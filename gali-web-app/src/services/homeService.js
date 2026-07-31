import { API_ENDPOINTS, APP_CONFIG } from '../config/config'
import { isApiSuccess, postJson } from './httpService'

const baseUserPayload = (userId) => ({
  app_id: APP_CONFIG.appId,
  user_id: String(userId || ''),
  dev_id: APP_CONFIG.devId,
})

export async function getUserProfile(userId) {
  const { data } = await postJson(API_ENDPOINTS.getUserProfile, baseUserPayload(userId))
  if (!isApiSuccess(data.success)) {
    throw new Error(data.message || 'Unable to fetch profile.')
  }
  return data
}

export async function getAppNotice(userId) {
  const { data } = await postJson(API_ENDPOINTS.appNotice, {
    app_id: APP_CONFIG.appId,
    user_id: String(userId || ''),
  })

  if (!isApiSuccess(data.status)) {
    return []
  }

  return Array.isArray(data.data) ? data.data : []
}

export async function getHomeDashboard(userId) {
  const { data } = await postJson(API_ENDPOINTS.home, baseUserPayload(userId))
  if (!isApiSuccess(data.success)) {
    throw new Error(data.message || 'Unable to fetch home data.')
  }
  return data
}

export async function getUserCredit(userId) {
  const { data } = await postJson(API_ENDPOINTS.userCredit, baseUserPayload(userId))
  if (!isApiSuccess(data.success)) {
    return 0
  }
  return Number(data.credit || 0)
}

export async function getHelpNumber() {
  const { data } = await postJson(API_ENDPOINTS.helpNumber, {
    app_id: APP_CONFIG.appId,
  })

  if (!isApiSuccess(data.status)) {
    return null
  }

  return data.data || null
}
