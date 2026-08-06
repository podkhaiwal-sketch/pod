import { useEffect, useState } from 'react'
import { ROUTE_PATHS } from '../routes'
import { getSession } from '../../services/sessionService'
import { getUserCredit } from '../../services/homeService'
import { getManageCommission } from '../../services/commissionService'
import SideDrawer from '../common/SideDrawer'
import BottomNav from '../common/BottomNav'
import Header from '../common/Header'
import './commission.css'

function CommissionPage({ navigate }) {
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
        const [creditValue, commissionData] = await Promise.all([
          getUserCredit(session.userId),
          getManageCommission(session.userId),
        ])
        setCredit(Number(creditValue || 0))
        setRows(commissionData.rows)
      } catch (apiError) {
        setError(apiError instanceof Error ? apiError.message : 'Unable to load commission list.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [navigate, session?.userId])

  if (!session?.userId) return null

  return (
    <div className="commission-page">
      <Header
        credit={credit}
        isMenuOpen={drawerOpen}
        onMenu={() => setDrawerOpen((prev) => !prev)}
        onBalanceClick={() => navigate(ROUTE_PATHS.wallet)}
        onNotification={() => navigate(ROUTE_PATHS.notification)}
      />

      <main className="commission-content">
        <h2 className="commission-title">Commission List</h2>

        {loading ? <p className="state-text">Loading commission data...</p> : null}
        {error ? <p className="state-text error">{error}</p> : null}

        {!loading && !error ? (
          <div className="commission-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>S.NO</th>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Commission Amount</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="empty-row">
                      No data available or something went wrong.
                    </td>
                  </tr>
                ) : (
                  rows.map((row, index) => (
                    <tr key={row.id || `${row.date || 'd'}-${index}`}>
                      <td>{index + 1}</td>
                      <td>{row.date || row.created_at || '--'}</td>
                      <td>{row.market_id || row.user_name || '--'}</td>
                      <td>{row.commission || row.amount || row.tr_value || '--'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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

export default CommissionPage
