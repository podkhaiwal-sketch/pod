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
  const url = `${APP_CONFIG.baseUrl}${endpoint}`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const raw = await response.text()
  let data
  try {
    data = raw ? JSON.parse(raw) : {}
  } catch {
    const preview = raw.trim().slice(0, 80)
    throw new Error(
      `API returned non-JSON (${response.status}) from ${url}. ` +
        `Check VITE_API_BASE_URL and that the API server is running. Preview: ${preview}`
    )
  }

  if (shouldForceLogout(data)) {
    forceLogoutToLogin()
  }

  return { ok: response.ok, data }
}

export function isApiSuccess(value) {
  return String(value) === '1'
}
