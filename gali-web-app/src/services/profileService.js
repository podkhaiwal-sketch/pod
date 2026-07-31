import { API_ENDPOINTS, APP_CONFIG } from '../config/config'
import { isApiSuccess, postJson } from './httpService'

export async function updateUserProfile({ userId, name, dob }) {
  const { data } = await postJson(API_ENDPOINTS.userProfileUpdate, {
    name: name.trim(),
    dob,
    app_id: APP_CONFIG.appId,
    user_id: String(userId || ''),
  })

  if (!isApiSuccess(data.success)) {
    throw new Error(data.message || 'Unable to update profile.')
  }

  return data
}
