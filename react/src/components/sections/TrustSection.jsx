const companies = [
  { name: 'Airbnb', logo: '/company-logos/airbnb.svg' },
  { name: 'Slack', logo: '/company-logos/slack.svg' },
  { name: 'Stripe', logo: '/company-logos/stripe.svg' },
  { name: 'Airwallex', logo: '/company-logos/airwallex.png' },
  { name: 'Spotify', logo: '/company-logos/spotify.svg' },
  { name: 'Booking.com', logo: '/company-logos/bookingdotcom.svg' },
  { name: 'Gusto', logo: '/company-logos/gusto.svg' },
  { name: 'Coinbase', logo: '/company-logos/coinbase.svg' },
]

export default function TrustSection() {
  return (
    <section className="trust-section section-wrap">
      <div className="section-heading">
        <h2>Designed for people at<br />growing companies</h2>
        <p>Brands shown for illustration only; their inclusion does not imply<br className="desktop-break" /> an endorsement or customer relationship.</p>
      </div>
      <div className="company-grid">
        {companies.map(({ name, logo }) => (
          <div className="company-logo" key={name}>
            <img src={logo} alt="" aria-hidden="true" loading="lazy" />
            <span>{name}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
