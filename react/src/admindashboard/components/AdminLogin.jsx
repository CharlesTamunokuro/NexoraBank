import { useState } from 'react'
import { FaArrowRight, FaShieldHalved } from 'react-icons/fa6'
import { useAdminData } from '../AdminDataContext.jsx'

export default function AdminLogin() {
  const { signIn } = useAdminData()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    const result = await signIn(email, password)
    if (!result.ok) {
      setError(result.error)
      return
    }
    window.history.pushState({}, '', '/admin')
    window.dispatchEvent(new Event('app:navigate'))
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <a className="admin-login-brand" href="/"><img src="/nexora.svg" alt="" /><span>Nexora <small>Safe Bank · Admin</small></span></a>
        <p className="admin-eyebrow">ADMINISTRATION PORTAL</p>
        <h1>Administrator sign in</h1>
        <p className="admin-login-copy">Sign in to the Nexora operations.</p>
        {/* <div className="admin-demo-credentials"><strong>Demo credentials</strong><span>Email <code>admin@nexora.test</code></span><span>Password <code>NexoraAdmin123</code></span><small>These credentials only unlock a local frontend demo. No authentication service is connected.</small></div> */}
        <form className="admin-login-form" onSubmit={submit}>
          <label>Email address<input type="email" autoComplete="off" required value={email} onChange={(event) => { setEmail(event.target.value); setError('') }} placeholder="admin@nexora.com" /></label>
          <label>Password<input type="password" autoComplete="off" required value={password} onChange={(event) => { setPassword(event.target.value); setError('') }} placeholder="Enter demo password" /></label>
          {error && <p className="admin-form-error" role="alert">{error}</p>}
          <button type="submit" className="admin-primary-button">Continue to admin<FaArrowRight /></button>
        </form>
        {/* <p className="admin-login-warning"><FaShieldHalved /> Demo only. No real banking data or services are accessible here.</p> */}
        <a className="back-to-site" href="/">← Return to Nexora website</a>
      </section>
    </main>
  )
}
