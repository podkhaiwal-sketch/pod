import logo from '../../assets/hero.png'
import AppIcon from './AppIcon'
import './header.css'

function Header({ className = '', credit = 0, onMenu, onNotification, isMenuOpen = false }) {
    return (
        <header className={`app-header ${className}`.trim()}>

            <button type="button" className="app-header-icon-btn" onClick={onMenu}>
                <AppIcon name={isMenuOpen ? 'close' : 'menu'} />
            </button>

            <img src={logo} alt="POK" className="app-header-logo" /> 

            <div className="app-header-balance-card">
                <div className="app-header-coin">₹</div>
                <div className="app-header-balance-text">
                    <small>Balance</small>
                    <strong>{credit}/-</strong>
                </div>
            </div>
            <button type="button" className="app-header-bell-btn" onClick={onNotification}>
                <AppIcon name="notifications" />
            </button>
        </header>
    )
}

export default Header
