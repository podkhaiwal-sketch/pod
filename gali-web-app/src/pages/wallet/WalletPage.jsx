import { useEffect, useMemo, useRef, useState } from 'react'
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
import { formatMarketDisplayName } from '../../utils/marketDisplayName'
import './wallet.css'

function WalletPage({ navigate }) {
  const IMB_PENDING_ORDER_KEY = 'imb_pending_order_id'
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
  const [checkingOrderStatus, setCheckingOrderStatus] = useState(false)
  const [lastOrderId, setLastOrderId] = useState('')
  const [paymentLinks, setPaymentLinks] = useState({
    phonepe: '',
    paytm: '',
    bhim: '',
    browser: '',
  })
  const lastAutoCheckedOrderRef = useRef('')
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
        const [managerResult, creditResult, walletResult, withdrawResult] = await Promise.allSettled([
          getAppManager(session.userId),
          getUserCredit(session.userId),
          getWalletReport(session.userId),
          getWithdrawHistory(session.userId),
        ])

        if (managerResult.status === 'fulfilled') {
          setManagerData(managerResult.value?.data || managerResult.value || null)
        } else {
          setManagerData(null)
        }

        if (creditResult.status === 'fulfilled') {
          setCredit(Number(creditResult.value || 0))
        }

        if (walletResult.status === 'fulfilled') {
          setWalletRows(walletResult.value)
        } else {
          setWalletRows([])
        }

        if (withdrawResult.status === 'fulfilled') {
          setWithdrawRows(withdrawResult.value)
        } else {
          setWithdrawRows([])
        }

        const failed = [managerResult, creditResult, walletResult, withdrawResult].filter(
          (result) => result.status === 'rejected'
        ).length

        if (failed > 0) {
          // setError('Some wallet data could not be loaded. Please refresh.')
        }
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [navigate, session?.userId])

   
  useEffect(() => {
     let envt= setInterval(() => {
      lastOrderId &&  onCheckOrderStatus()
     }, 3000)
     return () => clearInterval(envt) 
  }, [lastOrderId])



  const appController = managerData?.appController || managerData || {}
  const gatewayFromApi = String(managerData?.gateway?.name || managerData?.gateway?.slug || '').toLowerCase()

  const withdrawTimeText = useMemo(() => {
    const open = appController?.withdraw_open_time || '07:00'
    const close = appController?.withdraw_close_time || '13:30'
    return `Withdrawal Time ${open} to ${close}`
  }, [appController?.withdraw_close_time, appController?.withdraw_open_time])

  const isWithdrawTimeOpen = () => {
    const open = String(appController?.withdraw_open_time || '07:00')
    const close = String(appController?.withdraw_close_time || '13:30')
    const parseMinutes = (value) => {
      const [h, m] = value.split(':').map((part) => Number(part))
      if (Number.isNaN(h) || Number.isNaN(m)) return null
      return h * 60 + m
    }

    const openMin = parseMinutes(open)
    const closeMin = parseMinutes(close)
    if (openMin === null || closeMin === null) return true

    const now = new Date()
    const nowMin = now.getHours() * 60 + now.getMinutes()

    // Support windows that cross midnight as well.
    if (openMin <= closeMin) {
      return nowMin >= openMin && nowMin <= closeMin
    }
    return nowMin >= openMin || nowMin <= closeMin
  }

  const depositDisabled =
    String(appController?.deposit_disable || '0') === '0'
  const withdrawDisabled =
    String(appController?.withdraw_disable || '0') === '0'
  const minDeposit = Number(appController?.min_deposit ?? appController?.minDeposit ?? 0)
  const maxDeposit = Number(appController?.max_deposit ?? appController?.maxDeposit ?? 0)
  const minRedeem = Number(appController?.min_redeem ?? appController?.minRedeem ?? 0)

  const onAddPoints = async () => {
    if (depositDisabled) {
      setDialog({
        open: true,
        type: 'error',
        title: 'Deposit Disabled',
        message: 'Online deposit is currently disabled by admin.',
      })
      return
    }

    if (!amount || Number(amount) <= 0) {
      setDialog({
        open: true,
        type: 'error',
        title: 'Error',
        message: 'Please enter valid amount.',
      })
      return
    }

    const numericAmount = Number(amount)
    if (minDeposit > 0 && numericAmount < minDeposit) {
      setDialog({
        open: true,
        type: 'error',
        title: 'Invalid Amount',
        message: `Minimum deposit is ${minDeposit}.`,
      })
      return
    }
    if (maxDeposit > 0 && numericAmount > maxDeposit) {
      setDialog({
        open: true,
        type: 'error',
        title: 'Invalid Amount',
        message: `Maximum deposit is ${maxDeposit}.`,
      })
      return
    }

    const selectedGateway = gatewayFromApi || gatewayKey || 'utr'
    if (selectedGateway === 'imb') {
      setAddingPoints(true)
      try {
        const generatedOrderId = `${String(session?.userId || '')}${Date.now()}`
        const payload = {
          user_id: String(session?.userId || ''),
          app_id: APP_CONFIG.appId,
          amount: numericAmount,
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
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(IMB_PENDING_ORDER_KEY, finalOrderId)
        }

        const resultData = data?.result || data?.data || {}
        const paymentUrl =
          resultData?.payment_url ||
          data?.payment_url ||
          resultData?.payment_link ||
          data?.payment_link ||
          data?.url
        const paytmLink = resultData?.paytm_link || data?.paytm_link || ''
        const bhimLink = resultData?.bhim_link || data?.bhim_link || ''
        const phonepeLink = resultData?.phonepe_link || data?.phonepe_link || bhimLink

        setPaymentLinks({
          phonepe: String(phonepeLink || ''),
          paytm: String(paytmLink || ''),
          bhim: String(bhimLink || ''),
          browser: String(paymentUrl || ''),
        })

        if (paytmLink || bhimLink || phonepeLink || paymentUrl) {
          // setDialog({
          //   open: true,
          //   type: 'success',
          //   title: 'Payment Options',
          //   message: 'Select app and pay now.',
          // })
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

    } else {
      const name = encodeURIComponent(session?.name || 'Test')
      const userid = encodeURIComponent(String(session?.userId || ''))
      const contact = encodeURIComponent(session?.mobileNum || '')
      const finalAmount = encodeURIComponent(String(amount))

      const url = `${APP_CONFIG.paymentGatewayUrl}?name=${name}&userid=${userid}&amount=${finalAmount}&contact=${contact}&getaway=${selectedGateway}`
      window.location.href = url
    }
  }

  const onCheckOrderStatus = async (customOrderId = '', isAuto = false) => {
    const orderIdToCheck = String(customOrderId || lastOrderId || '')
    if (!orderIdToCheck) return

    setCheckingOrderStatus(true)
    try {
      const response = await fetch(`${APP_CONFIG.baseUrl}/imb-check-order-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderIdToCheck,
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
      const successStatuses = ['SUCCESS', 'PAID', 'COMPLETED']
      if (successStatuses.includes(String(statusValue).toUpperCase())) {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(IMB_PENDING_ORDER_KEY)
        }
        setLastOrderId('')
        setPaymentLinks({ phonepe: '', paytm: '', bhim: '', browser: '' })
        // page reload after 3 seconds
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }

      if (!isAuto || successStatuses.includes(String(statusValue).toUpperCase())) {
        // setDialog({
        //   open: true,
        //   type: 'success',
        //   title: 'Order Status',
        //   message: `${data?.message || 'Status fetched'} (${statusValue})`,
        // })
      }
    } catch (apiError) {
      if (!isAuto) {
        // setDialog({
        //   open: true,
        //   type: 'error',
        //   title: 'Error',
        //   message: apiError instanceof Error ? apiError.message : 'Unable to check IMB status.',
        // })
      }
    } finally {
      setCheckingOrderStatus(false)
    }
  }

  const openPaymentLink = (link, useBrowser = false) => {
    if (!link) return
    if (useBrowser) {
      window.open(link, '_blank', 'noopener,noreferrer')
      return
    }
    window.location.href = link
  }


  const handleWithdraw = async () => {
    if (withdrawDisabled) {
      setDialog({
        open: true,
        type: 'error',
        title: 'Withdraw Disabled',
        message: 'Withdrawal is currently disabled by admin.',
      })
      return
    }

    if (!isWithdrawTimeOpen()) {
      setDialog({
        open: true,
        type: 'error',
        title: 'Withdraw Closed',
        message: withdrawTimeText,
      })
      return
    }

    if (!amount || Number(amount) <= 0) {
      setDialog({
        open: true,
        type: 'error',
        title: 'Error',
        message: 'Please enter valid amount.',
      })
      return
    }
    if (minRedeem > 0 && Number(amount) < minRedeem) {
      setDialog({
        open: true,
        type: 'error',
        title: 'Invalid Amount',
        message: `Minimum redeem required is ${minRedeem}.`,
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

      <section className="wallet-win-strip win-strip" aria-live="polite">
        <div className="wallet-win-strip-inner">
          <span className="wallet-win-label">Win amount</span>
          <span className="wallet-win-value">₹ {Number(credit).toLocaleString('en-IN')}</span>
        </div>
      </section>

      <main className="wallet-content">
        {loading ? (
          <div className="wallet-loading" aria-busy aria-label="Loading wallet">
            <div className="wallet-skeleton wallet-skeleton-card" />
            <div className="wallet-skeleton wallet-skeleton-input" />
            <div className="wallet-skeleton wallet-skeleton-btn" />
            <div className="wallet-skeleton wallet-skeleton-table" />
          </div>
        ) : null}
        {error ? <p className="state-text error">{error}</p> : null}

        {!loading ? (
        <section className="wallet-card">
          <div className="wallet-tabs">
            <button
              type="button"
              className={`wallet-tab ${activeTab === 'add' ? 'active' : ''}`}
              onClick={() => setActiveTab('add')}
            >
              Add points
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
            <span className="input-icon" aria-hidden>
              ₹
            </span>
            <input
              value={amount}
              onChange={(event) => setAmount(event.target.value.replace(/[^\d]/g, ''))}
              placeholder="Enter amount"
              inputMode="numeric"
              autoComplete="off"
            />
          </div>

          {activeTab === 'add' ? (
            <>
              {/* <div className="wallet-gateway-wrap">
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
              </div> */}
              <button
                type="button"
                className="wallet-submit"
                onClick={onAddPoints}
                disabled={addingPoints || depositDisabled}
              >
                {addingPoints ? 'Please wait...' : 'Add Points'}
              </button>

              {paymentLinks.phonepe || paymentLinks.paytm || paymentLinks.bhim || paymentLinks.browser ? (
                <div className="wallet-pay-options">
                  {/* <button
                    type="button"
                    className="wallet-pay-app phonepe"
                    onClick={() => openPaymentLink(paymentLinks.phonepe)}
                    disabled={!paymentLinks.phonepe}
                  >
                    PhonePe
                  </button>
                  <button
                    type="button"
                    className="wallet-pay-app paytm"
                    onClick={() => openPaymentLink(paymentLinks.paytm)}
                    disabled={!paymentLinks.paytm}
                  >
                    Paytm
                  </button> */}
                  <button
                    type="button"
                    className="wallet-pay-app bhim"
                    onClick={() => openPaymentLink(paymentLinks.bhim)}
                    disabled={!paymentLinks.bhim}
                  >
                    BHIM
                  </button>
                  <button
                    type="button"
                    className="wallet-pay-app browser"
                    onClick={() => openPaymentLink(paymentLinks.browser, true)}
                    disabled={!paymentLinks.browser}
                  >
                    Other
                  </button>
                </div>
              ) : null}
          
              {lastOrderId ? <div className="wallet-note">Order ID: {lastOrderId}</div> : null}  
              {depositDisabled ? <div className="wallet-note">Deposit is disabled by admin.</div> : null}
              {!depositDisabled && minDeposit > 0 ? (
                <div className="wallet-note">
                  Deposit Limit: Min {minDeposit}
                  {maxDeposit > 0 ? ` / Max ${maxDeposit}` : ''}
                </div>
              ) : null}
              <p className="wallet-hint">Complete payment in your app to add points.</p>
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
                    placeholder={appController?.upiId || 'UPI ID'}
                  />
                </>
              )}

              <button
                type="button"
                className="wallet-submit"
                onClick={handleWithdraw}
                disabled={withdrawing || withdrawDisabled}
              >
                {withdrawing ? 'Please wait...' : 'Withdrawal'}
              </button>
              {withdrawDisabled ? <div className="wallet-note">Withdraw is disabled by admin.</div> : null}
              {!withdrawDisabled && minRedeem > 0 ? (
                <div className="wallet-note">Minimum Redeem: {minRedeem}</div>
              ) : null}
              <p className="wallet-hint wallet-hint--time">⏲️ {withdrawTimeText}</p>
            </>
          )}
        </section>
        ) : null}

        {!loading ? (
        <section className="history-card">
          <h3>{activeTab === 'withdraw' ? 'Withdraw history' : 'Wallet history'}</h3>
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
                      <td>
                        {formatMarketDisplayName(
                          row.market ? `${row.remark || '--'} ${row.market}` : row.remark || '--'
                        )}
                      </td>
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
        ) : null}
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
