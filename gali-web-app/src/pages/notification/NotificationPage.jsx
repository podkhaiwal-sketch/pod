import { useEffect, useMemo, useState } from 'react'
import { ROUTE_PATHS } from '../routes'
import { getAppNotice, getUserCredit } from '../../services/homeService'
import { getSession } from '../../services/sessionService'
import SideDrawer from '../common/SideDrawer'
import BottomNav from '../common/BottomNav'
import Header from '../common/Header'
import './notification.css'

function formatNoticeTime(value) {
  if (!value) return '--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('en-GB', { hour12: false })
}

function NotificationPage({ navigate }) {
  const [session] = useState(() => getSession())
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [credit, setCredit] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notices, setNotices] = useState([])

  useEffect(() => {
    if (!session?.userId) {
      navigate(ROUTE_PATHS.login)
      return
    }

    const loadData = async () => {
      setLoading(true)
      setError('')
      try {
        const [creditValue, noticeRows] = await Promise.all([
          getUserCredit(session.userId),
          getAppNotice(session.userId),
        ])
        setCredit(Number(creditValue || 0))
        setNotices(noticeRows)
      } catch (apiError) {
        setError(apiError instanceof Error ? apiError.message : 'Unable to fetch notices.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [navigate, session?.userId])

  const latestNotice = useMemo(() => notices[0] || null, [notices])

  if (!session?.userId) return null

  return (
    <div className="notification-page">
      <Header
        credit={credit}
        isMenuOpen={drawerOpen}
        onMenu={() => setDrawerOpen((prev) => !prev)}
        onBalanceClick={() => navigate(ROUTE_PATHS.wallet)}
        onNotification={() => navigate(ROUTE_PATHS.notification)}
      />

      <main className="notification-content">
        {loading ? <p className="state-text">Loading notification...</p> : null}
        {error ? <p className="state-text error">{error}</p> : null}

        {!loading && !error ? (
          <section className="notice-card">
            <div className="notice-head">
              <h3>{latestNotice?.title || 'Notice'}</h3>
              <span>{formatNoticeTime(latestNotice?.created_at)}</span>
            </div>
            <p>{latestNotice?.description || 'No notice available.'}</p>
          </section>
        ) : null}
      </main>

      <BottomNav activeTab="home" navigate={navigate} />

      <SideDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        navigate={navigate}
        name={session?.name || 'User'}
        mobile={session?.mobileNum || '--'}
      />
    </div>
  )
}

export default NotificationPage
