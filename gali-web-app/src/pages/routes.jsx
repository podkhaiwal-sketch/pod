import { useEffect, useState } from 'react'
import LoginPage from './auth/LoginPage'
import SignupPage from './auth/SignupPage'
import HomePage from './home/HomePage'
import PlayPage from './play/PlayPage'
import MarketPlayPage from './play/MarketPlayPage'
import WalletPage from './wallet/WalletPage'
import AddPointPage from './wallet/AddPointPage'
import MyGamePage from './mygame/MyGamePage'
import ProfilePage from './profile/ProfilePage'
import CommissionPage from './commission/CommissionPage'
import HistoryPage from './history/HistoryPage'
import ResultHistoryPage from './history/ResultHistoryPage'
import TermsPage from './terms/TermsPage'
import ReferPage from './refer/ReferPage'
import ReferSharePage from './refer/ReferSharePage'
import NotificationPage from './notification/NotificationPage'
import { getSession } from '../services/sessionService'

export const ROUTE_PATHS = {
  login: '/login',
  signup: '/signup',
  home: '/home',
  play: '/play',
  playMarket: '/play-market',
  wallet: '/wallet',
  addPoint: '/add-point',
  myGame: '/my-game',
  profile: '/profile',
  commission: '/manage-commission',
  history: '/history',
  resultHistory: '/result-history',
  terms: '/terms-and-condition',
  refer: '/refer-list',
  referShare: '/refer-earn',
  notification: '/notification',
}

const routeMap = {
  [ROUTE_PATHS.login]: LoginPage,
  [ROUTE_PATHS.signup]: SignupPage,
  [ROUTE_PATHS.home]: HomePage,
  [ROUTE_PATHS.play]: PlayPage,
  [ROUTE_PATHS.playMarket]: MarketPlayPage,
  [ROUTE_PATHS.wallet]: WalletPage,
  [ROUTE_PATHS.addPoint]: AddPointPage,
  [ROUTE_PATHS.myGame]: MyGamePage,
  [ROUTE_PATHS.profile]: ProfilePage,
  [ROUTE_PATHS.commission]: CommissionPage,
  [ROUTE_PATHS.history]: HistoryPage,
  [ROUTE_PATHS.resultHistory]: ResultHistoryPage,
  [ROUTE_PATHS.terms]: TermsPage,
  [ROUTE_PATHS.refer]: ReferPage,
  [ROUTE_PATHS.referShare]: ReferSharePage,
  [ROUTE_PATHS.notification]: NotificationPage,
}

const normalizePath = (path) => {
  if (routeMap[path]) return path
  return getSession()?.userId ? ROUTE_PATHS.home : ROUTE_PATHS.login
}

export function getRouteElement(pathname, navigate) {
  const normalizedPath = normalizePath(pathname)
  const session = getSession()
  const isAuthenticated = Boolean(session?.userId)

  if (
    !isAuthenticated &&
    (normalizedPath === ROUTE_PATHS.home ||
      normalizedPath === ROUTE_PATHS.play ||
      normalizedPath === ROUTE_PATHS.playMarket ||
      normalizedPath === ROUTE_PATHS.wallet ||
      normalizedPath === ROUTE_PATHS.addPoint ||
      normalizedPath === ROUTE_PATHS.myGame ||
      normalizedPath === ROUTE_PATHS.profile ||
      normalizedPath === ROUTE_PATHS.commission ||
      normalizedPath === ROUTE_PATHS.history ||
      normalizedPath === ROUTE_PATHS.terms ||
      normalizedPath === ROUTE_PATHS.refer ||
      normalizedPath === ROUTE_PATHS.referShare ||
      normalizedPath === ROUTE_PATHS.notification)
  ) {
    return <LoginPage navigate={navigate} />
  }

  if (
    isAuthenticated &&
    (normalizedPath === ROUTE_PATHS.login || normalizedPath === ROUTE_PATHS.signup)
  ) {
    return <HomePage navigate={navigate} />
  }

  if (normalizedPath === ROUTE_PATHS.signup) {
    return <SignupPage navigate={navigate} />
  }

  if (normalizedPath === ROUTE_PATHS.home) {
    return <HomePage navigate={navigate} />
  }

  if (normalizedPath === ROUTE_PATHS.play) {
    return <PlayPage navigate={navigate} />
  }

  if (normalizedPath === ROUTE_PATHS.playMarket) {
    return <MarketPlayPage navigate={navigate} />
  }

  if (normalizedPath === ROUTE_PATHS.wallet) {
    return <WalletPage navigate={navigate} />
  }

  if (normalizedPath === ROUTE_PATHS.addPoint) {
    return <AddPointPage navigate={navigate} />
  }

  if (normalizedPath === ROUTE_PATHS.myGame) {
    return <MyGamePage navigate={navigate} />
  }

  if (normalizedPath === ROUTE_PATHS.profile) {
    return <ProfilePage navigate={navigate} />
  }

  if (normalizedPath === ROUTE_PATHS.commission) {
    return <CommissionPage navigate={navigate} />
  }

  if (normalizedPath === ROUTE_PATHS.history) {
    return <HistoryPage navigate={navigate} />
  }

  if (normalizedPath === ROUTE_PATHS.resultHistory) {
    return <ResultHistoryPage navigate={navigate} />
  }

  if (normalizedPath === ROUTE_PATHS.terms) {
    return <TermsPage navigate={navigate} />
  }

  if (normalizedPath === ROUTE_PATHS.refer) {
    return <ReferPage navigate={navigate} />
  }

  if (normalizedPath === ROUTE_PATHS.referShare) {
    return <ReferSharePage navigate={navigate} />
  }

  if (normalizedPath === ROUTE_PATHS.notification) {
    return <NotificationPage navigate={navigate} />
  }

  return <LoginPage navigate={navigate} />
}

export function useSimpleRoute() {
  const [pathname, setPathname] = useState(normalizePath(window.location.pathname))

  useEffect(() => {
    const nextPath = normalizePath(window.location.pathname)
    if (nextPath !== window.location.pathname) {
      window.history.replaceState({}, '', nextPath)
    }

    const onPopState = () => {
      setPathname(normalizePath(window.location.pathname))
    }

    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const navigate = (path) => {
    const nextPath = normalizePath(path)
    if (nextPath === pathname) {
      return
    }

    window.history.pushState({}, '', nextPath)
    setPathname(nextPath)
  }

  return { pathname, navigate }
}
