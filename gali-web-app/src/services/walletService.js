import { API_ENDPOINTS, APP_CONFIG } from '../config/config'
import { isApiSuccess, postJson } from './httpService'

export async function getAppManager(userId) {
  const { data } = await postJson(API_ENDPOINTS.appManager, {
    app_id: APP_CONFIG.appId,
    user_id: String(userId || ''),
    dev_id: APP_CONFIG.devId,
  })

  if (!isApiSuccess(data.success)) {
    throw new Error(data.message || 'Unable to fetch app manager settings.')
  }

  return data
}

export async function deductWithdrawWeb({
  userId,
  amount,
  accountNumber = '',
  ifscCode = '',
  bankName = '',
  accountHolderName = '',
  upiId = '',
  otp = '',
}) {
  const { data } = await postJson(API_ENDPOINTS.deductWithdrawWeb, {
    app_id: APP_CONFIG.appId,
    dev_id: APP_CONFIG.devId,
    user_id: String(userId || ''),
    otp,
    amount: String(amount || ''),
    bank_name: bankName,
    account_holder_name: accountHolderName,
    account_number: accountNumber,
    ifsc_code: ifscCode,
    upiid: upiId,
  })

  if (!isApiSuccess(data?.success)) {
    throw new Error(data?.message || 'Unable to submit withdrawal request.')
  }

  return data
}

export async function deductWithdrawUpiWeb({ userId, amount, upiId }) {
  const { data } = await postJson(API_ENDPOINTS.deductWithdrawUpiWeb, {
    app_id: APP_CONFIG.appId,
    dev_id: APP_CONFIG.devId,
    user_id: String(userId || ''),
    amount: String(amount || ''),
    upi_id: String(upiId || ''),
  })

  if (!isApiSuccess(data?.success)) {
    throw new Error(data?.message || 'Unable to submit UPI withdrawal request.')
  }

  return data
}

export async function getWalletReport(userId, paginate = 1) {
  const { data } = await postJson(API_ENDPOINTS.walletReport, {
    app_id: APP_CONFIG.appId,
    user_id: String(userId || ''),
    dev_id: APP_CONFIG.devId,
    paginate,
  })

  if (!isApiSuccess(data?.success)) {
    throw new Error(data?.message || 'Unable to fetch wallet report.')
  }

  return Array.isArray(data?.data) ? data.data : []
}

export async function getWithdrawHistory(userId) {
  const { data } = await postJson(API_ENDPOINTS.withdrawHistory, {
    app_id: APP_CONFIG.appId,
    user_id: String(userId || ''),
    dev_id: APP_CONFIG.devId,
  })

  if (!isApiSuccess(data?.success)) {
    throw new Error(data?.message || 'Unable to fetch withdraw history.')
  }

  return Array.isArray(data?.data) ? data.data : []
}
