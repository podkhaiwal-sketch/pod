import logo from '../../assets/hero.png'

function AuthLayout({ children }) {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="logo-wrap">
          <img src={logo} alt="POK" className="logo" />
        </div>
        {children}
      </section>
    </main>
  )
}

export default AuthLayout
