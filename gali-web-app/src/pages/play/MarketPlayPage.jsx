import { useEffect, useMemo, useState } from 'react'
import { ROUTE_PATHS } from '../routes'
import { getSession } from '../../services/sessionService'
import { placeBet } from '../../services/playService'
import { getUserCredit } from '../../services/homeService'
import SideDrawer from '../common/SideDrawer'
import MessageDialog from '../common/MessageDialog'
import AppIcon from '../common/AppIcon'
import Header from '../common/Header'
import { formatMarketDisplayName } from '../../utils/marketDisplayName'
import './marketPlay.css'

const jodiNumbers = Array.from({ length: 100 }, (_, index) => String(index).padStart(2, '0'))
const digitNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']

function mapJodiToBetList(values) {
  return Object.entries(values)
    .filter(([, amount]) => Number(amount) > 0)
    .map(([key, amount]) => ({
      betkey: key,
      betamount: String(amount),
      bettype: '8',
    }))
}

function mapHarrafToBetList(andar, bahar) {
  const andarRows = Object.entries(andar)
    .filter(([, amount]) => Number(amount) > 0)
    .map(([key, amount]) => ({
      betkey: key,
      betamount: String(amount),
      bettype: 9,
      crossing: 'no',
      chkunique: `A${key}`,
    }))

  const baharRows = Object.entries(bahar)
    .filter(([, amount]) => Number(amount) > 0)
    .map(([key, amount]) => ({
      betkey: key,
      betamount: String(amount),
      bettype: 9,
      crossing: 'no',
      chkunique: `B${key}`,
    }))

  return [...andarRows, ...baharRows]
}

function mapCrossingToBetList(rows) {
  return rows.map((row) => ({
    betkey: row.number,
    betamount: String(row.amount),
    session_name: 'open',
    bettype: '8',
  }))
}

