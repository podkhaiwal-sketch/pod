import { useState } from 'react'
import AuthLayout from './AuthLayout'
import { registerAccount } from '../../services/authService'
import { ROUTE_PATHS } from '../routes'
import './auth.css'

const initialSignupForm = { name: '', mobileNum: '', pss: '', refercode: '' }

function SignupPage({ navigate }) {
  const [form, setForm] = useState(initialSignupForm)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!form.name || !form.mobileNum || !form.pss) {
      setMessage({ type: 'error', text: 'Please fill name, mobile number, and password.' })
      return
    }

    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const result = await registerAccount(form)
      setForm(initialSignupForm)
      setMessage({ type: 'success', text: result.message })
      navigate(ROUTE_PATHS.home)
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Unable to register.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Create Your Account</h1>

        <label className="field-label" htmlFor="name">
          Full Name
        </label>
        <div className="input-wrap">
          <input
            id="name"
            name="name"
            placeholder="Enter your name"
            value={form.name}
            onChange={handleChange}
          />
        </div>

        <label className="field-label" htmlFor="mobileNum">
          Mobile Number
        </label>
        <div className="input-wrap">
          <input
            id="mobileNum"
            type="tel"
            name="mobileNum"
            placeholder="Enter mobile number"
            value={form.mobileNum}
            onChange={handleChange}
          />
        </div>

        <label className="field-label" htmlFor="pss">
          Password
        </label>
        <div className="input-wrap">
          <input
            id="pss"
            type="password"
            name="pss"
            placeholder="Enter password"
            value={form.pss}
            onChange={handleChange}
          />
        </div>

        <label className="field-label" htmlFor="refercode">
          Refer Code (Optional)
        </label>
        <div className="input-wrap">
          <input
            id="refercode"
            name="refercode"
            placeholder="Enter refer code"
            value={form.refercode}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? 'Please wait...' : 'Create account'}
        </button>

        <p className="switch-text">
          have an Account?{' '}
          <button type="button" onClick={() => navigate(ROUTE_PATHS.login)}>
            Signin Here
          </button>
        </p>
      </form>

      {message.text ? (
        <p className={`api-message ${message.type === 'error' ? 'error' : 'success'}`}>
          {message.text}
        </p>
      ) : null}
    </AuthLayout>
  )
}

export default SignupPage
