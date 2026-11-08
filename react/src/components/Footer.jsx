import { useState } from 'react'
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter } from 'react-icons/fa6'
import Link from './Link.jsx'
import Icon from './Icon.jsx'

const linkGroups = [
  { heading: 'Nexora', links: [['About us', '/about'], ['Careers', '/about'], ['Press', '/about']] },
  { heading: 'Banking', links: [['Personal banking', '/features'], ['Digital banking', '/features'], ['Cards', '/features']] },
  { heading: 'Company', links: [['About', '/about'], ['Partners', '/about'], ['Contact', '/support']] },
  { heading: 'Support', links: [['Help center', '/support'], ['FAQ', '/support'], ['Contact us', '/support']] },
]

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    if (email.trim()) setSubscribed(true)
  }

  return (
    <footer className="footer-wrap">
      <div className="footer-cta">
        <div className="footer-cta-copy">
          <span className="icon-disc"><Icon name="card" size={18} /></span>
          <h2>Keep up with the<br />latest</h2>
          <p>Join our newsletter to stay up to date on features and releases.</p>
        </div>
        <form className="newsletter-form" onSubmit={handleSubmit}>
          <label htmlFor="newsletter-email">Stay up to date</label>
          <div className="newsletter-input">
            <input
              id="newsletter-email"
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <button type="submit">{subscribed ? 'You’re in!' : 'Subscribe'}</button>
          </div>
          <small>{subscribed ? 'Thanks for subscribing. Watch your inbox!' : 'By subscribing, you agree to our Privacy Policy.'}</small>
        </form>
        <div className="footer-divider" />
        <div className="footer-bottom">
          <Link href="/" className="brand brand-footer"><span className="brand-mark"><i /><i /></span><span>Nexora Safe Bank</span></Link>
          <div className="footer-links">
            {linkGroups.map((group) => (
              <div key={group.heading}>
                <strong>{group.heading}</strong>
                {group.links.map(([label, href]) => <Link key={label} href={href}>{label}</Link>)}
              </div>
            ))}
          </div>
        </div>
        <p className="footer-tagline">Make your complex finance easy.<br />Your money, your rules.</p>
      </div>
      <div className="legal-row">
        <span>© 2025 Nexora Safe Bank. All rights reserved.</span>
        <div className="social-links" aria-label="Social media">
          <a href="https://www.instagram.com/" aria-label="Instagram" target="_blank" rel="noreferrer"><FaInstagram aria-hidden="true" /></a>
          <a href="https://www.facebook.com/" aria-label="Facebook" target="_blank" rel="noreferrer"><FaFacebookF aria-hidden="true" /></a>
          <a href="https://www.x.com/" aria-label="X" target="_blank" rel="noreferrer"><FaXTwitter aria-hidden="true" /></a>
          <a href="https://www.linkedin.com/" aria-label="LinkedIn" target="_blank" rel="noreferrer"><FaLinkedinIn aria-hidden="true" /></a>
        </div>
      </div>
    </footer>
  )
}
