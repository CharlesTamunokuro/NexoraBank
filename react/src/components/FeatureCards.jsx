import Icon from './Icon.jsx'
import Link from './Link.jsx'

function CardArtwork() {
  return (
    <div className="artwork card-artwork">
      <div className="bank-card bank-card-dark"><span>Nexora</span><strong>VISA</strong><small>Cardholder</small><b>Akmal Nasrullah</b></div>
      <div className="bank-card bank-card-light"><span>Nexora <i>◌</i></span><small>Cardholder</small><b>Lina</b><div className="card-wave" /></div>
    </div>
  )
}

function AnalyticsArtwork() {
  return (
    <div className="artwork analytics-artwork">
      <div className="analytics-panel">
        <div className="panel-tabs"><span>↗ Income</span><span>↗ Expense</span></div>
        <small>Income average</small>
        <strong>$75,500.50</strong>
        <div className="chart-bars">{[22, 38, 29, 63, 47, 76, 43, 58, 34, 69, 49, 82].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div>
        <div className="chart-months">Jan / Feb / Mar / Apr / May</div>
      </div>
      <div className="floating-balance"><span className="mini-icon">◉</span><small>Total savings</small><strong>$15,500.00</strong><i>↗ 12% this month</i></div>
    </div>
  )
}

function TransferArtwork() {
  return (
    <div className="artwork transfer-artwork">
      <div className="transfer-card">
        <span className="mini-icon">↗</span><small>Send money</small>
        <div className="transfer-person"><span>🇺🇸</span><b>Alex Morgan</b><i>•••• 4832</i></div>
        <strong>$1,500.00</strong><small>Available balance $8,250.00</small>
      </div>
      <span className="floating-flag flag-one">🇯🇵</span><span className="floating-flag flag-two">🇪🇺</span><span className="floating-flag flag-three">🇬🇧</span>
      <div className="transfer-dots" />
    </div>
  )
}

function CurrencyArtwork() {
  const currencies = [
    { code: 'USD', symbol: '$' },
    { code: 'EUR', symbol: '€' },
    { code: 'GBP', symbol: '£' },
    { code: 'JPY', symbol: '¥' },
  ]

  return (
    <div className="currency-artwork">
      {currencies.map(({ code, symbol }) => (
        <span key={code}><i aria-hidden="true">{symbol}</i><b>{code}</b></span>
      ))}
    </div>
  )
}

function SubscriptionArtwork() {
  return <div className="subscription-artwork"><span>◉ Spotify</span><b>$12.00</b><i>●</i><i>●</i></div>
}

const features = [
  {
    icon: 'card',
    title: 'Custom and design your card, make it unique',
    description: 'Create a custom card that reflects your unique style and personality. Choose from a range of colors, patterns, and designs to customize the look of your card.',
    className: 'feature-card-wide',
    artwork: <CardArtwork />,
  },
  {
    icon: 'chart',
    title: 'Personalized your financial insights and goals',
    description: 'Track your spending patterns, analyze income or expenses easily, and receive personalized recommendations to optimize your financial habits.',
    className: 'feature-card-wide',
    artwork: <AnalyticsArtwork />,
  },
  {
    icon: 'transfer',
    title: 'Free transfer anywhere around the world',
    description: 'Experience the freedom of hassle-free money transfers with our free transfer and instant payments. Say goodbye to unnecessary fees and enjoy seamless transactions.',
    className: 'feature-card-transfer',
    artwork: <TransferArtwork />,
  },
  {
    icon: 'globe',
    title: 'Hold money in 30+ currencies',
    description: 'Spend and save in the currencies you use every day.',
    className: 'feature-card-small',
    artwork: <CurrencyArtwork />,
  },
  {
    icon: 'phone',
    title: 'Subscriptions you control in one place',
    description: 'See every subscription and manage it in seconds.',
    className: 'feature-card-small',
    artwork: <SubscriptionArtwork />,
  },
]

export default function FeatureCards({ compact = false }) {
  return (
    <div className={`feature-grid ${compact ? 'feature-grid-compact' : ''}`}>
      {features.map((feature) => (
        <article className={`feature-card ${feature.className}`} key={feature.title}>
          <span className="icon-disc"><Icon name={feature.icon} size={19} /></span>
          <h3>{feature.title}</h3>
          <p>{feature.description}</p>
          {feature.artwork}
        </article>
      ))}
      {!compact && (
        <Link href="/features" className="feature-card feature-card-more">
          <span className="more-shape" />
          <h3>Check out our<br />product features</h3>
          <span className="button button-yellow">View features <Icon name="arrow" size={16} /></span>
        </Link>
      )}
    </div>
  )
}
