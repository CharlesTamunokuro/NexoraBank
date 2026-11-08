import { FaArrowDown, FaArrowRightArrowLeft, FaArrowUp, FaEllipsis, FaFileLines, FaPlus } from 'react-icons/fa6'
import Link from '../../components/Link.jsx'
import { formatDate, money } from '../demoData.js'

function BalanceChart({ totalBalance, balancesVisible }) {
  return (
    <div className="activity-chart">
      <div className="chart-summary"><div><span>Total ledger balance</span><strong>{balancesVisible ? money.format(totalBalance) : '••••••'}</strong><small>Current stored account balance</small></div><span className="chart-period-label">data</span></div>
      <div className="empty-state">Balance history will appear when dated ledger records are available.</div>
    </div>
  )
}

function TransactionRows({ transactions, accounts, limit = 5 }) {
  return transactions.slice(0, limit).map((transaction) => {
    const incoming = transaction.amount > 0
    const account = accounts.find((item) => item.id === transaction.account)
    return (
      <div className="transaction-row" key={transaction.id}>
        <span className={`transaction-type-icon${incoming ? ' incoming' : ''}`}>{incoming ? <FaArrowDown /> : <FaArrowUp />}</span>
        <span className="transaction-description"><strong>{transaction.description}</strong><small>{formatDate(transaction.date)} · {account?.name ?? 'Account'}</small></span>
        <span className={`transaction-amount${incoming ? ' incoming' : ''}`}>{incoming ? '+' : '−'}{money.format(Math.abs(transaction.amount))}</span>
      </div>


        // <span className={`transaction-amount${incoming ? ' incoming' : ''}`}>{incoming ? '+' : '−'}{money.format(Math.abs(transaction.amount))}<small className={`-${transaction.status.toLowerCase()}`}>{transaction.status}</small></span>

    )
  })
}

export default function OverviewPage({ customer, accounts, transactions, balancesVisible, onNavigate }) {
  const total = accounts.reduce((sum, account) => sum + account.available, 0)
  const firstName = customer?.name?.split(/\s+/)[0] ?? 'there'
  const quickActions = [
    { label: 'Send money', Icon: FaArrowUp, path: '/dashboard/transfers/domestic' },
    { label: 'Receive money', Icon: FaArrowDown, path: '/dashboard/accounts' },
    { label: 'Pay bills', Icon: FaFileLines, path: '/dashboard/transfers/bill' },
    { label: 'Transfer between accounts', Icon: FaArrowRightArrowLeft, path: '/dashboard/transfers' },
    { label: 'Statements', Icon: FaFileLines, path: '/dashboard/statements' },
  ]

  return (
    <div className="dashboard-page overview-page">
      {/* <div className="demo-banner"><span>DEMO ENVIRONMENT</span> Sample data only. No real bank account or money movement is connected.</div> */}
      <section className="welcome-row">
        <div><p className="page-eyebrow">{new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date()).toUpperCase()}</p><h2>Hello, {firstName}</h2><p>Here’s what’s happening with your accounts.</p></div>
        <button className="primary-button" type="button" onClick={() => onNavigate('/dashboard/transfers')}><FaPlus /> New transfer</button>
      </section>

      <section className="account-summary-grid" aria-label="Account balances">
        <article className="total-balance-panel">
          <div className="summary-card-label"><span>Total available balance</span><FaEllipsis /></div>
          <strong>{balancesVisible ? money.format(total) : '••••••'}</strong>
          <span className="summary-note">Across {accounts.length} open accounts</span>
        </article>
        {accounts.map((account) => (
          <article className="account-summary-card" key={account.id}>
            <div className="summary-card-label"><span>{account.type} account</span><span className="account-status"><i /> {account.status}</span></div>
            <strong>{balancesVisible ? money.format(account.available) : '••••••'}</strong>
            <span className="account-number">Account number · {account.name} <b>{account.number}</b></span>
            <span className="current-balance">Current balance {balancesVisible ? money.format(account.current) : '••••••'}</span>
          </article>
        ))}
      </section>

      <section className="quick-actions-section">
        <div className="section-title-row"><div><h3>Quick actions</h3><p>Common tasks, right when you need them.</p></div></div>
        <div className="quick-actions">
          {quickActions.map(({ label, Icon, path }) => <button key={label} type="button" onClick={() => onNavigate(path)}><span><Icon /></span>{label}</button>)}
        </div>
      </section>

      <div className="overview-content-grid">
        <section className="panel activity-panel"><BalanceChart totalBalance={total} balancesVisible={balancesVisible} /></section>
        <section className="panel upcoming-panel">
          <div className="panel-heading"><div><h3>Scheduled payments</h3><p>Payment scheduling is not available right now.</p></div><button type="button" className="icon-button" aria-label="Open transfers" onClick={() => onNavigate('/dashboard/transfers')}><FaEllipsis /></button></div>
          <div className="empty-state">There are no scheduled payments.</div>
        </section>
      </div>

      <section className="panel recent-transactions">
        <div className="panel-heading"><div><h3>Recent transactions</h3><p>Most recent activity across your accounts</p></div><Link className="text-button" href="/dashboard">View all <span>→</span></Link></div>
        <div className="transaction-list"><TransactionRows transactions={transactions} accounts={accounts} /></div>
      </section>
    </div>
  )
}
