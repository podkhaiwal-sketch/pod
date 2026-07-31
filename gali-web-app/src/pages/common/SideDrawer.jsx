import { useEffect, useMemo, useState } from 'react'
import logo from '../../assets/hero.png'
import { clearSession, getSession } from '../../services/sessionService'
import { getHelpNumber, getUserProfile } from '../../services/homeService'
import { ROUTE_PATHS } from '../routes'
import AppIcon from './AppIcon'
import './sideDrawer.css'

const menuItems = [
  { key: 'profile', label: 'Profile', icon: 'person' },
  { key: 'commission', label: 'App Commission', icon: 'account_balance_wallet' },
  { key: 'history', label: 'Game History', icon: 'history' },
  { key: 'resultHistory', label: 'Result History', icon: 'sports_score' },
  { key: 'terms', label: 'Terms And Condition', icon: 'description' },
  { key: 'refer', label: 'my Refer List', icon: 'group' },
  { key: 'whatsapp', label: 'whatsapp Number', icon: 'chat' },
]

function SideDrawer({
  isOpen,
  onClose,
  navigate,
  name = 'User',
  mobile = '--',
  refCode = '--',
  helpNumber = '',
}) {
  const [session] = useState(() => getSession())
  const [profileData, setProfileData] = useState(null)
  const [helpData, setHelpData] = useState(null)

  useEffect(() => {
    if (!session?.userId) return

    let isMounted = true
    const loadDrawerData = async () => {
      try {
        const [profileResult, helpResult] = await Promise.all([
          getUserProfile(session.userId),
          getHelpNumber(),
        ])
        if (!isMounted) return
        setProfileData(profileResult || null)
        setHelpData(helpResult || null)
      } catch {
        // Keep fallback props/session data when drawer APIs fail.
      }
    }

    loadDrawerData()
    return () => {
      isMounted = false
    }
  }, [session?.userId])

  const resolvedHelpNumber = useMemo(
    () =>
      profileData?.genral_setting_whatsapp ||
      helpData?.help_line_number ||
      helpData?.whatsapp ||
      helpNumber,
    [helpData?.help_line_number, helpData?.whatsapp, helpNumber, profileData?.genral_setting_whatsapp]
  )

  const resolvedName = profileData?.name || session?.name || name
  const resolvedMobile = profileData?.mob || session?.mobileNum || mobile
  const resolvedRefCode = profileData?.refCode || refCode

  const onClickMenuItem = (itemKey) => {
    if (itemKey === 'profile') {
      onClose()
      navigate(ROUTE_PATHS.profile)
      return
    }

    if (itemKey === 'commission') {
      onClose()
      navigate(ROUTE_PATHS.commission)
      return
    }

    if (itemKey === 'history') {
      onClose()
      navigate(ROUTE_PATHS.history)
      return
    }

    if (itemKey === 'resultHistory') {
      onClose()
      navigate(ROUTE_PATHS.resultHistory)
      return
    }

    if (itemKey === 'terms') {
      onClose()
      navigate(ROUTE_PATHS.terms)
      return
    }

    if (itemKey === 'refer') {
      onClose()
      navigate(ROUTE_PATHS.refer)
      return
    }

    if (itemKey === 'whatsapp') {
      onClose()
      const waUrl = `https://wa.me/${resolvedHelpNumber.replace(/[^\d]/g, '')}`
      window.open(waUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const onLogout = () => {
    clearSession()
    onClose()
    navigate(ROUTE_PATHS.login)
  }

  return (
    <div
      className={`sd-overlay ${isOpen ? 'show' : ''}`}
      onClick={onClose}
      role="presentation"
      aria-hidden={!isOpen}
    >
      <aside
        className={`sd-drawer ${isOpen ? 'open' : ''}`}
        onClick={(event) => event.stopPropagation()}
        aria-label="Side menu"
        aria-modal="true"
        role="dialog"
      >
        <div className="sd-header">
          <div className="sd-brand">
            <div className="sd-logo-wrap">
              <img src={logo} alt="" className="sd-logo" />
            </div>
            <span className="sd-brand-title">Menu</span>
          </div>
          <button type="button" className="sd-close" onClick={onClose} aria-label="Close menu">
            ✕
          </button>
        </div>

        <div className="sd-profile-card">
          <div className="sd-profile-row">
            <span className="sd-profile-label">Name</span>
            <span className="sd-profile-value">{resolvedName}</span>
          </div>
          <div className="sd-profile-row">
            <span className="sd-profile-label">Mobile</span>
            <span className="sd-profile-value">{resolvedMobile}</span>
          </div>
          <div className="sd-profile-row">
            <span className="sd-profile-label">Ref code</span>
            <span className="sd-profile-value sd-profile-value--mono">{resolvedRefCode}</span>
          </div>
        </div>

        <nav className="sd-menu" aria-label="Main navigation">
          {menuItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`sd-item ${item.key === 'whatsapp' ? 'sd-item--whatsapp' : ''}`}
              onClick={() => onClickMenuItem(item.key)}
            >
              <span className="sd-item-icon-wrap" aria-hidden>
                <AppIcon
                  name={item.key === 'whatsapp' ? 'support_agent' : item.icon}
                  className="sd-item-icon"
                />
              </span>
              <span className="sd-item-label">
                {item.key === 'whatsapp' ? 'WhatsApp / Help' : item.label}
                {item.key === 'whatsapp' && resolvedHelpNumber ? (
                  <span className="sd-item-sublabel">{resolvedHelpNumber}</span>
                ) : null}
              </span>
            </button>
          ))}

          <div className="sd-menu-divider" role="separator" />

          <button type="button" className="sd-item sd-item--logout" onClick={onLogout}>
            <span className="sd-item-icon-wrap sd-item-icon-wrap--logout" aria-hidden>
              <AppIcon name="logout" className="sd-item-icon" />
            </span>
            <span className="sd-item-label">Logout</span>
          </button>
        </nav>
      </aside>
    </div>
  )
}

export default SideDrawer
