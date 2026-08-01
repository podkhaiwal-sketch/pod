/** Ensures user API calls hit `.../api/users` (fixes "Cannot POST /register-step1"). */
function normalizeUserApiBaseUrl(url) {
  const fallback = 'https://gali-web-app-api.onrender.com/api/users'
  let base = String(url ?? fallback).trim().replace(/\/+$/, '')
  if (!base) base = fallback

  // Fix common misconfig: .../users/api/users → .../api/users
  base = base.replace(/\/users\/api\/users$/i, '/api/users')

  try {
    const parsed = new URL(base)
    // Always force origin + /api/users (ignore extra path segments)
    base = `${parsed.origin}/api/users`
  } catch {
    if (!base.endsWith('/api/users')) {
      base = `${base}/api/users`.replace(/([^:]\/)\/+/g, '$1')
    }
  }
  return base
}

export const APP_CONFIG = {
  baseUrl: normalizeUserApiBaseUrl(import.meta.env.VITE_API_BASE_URL),
  appId: import.meta.env.VITE_APP_ID || 'com.dubaiking',
  devId: import.meta.env.VITE_DEV_ID || 'undefined',
  paymentGatewayUrl:
    import.meta.env.VITE_PAYMENT_GATEWAY_URL ||
    'https://gali-admin.onrender.com/public/payment-getway',
}

export const API_ENDPOINTS = {
  login: '/login',
  registerStep1: '/register-step1',
  register: '/register',
  getUserProfile: '/POM_get_user_profile',
  appNotice: '/POM_app_notice',
  home: '/home',
  marketList: '/get-market-list',
  batPlace: '/bat-place',
  deductWithdrawWeb: '/deduct-withdrawweb',
  deductWithdrawUpiWeb: '/deduct-withdrawUpiweb',
  appManager: '/app-manager',
  manageCommission: '/manage-commission',
  userRefferList: '/user-refferlist',
  pendingBetHistory: '/pending-bet-history',
  userCredit: '/user-credit',
  userProfileUpdate: '/user-profile-update',
  helpNumber: '/POM_help_number',
  walletReport: '/wallet-report',
  withdrawHistory: '/withdrawl-history',
  resultLinks: '/result-links',
  allGameResultsByMonth: '/all-game-results-by-month',
}
