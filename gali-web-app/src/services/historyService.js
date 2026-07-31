import { API_ENDPOINTS, APP_CONFIG } from '../config/config'
import { isApiSuccess, postJson } from './httpService'

export async function getPendingBetHistory(userId, tblCode = 'all', page = 1) {
  const { data } = await postJson(API_ENDPOINTS.pendingBetHistory, {
    app_id: APP_CONFIG.appId,
    user_id: String(userId || ''),
    tbl_code: tblCode,
    page,
  })

  const payload = data?.data
  if (!payload || !isApiSuccess(payload.success)) {
    throw new Error(payload?.message || 'Unable to fetch pending bet history.')
  }

  return {
    rows: Array.isArray(payload.data) ? payload.data : [],
    pagination: Number(payload.pagination || 1),
    totalRecords: Number(data?.totalRecords || 0),
  }
}

export async function getResultLinks() {
  const { data } = await postJson(API_ENDPOINTS.resultLinks, {})
  const payload = data?.data || data

  if (!payload || !isApiSuccess(payload.success)) {
    throw new Error(payload?.message || data?.message || 'Unable to fetch result link.')
  }

  const link =
    payload?.result_link ||
    payload?.url ||
    payload?.link ||
    payload?.result?.url ||
    payload?.result?.link ||
    payload?.data?.url ||
    payload?.data?.link

  return link || ''
}

export async function getAllGameResultsByMonth(month) {
  const { data } = await postJson(API_ENDPOINTS.allGameResultsByMonth, {
    app_id: APP_CONFIG.appId,
    month: String(month || '').trim(),
  })

  if (!isApiSuccess(data?.success)) {
    throw new Error(data?.message || 'Unable to fetch monthly results.')
  }

  return {
    columns: Array.isArray(data?.columns) ? data.columns : [],
    rows: Array.isArray(data?.data) ? data.data : [],
    filter: data?.filter || {},
    totalDays: Number(data?.total_days || 0),
    message: data?.message || '',
  }
}
