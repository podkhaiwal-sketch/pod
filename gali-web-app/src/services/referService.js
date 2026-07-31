import { API_ENDPOINTS, APP_CONFIG } from '../config/config'
import { postJson } from './httpService'

export async function getReferList(userId) {
  const { data } = await postJson(API_ENDPOINTS.userRefferList, {
    app_id: APP_CONFIG.appId,
    user_id: String(userId || ''),
    dev_id: APP_CONFIG.devId,
  })

  const success = String(data?.success || '')
  if (success === '2') {
    return { rows: [], message: data?.message || 'Data Not Found' }
  }

  if (success !== '1') {
    throw new Error(data?.message || 'Unable to fetch refer list.')
  }

  const rows = Array.isArray(data?.data) ? data.data : []
  return { rows, message: data?.message || 'Refer list fetched successfully.' }
}
