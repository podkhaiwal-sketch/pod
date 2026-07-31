import { useEffect, useMemo, useState } from 'react'
import { APP_CONFIG } from '../../config/config'
import { ROUTE_PATHS } from '../routes'
import { getUserCredit } from '../../services/homeService'
import { getSession } from '../../services/sessionService'
import {
  deductWithdrawUpiWeb,
  deductWithdrawWeb,
  getAppManager,
  getWalletReport,
  getWithdrawHistory,
} from '../../services/walletService'
import SideDrawer from '../common/SideDrawer'
import MessageDialog from '../common/MessageDialog'
import BottomNav from '../common/BottomNav'
import Header from '../common/Header'
import './wallet.css'

function WalletPage({ navigate }) {
  const [session] = useState(() => getSession())
  const [activeTab, setActiveTab] = useState('add')
  const [amount, setAmount] = useState('')
  const [gatewayKey, setGatewayKey] = useState('utr')
  const [paymentMode, setPaymentMode] = useState('upi')
  const [upiId, setUpiId] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('')
  const [ifscCode, setIfscCode] = useState('')
  const [confirmIfscCode, setConfirmIfscCode] = useState('')
  const [credit, setCredit] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [managerData, setManagerData] = useState(null)
  const [walletRows, setWalletRows] = useState([])
  const [withdrawRows, setWithdrawRows] = useState([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)
  const [addingPoints, setAddingPoints] = useState(false)
  const [checkingOrder, setCheckingOrder] = useState(false)
  const [lastOrderId, setLastOrderId] = useState('')
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
        const [managerResponse, creditValue, walletHistory, withdrawHistory] = await Promise.all([
          getAppManager(session.userId),
          getUserCredit(session.userId),
          getWalletReport(session.userId),
          getWithdrawHistory(session.userId),
        ])

        setManagerData(managerResponse?.data || null)
        setCredit(Number(creditValue || 0))
        setWalletRows(walletHistory)
        setWithdrawRows(withdrawHistory)
      } catch (apiError) {
        setError(apiError instanceof Error ? apiError.message : 'Unable to fetch wallet details.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [navigate, session?.userId])

  const withdrawTimeText = useMemo(() => {
    const open = managerData?.withdraw_open_time || '07:00'
    const close = managerData?.withdraw_close_time || '13:30'
    return `Withdrawal Time ${open} to ${close}`
  }, [managerData?.withdraw_close_time, managerData?.withdraw_open_time])

  const onAddPoints = async () => {
    if (!amount || Number(amount) <= 0) {
      setDialog({
        open: true,
        type: 'error',
        title: 'Error',
        message: 'Please enter valid amount.11',
      })
      return
    }

    // if (gatewayKey === 'imb') {
      setAddingPoints(true)
      try {
        const generatedOrderId = `${String(session?.userId || '')}${Date.now()}`
        const payload = {
          user_id: String(session?.userId || ''),
          app_id: APP_CONFIG.appId,
          amount: Number(amount),
          user_token: '7a7163ad52cc616002758a1e408a4a3b',
          customer_mobile: String(session?.mobileNum || ''),
          order_id: generatedOrderId,
          redirect_url:
            typeof window !== 'undefined' ? `${window.location.origin}${ROUTE_PATHS.wallet}` : '',
          remark1: 'your-customer@gmail.com',
          remark2: 'Hello',
          webhook_url: `${APP_CONFIG.baseUrl.replace('/api/users', '')}/imb-api/api/webhook`,
          devName: 'WEB',
          devType: 'web',
          devId: 'BROWSER-1',
        }

        const response = await fetch(`${APP_CONFIG.baseUrl}/imb-create-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await response.json()

        if (!response.ok || String(data?.success) !== '1') {
          throw new Error(data?.message || 'Unable to create payment order.')
        }

        const finalOrderId = String(data?.order_id || generatedOrderId)
        setLastOrderId(finalOrderId)

        const paymentUrl =
          data?.payment_url ||
          data?.payment_link ||
          data?.url ||
          data?.data?.payment_url ||
          data?.data?.payment_link

        if (paymentUrl) {
          window.location.href = paymentUrl
          return
        }

        setDialog({
          open: true,
          type: 'success',
          title: 'Success',
          message: data?.message || 'Order created successfully.',
        })
      } catch (apiError) {
        setDialog({
          open: true,
          type: 'error',
          title: 'Error',
          message: apiError instanceof Error ? apiError.message : 'Unable to create IMB order.',
        })
      } finally {
        setAddingPoints(false)
      }
    // } else {
    //   const name = encodeURIComponent(session?.name || 'Test')
    //   const userid = encodeURIComponent(String(session?.userId || ''))
    //   const contact = encodeURIComponent(session?.mobileNum || '')
    //   const finalAmount = encodeURIComponent(String(amount))
    //   const getaway = gatewayKey
    //   const url = `${APP_CONFIG.paymentGatewayUrl}?name=${name}&userid=${userid}&amount=${finalAmount}&contact=${contact}&getaway=${getaway}`
    //   window.location.href = url
    // }
  }

  const onCheckImbStatus = async () => {
    if (!lastOrderId) {
      setDialog({
        open: true,
        type: 'error',
        title: 'Error',
        message: 'No IMB order found. Please create order first.',
      })
      return
    }

    setCheckingOrder(true)
    try {
      const response = await fetch(`${APP_CONFIG.baseUrl}/imb-check-order-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: String(lastOrderId),
          user_token: '2048f66bef68633fa3262d7a398ab577',
          devName: 'WEB',
          devType: 'web',
          devId: 'BROWSER-1',
        }),
      })
      const data = await response.json()

      if (!response.ok || String(data?.success) !== '1') {
        throw new Error(data?.message || 'Unable to check order status.')
      }

      const statusValue = data?.status || data?.data?.order_status || 'Unknown'
      setDialog({
        open: true,
        type: 'success',
        title: 'Order Status',
        message: `${data?.message || 'Status fetched'} (${statusValue})`,
      })
    } catch (apiError) {
      setDialog({
        open: true,
        type: 'error',
        title: 'Error',
        message: apiError instanceof Error ? apiError.message : 'Unable to check IMB status.',
      })
    } finally {
      setCheckingOrder(false)
    }
  }

  const handleWithdraw = async () => {
    if (!amount || Number(amount) <= 0) {
      setDialog({
        open: true,
        type: 'error',
        title: 'Error',
        message: 'Please enter valid amount.',
      })
      return
    }

    if (paymentMode === 'bank' && (!accountNumber || !ifscCode)) {
      setDialog({
        open: true,
        type: 'error',
        title: 'Error',
        message: 'Please enter account number and IFSC code.',
      })
      return
    }

    if (paymentMode === 'bank' && accountNumber !== confirmAccountNumber) {
      setDialog({
        open: true,
        type: 'error',
        title: 'Error',
        message: 'Account number and confirm account number should match.',
      })
      return
    }

    if (paymentMode === 'bank' && ifscCode.toUpperCase() !== confirmIfscCode.toUpperCase()) {
      setDialog({
        open: true,
        type: 'error',
        title: 'Error',
        message: 'IFSC code and confirm IFSC code should match.',
      })
      return
    }

    if (paymentMode === 'upi' && !upiId) {
      setDialog({
        open: true,
        type: 'error',
        title: 'Error',
        message: 'Please enter UPI ID.',
      })
      return
    }

    setWithdrawing(true)
    try {
      const result =
        paymentMode === 'upi'
          ? await deductWithdrawUpiWeb({
              userId: session.userId,
              amount,
              upiId,
            })
          : await deductWithdrawWeb({
              userId: session.userId,
              amount,
              accountNumber,
              ifscCode,
              bankName: '',
              accountHolderName: '',
              upiId: '',
            })

      setCredit(Number(result.credit || credit))

      const [walletHistory, withdrawHistory] = await Promise.all([
        getWalletReport(session.userId),
        getWithdrawHistory(session.userId),
      ])
      setWalletRows(walletHistory)
      setWithdrawRows(withdrawHistory)

      setDialog({
        open: true,
        type: 'success',
        title: 'Success',
        message: result.message || 'Withdrawal request submitted.',
      })
    } catch (apiError) {
      setDialog({
        open: true,
        type: 'error',
        title: 'Error',
        message:
          apiError instanceof Error ? apiError.message : 'Unable to submit withdrawal request.',
      })
    } finally {
      setWithdrawing(false)
    }
  }

  if (!session?.userId) return null

  return (
    <div className="wallet-page">
      <Header
        credit={credit}
        isMenuOpen={drawerOpen}
        onMenu={() => setDrawerOpen((prev) => !prev)}
        onNotification={() => navigate(ROUTE_PATHS.notification)}
      />

      <div className="win-strip">
        Win Amount :- <span>{credit}</span>
      </div>

      <main className="wallet-content">
        {loading ? <p className="state-text">Loading wallet data...</p> : null}
        {error ? <p className="state-text error">{error}</p> : null}

        <section className="wallet-card">
          <div className="wallet-tabs">
            <button
              type="button"
              className={`wallet-tab ${activeTab === 'add' ? 'active' : ''}`}
              onClick={() => setActiveTab('add')}
            >
              Add Point
            </button>
            <button
              type="button"
              className={`wallet-tab ${activeTab === 'withdraw' ? 'active' : ''}`}
              onClick={() => setActiveTab('withdraw')}
            >
              Withdraw
            </button>
          </div>

          <div className="input-box">
            <span className="input-icon">🏛️</span>
            <input
              value={amount}
              onChange={(event) => setAmount(event.target.value.replace(/[^\d]/g, ''))}
              placeholder="Enter Amount"
            />
          </div>

          {activeTab === 'add' ? (
            <>
              <div className="wallet-gateway-wrap">
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
                  <option value="imb">IMB</option>
                </select>
              </div>
              <button type="button" className="wallet-submit" onClick={onAddPoints} disabled={addingPoints}>
                {addingPoints ? 'Please wait...' : 'Add Points'}
              </button>
              {gatewayKey === 'imb' ? (
                <button
                  type="button"
                  className="wallet-submit"
                  onClick={onCheckImbStatus}
                  disabled={checkingOrder || !lastOrderId}
                >
                  {checkingOrder ? 'Checking...' : 'Check Status'}
                </button>
              ) : null}
              {lastOrderId ? <div className="wallet-note">Order ID: {lastOrderId}</div> : null}
              <div className="wallet-note">Use gateway and complete payment to add points.</div>
            </>
          ) : (
            <>
              <div className="bank-tabs">
                <button
                  type="button"
                  className={paymentMode === 'upi' ? 'active' : ''}
                  onClick={() => setPaymentMode('upi')}
                >
                  UPI ID
                </button>
                <button
                  type="button"
                  className={paymentMode === 'bank' ? 'active' : ''}
                  onClick={() => setPaymentMode('bank')}
                >
                  Bank
                </button>
              </div>

              {paymentMode === 'bank' ? (
                <>
                  <input
                    className="upi-input"
                    value={accountNumber}
                    onChange={(event) => setAccountNumber(event.target.value.replace(/[^\d]/g, ''))}
                    placeholder="Account Number"
                  />
                  <input
                    className="upi-input"
                    value={confirmAccountNumber}
                    onChange={(event) => setConfirmAccountNumber(event.target.value.replace(/[^\d]/g, ''))}
                    placeholder="Confirm Account Number"
                  />
                  <input
                    className="upi-input"
                    value={ifscCode}
                    onChange={(event) => setIfscCode(event.target.value.toUpperCase())}
                    placeholder="IFSC CODE"
                  />
                  <input
                    className="upi-input"
                    value={confirmIfscCode}
                    onChange={(event) => setConfirmIfscCode(event.target.value.toUpperCase())}
                    placeholder="CONFIRM IFSC CODE"
                  />
                </>
              ) : (
                <>
                  <label className="upi-label">Enter your UPI ID</label>
                  <input
                    className="upi-input"
                    value={upiId}
                    onChange={(event) => setUpiId(event.target.value)}
                    placeholder={managerData?.upiId || 'UPI ID'}
                  />
                </>
              )}

              <button
                type="button"
                className="wallet-submit"
                onClick={handleWithdraw}
                disabled={withdrawing}
              >
                {withdrawing ? 'Please wait...' : 'Withdrawal'}
              </button>
              <div className="wallet-note">⏲️ {withdrawTimeText}</div>
            </>
          )}
        </section>

        <section className="history-card">
          <h3>{activeTab === 'withdraw' ? 'Withdraw History' : 'Wallet History'}</h3>
          <div className="history-table-wrap">
            {activeTab === 'withdraw' ? (
              <table>
                <thead>
                  <tr>
                    <th>S No</th>
                    <th>Date</th>
                    <th>Points</th>
                    <th>Closing Balance</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawRows.map((row, index) => (
                    <tr key={row._id || row.transaction_id || `${row.date || 'd'}-${index}`}>
                      <td>{index + 1}</td>
                      <td>{row.date || '--'}</td>
                      <td>{row.tr_value ?? '--'}</td>
                      <td>{row.tr_value_updated ?? row.win_bet_amt_not_use ?? '--'}</td>
                      <td className="success">{row.tr_status || '--'}</td>
                    </tr>
                  ))}
                  {withdrawRows.length === 0 ? (
                    <tr>
                      <td colSpan={5}>No withdraw history found.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Sr No</th>
                    <th>Pay Mode</th>
                    <th>Date</th>
                    <th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {walletRows.map((row, index) => (
                    <tr key={row.transaction_id || `${row.datetime || 'dt'}-${index}`}>
                      <td>{index + 1}</td>
                      <td>{row.market ? `${row.remark || '--'} ${row.market}` : row.remark || '--'}</td>
                      <td>{row.datetime || '--'}</td>
                      <td>{row.amount ?? '--'}</td>
                    </tr>
                  ))}
                  {walletRows.length === 0 ? (
                    <tr>
                      <td colSpan={4}>No wallet history found.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            )}
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

export default WalletPage
