import FeaturesSection from '../components/sections/FeaturesSection.jsx'
import AppSection from '../components/sections/AppSection.jsx'

export default function FeaturesPage() {
  return (
    <>
      <section className="page-intro section-wrap">
        <span className="eyebrow">THE NEXORA ADVANTAGE</span>
        <h1>More clarity.<br />More possibilities.</h1>
        <p>Everything you need to spend, save, and stay in control — thoughtfully brought together.</p>
      </section>
      <FeaturesSection fullPage />
      <AppSection />
    </>
  )
}
