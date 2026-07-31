import { API_ENDPOINTS, APP_CONFIG } from '../config/config'
import { isApiSuccess, postJson } from './httpService'
import { saveSession } from './sessionService'

function firstNonEmpty(...values) {
  for (const value of values) {
    if (value === undefined || value === null) continue
    const text = String(value).trim()
    if (text) return text
  }
  return ''
}

function extractSessionFromAuthData(data, fallbackMobile = '', fallbackName = '') {
  const result = data?.result || data?.data || {}

  const userId = firstNonEmpty(
    data?.user_id,
    data?.userId,
    data?.userid,
    data?.id,
    result?.user_id,
    result?.userId,
    result?.userid,
    result?.id
  )
  const name = firstNonEmpty(data?.name, data?.user_name, result?.name, result?.user_name, fallbackName)
  const mobileNum = firstNonEmpty(
    data?.mobileNum,
    data?.mobile_num,
    data?.mobile,
    data?.mob,
    result?.mobileNum,
    result?.mobile_num,
    result?.mobile,
    result?.mob,
    fallbackMobile
  )
  const token = firstNonEmpty(
    data?.login_token,
    data?.auth,
    data?.token,
    result?.login_token,
    result?.auth,
    result?.token
  )

  return { userId, name, mobileNum, token }
}

export async function loginUser({ mobileNum, pss }) {
  const { data } = await postJson(API_ENDPOINTS.login, {
    mobileNum: mobileNum.trim(),
    pss,
    dev_id: APP_CONFIG.devId,
    app_id: APP_CONFIG.appId,
  })

  if (!isApiSuccess(data.success)) {
    throw new Error(data.message || 'Login failed.')
  }

  const session = extractSessionFromAuthData(data, mobileNum.trim())
  if (!session.userId) {
    throw new Error('Login succeeded but user id missing in response.')
  }

  saveSession(session)
  return { session, message: data.message || 'Login successful.' }
}

/**
 * Creates account in one step via POST /register-step1 (no OTP).
 */
export async function registerAccount({ name, mobileNum, pss, refercode = '' }) {
  const { ok, data } = await postJson(API_ENDPOINTS.registerStep1, {
    name: name.trim(),
    pss,
    mobileNum: mobileNum.trim(),
    refercode: String(refercode || '').trim(),
    lat: '0',
    lng: '0',
    dev_id: APP_CONFIG.devId,
    app_id: APP_CONFIG.appId,
  })

  if (!ok || !isApiSuccess(data.success)) {
    throw new Error(data.message || 'Registration failed.')
  }

  const session = extractSessionFromAuthData(data, mobileNum.trim(), name.trim())
  if (!session.userId) {
    throw new Error('Registration succeeded but user id missing in response.')
  }

  saveSession(session)
  return { session, message: data.message || 'User registered successfully.' }
}

/** @deprecated Use registerAccount — OTP removed; otp is ignored */
export async function registerUser({ name, mobileNum, pss, refercode, otp: _otp }) {
  return registerAccount({ name, mobileNum, pss, refercode })
}
