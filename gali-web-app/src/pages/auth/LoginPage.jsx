import { useEffect, useState } from 'react'
import AuthLayout from './AuthLayout'
import { getHelpNumber } from '../../services/homeService'
import { loginUser } from '../../services/authService'
import { ROUTE_PATHS } from '../routes'
import './auth.css'

const initialLoginForm = { mobileNum: '', pss: '' }
const APK_DOWNLOAD_URL = 'https://24x7good.com/apk/Shree-Matka.apk'

function LoginPage({ navigate }) {
  const [form, setForm] = useState(initialLoginForm)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [session, setSession] = useState(null)
  const [helplineNumber, setHelplineNumber] = useState('')

  useEffect(() => {
    getHelpNumber()
      .then((result) => {
        setHelplineNumber(result?.help_line_number || result?.whatsapp || '')
      })
      .catch(() => {})
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!form.mobileNum || !form.pss) {
      setMessage({ type: 'error', text: 'Please enter mobile number and password.' })
      return
    }

    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const result = await loginUser(form)
      setSession(result.session)
      setForm(initialLoginForm)
      setMessage({ type: 'success', text: result.message })
      navigate(ROUTE_PATHS.home)
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Unable to login.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Welcome Back</h1>

        <div className="input-wrap icon-input">
          <span aria-hidden="true">👤</span>
          <input
            type="tel"
            name="mobileNum"
            placeholder="Mobile Number"
            value={form.mobileNum}
            onChange={handleChange}
          />
        </div>

        <div className="input-wrap icon-input">
          <span aria-hidden="true">🔒</span>
          <input
            type="password"
            name="pss"
            placeholder="Password"
            value={form.pss}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? 'Please wait...' : 'LOGIN'}
        </button>

        <p className="switch-text">
          Don&apos;t have an Account?{' '}
          <button type="button" onClick={() => navigate(ROUTE_PATHS.signup)}>
            Signup Here
          </button>
        </p>
        {/* <div className="install-center">
          <button
            type="button"
            className="install-btn"
            onClick={() => window.open(APK_DOWNLOAD_URL, '_blank')}
          >
            <span className="apk-icon" aria-hidden="true">
              ⬇️
            </span>
            <span>Install Application</span>
          </button>
        </div> */}

        <p className="helpline">
          Helpline Number:{' '}
          {helplineNumber ? (
            <a
              href={`https://wa.me/${helplineNumber.replace(/[^\d]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="helpline-link"
            >
              <span className="wa-icon">🟢</span> {helplineNumber}
            </a>
          ) : (
            <span>--</span>
          )}
        </p>
      </form>

      {message.text ? (
        <p className={`api-message ${message.type === 'error' ? 'error' : 'success'}`}>
          {message.text}
        </p>
      ) : null}

      {session ? (
        <p className="session-text">
          Logged in as {session.name || 'User'} (ID: {session.userId})
        </p>
      ) : null}
    </AuthLayout>
  )
}

export default LoginPage
