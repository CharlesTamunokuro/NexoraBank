import { useState } from 'react'
import Link from '../components/Link.jsx'
import Icon from '../components/Icon.jsx'
import { navigateTo } from '../navigation.js'
import { apiRequest } from '../api.js'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    try {
      await apiRequest('/auth/login', { method: 'POST', body: { email, password } })
      setError('')
      navigateTo('/dashboard')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="login-page">
      <div className="login-decoration"><div className="login-decoration-card"><span>Nexora</span><strong>VISA</strong><div className="hero-chip">▦</div><b>Money, made simple.</b></div><span className="login-decoration-note">A little more freedom<br />in every day. ✦</span></div>
      <div className="login-panel">
        <Link href="/" className="brand"><span className="brand-mark"><i /><i /></span><span>Nexora Safe Bank</span></Link>
        <div className="login-form-wrap">
          <span className="eyebrow">WELCOME BACK</span>
          <h1>Log in to Nexora</h1>
          <p>Continue to your Nexora dashboard.</p>
          <div className="demo-login-notice"><small>Sign in with the email and password used to create your Nexoraprofile.</small></div>
          <form onSubmit={handleSubmit}>
            <label htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                setError('')
              }}
            />
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              required
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
                setError('')
              }}
            />
            {error && <p className="login-error" role="alert">{error}</p>}
            <button className="button button-dark login-submit" type="submit" disabled={submitting}>{submitting ? 'Signing in…' : 'LOGIN TO NEXORA'} <Icon name="arrow" size={16} /></button>
          </form>
          <p className="signup-prompt">New to Nexora? <Link href="/signup">Open an account</Link></p>
          {/* <div className="login-security"><Icon name="lock" size={15} /> Demo only — credentials are sent to the configured local demo backend.</div> */}
        </div>
        <Link href="/" className="back-home">← Back to home</Link>
      </div>
    </section>
  )
}
