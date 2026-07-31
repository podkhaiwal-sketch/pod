import { API_ENDPOINTS, APP_CONFIG } from '../config/config'
import { isApiSuccess, postJson } from './httpService'

export async function getMarketList(userId) {
  const { data } = await postJson(API_ENDPOINTS.marketList, {
    app_id: APP_CONFIG.appId,
    user_id: String(userId || ''),
    dev_id: APP_CONFIG.devId,
  })

  const payload = data?.message
  if (!payload || !isApiSuccess(payload.status)) {
    throw new Error(payload?.message || 'Unable to fetch market list.')
  }

  return Array.isArray(payload.data) ? payload.data : []
}

export async function placeBet({ userId, marketId, betList }) {
  const { data } = await postJson(API_ENDPOINTS.batPlace, {
    user_id: String(userId || ''),
    dev_id: APP_CONFIG.devId,
    market_id: marketId,
    app_id: APP_CONFIG.appId,
    BetList: betList,
    dev_model: 'web',
    devName: 'sumsang',
    batuniqueid: `${Date.now()}_${Math.floor(Math.random() * 1000)}`,
  })

  if (!isApiSuccess(data?.success)) {
    throw new Error(data?.message || 'Unable to place bet.')
  }

  return data
}
