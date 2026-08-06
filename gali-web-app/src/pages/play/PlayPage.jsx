import { useEffect, useState } from 'react'
import { Card, CardContent } from '@mui/material'
import { ROUTE_PATHS } from '../routes'
import { getMarketList } from '../../services/playService'
import { getUserCredit } from '../../services/homeService'
import { getSession } from '../../services/sessionService'
import SideDrawer from '../common/SideDrawer'
import BottomNav from '../common/BottomNav'
import Header from '../common/Header'
import { formatMarketDisplayName } from '../../utils/marketDisplayName'
import './play.css'

function PlayPage({ navigate }) {
  const [session] = useState(() => getSession())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [markets, setMarkets] = useState([])
  const [credit, setCredit] = useState(0)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    if (!session?.userId) {
      navigate(ROUTE_PATHS.login)
      return
    }

    const loadData = async () => {
      setLoading(true)
      setError('')

      try {
        const [marketData, creditData] = await Promise.all([
          getMarketList(session.userId),
          getUserCredit(session.userId),
        ])

        setMarkets(marketData)
        setCredit(Number(creditData || 0))
      } catch (apiError) {
        setError(apiError instanceof Error ? apiError.message : 'Unable to load play data.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [navigate, session?.userId])

  if (!session?.userId) return null

  const openMarketPlay = (market) => {
    if (String(market.is_play) !== '1') return
    sessionStorage.setItem('selected_market', JSON.stringify(market))
    navigate(ROUTE_PATHS.playMarket)
  }

  return (
    <div className="play-page">
      <Header
        credit={credit}
        isMenuOpen={drawerOpen}
        onMenu={() => setDrawerOpen((prev) => !prev)}
        onBalanceClick={() => navigate(ROUTE_PATHS.wallet)}
        onNotification={() => navigate(ROUTE_PATHS.notification)}
      />

      <main className="play-content">
        <h2 className="all-games-title">All Games</h2>

        {loading ? <p className="state-text">Loading market list...</p> : null}
        {error ? <p className="state-text error">{error}</p> : null}

        {!loading && !error ? (
          <div className="games-grid">
            {markets.map((market) => {
              const canPlay = String(market.is_play) === '1'
              return (
                <Card key={market.id} className="game-card" elevation={2}>
                  <CardContent className="game-card-content">
                    <div className="clock-box">⏰</div>
                    <div className="game-info">
                      <h3>{formatMarketDisplayName(market.name)}</h3>
                      <p>
                        {market.open_time} - {market.time}
                      </p>
                    </div>
                    <button
                      type="button"
                      className={`game-action ${canPlay ? 'play' : 'timeout'}`}
                      onClick={() => openMarketPlay(market)}
                    >
                      {canPlay ? 'Play Games' : 'Time Out'}
                    </button>
                  </CardContent>
                </Card>
              )
            })}
            {markets.length === 0 ? (
              <div className="play-empty-card">No games available right now.</div>
            ) : null}
          </div>
        ) : null}
      </main>

      <BottomNav activeTab="home" navigate={navigate} />

      <SideDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        navigate={navigate}
        name={session?.name || 'User'}
        mobile={session?.mobileNum || '--'}
      />
    </div>
  )
}

export default PlayPage
