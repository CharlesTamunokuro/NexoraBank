import HeroSection from '../components/sections/HeroSection.jsx'
import FeaturesSection from '../components/sections/FeaturesSection.jsx'
import TrustSection from '../components/sections/TrustSection.jsx'
import TestimonialSection from '../components/sections/TestimonialSection.jsx'
import AppSection from '../components/sections/AppSection.jsx'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <TrustSection />
      <TestimonialSection />
      <AppSection />
      <section className="closing-line section-wrap"><h2>Save smart. Achieve more.</h2></section>
    </>
  )
}
