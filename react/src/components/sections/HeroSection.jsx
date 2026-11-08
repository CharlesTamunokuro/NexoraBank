import Link from '../Link.jsx'
import Icon from '../Icon.jsx'

function CardStack() {
  return (
    <div className="hero-visual" aria-label="Nexora mobile app and card preview">
      <div className="hero-glow" />
      <div className="phone-mockup">
        <div className="phone-camera" />
        <div className="phone-screen">
          <div className="phone-top"><span>9:41</span><span>●●●</span></div>
          <div className="phone-greeting">Good morning,</div>
          <strong>Akmal Nasrullah</strong>
          <div className="phone-balance"><small>Total balance</small><b>$24,562.00</b><span>↗ 2.4% this month</span></div>
          <div className="phone-actions"><span>↗<small>Send</small></span><span>＋<small>Top up</small></span><span>⇄<small>Exchange</small></span></div>
          <div className="phone-activity"><small>Recent activity</small><div><i>◉</i><span>Grocery store<small>Today, 10:42</small></span><b>−$42.80</b></div><div><i>↗</i><span>Salary deposit<small>Yesterday</small></span><b>+$2,500</b></div></div>
        </div>
      </div>
      <div className="hero-bank-card"><span>Nexora</span><strong>VISA</strong><small>Cardholder</small><b>Akmal Nasrullah</b><div className="hero-chip">▦</div></div>
      <div className="hero-float hero-float-left"><span className="mini-icon">↗</span><b>One app<br />for all</b></div>
      <div className="hero-float hero-float-right"><span className="mini-icon">✓</span><b>Secure<br />payments</b></div>
      <span className="hero-sparkle sparkle-one">✦</span><span className="hero-sparkle sparkle-two">✦</span>
    </div>
  )
}

export default function HeroSection() {
  return (
    <section className="hero-section section-wrap">
      <CardStack />
      <div className="hero-copy">
        <span className="eyebrow"><Icon name="sparkle" size={14} /> BANKING, MADE BETTER</span>
        <h1>Control your<br />financial future<br />easily</h1>
        <p>From easy money management to financial goals and investments. Open your account in just a flash.</p>
        <div className="hero-buttons">
          <Link href="/signup" className="button button-yellow">Open account <Icon name="arrow" size={16} /></Link>
          <Link href="/features" className="button button-outline">Explore our cards</Link>
        </div>
        <div className="hero-proof">
          <div className="avatar-stack" aria-label="People who inspire how we design">
            <img src="/portraits/person-one.jpg" alt="" />
            <img src="/portraits/person-two.jpg" alt="" />
            <img src="/portraits/person-three.jpg" alt="" />
            <i aria-hidden="true">＋</i>
          </div>
          <div><strong>15 Million+</strong><small>Trusted by millions of people<br />around the world</small></div>
        </div>
      </div>
    </section>
  )
}
