import { APP_CONFIG } from '../config/config'
import { clearSession } from './sessionService'

function isBlockedUserMessage(message) {
  const text = String(message || '').toLowerCase()
  if (!text) return false

  return (
    text.includes('blocked') ||
    text.includes('block') ||
    text.includes('suspend') ||
    text.includes('inactive') ||
    text.includes('deactivate')
  )
}

function shouldForceLogout(data) {
  if (!data || typeof data !== 'object') return false

  if (String(data.banned) === '1') return true
  if (String(data.user_status) === '0') return true
  if (isBlockedUserMessage(data.message)) return true

  return false
}

function forceLogoutToLogin() {
  clearSession()
  if (typeof window !== 'undefined') {
    window.location.replace('/login')
  }
}

export async function postJson(endpoint, payload) {
  const response = await fetch(`${APP_CONFIG.baseUrl}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = await response.json()

  if (shouldForceLogout(data)) {
    forceLogoutToLogin()
  }

  return { ok: response.ok, data }
}

export function isApiSuccess(value) {
  return String(value) === '1'
}
