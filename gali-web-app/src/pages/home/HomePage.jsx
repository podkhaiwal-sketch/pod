import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent } from '@mui/material'
import { ROUTE_PATHS } from '../routes'
import { getAppNotice, getHelpNumber, getHomeDashboard, getUserCredit, getUserProfile } from '../../services/homeService'
import { getMarketList } from '../../services/playService'
import { getSession } from '../../services/sessionService'
import SideDrawer from '../common/SideDrawer'
import BottomNav from '../common/BottomNav'
import Header from '../common/Header'
import { formatMarketDisplayName } from '../../utils/marketDisplayName'
import './home.css'

function HomePage({ navigate }) {
  const [session] = useState(() => getSession())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [profile, setProfile] = useState(null)
  const [markets, setMarkets] = useState([])
  const [credit, setCredit] = useState(0)
  const [notice, setNotice] = useState('')
  const [help, setHelp] = useState(null)

  useEffect(() => {
    if (!session?.userId) {
      navigate(ROUTE_PATHS.login)
      return
    }

    const loadData = async () => {
      setLoading(true)
      setError('')

      try {
        const [profileData, dashboardData, creditData, noticeData, helpData, marketData] = await Promise.all([
          getUserProfile(session.userId),
          getHomeDashboard(session.userId),
          getUserCredit(session.userId),
          getAppNotice(session.userId),
          getHelpNumber(),
          getMarketList(session.userId),
        ])

        setProfile(profileData)
        const dashboardMarkets = Array.isArray(dashboardData.data) ? dashboardData.data : []
        const playableMarkets = Array.isArray(marketData) ? marketData : []
        const marketById = new Map(
          playableMarkets.map((item) => [String(item.id || '').trim(), item])
        )
        const marketByName = new Map(
          playableMarkets.map((item) => [String(item.name || '').trim().toUpperCase(), item])
        )
        const mergedMarkets = dashboardMarkets.map((item) => {
          const matchById = marketById.get(String(item.market_id || '').trim())
          const matchByName = marketByName.get(String(item.market_name || '').trim().toUpperCase())
          const match = matchById || matchByName || {}
          return {
            ...item,
            open_time: match.open_time || '--',
            time: match.time || '--',
            is_play: String(match.is_play ?? '0'),
            market_name: item.market_name || match.name || '--',
            market_id: item.market_id || match.id || '',
          }
        })
        setMarkets(mergedMarkets)
        setCredit(Number(creditData || dashboardData.user_balance || 0))
        const noticeItems = Array.isArray(noticeData) ? noticeData : []
        const noticeText = noticeItems
          .map((item) => item?.short_description || item?.description || '')
          .filter(Boolean)
          .join('   •   ')
        setNotice(noticeText)
        setHelp(helpData)
      } catch (apiError) {
        setError(apiError instanceof Error ? apiError.message : 'Unable to fetch home data.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [navigate, session?.userId])

  const helpNumber = useMemo(
    () => profile?.genral_setting_whatsapp || help?.help_line_number || help?.whatsapp || '',
    [help?.help_line_number, help?.whatsapp, profile?.genral_setting_whatsapp]
  )
  const todayText = useMemo(() => {
    const today = new Date()
    const dd = String(today.getDate()).padStart(2, '0')
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const yyyy = String(today.getFullYear())
    return `${dd}-${mm}-${yyyy}`
  }, [])

  if (!session?.userId) return null

  const openMarketPlay = (market) => {
    if (String(market.is_play) !== '1') return
    sessionStorage.setItem(
      'selected_market',
      JSON.stringify({
        id: market.market_id,
        name: market.market_name,
        open_time: market.open_time,
        time: market.time,
        is_play: market.is_play,
      })
    )
    navigate(ROUTE_PATHS.playMarket)
  }

  return (
    <div className="home-page">
      <Header
        credit={credit}
        isMenuOpen={drawerOpen}
        onMenu={() => setDrawerOpen((prev) => !prev)}
        onNotification={() => navigate(ROUTE_PATHS.notification)}
      />

      <main className="home-content">
        {loading ? (
          <div className="home-loading" aria-busy aria-label="Loading home">
            <div className="home-skeleton home-skeleton-hero" />
            <div className="home-skeleton home-skeleton-strip" />
            <div className="home-skeleton home-skeleton-card" />
            <div className="home-skeleton home-skeleton-card" />
          </div>
        ) : null}
        {error ? <p className="state-text error">{error}</p> : null}
        <div className="hero-notice-ticker" role="status" aria-live="polite">
                  <div className="hero-notice-track">
                    <span>{notice || 'No notice posted yet.'}</span>
                    <span aria-hidden>{notice || 'No notice posted yet.'}</span>
                  </div>
                </div>
        {!loading && !error ? (
          <>
           

            <div className="live-strip" role="status">
              <span className="live-strip-icon" aria-hidden>
                🔥
              </span>
              <span className="live-strip-text">LIVE RESULT · {todayText}</span>
            </div>
          </>
        ) : null}

        {!loading &&
          !error &&
          markets.map((item) => (
            <Card key={item.market_id} className="market-card" elevation={0}>
              <CardContent className="market-card-content">
                <div className="market-card-head">
                  <h3>{formatMarketDisplayName(item.market_name)}</h3>
                </div>
                <div className="market-card-body">
                  <p className="result-time">
                    {item.open_time || '--'} - <strong>{item.time || '--'}</strong>
                  </p>
                  <p className="result-time">
                    Result at{' '}
                    <strong>{item.resultTime || '--'}</strong>
                  </p>
                  <div className="result-grid">
                    <div className="result-cell">
                      <span className="result-cell-label">Previous</span>
                      <span className="result-cell-value">{item.market_result_previous_day || '—'}</span>
                    </div>
                    <div className="result-cell result-cell--today">
                      <span className="result-cell-label">Today</span>
                      <span className="result-cell-value">{item.market_result || '—'}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`market-play-btn ${String(item.is_play) === '1' ? 'play' : 'timeout'}`}
                    onClick={() => openMarketPlay(item)}
                  >
                    {String(item.is_play) === '1' ? 'Play Games' : 'Time Out'}
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
      </main>

      <BottomNav activeTab="home" navigate={navigate} />

      <SideDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        navigate={navigate}
        name={profile?.name || session.name || 'User'}
        mobile={profile?.mob || session.mobileNum || '--'}
        refCode={profile?.refCode || '--'}
        helpNumber={helpNumber}
      />
    </div>
  )
}

export default HomePage
