import { useEffect, useMemo, useRef, useState } from 'react'
import { ROUTE_PATHS } from '../routes'
import { getSession } from '../../services/sessionService'
import { APP_CONFIG } from '../../config/config'
import AppIcon from '../common/AppIcon'
import BottomNav from '../common/BottomNav'
import {
  createRouletteSocket,
  DEFAULT_WHEEL_ORDER,
  formatTimer,
  numberColor,
  numberColorHex,
  rotationForNumber,
} from '../../services/rouletteService'
import './roulette.css'

const CHIP_OPTIONS = [10, 50, 100, 500]
const BET_NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

function RoulettePage({ navigate }) {
  const [session] = useState(() => getSession())
  const socketRef = useRef(null)
  const wheelRef = useRef(null)
  const rotationRef = useRef(0)
  const lastBetsRef = useRef([])

  const [credit, setCredit] = useState(0)
  const [phase, setPhase] = useState('betting')
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [recent, setRecent] = useState([])
  const [wheelOrder, setWheelOrder] = useState(DEFAULT_WHEEL_ORDER)
  const [config, setConfig] = useState({
    minBet: 10,
    maxBet: 10000,
    payoutMultiplier: 10,
    spinMs: 7000,
  })
  const [connected, setConnected] = useState(false)
  const [soundOn, setSoundOn] = useState(true)
  const [chip, setChip] = useState(10)
  const [pendingBets, setPendingBets] = useState({}) // number -> amount
  const [historyStack, setHistoryStack] = useState([])
  const [confirmedBets, setConfirmedBets] = useState([])
  const [placing, setPlacing] = useState(false)
  const [toast, setToast] = useState('')
  const [lastWin, setLastWin] = useState(null)
  const [spinningTo, setSpinningTo] = useState(null)
  const roundIdRef = useRef(null)

  const showToast = (msg) => {
    setToast(msg)
    window.setTimeout(() => setToast(''), 2800)
  }

  const pendingList = useMemo(
    () =>
      Object.entries(pendingBets)
        .map(([number, amount]) => ({ number: Number(number), amount: Number(amount) }))
        .filter((b) => b.amount > 0),
    [pendingBets]
  )

  const totalPending = useMemo(
    () => pendingList.reduce((sum, b) => sum + b.amount, 0),
    [pendingList]
  )

  const confirmedTotal = useMemo(
    () => confirmedBets.reduce((sum, b) => sum + Number(b.amount || 0), 0),
    [confirmedBets]
  )

  const displayBets = useMemo(() => {
    const map = {}
    confirmedBets.forEach((b) => {
      map[b.number] = (map[b.number] || 0) + Number(b.amount || 0)
    })
    pendingList.forEach((b) => {
      map[b.number] = (map[b.number] || 0) + b.amount
    })
    return map
  }, [confirmedBets, pendingList])

  const betsCount = Object.keys(displayBets).length
  const totalBet = confirmedTotal + totalPending
  const maxWin = useMemo(() => {
    const amounts = Object.values(displayBets)
    if (!amounts.length) return 0
    return Math.floor(Math.max(...amounts) * (config.payoutMultiplier || 10))
  }, [displayBets, config.payoutMultiplier])

  const bettingOpen = phase === 'betting' && !placing

  useEffect(() => {
    if (!session?.userId) {
      navigate(ROUTE_PATHS.login)
      return undefined
    }

    const socket = createRouletteSocket()
    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
      socket.emit('roulette:join', {
        userId: session.userId,
        app_id: APP_CONFIG.appId,
      })
    })

    socket.on('disconnect', () => setConnected(false))

    socket.on('roulette:state', (payload) => {
      if (payload?.credit != null) setCredit(Number(payload.credit) || 0)
      if (payload?.phase) setPhase(payload.phase)
      if (payload?.secondsLeft != null) setSecondsLeft(Number(payload.secondsLeft) || 0)
      if (Array.isArray(payload?.recent)) setRecent(payload.recent)
      if (payload?.roundId && payload.roundId !== roundIdRef.current) {
        roundIdRef.current = payload.roundId
        if (payload.phase === 'betting') {
          setConfirmedBets([])
          setPendingBets({})
          setHistoryStack([])
          setLastWin(null)
        }
      }
      if (payload?.config) {
        setConfig((prev) => ({ ...prev, ...payload.config }))
        if (payload.config.wheelOrder?.length) setWheelOrder(payload.config.wheelOrder)
        if (payload.config.minBet) setChip(Number(payload.config.minBet))
      }
      if (Array.isArray(payload?.myBets)) setConfirmedBets(payload.myBets)
      if (
        (payload?.phase === 'spinning' || payload?.phase === 'result') &&
        payload?.winningNumber != null
      ) {
        snapWheelTo(payload.winningNumber, payload.config?.wheelOrder || wheelOrder)
      }
    })

    socket.on('roulette:tick', (payload) => {
      if (payload?.phase) setPhase(payload.phase)
      if (payload?.secondsLeft != null) setSecondsLeft(Number(payload.secondsLeft) || 0)
    })

    socket.on('roulette:spin', (payload) => {
      setPhase('spinning')
      setPendingBets({})
      setHistoryStack([])
      if (payload?.winningNumber != null) {
        spinWheelTo(payload.winningNumber, payload.spinMs || config.spinMs)
      }
    })

    socket.on('roulette:roundResult', (payload) => {
      setPhase('result')
      if (Array.isArray(payload?.recent)) setRecent(payload.recent)
      if (payload?.winningNumber != null) setSpinningTo(payload.winningNumber)
    })

    socket.on('roulette:result', (payload) => {
      if (payload?.credit != null) setCredit(Number(payload.credit) || 0)
      if (payload?.won) {
        setLastWin(Number(payload.winAmount) || 0)
        showToast(`You won ₹${payload.winAmount}`)
      } else if (payload?.winningNumber != null) {
        setLastWin(0)
      }
      setConfirmedBets([])
    })

    socket.on('roulette:betAccepted', (payload) => {
      setPlacing(false)
      if (payload?.credit != null) setCredit(Number(payload.credit) || 0)
      if (Array.isArray(payload?.bets)) setConfirmedBets(payload.bets)
      setPendingBets({})
      setHistoryStack([])
      showToast('Bet placed')
    })

    socket.on('roulette:balance', (payload) => {
      if (payload?.credit != null) setCredit(Number(payload.credit) || 0)
    })

    socket.on('roulette:error', (payload) => {
      setPlacing(false)
      showToast(payload?.message || 'Something went wrong')
    })

    return () => {
      socket.removeAllListeners()
      socket.disconnect()
      socketRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.userId])

  const snapWheelTo = (number, order = wheelOrder) => {
    const deg = rotationForNumber(number, order, 0)
    rotationRef.current = deg
    if (wheelRef.current) {
      wheelRef.current.style.transition = 'none'
      wheelRef.current.style.transform = `rotate(${deg}deg)`
    }
    setSpinningTo(number)
  }

  const spinWheelTo = (number, spinMs = 7000) => {
    setSpinningTo(number)
    const base = rotationRef.current % 360
    const target = rotationForNumber(number, wheelOrder, 6)
    // Keep continuous forward spin from current visual angle
    const next = rotationRef.current - base + target
    rotationRef.current = next
    if (wheelRef.current) {
      wheelRef.current.style.transition = `transform ${spinMs}ms cubic-bezier(0.12, 0.75, 0.12, 1)`
      wheelRef.current.style.transform = `rotate(${next}deg)`
    }
  }

  const addBetOnNumber = (num) => {
    if (!bettingOpen) {
      showToast(phase === 'spinning' ? 'Wheel is spinning' : 'Betting closed')
      return
    }
    const amount = Number(chip)
    if (amount < (config.minBet || 10)) {
      showToast(`Min bet ${config.minBet}`)
      return
    }
    const nextTotal = totalBet + amount
    if (nextTotal > (config.maxBet || 10000)) {
      showToast(`Max bet ${config.maxBet}`)
      return
    }
    if (nextTotal > credit) {
      showToast('Insufficient balance')
      return
    }

    setHistoryStack((h) => [...h, pendingBets])
    setPendingBets((prev) => ({
      ...prev,
      [num]: (Number(prev[num]) || 0) + amount,
    }))
  }

  const onUndo = () => {
    setHistoryStack((h) => {
      if (!h.length) return h
      const prev = h[h.length - 1]
      setPendingBets(prev)
      return h.slice(0, -1)
    })
  }

  const onClear = () => {
    if (!Object.keys(pendingBets).length) return
    setHistoryStack((h) => [...h, pendingBets])
    setPendingBets({})
  }

  const onRepeat = () => {
    if (!bettingOpen) {
      showToast('Betting closed')
      return
    }
    const last = lastBetsRef.current
    if (!last?.length) {
      showToast('No previous bet')
      return
    }
    const map = {}
    last.forEach((b) => {
      map[b.number] = (map[b.number] || 0) + Number(b.amount)
    })
    const sum = Object.values(map).reduce((a, b) => a + b, 0)
    if (sum > credit) {
      showToast('Insufficient balance')
      return
    }
    setHistoryStack((h) => [...h, pendingBets])
    setPendingBets(map)
  }

  const onPlaceBet = () => {
    if (!bettingOpen) {
      showToast('Betting closed')
      return
    }
    if (!pendingList.length) {
      showToast('Select a number first')
      return
    }
    if (!socketRef.current?.connected) {
      showToast('Connecting… try again')
      return
    }
    setPlacing(true)
    lastBetsRef.current = pendingList
    socketRef.current.emit('roulette:placeBet', {
      userId: session.userId,
      app_id: APP_CONFIG.appId,
      bets: pendingList,
    })
  }

  const wheelLabels = useMemo(() => {
    const order = wheelOrder?.length ? wheelOrder : DEFAULT_WHEEL_ORDER
    const segment = 360 / order.length
    return order.map((n, i) => {
      const angle = i * segment + segment / 2
      return { n, angle, color: numberColor(n) }
    })
  }, [wheelOrder])

  const conic = useMemo(() => {
    const order = wheelOrder?.length ? wheelOrder : DEFAULT_WHEEL_ORDER
    const segment = 360 / order.length
    const stops = order.map((n, i) => {
      const color = numberColorHex(n)
      const start = i * segment
      const end = (i + 1) * segment
      return `${color} ${start}deg ${end}deg`
    })
    // CSS conic 0deg = top; keep aligned with label angles + bet card colors
    return `conic-gradient(from 0deg, ${stops.join(', ')})`
  }, [wheelOrder])

  return (
    <div className="roulette-page">
      <header className="rl-top">
        <button type="button" className="rl-icon-btn" onClick={() => navigate(ROUTE_PATHS.home)} aria-label="Back">
          <AppIcon name="arrow_back" />
        </button>
        <h1>Roulette</h1>
        <div className="rl-top-right">
          <button type="button" className="rl-balance" onClick={() => navigate(ROUTE_PATHS.wallet)}>
            <span className="rl-coin" aria-hidden />
            <strong>{credit}</strong>
          </button>
          <button
            type="button"
            className="rl-icon-btn"
            onClick={() => setSoundOn((v) => !v)}
            aria-label="Sound"
          >
            <AppIcon name={soundOn ? 'volume_up' : 'volume_off'} />
          </button>
        </div>
      </header>

      <div className="rl-status-row">
        <span className={`rl-dot ${connected ? 'on' : ''}`} />
        <span>
          {phase === 'betting' && 'Place your bets'}
          {phase === 'spinning' && 'Spinning…'}
          {phase === 'result' && (lastWin > 0 ? `Win ₹${lastWin}` : 'Round result')}
        </span>
      </div>

      <section className="rl-wheel-stage">
        <div className="rl-pointer" aria-hidden />
        <div className="rl-wheel-shell">
          <div
            ref={wheelRef}
            className="rl-wheel"
            style={{ background: conic }}
          >
            <svg className="rl-wheel-dividers" viewBox="0 0 200 200" aria-hidden>
              {wheelLabels.map(({ n }, i) => {
                const segment = 360 / wheelLabels.length
                const deg = -90 + i * segment
                const rad = (deg * Math.PI) / 180
                const x2 = 100 + Math.cos(rad) * 100
                const y2 = 100 + Math.sin(rad) * 100
                return (
                  <line
                    key={`div-${n}`}
                    x1="100"
                    y1="100"
                    x2={x2}
                    y2={y2}
                    className="rl-wheel-divider"
                  />
                )
              })}
            </svg>
            <div className="rl-wheel-rim" />
            {wheelLabels.map(({ n, angle }) => (
              <div
                key={n}
                className="rl-wheel-label"
                style={{ transform: `rotate(${angle}deg)` }}
              >
                <span
                  className="rl-wheel-num"
                  style={{ transform: `translateX(-50%) rotate(${-angle}deg)` }}
                >
                  {n}
                </span>
              </div>
            ))}
            <div className="rl-wheel-hub" />
          </div>
        </div>
      </section>

      <section className="rl-recent">
        <span className="rl-recent-label">RECENT</span>
        <div className="rl-recent-list">
          {recent.length ? (
            recent.map((n, idx) => (
              <span
                key={`${n}-${idx}`}
                className={`rl-chip-num rl-chip-num--${numberColor(n)}`}
                style={{ backgroundColor: numberColorHex(n) }}
              >
                {n}
              </span>
            ))
          ) : (
            <span className="rl-muted">—</span>
          )}
        </div>
      </section>

      <section className="rl-bet-grid">
        {BET_NUMBERS.map((n) => (
          <button
            key={n}
            type="button"
            className={`rl-bet-cell rl-bet-cell--${numberColor(n)} ${displayBets[n] ? 'has-bet' : ''}`}
            style={{ backgroundColor: numberColorHex(n) }}
            onClick={() => addBetOnNumber(n)}
            disabled={!bettingOpen}
          >
            <span className="rl-bet-n">{n}</span>
            {displayBets[n] ? <span className="rl-bet-amt">{displayBets[n]}</span> : null}
          </button>
        ))}
      </section>

      <section className="rl-chips">
        {CHIP_OPTIONS.map((c) => (
          <button
            key={c}
            type="button"
            className={`rl-chip ${chip === c ? 'active' : ''}`}
            onClick={() => setChip(c)}
          >
            {c}
          </button>
        ))}
      </section>

      <section className="rl-stats">
        <div className="rl-stat">
          <span>BETS</span>
          <strong>{betsCount}</strong>
        </div>
        <div className="rl-stat">
          <span>TOTAL BET</span>
          <strong>{totalBet}</strong>
        </div>
        <div className="rl-stat">
          <span>MAX WIN</span>
          <strong>{maxWin}</strong>
        </div>
        <div className="rl-actions">
          <button type="button" className="rl-mini" onClick={onUndo} aria-label="Undo">
            <AppIcon name="undo" />
          </button>
          <button type="button" className="rl-mini" onClick={onClear} aria-label="Clear">
            <AppIcon name="close" />
          </button>
          <button type="button" className="rl-mini" onClick={onRepeat} aria-label="Repeat">
            <AppIcon name="replay" />
          </button>
        </div>
      </section>

      <button
        type="button"
        className="rl-place"
        onClick={onPlaceBet}
        disabled={!bettingOpen || !pendingList.length}
      >
        {placing ? 'PLACING…' : 'PLACE BET'}
      </button>

      <div className="rl-timer">{formatTimer(secondsLeft)}</div>

      {toast ? <div className="rl-toast">{toast}</div> : null}
      {spinningTo != null && phase === 'result' ? (
        <div className="rl-result-badge">
          Result:{' '}
          <strong
            className={`rl-chip-num--${numberColor(spinningTo)}`}
            style={{ backgroundColor: numberColorHex(spinningTo) }}
          >
            {spinningTo}
          </strong>
        </div>
      ) : null}

      <BottomNav activeTab="roulette" navigate={navigate} />
    </div>
  )
}

export default RoulettePage
