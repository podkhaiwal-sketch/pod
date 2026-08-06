import { APP_CONFIG } from '../config/config'
import { io } from 'socket.io-client'

export function getSocketBaseUrl() {
  // VITE base is .../api/users — socket lives on host root
  return String(APP_CONFIG.baseUrl || '')
    .replace(/\/api\/users\/?$/i, '')
    .replace(/\/+$/, '')
}

export function createRouletteSocket() {
  const url = getSocketBaseUrl()
  return io(url, {
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 20,
    reconnectionDelay: 1000,
  })
}

export function numberColor(n) {
  if (Number(n) === 0) return 'green'
  return Number(n) % 2 === 0 ? 'black' : 'red'
}

/** Same hex for wheel slices + bet cards + recent chips */
export const NUMBER_COLORS = {
  green: '#0a8f3d',
  red: '#b0102a',
  black: '#141414',
}

export function numberColorHex(n) {
  return NUMBER_COLORS[numberColor(n)] || NUMBER_COLORS.black
}

export const DEFAULT_WHEEL_ORDER = [0, 9, 1, 8, 2, 7, 3, 6, 4, 5]

/** Degrees to rotate wheel so `number` lands under top pointer. */
export function rotationForNumber(number, wheelOrder = DEFAULT_WHEEL_ORDER, extraSpins = 6) {
  const order = wheelOrder?.length ? wheelOrder : DEFAULT_WHEEL_ORDER
  const index = order.indexOf(Number(number))
  const i = index >= 0 ? index : 0
  const segment = 360 / order.length
  const target = 360 - (i * segment + segment / 2)
  return extraSpins * 360 + target
}

export function formatTimer(seconds) {
  const s = Math.max(0, Number(seconds) || 0)
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`
}
