import Link from '../components/Link.jsx'
import Icon from '../components/Icon.jsx'
import TrustSection from '../components/sections/TrustSection.jsx'

export default function AboutPage() {
  return (
    <>
      <section className="about-hero section-wrap">
        <div className="about-copy">
          <span className="eyebrow">A LITTLE MORE HUMAN</span>
          <h1>Money should move you forward.</h1>
          <p>We’re building a more thoughtful kind of banking — one that gives people the confidence and tools to make the most of their money.</p>
          <Link href="/features" className="button button-yellow">Discover Nexora <Icon name="arrow" size={16} /></Link>
        </div>
        <div className="about-visual"><span className="about-visual-circle">F</span><div className="about-stat"><strong>15M+</strong><span>people banking<br />with more confidence</span></div><div className="about-orbit orbit-one" /><div className="about-orbit orbit-two" /></div>
      </section>
      <TrustSection />
      <section className="values-section section-wrap">
        <div><span className="eyebrow">WHAT WE BELIEVE</span><h2>Good money habits<br />start with good tools.</h2></div>
        <div className="values-grid"><article><span className="icon-disc"><Icon name="chart" /></span><h3>Clarity first</h3><p>Money decisions should feel clear, not complicated. We make the important things easier to see.</p></article><article><span className="icon-disc"><Icon name="lock" /></span><h3>Built around trust</h3><p>Your money and your information deserve the highest standard of care.</p></article><article><span className="icon-disc"><Icon name="sparkle" /></span><h3>Always improving</h3><p>We keep listening, learning, and creating better ways to bank.</p></article></div>
      </section>
    </>
  )
}
