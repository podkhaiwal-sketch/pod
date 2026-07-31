import AppIcon from './AppIcon'

const tabs = [
  { key: 'home', label: 'Home', icon: 'home', path: '/home' },
  { key: 'wallet', label: 'Wallet', icon: 'account_balance_wallet', path: '/wallet' },
  { key: 'myGame', label: 'My Game', icon: 'stadia_controller', path: '/my-game' },
  { key: 'refer', label: 'Refer & Earn', icon: 'group', path: '/refer-earn' },
]

function BottomNav({ activeTab = 'home', navigate }) {
  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => (
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
