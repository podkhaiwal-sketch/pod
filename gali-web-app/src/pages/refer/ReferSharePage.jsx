import { useEffect, useMemo, useState } from 'react'
import { getUserCredit, getUserProfile } from '../../services/homeService'
import { getSession } from '../../services/sessionService'
import { ROUTE_PATHS } from '../routes'
import SideDrawer from '../common/SideDrawer'
import BottomNav from '../common/BottomNav'
import MessageDialog from '../common/MessageDialog'
import Header from '../common/Header'
import './referShare.css'

function ReferSharePage({ navigate }) {
  const [session] = useState(() => getSession())
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [credit, setCredit] = useState(0)
  const [refCode, setRefCode] = useState('393886')
  const [dialog, setDialog] = useState({ open: false, type: 'success', title: '', message: '' })

  useEffect(() => {
    if (!session?.userId) {
      navigate(ROUTE_PATHS.login)
      return
    }

    const loadData = async () => {
      try {
        const [creditValue, profile] = await Promise.all([
          getUserCredit(session.userId),
          getUserProfile(session.userId),
        ])
        setCredit(Number(creditValue || 0))
        setRefCode(profile?.refCode || '393886')
      } catch {
        // keep fallback values
      }
    }

    loadData()
  }, [navigate, session?.userId])

  const shareText = useMemo(
    () =>
      `अपने दोस्तों को रेफर करें और अपने दोस्तों की प्रत्येक हानि बोली (बुकिंग) पर 5% कमीशन राशि प्राप्त करें रेफरल कोड का उपयोग करके | रेफरल कोड ${refCode} https://24x7good.com/`,
    [refCode]
  )
  const todayText = useMemo(() => {
    const now = new Date()
    const dd = String(now.getDate()).padStart(2, '0')
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const yyyy = String(now.getFullYear())
    return `${dd}-${mm}-${yyyy}`
  }, [])

  const onShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ text: shareText })
        return
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText)
        setDialog({
          open: true,
          type: 'success',
          title: 'Copied',
          message: 'Share message copied. Now paste it anywhere.',
        })
        return
      }

      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank', 'noopener,noreferrer')
    } catch {
      setDialog({
        open: true,
        type: 'error',
        title: 'Error',
        message: 'Unable to share right now.',
      })
    }
  }

  if (!session?.userId) return null

  return (
    <div className="refer-share-page">
      <Header
        credit={credit}
        isMenuOpen={drawerOpen}
        onMenu={() => setDrawerOpen((prev) => !prev)}
        onBalanceClick={() => navigate(ROUTE_PATHS.wallet)}
        onNotification={() => navigate(ROUTE_PATHS.notification)}
      />

      <main className="refer-share-content">
        <section className="hero-result-card">
          <div className="hero-date">
            <span className="hero-date-badge">Today</span>
            <span className="hero-date-text">{todayText}</span>
          </div>
          <div className="hero-body">
            <p className="hero-notice-label">Refer &amp; Earn</p>
            <p className="hero-notice">
              अगर आप किसी friend को invite करते हैं तो आपको उसके खेल से lifetime 5% commission मिलेगा।
            </p>
            <div className="hero-status">
              <span className="hero-status-pill">Referral Code</span>
              <span className="hero-status-value">{refCode || '---'}</span>
            </div>
          </div>
          <button type="button" className="share-earn-btn" onClick={onShare}>
            <span className="share-earn-icon" aria-hidden>
              🔗
            </span>
            <span className="share-earn-label">Share Referral Link</span>
          </button>
        </section>
      </main>

      <BottomNav activeTab="refer" navigate={navigate} />

      <SideDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        navigate={navigate}
        name={session?.name || 'User'}
        mobile={session?.mobileNum || '--'}
      />

      <MessageDialog
        open={dialog.open}
        type={dialog.type}
        title={dialog.title}
        message={dialog.message}
        onClose={() => setDialog((prev) => ({ ...prev, open: false }))}
      />
    </div>
  )
}

export default ReferSharePage
