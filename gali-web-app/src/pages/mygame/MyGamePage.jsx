import { useEffect, useState } from 'react'
import { ROUTE_PATHS } from '../routes'
import { getMarketList } from '../../services/playService'
import { getUserCredit } from '../../services/homeService'
import { getSession } from '../../services/sessionService'
import SideDrawer from '../common/SideDrawer'
import BottomNav from '../common/BottomNav'
import Header from '../common/Header'
import { formatMarketDisplayName } from '../../utils/marketDisplayName'
import './mygame.css'

function MyGamePage({
  navigate,
  pageTitle = 'My Game',
  hideWalletTab = false,
}) {
  const [session] = useState(() => getSession())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [credit, setCredit] = useState(0)
  const [markets, setMarkets] = useState([])
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    if (!session?.userId) {
      navigate(ROUTE_PATHS.login)
      return
    }

    const loadInitialData = async () => {
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
        setError(apiError instanceof Error ? apiError.message : 'Unable to fetch market list.')
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [navigate, session?.userId])

  if (!session?.userId) return null

  const openMarketPlay = (market) => {
    if (!market || String(market.is_play) !== '1') return
    sessionStorage.setItem('selected_market', JSON.stringify(market))
    navigate(ROUTE_PATHS.playMarket)
  }

  return (
    <div className="my-game-page">
      <Header
        credit={credit}
        isMenuOpen={drawerOpen}
        onMenu={() => setDrawerOpen((prev) => !prev)}
        onBalanceClick={() => navigate(ROUTE_PATHS.wallet)}
        onNotification={() => navigate(ROUTE_PATHS.notification)}
      />

      <header className="my-game-banner">
        <h1 className="my-game-banner-title">{pageTitle}</h1>
        <p className="my-game-banner-sub">Select a game to play now</p>
      </header>

      <main className="my-game-content">
        {loading ? (
          <div className="my-game-loading" aria-busy aria-label="Loading markets">
            <div className="my-game-skeleton my-game-skeleton-row" />
            <div className="my-game-skeleton my-game-skeleton-row" />
            <div className="my-game-skeleton my-game-skeleton-row" />
            <div className="my-game-skeleton my-game-skeleton-row" />
          </div>
        ) : null}

        {error ? <p className="my-game-state my-game-state--error">{error}</p> : null}

        {!loading && !error ? (
          <section className="my-game-market-list" aria-label="Game list">
            {markets.map((market) => {
              const canPlay = String(market.is_play) === '1'
              return (
                <div key={market.id} className="my-game-market-card">
                  <div className="my-game-market-info">
                    <div className="my-game-market-name">
                      {formatMarketDisplayName(market.name || market.market_name || '') || market.id}
                    </div>
                    <div className="my-game-market-time">
                      {market.open_time || '--'} - {market.time || '--'}
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`my-game-play-now ${canPlay ? '' : 'disabled'}`}
                    disabled={!canPlay}
                    onClick={() => openMarketPlay(market)}
                  >
                    <span className="my-game-play-now-icon" aria-hidden>
                      ▶
                    </span>
                    PLAY NOW
                  </button>
                </div>
              )
            })}
          </section>
        ) : null}
      </main>

      <BottomNav
        activeTab="myGame"
        navigate={navigate}
        hiddenTabKeys={hideWalletTab ? ['wallet'] : []}
      />

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

export default MyGamePage
