const USER_KEY = 'pod_user'
const TOKEN_KEY = 'pod_auth_token'
const LEGACY_USER_KEYS = ['pod_user_data', 'user', 'session']

function normalizeSession(session) {
  if (!session || typeof session !== 'object') return null

  const userId = String(session.userId || session.user_id || session.userid || session.id || '').trim()
  const mobileNum = String(session.mobileNum || session.mobile_num || session.mob || '').trim()
  const token = String(session.token || session.login_token || '').trim()

  return {
    ...session,
    userId,
    mobileNum,
    token,
  }
}

export function saveSession(session) {
  
  if (!session) return
  const normalized = normalizeSession(session)
  if (!normalized) return

  console.log("session", session)
  localStorage.setItem(USER_KEY, JSON.stringify(normalized))
  localStorage.setItem(TOKEN_KEY, normalized.token || '')
}

export function getSession() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    let parsed = raw ? JSON.parse(raw) : null
    let normalized = normalizeSession(parsed)

    if (!normalized?.userId) {
      for (const legacyKey of LEGACY_USER_KEYS) {
        const legacyRaw = localStorage.getItem(legacyKey)
        if (!legacyRaw) continue
        try {
          parsed = JSON.parse(legacyRaw)
        } catch {
          continue
        }
        normalized = normalizeSession(parsed)
        if (normalized?.userId) {
          saveSession(normalized)
          localStorage.removeItem(legacyKey)
          break
        }
      }
    }

    return normalized
  } catch {
    return null
  }
}

export function clearSession() {
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(TOKEN_KEY)
}
