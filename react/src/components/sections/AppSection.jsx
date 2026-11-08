import { FaApple, FaGooglePlay } from 'react-icons/fa6'

export default function AppSection() {
  return (
    <section className="app-section section-wrap">
      <div className="section-heading app-section-heading">
        <h2>Get the Nexora mobile app.</h2>
        <p>With the app, you can access your account anywhere, anytime for<br className="app-desktop-break" /> balance and so much more.</p>
        <div className="download-buttons">
          <a href="https://www.apple.com/app-store/" className="download-pill"><FaApple aria-hidden="true" /> Download Now</a>
          <a href="https://play.google.com/store" className="download-pill"><FaGooglePlay aria-hidden="true" /> Download Now</a>
        </div>
      </div>
      <div className="app-showcase">
        <div className="showcase-bg-shape shape-left" aria-hidden="true" />
        <div className="showcase-bg-shape shape-right" aria-hidden="true" />
        <div className="showcase-card showcase-card-dark">
          <div className="showcase-card-top"><span>Nexora</span><strong>VISA</strong></div>
          <span className="showcase-chip" aria-hidden="true" />
          <div className="showcase-card-owner"><small>Cardholder</small><b>Nasrullah</b></div>
        </div>
        <div className="showcase-card showcase-card-light">
          <div className="showcase-card-top"><span>Nexora</span></div>
          <span className="showcase-chip" aria-hidden="true" />
          <div className="showcase-card-owner"><small>Cardholder</small><b>Nasrullah</b></div>
        </div>
        <div className="showcase-balance balance-left">
          <small><i className="notification-mark notification-usd" aria-hidden="true">$</i> USDollar <strong>VISA</strong></small>
          <b>$40,500.80</b>
          <div className="balance-details"><span>Account number<br /><strong>•••• 0934</strong></span><span>Valid Thru<br /><strong>05/28</strong></span></div>
        </div>
        <div className="showcase-balance balance-top">
          <small><i className="notification-mark notification-transfer" aria-hidden="true">↗</i> Transfer</small>
          <b>$5,500 USD</b>
        </div>
        <div className="showcase-balance balance-right">
          <small><i className="notification-mark notification-euro" aria-hidden="true">€</i> Received</small>
          <b>4,997.68 EUR</b>
        </div>
      </div>
    </section>
  )
}