function MarketPlayPage({ navigate }) {
  const [session] = useState(() => getSession())
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('jodiHarraf')
  const [credit, setCredit] = useState(0)
  const [dialog, setDialog] = useState({ open: false, type: 'success', title: '', message: '' })
  const [submitting, setSubmitting] = useState(false)

  const [jodiValues, setJodiValues] = useState({})
  const [andarHarraf, setAndarHarraf] = useState({})
  const [baharHarraf, setBaharHarraf] = useState({})
  const [crossFirst, setCrossFirst] = useState('')
  const [crossSecond, setCrossSecond] = useState('')
  const [crossPoints, setCrossPoints] = useState('')
  const [crossRows, setCrossRows] = useState([])
  const [rangeStart, setRangeStart] = useState('')
  const [rangeEnd, setRangeEnd] = useState('')
  const [rangePoints, setRangePoints] = useState('')
  const [rangeRows, setRangeRows] = useState([])

  const [market] = useState(() => {
    try {
      const stored = sessionStorage.getItem('selected_market')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (!session?.userId) {
      navigate(ROUTE_PATHS.login)
      return
    }
    if (!market?.id) {
      navigate(ROUTE_PATHS.play)
      return
    }

    getUserCredit(session.userId)
      .then((value) => setCredit(Number(value || 0)))
      .catch(() => {})
  }, [market?.id, navigate, session?.userId])

  const currentBetList = useMemo(() => {
    if (activeTab === 'jodiHarraf') {
      return [
        ...mapJodiToBetList(jodiValues),
        ...mapHarrafToBetList(andarHarraf, baharHarraf),
      ]
    }
    if (activeTab === 'harraf') return mapHarrafToBetList(andarHarraf, baharHarraf)
    if (activeTab === 'crossing') return mapCrossingToBetList(crossRows)
    return mapCrossingToBetList(rangeRows)
  }, [activeTab, andarHarraf, baharHarraf, crossRows, jodiValues, rangeRows])

  const totalAmount = useMemo(
    () => currentBetList.reduce((sum, row) => sum + Number(row.betamount || 0), 0),
    [currentBetList]
  )

  const setJodiAmount = (key, value) => {
    setJodiValues((prev) => ({ ...prev, [key]: value.replace(/[^\d]/g, '') }))
  }

  const setAndarAmount = (key, value) => {
    setAndarHarraf((prev) => ({ ...prev, [key]: value.replace(/[^\d]/g, '') }))
  }

  const setBaharAmount = (key, value) => {
    setBaharHarraf((prev) => ({ ...prev, [key]: value.replace(/[^\d]/g, '') }))
  }

  const addCrossingRows = () => {
    if (!crossFirst || !crossSecond || !crossPoints) return
    const points = Number(crossPoints)
    if (points <= 0) return

    const firstDigits = crossFirst.split('')
    const secondDigits = crossSecond.split('')
    const nextRows = []
    firstDigits.forEach((a) => {
      secondDigits.forEach((b) => {
        nextRows.push({ number: `${a}${b}`, amount: points })
      })
    })

    setCrossRows((prev) => [...prev, ...nextRows])
    setCrossFirst('')
    setCrossSecond('')
    setCrossPoints('')
  }

  const addRangeRows = () => {
    if (!rangeStart || !rangeEnd || !rangePoints) return
    const start = Number(rangeStart)
    const end = Number(rangeEnd)
    const amount = Number(rangePoints)
    if (Number.isNaN(start) || Number.isNaN(end) || amount <= 0 || start > end) return

    const nextRows = []
    for (let num = start; num <= end; num += 1) {
      nextRows.push({
        number: String(num).padStart(2, '0'),
        amount,
      })
    }

    setRangeRows((prev) => [...prev, ...nextRows])
    setRangeStart('')
    setRangeEnd('')
    setRangePoints('')
  }

  const removeRow = (index, kind) => {
    if (kind === 'crossing') {
      setCrossRows((prev) => prev.filter((_, idx) => idx !== index))
      return
    }
    setRangeRows((prev) => prev.filter((_, idx) => idx !== index))
  }

  const placeCurrentBet = async () => {
    if (!currentBetList.length) {
      setDialog({
        open: true,
        type: 'error',
        title: 'Error',
        message: 'Please add at least one bet.',
      })
      return
    }

    setSubmitting(true)
    try {
      const result = await placeBet({
        userId: session.userId,
        marketId: market.id,
        betList: currentBetList,
      })
      setCredit(Number(result.credit || credit))
      setDialog({
        open: true,
        type: 'success',
        title: 'Success',
        message: result.message || 'Game Played Successfully.',
      })

      if (activeTab === 'jodiHarraf') {
        setJodiValues({})
        setAndarHarraf({})
        setBaharHarraf({})
      }
      if (activeTab === 'harraf') {
        setAndarHarraf({})
        setBaharHarraf({})
      }
      if (activeTab === 'crossing') setCrossRows([])
      if (activeTab === 'numberRange') setRangeRows([])
    } catch (error) {
      setDialog({
        open: true,
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Unable to place bet.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (!session?.userId || !market?.id) return null

  return (
    <div className="market-play-page">
      <Header
        credit={credit}
        isMenuOpen={drawerOpen}
        onMenu={() => setDrawerOpen((prev) => !prev)}
        onBalanceClick={() => navigate(ROUTE_PATHS.wallet)}
        onNotification={() => navigate(ROUTE_PATHS.notification)}
      />

      <div className="market-header-row">
        <button type="button" className="back-btn" onClick={() => navigate(ROUTE_PATHS.play)}>
          ←
        </button>
        <h1>{formatMarketDisplayName(market.name) || market.id}</h1>
      </div>

      <div className="tab-row">
        <button
          className={activeTab === 'jodiHarraf' ? 'active' : ''}
          onClick={() => setActiveTab('jodiHarraf')}
        >
          Jodi/Harraf
        </button>
        <button
          className={activeTab === 'crossing' ? 'active' : ''}
          onClick={() => setActiveTab('crossing')}
        >
          Crossing
        </button>
        <button
          className={activeTab === 'numberRange' ? 'active' : ''}
          onClick={() => setActiveTab('numberRange')}
        >
          Number to Number
        </button>
      </div>

      <main className="market-content">
        <p className="remaining">Points Remaining : {credit}</p>

        {activeTab === 'jodiHarraf' ? (
          <>
            <h3 className="section-title">Jodi</h3>
            <div className="jodi-grid">
              {jodiNumbers.map((num) => (
                <div key={num} className="cell-card">
                  <div className={`cell-head ${Number(jodiValues[num] || 0) > 0 ? 'selected' : ''}`}>{num}</div>
                  <input value={jodiValues[num] || ''} onChange={(e) => setJodiAmount(num, e.target.value)} />
                </div>
              ))}
            </div>

            <h3 className="section-title">Andar Haruf</h3>
            <div className="digit-grid">
              {digitNumbers.map((num) => (
                <div key={`a-${num}`} className="cell-card">
                  <div className={`cell-head ${Number(andarHarraf[num] || 0) > 0 ? 'selected' : ''}`}>{num}</div>
                  <input value={andarHarraf[num] || ''} onChange={(e) => setAndarAmount(num, e.target.value)} />
                </div>
              ))}
            </div>

            <h3 className="section-title">Bahar Haruf</h3>
            <div className="digit-grid">
              {digitNumbers.map((num) => (
                <div key={`b-${num}`} className="cell-card">
                  <div className={`cell-head ${Number(baharHarraf[num] || 0) > 0 ? 'selected' : ''}`}>{num}</div>
                  <input value={baharHarraf[num] || ''} onChange={(e) => setBaharAmount(num, e.target.value)} />
                </div>
              ))}
            </div>
          </>
        ) : null}

        {activeTab === 'crossing' ? (
          <>
            <div className="row2">
              <div>
                <label>Number</label>
                <input value={crossFirst} onChange={(e) => setCrossFirst(e.target.value.replace(/[^\d]/g, ''))} />
              </div>
              <div>
                <label>Number</label>
                <input value={crossSecond} onChange={(e) => setCrossSecond(e.target.value.replace(/[^\d]/g, ''))} />
              </div>
            </div>
            <label>Points</label>
            <input value={crossPoints} onChange={(e) => setCrossPoints(e.target.value.replace(/[^\d]/g, ''))} />
            <button className="add-btn" onClick={addCrossingRows}>
              Add
            </button>

            <table className="bet-table">
              <thead>
                <tr>
                  <th>Number Type</th>
                  <th>Number</th>
                  <th>Points</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {crossRows.map((row, index) => (
                  <tr key={`${row.number}-${index}`}>
                    <td>Crossing</td>
                    <td>{row.number}</td>
                    <td>{row.amount}</td>
                    <td>
                      <button className="delete-btn" onClick={() => removeRow(index, 'crossing')}>
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : null}

        {activeTab === 'numberRange' ? (
          <>
            <div className="row2">
              <div>
                <label>Start Number</label>
                <input value={rangeStart} onChange={(e) => setRangeStart(e.target.value.replace(/[^\d]/g, ''))} />
              </div>
              <div>
                <label>End Number</label>
                <input value={rangeEnd} onChange={(e) => setRangeEnd(e.target.value.replace(/[^\d]/g, ''))} />
              </div>
            </div>
            <label>Points</label>
            <input value={rangePoints} onChange={(e) => setRangePoints(e.target.value.replace(/[^\d]/g, ''))} />
            <button className="add-btn" onClick={addRangeRows}>
              Add
            </button>

            <table className="bet-table">
              <thead>
                <tr>
                  <th>Number Type</th>
                  <th>Number</th>
                  <th>Points</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rangeRows.map((row, index) => (
                  <tr key={`${row.number}-${index}`}>
                    <td>Number to Number</td>
                    <td>{row.number}</td>
                    <td>{row.amount}</td>
                    <td>
                      <button className="delete-btn" onClick={() => removeRow(index, 'range')}>
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : null}

      </main>

      <footer className="bet-footer">
        <span>₹ {totalAmount}/-</span>
        <button onClick={placeCurrentBet} disabled={submitting}>
          {submitting ? 'Please wait...' : activeTab === 'jodiHarraf' ? 'Play Bet' : 'Place Bet'}
        </button>
      </footer>

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

export default MarketPlayPage
