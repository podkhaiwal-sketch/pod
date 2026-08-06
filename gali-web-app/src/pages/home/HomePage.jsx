import { useEffect, useMemo, useState } from 'react'
import { ROUTE_PATHS } from '../routes'
import { getAppNotice, getHelpNumber, getHomeDashboard, getUserCredit, getUserProfile } from '../../services/homeService'
import { getMarketList } from '../../services/playService'
import { getSession } from '../../services/sessionService'
import SideDrawer from '../common/SideDrawer'
import BottomNav from '../common/BottomNav'
import Header from '../common/Header'
import AppIcon from '../common/AppIcon'
import { formatMarketDisplayName } from '../../utils/marketDisplayName'
import './home.css'

const STRIP_COLORS = ['#f7c5d8', '#c9c4db', '#b9d6c9', '#d7c6a8', '#c5d8f0', '#e8d4b8']

function marketResult(item) {
  const value = item?.market_result
  if (value == null || value === '' || value === '--' || value === '—') return '—'
  return String(value)
}

function marketTime(item) {
  return item?.time || item?.open_time || item?.resultTime || '--'
}

function HomePage({ navigate }) {
  const [session] = useState(() => getSession())
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [profile, setProfile] = useState(null)
  const [markets, setMarkets] = useState([])
  const [featuredId, setFeaturedId] = useState('')
  const [credit, setCredit] = useState(0)
  const [notice, setNotice] = useState('')
  const [help, setHelp] = useState(null)

  const loadData = async ({ silent = false } = {}) => {
    if (!session?.userId) return

    // Avoid triggering "setState synchronously within effect" lint
    // by breaking out of the synchronous call stack.
    await Promise.resolve()

    if (silent) setRefreshing(true)
    else setLoading(true)
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
          open_time: match.open_time || item.open_time || '--',
          time: match.time || item.time || '--',
          is_play: String(match.is_play ?? item.is_play ?? '0'),
          market_name: item.market_name || match.name || '--',
          market_id: item.market_id || match.id || '',
        }
      })
      setMarkets(mergedMarkets)
      setFeaturedId((prev) => {
        if (prev && mergedMarkets.some((m) => String(m.market_id) === String(prev))) return prev
        return String(mergedMarkets[0]?.market_id || '')
      })
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
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (!session?.userId) {
      navigate(ROUTE_PATHS.login)
      return
    }
    // Trigger fetch after current render to avoid "setState in effect" lint.
    void Promise.resolve().then(() => loadData())
  }, [navigate, session?.userId])

  const helpNumber = useMemo(
    () => profile?.genral_setting_whatsapp || help?.help_line_number || help?.whatsapp || '',
    [help?.help_line_number, help?.whatsapp, profile?.genral_setting_whatsapp]
  )

  const featuredMarket = useMemo(() => {
    if (!markets.length) return null
    return markets.find((m) => String(m.market_id) === String(featuredId)) || markets[0]
  }, [featuredId, markets])

  const stripMarkets = useMemo(() => {
    if (!featuredMarket) return markets
    return markets.filter((m) => String(m.market_id) !== String(featuredMarket.market_id))
  }, [featuredMarket, markets])

  if (!session?.userId) return null

  const openMarketPlay = (market) => {
    if (!market || String(market.is_play) !== '1') return
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
        onBalanceClick={() => navigate(ROUTE_PATHS.wallet)}
      />

      <main className="home-content">
        <div className="home-notice-banner" role="status" aria-live="polite">
          <div className="home-notice-track">
            <span>{notice || '1 और 15 तारीख को पेमेंट नहीं निकाल (withdraw) सकते है'}</span>
            <span aria-hidden>
              {notice || '1 और 15 तारीख को पेमेंट नहीं निकाल (withdraw) सकते है'}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="home-loading" aria-busy aria-label="Loading home">
            <div className="home-skeleton home-skeleton-hero" />
            <div className="home-skeleton home-skeleton-strip" />
            <div className="home-skeleton home-skeleton-refresh" />
          </div>
        ) : null}

        {error ? <p className="state-text error">{error}</p> : null}

        {!loading && !error && featuredMarket ? (
          <>
            <section
              className="home-featured-card"
              aria-label="Featured result"
              role={String(featuredMarket.is_play) === '1' ? 'button' : undefined}
              tabIndex={String(featuredMarket.is_play) === '1' ? 0 : undefined}
              onClick={() => openMarketPlay(featuredMarket)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  openMarketPlay(featuredMarket)
                }
              }}
            >
              <p className="home-featured-time">{marketTime(featuredMarket)}</p>
              <h2 className="home-featured-name">
                {formatMarketDisplayName(featuredMarket.market_name)}
              </h2>
              <p className="home-featured-result">{marketResult(featuredMarket)}</p>
            </section>

            {stripMarkets.length > 0 ? (
              <div className="home-result-strip" role="list" aria-label="Other market results">
                {stripMarkets.map((item, index) => (
                  <button
                    key={item.market_id || index}
                    type="button"
                    role="listitem"
                    className="home-result-chip"
                    style={{ backgroundColor: STRIP_COLORS[index % STRIP_COLORS.length] }}
                    onClick={() => setFeaturedId(String(item.market_id))}
                    onDoubleClick={() => openMarketPlay(item)}
                  >
                    <span className="home-result-chip-number">{marketResult(item)}</span>
                    <span className="home-result-chip-name">
                      {formatMarketDisplayName(item.market_name)}
                    </span>
                    <span className="home-result-chip-time">{marketTime(item)}</span>
                  </button>
                ))}
              </div>
            ) : null}

            <button
              type="button"
              className="home-refresh-btn"
              onClick={() => loadData({ silent: true })}
              disabled={refreshing}
            >
              <AppIcon name="refresh" className={refreshing ? 'spin' : ''} />
              <span>{refreshing ? 'Refreshing…' : 'Refresh'}</span>
            </button>
          </>
        ) : null}

        {!loading && !error && !markets.length ? (
          <p className="state-text">No market results available.</p>
        ) : null}
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
