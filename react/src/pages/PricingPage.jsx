import Link from '../components/Link.jsx'
import Icon from '../components/Icon.jsx'

const plans = [
  { name: 'Everyday', price: 'Free', description: 'A smarter way to manage your day-to-day money.', features: ['Nexora debit card', 'Spend in 30+ currencies', 'Instant payment notifications'] },
  { name: 'Plus', price: '$8', period: '/ month', description: 'More flexibility and benefits for your busy life.', features: ['Everything in Everyday', 'Fee-free international transfers', 'Personalized money insights', 'Priority support'], popular: true },
  { name: 'Premium', price: '$15', period: '/ month', description: 'The complete Nexora experience, built around you.', features: ['Everything in Plus', 'Premium custom card', 'Exclusive partner rewards', 'Dedicated support'] },
]

export default function PricingPage() {
  return (
    <section className="pricing-page section-wrap">
      <div className="page-intro">
        <span className="eyebrow">SIMPLE, TRANSPARENT PRICING</span>
        <h1>Choose a plan that<br />works for you.</h1>
        <p>Start free. Upgrade whenever you’re ready. No surprises, just more ways to make your money work.</p>
      </div>
      <div className="pricing-grid">
        {plans.map((plan) => (
          <article className={`pricing-card ${plan.popular ? 'pricing-popular' : ''}`} key={plan.name}>
            {plan.popular && <span className="popular-label">MOST POPULAR</span>}
            <h2>{plan.name}</h2><p>{plan.description}</p>
            <div className="plan-price"><strong>{plan.price}</strong>{plan.period && <span>{plan.period}</span>}</div>
            <Link href="/login" className={plan.popular ? 'button button-yellow' : 'button button-dark'}>Get started <Icon name="arrow" size={16} /></Link>
            <div className="plan-divider" /><span className="plan-includes">What’s included</span>
            <ul>{plan.features.map((feature) => <li key={feature}><Icon name="check" size={17} />{feature}</li>)}</ul>
          </article>
        ))}
      </div>
      <p className="pricing-note">All plans include secure banking and 24/7 account access. Fees may apply to some services.</p>
    </section>
  )
}
