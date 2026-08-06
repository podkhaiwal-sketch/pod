import { API_ENDPOINTS, APP_CONFIG } from '../config/config'
import { isApiSuccess, postJson } from './httpService'

async function fetchRows(endpoint, userId, tblCode = 'all', page = 1) {
  const { data } = await postJson(endpoint, {
    app_id: APP_CONFIG.appId,
    user_id: String(userId || ''),
    tbl_code: String(tblCode || 'all'),
    page,
  })

  if (!isApiSuccess(data?.success)) {
    throw new Error(data?.message || 'Unable to fetch records.')
  }

  return {
    rows: Array.isArray(data?.data) ? data.data : [],
    pagination: Number(data?.pagination || page),
    totalRecords: Number(data?.totalRecords || 0),
  }
}

export function getMyBidding(userId, tblCode = 'all', page = 1) {
  return fetchRows(API_ENDPOINTS.myBidding, userId, tblCode, page)
}

export function getOldRecords(userId, tblCode = 'all', page = 1) {
  return fetchRows(API_ENDPOINTS.oldRecords, userId, tblCode, page)
}

export function getMyWins(userId, tblCode = 'all', page = 1) {
  return fetchRows(API_ENDPOINTS.myWins, userId, tblCode, page)
}

export function getStatement(userId, page = 1) {
  return fetchRows(API_ENDPOINTS.statement, userId, 'all', page)
}
