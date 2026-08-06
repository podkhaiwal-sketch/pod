import { useEffect, useState } from 'react'
import { ROUTE_PATHS } from '../routes'
import { getSession } from '../../services/sessionService'
import { getUserCredit } from '../../services/homeService'
import { getReferList } from '../../services/referService'
import SideDrawer from '../common/SideDrawer'
import BottomNav from '../common/BottomNav'
import Header from '../common/Header'
import './refer.css'

function ReferPage({ navigate }) {
  const [session] = useState(() => getSession())
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [credit, setCredit] = useState(0)
  const [rows, setRows] = useState([])

  useEffect(() => {
    if (!session?.userId) {
      navigate(ROUTE_PATHS.login)
      return
    }

    const loadData = async () => {
      setLoading(true)
      setError('')
      try {
        const [creditValue, referData] = await Promise.all([
          getUserCredit(session.userId),
          getReferList(session.userId),
        ])
        setCredit(Number(creditValue || 0))
        setRows(referData.rows)
      } catch (apiError) {
        setError(apiError instanceof Error ? apiError.message : 'Unable to load refer list.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [navigate, session?.userId])

  if (!session?.userId) return null

  return (
    <div className="refer-page">
      <Header
        credit={credit}
        isMenuOpen={drawerOpen}
        onMenu={() => setDrawerOpen((prev) => !prev)}
        onBalanceClick={() => navigate(ROUTE_PATHS.wallet)}
        onNotification={() => navigate(ROUTE_PATHS.notification)}
      />

      <main className="refer-content">
        <h2 className="refer-title">My Refer List</h2>

        {loading ? <p className="state-text">Loading refer list...</p> : null}
        {error ? <p className="state-text error">{error}</p> : null}

        {!loading && !error ? (
          <div className="refer-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>S.NO</th>
                  <th>Name</th>
                  <th>Mobile</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="empty-row">
                      Data Not Found
                    </td>
                  </tr>
                ) : (
                  rows.map((row, index) => (
                    <tr key={row.id || `${row.name || 'n'}-${index}`}>
                      <td>{index + 1}</td>
                      <td>{row.name || row.FullName || '--'}</td>
                      <td>{row.mob || row.mobile || '--'}</td>
                      <td>{row.date || row.created_at || '--'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : null}
      </main>

      <BottomNav activeTab="refer" navigate={navigate} />

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

export default ReferPage
