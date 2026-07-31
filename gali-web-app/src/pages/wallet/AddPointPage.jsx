import { useEffect, useState } from 'react'
import { ROUTE_PATHS } from '../routes'
import { getSession } from '../../services/sessionService'
import { getAppManager, getWalletReport } from '../../services/walletService'
import { getUserCredit } from '../../services/homeService'
import SideDrawer from '../common/SideDrawer'
import MessageDialog from '../common/MessageDialog'
import { APP_CONFIG } from '../../config/config'
import BottomNav from '../common/BottomNav'
import Header from '../common/Header'
import './addPoint.css'

function AddPointPage({ navigate }) {
  const [session] = useState(() => getSession())
  const [amount, setAmount] = useState('')
  const [gatewayKey, setGatewayKey] = useState('utr')
  const [credit, setCredit] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [walletRows, setWalletRows] = useState([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [dialog, setDialog] = useState({ open: false, type: 'success', title: '', message: '' })

  useEffect(() => {
    if (!session?.userId) {
      navigate(ROUTE_PATHS.login)
      return
    }

    const loadData = async () => {
      setLoading(true)
      setError('')
      try {
        const [, creditValue, walletHistory] = await Promise.all([
          getAppManager(session.userId),
          getUserCredit(session.userId),
          getWalletReport(session.userId),
        ])
        setCredit(Number(creditValue || 0))
        setWalletRows(walletHistory)
      } catch (apiError) {
        setError(apiError instanceof Error ? apiError.message : 'Unable to load wallet data.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [navigate, session?.userId])

  const onAddPoints = () => {
    if (!amount || Number(amount) <= 0) {
      setDialog({
        open: true,
        type: 'error',
        title: 'Error',
        message: 'Please enter valid amount.',
      })
      return
    }

    const name = encodeURIComponent(session?.name || 'Test')
    const userid = encodeURIComponent(String(session?.userId || ''))
    const contact = encodeURIComponent(session?.mobileNum || '')
    const finalAmount = encodeURIComponent(String(amount))
    const getaway = gatewayKey
    const url = `${APP_CONFIG.paymentGatewayUrl}?name=${name}&userid=${userid}&amount=${finalAmount}&contact=${contact}&getaway=${getaway}`
    window.location.href = url
  }

  if (!session?.userId) return null

  return (
    <div className="add-point-page">
      <Header
        credit={credit}
        isMenuOpen={drawerOpen}
        onMenu={() => setDrawerOpen((prev) => !prev)}
        onNotification={() => navigate(ROUTE_PATHS.notification)}
      />

      <div className="addp-win-strip">
        Win Amount :- <span>{credit}</span>
      </div>

      <main className="addp-content">
        {loading ? <p className="state-text">Loading wallet data...</p> : null}
        {error ? <p className="state-text error">{error}</p> : null}

        <section className="addp-card">
          <div className="addp-tabs">
            <button type="button" className="addp-tab active">
              Add Point
            </button>
            <button type="button" className="addp-tab" onClick={() => navigate(ROUTE_PATHS.wallet)}>
              Withdraw
            </button>
          </div>

          <div className="addp-input-wrap">
            <span className="addp-input-icon">🏛️</span>
            <input
              type="number"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Enter Amount"
            />
          </div>

          {/* <div className="addp-gateway-wrap">
            <label htmlFor="gatewayKey">Select Gateway</label>
            <select
              id="gatewayKey"
              value={gatewayKey}
              onChange={(event) => setGatewayKey(event.target.value)}
            >
              <option value="utr">UTR</option>
              <option value="online">Online</option>
              <option value="menual">Menual</option>
              <option value="payinfintech">Payinfintech</option>
            </select>
          </div> */}

          <button type="button" className="addp-submit-btn" onClick={onAddPoints}>
            Add Points
          </button>
        </section>

        <section className="addp-history-card">
          <h3>Wallet History</h3>
          <div className="addp-history-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Sr No</th>
                  <th>Pay Mode</th>
                  <th>Date</th>
                  <th>Points</th>
                  <th>Closing Balance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {walletRows.map((row, index) => (
                  <tr key={row.transaction_id || `${row.datetime || 'dt'}-${index}`}>
                    <td>{index + 1}</td>
                    <td>{row.market ? `${row.remark || '--'} ${row.market}` : row.remark || '--'}</td>
                    <td>{row.datetime || '--'}</td>
                    <td>{row.amount ?? '--'}</td>
                    <td>{row.closing_balance ?? '--'}</td>
                    <td className="success">{row.status || '--'}</td>
                  </tr>
                ))}
                {walletRows.length === 0 ? (
                  <tr>
                    <td colSpan={6}>No wallet history found.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <BottomNav activeTab="wallet" navigate={navigate} />

      <SideDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        navigate={navigate}
        name={session?.name || 'User'}
        mobile={session?.mobileNum || '--'}
      />

      <MessageDialog
        open={dialog.open}
        type={dialog.type}
        title={dialog.title}
        message={dialog.message}
        onClose={() => setDialog((prev) => ({ ...prev, open: false }))}
      />
    </div>
  )
}

export default AddPointPage
