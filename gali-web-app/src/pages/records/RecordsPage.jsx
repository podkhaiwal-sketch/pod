import { useEffect, useMemo, useState } from 'react'
import { ROUTE_PATHS } from '../routes'
import { getMarketList } from '../../services/playService'
import { getUserCredit } from '../../services/homeService'
import { getSession } from '../../services/sessionService'
import SideDrawer from '../common/SideDrawer'
import BottomNav from '../common/BottomNav'
import Header from '../common/Header'
import { formatMarketDisplayName } from '../../utils/marketDisplayName'
import './records.css'

function RecordsPage({
  navigate,
  title,
  subtitle,
  loadRows,
  columns,
  activeTab = 'myGame',
  showMarketFilter = true,
}) {
  const [session] = useState(() => getSession())
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [credit, setCredit] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rows, setRows] = useState([])
  const [markets, setMarkets] = useState([])
  const [selectedMarket, setSelectedMarket] = useState('all')

  useEffect(() => {
    if (!session?.userId) {
      navigate(ROUTE_PATHS.login)
      return
    }

    const loadMeta = async () => {
      try {
        const [creditValue, marketRows] = await Promise.all([
          getUserCredit(session.userId),
          showMarketFilter ? getMarketList(session.userId) : Promise.resolve([]),
        ])
        setCredit(Number(creditValue || 0))
        setMarkets(Array.isArray(marketRows) ? marketRows : [])
      } catch {
        // Non-fatal; page data loader handles main failure state.
      }
    }

    loadMeta()
  }, [navigate, session?.userId, showMarketFilter])

  useEffect(() => {
    if (!session?.userId) return

    const fetchData = async () => {
      setLoading(true)
      setError('')
      try {
        const result = await loadRows(session.userId, selectedMarket, 1)
        setRows(result.rows || [])
      } catch (apiError) {
        setError(apiError instanceof Error ? apiError.message : 'Unable to load records.')
        setRows([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [loadRows, selectedMarket, session?.userId])

  const marketOptions = useMemo(
    () => [
      { id: 'all', name: 'All Market' },
      ...markets.map((item) => ({
        id: item.id,
        name: formatMarketDisplayName(item.name || item.market_name || ''),
      })),
    ],
    [markets]
  )

  if (!session?.userId) return null

  return (
    <div className="records-page">
      <Header
        credit={credit}
        isMenuOpen={drawerOpen}
        onMenu={() => setDrawerOpen((prev) => !prev)}
        onBalanceClick={() => navigate(ROUTE_PATHS.wallet)}
        onNotification={() => navigate(ROUTE_PATHS.notification)}
      />

      <header className="records-hero">
        <h1 className="records-title">{title}</h1>
        <p className="records-subtitle">{subtitle}</p>
      </header>

      <main className="records-content">
        {showMarketFilter ? (
          <label className="records-filter">
            <span>Market</span>
            <select value={selectedMarket} onChange={(event) => setSelectedMarket(event.target.value)}>
              {marketOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {loading ? <p className="records-state">Loading...</p> : null}
        {error ? <p className="records-state records-state--error">{error}</p> : null}

        {!loading && !error ? (
          <section className="records-card">
            <div className="records-table-wrap">
              <table className="records-table">
                <thead>
                  <tr>
                    {columns.map((column) => (
                      <th key={column.key}>{column.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={row.id || `${row.date || 'row'}-${index}`}>
                      {columns.map((column) => (
                        <td key={`${column.key}-${index}`}>{column.render ? column.render(row, index) : row[column.key] ?? '--'}</td>
                      ))}
                    </tr>
                  ))}
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length} className="records-empty">
                        No records found.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}
      </main>

      <BottomNav activeTab={activeTab} navigate={navigate} />

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

export default RecordsPage
