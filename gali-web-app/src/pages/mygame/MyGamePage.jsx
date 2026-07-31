import { useEffect, useMemo, useState } from 'react'
import { ROUTE_PATHS } from '../routes'
import { getMarketList } from '../../services/playService'
import { getUserCredit } from '../../services/homeService'
import { getSession } from '../../services/sessionService'
import { getPendingBetHistory } from '../../services/historyService'
import SideDrawer from '../common/SideDrawer'
import BottomNav from '../common/BottomNav'
import Header from '../common/Header'
import { formatMarketDisplayName } from '../../utils/marketDisplayName'
import './mygame.css'

function MyGamePage({ navigate, pageTitle = 'My Game', initialTab = 'pending' }) {
  const [session] = useState(() => getSession())
  const [loading, setLoading] = useState(true)
  const [reloadTick, setReloadTick] = useState(0)
  const [error, setError] = useState('')
  const [credit, setCredit] = useState(0)
  const [markets, setMarkets] = useState([])
  const [selectedMarket, setSelectedMarket] = useState('all')
  const [activeTab, setActiveTab] = useState(initialTab)
  const [historyRows, setHistoryRows] = useState([])
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    if (!session?.userId) {
      navigate(ROUTE_PATHS.login)
      return
    }

    const loadInitialData = async () => {
      try {
        const [marketData, creditData] = await Promise.all([
          getMarketList(session.userId),
          getUserCredit(session.userId),
        ])
        setMarkets(marketData)
        setCredit(Number(creditData || 0))
      } catch (apiError) {
        setError(apiError instanceof Error ? apiError.message : 'Unable to fetch market list.')
      }
    }

    loadInitialData()
  }, [navigate, session?.userId])

  useEffect(() => {
    if (!session?.userId) return

    const loadHistory = async () => {
      setLoading(true)
      setError('')
      try {
        const result = await getPendingBetHistory(session.userId, selectedMarket, 1)
        setHistoryRows(result.rows)
      } catch (apiError) {
        setError(apiError instanceof Error ? apiError.message : 'Unable to fetch history.')
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [activeTab, reloadTick, selectedMarket, session?.userId])

  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])

  const marketOptions = useMemo(
    () => [
      { id: 'all', name: 'All Market' },
      ...markets.map((item) => ({ id: item.id, name: formatMarketDisplayName(item.name) })),
    ],
    [markets]
  )

  if (!session?.userId) return null

  return (
    <div className="my-game-page">
      <Header
        credit={credit}
        isMenuOpen={drawerOpen}
        onMenu={() => setDrawerOpen((prev) => !prev)}
        onNotification={() => navigate(ROUTE_PATHS.notification)}
      />

      <header className="my-game-banner">
        <h1 className="my-game-banner-title">{pageTitle}</h1>
        <p className="my-game-banner-sub">Pending &amp; declared bets</p>
      </header>

      <main className="my-game-content">
        <section className="my-game-toolbar" aria-label="Filters">
          <label className="my-game-select-wrap">
            <span className="my-game-select-label">Market</span>
            <select
              className="my-game-select"
              value={selectedMarket}
              onChange={(event) => setSelectedMarket(event.target.value)}
            >
              {marketOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="my-game-reload"
            onClick={() => setReloadTick((prev) => prev + 1)}
          >
            <span className="my-game-reload-icon" aria-hidden>
              ↻
            </span>
            Reload
          </button>
        </section>

        <section className="my-game-tabs-card">
          <div className="history-tabs my-game-segmented">
            <button
              type="button"
              className={activeTab === 'pending' ? 'active' : ''}
              onClick={() => setActiveTab('pending')}
            >
              Pending bet
            </button>
            <button
              type="button"
              className={activeTab === 'declared' ? 'active' : ''}
              onClick={() => setActiveTab('declared')}
            >
              Declared bet
            </button>
          </div>
          <div className="my-game-notes">
            <div className="my-game-note">
              <span className="my-game-note-badge">Pending</span>
              <p>
                जिन गेम का रिजल्ट नहीं आया वो यहाँ दिखेंगी। Games without a result show under Pending.
              </p>
            </div>
            <div className="my-game-note">
              <span className="my-game-note-badge my-game-note-badge--declared">Declared</span>
              <p>
                जिन गेम का रिजल्ट आ गया है वो यहाँ दिखेंगी। Declared results show here.
              </p>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="my-game-loading" aria-busy aria-label="Loading bets">
            <div className="my-game-skeleton my-game-skeleton-row" />
            <div className="my-game-skeleton my-game-skeleton-row" />
            <div className="my-game-skeleton my-game-skeleton-row" />
            <div className="my-game-skeleton my-game-skeleton-table" />
          </div>
        ) : null}
        {error ? <p className="my-game-state my-game-state--error">{error}</p> : null}

        {!loading && !error ? (
          <section className="my-game-table-card">
            <h2 className="my-game-table-heading">
              {activeTab === 'pending' ? 'Pending bets' : 'Declared bets'}
            </h2>
            <div className="my-game-table-wrap table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Date</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Number</th>
                    <th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {historyRows.map((row, index) => (
                    <tr key={row.id ?? `row-${index}`}>
                      <td>{index + 1}</td>
                      <td>{row.datetime || row.date || '—'}</td>
                      <td>{row.table_id || '—'}</td>
                      <td>{row.bettype || '—'}</td>
                      <td className="my-game-num">{row.pred_num ?? '—'}</td>
                      <td className="my-game-points">{row.tr_value ?? '—'}</td>
                    </tr>
                  ))}
                  {historyRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="my-game-empty">
                        No records for this filter.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}
      </main>

      <BottomNav activeTab="myGame" navigate={navigate} />

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
