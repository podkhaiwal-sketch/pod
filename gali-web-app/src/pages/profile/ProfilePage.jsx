import { useEffect, useState } from 'react'
import logo from '../../assets/hero.png'
import { ROUTE_PATHS } from '../routes'
import { getUserCredit } from '../../services/homeService'
import { getSession } from '../../services/sessionService'
import { updateUserProfile } from '../../services/profileService'
import SideDrawer from '../common/SideDrawer'
import BottomNav from '../common/BottomNav'
import Header from '../common/Header'
import './profile.css'

function ProfilePage({ navigate }) {
  const [session] = useState(() => getSession())
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [credit, setCredit] = useState(0)
  const [name, setName] = useState(session?.name || '')
  const [dob, setDob] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    if (!session?.userId) {
      navigate(ROUTE_PATHS.login)
      return
    }

    const loadCredit = async () => {
      const value = await getUserCredit(session.userId)
      setCredit(Number(value || 0))
    }

    loadCredit().catch(() => {})
  }, [navigate, session?.userId])

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!name || !dob) {
      setMessage({ type: 'error', text: 'Please enter full name and date of birth.' })
      return
    }

    setSaving(true)
    setMessage({ type: '', text: '' })
    try {
      const result = await updateUserProfile({ userId: session.userId, name, dob })
      setMessage({ type: 'success', text: result.message || 'Updated success' })
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Unable to update profile.',
      })
    } finally {
      setSaving(false)
    }
  }

  if (!session?.userId) return null

  return (
    <div className="profile-page">
      <Header
        credit={credit}
        isMenuOpen={drawerOpen}
        onMenu={() => setDrawerOpen((prev) => !prev)}
        onNotification={() => navigate(ROUTE_PATHS.notification)}
      />

      <section className="profile-hero">
        <img src={logo} alt="POK" className="profile-hero-logo" />
      </section>

      <main className="profile-content">
        <section className="profile-card">
          <div className="profile-stats">
            <div className="active">Balance: {credit}</div>
            <div>Bonus: 0</div>
          </div>

          <form className="profile-form" onSubmit={handleSubmit}>
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Full Name"
            />

            <label htmlFor="dob">Date of Birth</label>
            <input id="dob" type="date" value={dob} onChange={(event) => setDob(event.target.value)} />

            <button type="submit" disabled={saving}>
              {saving ? 'Please wait...' : 'Submit'}
            </button>
          </form>

          {message.text ? <p className={`profile-message ${message.type}`}>{message.text}</p> : null}
        </section>
      </main>

      <BottomNav activeTab="myGame" navigate={navigate} />

      <SideDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        navigate={navigate}
        name={name || session?.name || 'User'}
        mobile={session?.mobileNum || '--'}
      />
    </div>
  )
}

export default ProfilePage
