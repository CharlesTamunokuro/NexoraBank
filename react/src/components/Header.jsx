import { useState } from 'react'
import Link from './Link.jsx'
import Icon from './Icon.jsx'

const navItems = [
  ['Company', '/about'],
  ['Features', '/features'],
  ['Support', '/support'],
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="brand" aria-label="Nexora Safe Bank home">
          <span className="brand-mark"><i /><i /></span>
          <span>Nexora <span className="brand-secondary">Safe Bank</span></span>
        </Link>
        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span /><span />
        </button>
        <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
          {navItems.map(([label, href]) => (
            <Link key={label} href={href} onClick={() => setMenuOpen(false)}>{label}<Icon name="chevronDown" size={13} className="nav-chevron" /></Link>
          ))}
          <Link className="mobile-login" href="/login" onClick={() => setMenuOpen(false)}>Log in</Link>
        </nav>
        <div className="header-actions">
          <Link className="login-link" href="/login">Log in</Link>
          <Link className="button button-dark header-cta" href="/signup">Open account <span>↗</span></Link>
        </div>
      </div>
    </header>
  )
}
