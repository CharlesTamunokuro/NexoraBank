import FeatureCards from '../FeatureCards.jsx'
import Link from '../Link.jsx'

export default function FeaturesSection({ fullPage = false }) {
  return (
    <section className={`features-section section-wrap ${fullPage ? 'features-page-section' : ''}`} id="features">
      <div className="section-heading">
        {fullPage && <span className="eyebrow">A BETTER WAY TO BANK</span>}
        <h2>{fullPage ? <>Everything you need.<br />All in one place.</> : <>Feel the best experience<br />with our features</>}</h2>
        {fullPage && <p>Tools that make every day with your money feel a little easier.</p>}
      </div>
      <FeatureCards />
      {fullPage && <div className="center-cta"><Link href="/signup" className="button button-dark">Get started today <span>↗</span></Link></div>}
    </section>
  )
}
