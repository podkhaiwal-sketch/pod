import AppIcon from './AppIcon'

const tabs = [
  { key: 'home', label: 'Home', icon: 'home', path: '/home' },
  { key: 'myGame', label: 'My Game', icon: 'stadia_controller', path: '/my-game' },
  { key: 'roulette', label: 'Roulette', icon: 'casino', path: '/roulette' },
  { key: 'refer', label: 'Refer & Earn', icon: 'group', path: '/refer-earn' },
]

function BottomNav({ activeTab = 'home', navigate, hiddenTabKeys = [] }) {
  const visibleTabs = tabs.filter((tab) => !hiddenTabKeys.includes(tab.key))
  return (
    <nav
      className="bottom-nav"
      style={{ '--bottom-nav-count': visibleTabs.length }}
    >
      {visibleTabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          className={`nav-item ${activeTab === tab.key ? 'active' : ''}`}
          onClick={() => navigate(tab.path)}
        >
          <AppIcon name={tab.icon} className="nav-icon" />
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}

export default BottomNav
