import { useMemo, useState } from 'react'
import { FaArrowDown, FaArrowUp, FaArrowUpRightFromSquare, FaCheck, FaDownload, FaMagnifyingGlass, FaPlus, FaTrash, FaXmark } from 'react-icons/fa6'
import { createDemoId, demoNow, formatDate, maskAccount, money } from '../demoData.js'
import { apiRequest } from '../../api.js'

function PageIntro({ eyebrow, title, copy, action }) {
  return <div className="workspace-intro"><div><p className="page-eyebrow">{eyebrow}</p><h2>{title}</h2><p>{copy}</p></div>{action}</div>
}

function AccountTransactions({ transactions, accountId }) {
  const rows = transactions.filter((transaction) => transaction.account === accountId).slice(0, 5)
  return rows.length ? rows.map((transaction) => <div className="account-activity-row" key={transaction.id}><span className={transaction.amount > 0 ? 'deposit-mark' : 'payment-mark'}>{transaction.amount > 0 ? <FaArrowDown /> : <FaArrowUp />}</span><span><strong>{transaction.description}</strong><small>{formatDate(transaction.date)} · {transaction.status}</small></span><b className={transaction.amount > 0 ? 'positive-amount' : ''}>{transaction.amount > 0 ? '+' : '−'}{money.format(Math.abs(transaction.amount))}</b></div>) : <div className="empty-state">No activity for this account yet.</div>
}

export function AccountsPage({ accounts, transactions, balancesVisible, onNavigate }) {
  const [selectedId, setSelectedId] = useState(accounts[0]?.id)
  const selected = accounts.find((account) => account.id === selectedId) ?? accounts[0]
  return (
    <div className="dashboard-page">
      <PageIntro eyebrow="YOUR MONEY" title="Accounts" copy="Review your available funds and account activity." />
      <div className="account-workspace">
        <section className="workspace-panel account-selector"><h3>Your accounts</h3>{accounts.map((account) => <button type="button" className={`account-select-row${selected?.id === account.id ? ' selected' : ''}`} key={account.id} onClick={() => setSelectedId(account.id)}><span className="account-icon">⌂</span><span><strong>{account.name}</strong><small>{account.type} · account number: {account.number}</small></span><b>{balancesVisible ? money.format(account.available) : '••••••'}</b></button>)}</section>
        {selected && <section className="workspace-panel account-detail"><div className="account-detail-head"><div><p className="page-eyebrow">{selected.type.toUpperCase()} ACCOUNT</p><h3>{selected.name}</h3><span>account number: <strong>{selected.number}</strong> · <span className="account-status"><i /> {selected.status}</span></span></div><button type="button" className="secondary-button" onClick={() => onNavigate('/dashboard/statements')}><FaDownload /> Statements</button></div><div className="account-balance-pair"><div><span>Available balance</span><strong>{balancesVisible ? money.format(selected.available) : '••••••'}</strong></div><div><span>Current balance</span><strong>{balancesVisible ? money.format(selected.current) : '••••••'}</strong></div></div><div className="account-activity-head"><h4>Recent activity</h4><button type="button" className="text-button" onClick={() => onNavigate('/dashboard/transactions')}>View all →</button></div><div className="account-activity-list"><AccountTransactions transactions={transactions} accountId={selected.id} /></div></section>}
      </div>
      {/* <div className="inline-notice"><span>These account numbers and balances are fictional demo data. They are used only to identify accounts in this local demo; they are not real bank account details.</span></div> */}
    </div>
  )
}

export function TransactionHistoryPage({ transactions, accounts, initialQuery = '' }) {
  const [query, setQuery] = useState(initialQuery)
  const [accountFilter, setAccountFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('30')
  const [selected, setSelected] = useState(null)
  const filtered = useMemo(() => transactions.filter((transaction) => {
    const matchesText = transaction.description.toLowerCase().includes(query.toLowerCase())
    const matchesDate = dateFilter === 'all' || demoNow - new Date(`${transaction.date}T12:00:00`).getTime() <= Number(dateFilter) * 86400000
    return matchesText && matchesDate && (accountFilter === 'all' || transaction.account === accountFilter) && (statusFilter === 'all' || transaction.status.toLowerCase() === statusFilter) && (typeFilter === 'all' || transaction.type === typeFilter)
  }), [transactions, query, accountFilter, statusFilter, typeFilter, dateFilter])

  function exportCsv() {
    const lines = [['Date', 'Description', 'Type', 'Account', 'Amount USD', 'Status'], ...filtered.map((transaction) => [transaction.date, transaction.description, transaction.type, accounts.find((account) => account.id === transaction.account)?.name ?? '', transaction.amount.toFixed(2), transaction.status])]
    const file = new Blob([lines.map((row) => row.map((field) => `"${String(field).replaceAll('"', '""')}"`).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = url
    link.download = 'nexora-transactions.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="dashboard-page">
      <PageIntro eyebrow="ACCOUNT ACTIVITY" title="Transaction history" copy="Search, filter, and export your account activity." action={<button type="button" className="secondary-button" onClick={exportCsv}><FaDownload /> Export CSV</button>} />
      <section className="workspace-panel transaction-history-panel">
        <div className="transaction-filters"><label className="filter-search"><FaMagnifyingGlass /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search transactions" aria-label="Search transactions" /></label><select value={accountFilter} onChange={(event) => setAccountFilter(event.target.value)} aria-label="Filter by account"><option value="all">All accounts</option>{accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}</select><select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} aria-label="Filter by transaction type"><option value="all">All transaction types</option>{[...new Set(transactions.map((transaction) => transaction.type))].map((type) => <option key={type} value={type}>{type}</option>)}</select><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by status"><option value="all">All statuses</option><option value="completed">Completed</option><option value="pending">Pending</option><option value="failed">Failed</option></select><select value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} aria-label="Filter by date"><option value="30">Last 30 days</option><option value="7">Last 7 days</option><option value="all">All dates</option></select></div>
        <div className="transaction-table-wrap"><table className="transaction-table"><thead><tr><th>Transaction</th><th>Date</th><th>Account</th><th>Status</th><th className="amount-cell">Amount</th><th><span className="sr-only">Details</span></th></tr></thead><tbody>{filtered.map((transaction) => <tr key={transaction.id}><td><button className="transaction-name-button" type="button" onClick={() => setSelected(transaction)}><span className={`transaction-type-icon${transaction.amount > 0 ? ' incoming' : ''}`}>{transaction.amount > 0 ? <FaArrowDown /> : <FaArrowUp />}</span><span><strong>{transaction.description}</strong><small>{transaction.type}</small></span></button></td><td>{formatDate(transaction.date)}</td><td>{accounts.find((account) => account.id === transaction.account)?.name ?? 'Account'}</td><td><span className={`status-pill status-${transaction.status.toLowerCase()}`}>{transaction.status}</span></td><td className={`amount-cell ${transaction.amount > 0 ? 'positive-amount' : ''}`}>{transaction.amount > 0 ? '+' : '−'}{money.format(Math.abs(transaction.amount))}</td><td><button type="button" className="icon-button" aria-label={`View ${transaction.description}`} onClick={() => setSelected(transaction)}>···</button></td></tr>)}</tbody></table></div>
        {!filtered.length && <div className="empty-state">No transactions match these filters.</div>}
        <div className="table-footnote">Showing {filtered.length} of {transactions.length} transactions.</div>
      </section>
      {selected && <div className="modal-backdrop" role="presentation" onClick={() => setSelected(null)}><section className="dashboard-modal" role="dialog" aria-modal="true" aria-labelledby="transaction-modal-title" onClick={(event) => event.stopPropagation()}><button className="modal-close" type="button" aria-label="Close details" onClick={() => setSelected(null)}><FaXmark /></button><p className="page-eyebrow">TRANSACTION DETAILS</p><h3 id="transaction-modal-title">{selected.description}</h3><div className="review-list"><div><span>Date</span><strong>{formatDate(selected.date)}</strong></div><div><span>Type</span><strong>{selected.type}</strong></div><div><span>Account</span><strong>{accounts.find((account) => account.id === selected.account)?.name}</strong></div><div><span>Status</span><strong>{selected.status}</strong></div><div><span>Amount</span><strong>{money.format(Math.abs(selected.amount))}</strong></div>{selected.reference && <div><span>Demo reference</span><strong>{selected.reference}</strong></div>}</div></section></div>}
    </div>
  )
}

export function BeneficiariesPage({ recipients, onAdd, onRemove, onUpdate, onNavigate }) {
  const [query, setQuery] = useState('')
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', nickname: '', bank: '', account: '', type: 'Checking' })
  const visible = recipients.filter((recipient) => `${recipient.name} ${recipient.nickname} ${recipient.bank}`.toLowerCase().includes(query.toLowerCase()))

  function save(event) {
    event.preventDefault()
    if (!form.name.trim() || !form.bank.trim() || form.account.replace(/\D/g, '').length < 4) {
      setError('Enter the recipient name, bank, and at least 4 account-number digits.')
      return
    }
    onAdd({ id: createDemoId('recipient'), name: form.name.trim(), nickname: form.nickname.trim(), bank: form.bank.trim(), account: maskAccount(form.account), type: form.type, method: 'Domestic' })
    setAdding(false)
    setForm({ name: '', nickname: '', bank: '', account: '', type: 'Checking' })
    setError('')
  }

  function saveEdit(event) {
    event.preventDefault()
    if (!editing.nickname.trim() || !editing.bank.trim()) {
      setError('Enter a nickname and bank name.')
      return
    }
    onUpdate(editing.id, { nickname: editing.nickname.trim(), bank: editing.bank.trim() })
    setEditing(null)
    setError('')
  }

  return (
    <div className="dashboard-page">
      <PageIntro eyebrow="SAVED RECIPIENTS" title="Beneficiaries" copy="Manage the people and accounts you may send transfers to." action={<button className="primary-button" type="button" onClick={() => setAdding(true)}><FaPlus /> Add recipient</button>} />
      <section className="workspace-panel recipients-panel">
        <div className="recipient-toolbar"><label className="filter-search"><FaMagnifyingGlass /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search recipients" aria-label="Search recipients" /></label><span>{visible.length} recipients</span></div>
        <div className="recipient-list">{visible.map((recipient) => <article className="recipient-row" key={recipient.id}><span className="recipient-avatar">{recipient.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span><div><strong>{recipient.nickname || recipient.name}</strong><small>{recipient.name}{recipient.nickname ? ` · ${recipient.nickname}` : ''}</small></div><div><strong>{recipient.bank}</strong><small>{recipient.type} · {maskAccount(recipient.account)} · {recipient.method}</small></div><div className="recipient-actions"><button type="button" className="secondary-button compact" onClick={() => onNavigate(`/dashboard/transfers/${recipient.method === 'International' ? 'international' : 'domestic'}?recipient=${encodeURIComponent(recipient.id)}`)}>Send money <FaArrowUpRightFromSquare /></button><button type="button" className="secondary-button compact" onClick={() => { setEditing({ id: recipient.id, nickname: recipient.nickname || recipient.name, bank: recipient.bank }); setError('') }}>Edit</button><button type="button" className="icon-button danger-icon" aria-label={`Remove ${recipient.name}`} onClick={() => { if (window.confirm(`Remove ${recipient.name} from demo beneficiaries?`)) onRemove(recipient.id) }}><FaTrash /></button></div></article>)}</div>
        {!visible.length && <div className="empty-state">No saved recipients match your search.</div>}
        {/* <div className="inline-notice">Sensitive recipient account details are represented by masked demo values and are never sent to a bank service.</div> */}
      </section>
      {adding && <div className="modal-backdrop" role="presentation" onClick={() => setAdding(false)}><form className="dashboard-modal" role="dialog" aria-modal="true" aria-labelledby="recipient-modal-title" onSubmit={save} onClick={(event) => event.stopPropagation()}><button className="modal-close" type="button" aria-label="Close" onClick={() => setAdding(false)}><FaXmark /></button><p className="page-eyebrow">NEW BENEFICIARY</p><h3 id="recipient-modal-title">Add recipient</h3><div className="form-grid"><label>Legal name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label>Nickname<input value={form.nickname} onChange={(event) => setForm({ ...form, nickname: event.target.value })} /></label><label>Bank name<input value={form.bank} onChange={(event) => setForm({ ...form, bank: event.target.value })} /></label><label>Account type<select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}><option>Checking</option><option>Savings</option></select></label><label className="form-span">Account number<input value={form.account} onChange={(event) => setForm({ ...form, account: event.target.value })} /></label></div><p className="sensitive-data-note"><FaCheck /> only the last four digits are displayed.</p>{error && <p role="alert" className="form-error">{error}</p>}<button className="primary-button" type="submit">Save demo recipient</button></form></div>}
      {editing && <div className="modal-backdrop" role="presentation" onClick={() => setEditing(null)}><form className="dashboard-modal" role="dialog" aria-modal="true" aria-labelledby="edit-recipient-title" onSubmit={saveEdit} onClick={(event) => event.stopPropagation()}><button className="modal-close" type="button" aria-label="Close" onClick={() => setEditing(null)}><FaXmark /></button><p className="page-eyebrow">EDIT BENEFICIARY</p><h3 id="edit-recipient-title">Update saved recipient</h3><div className="form-grid"><label>Nickname<input value={editing.nickname} onChange={(event) => setEditing({ ...editing, nickname: event.target.value })} /></label><label>Bank name<input value={editing.bank} onChange={(event) => setEditing({ ...editing, bank: event.target.value })} /></label></div>{error && <p role="alert" className="form-error">{error}</p>}<button className="primary-button" type="submit">Save changes</button></form></div>}
    </div>
  )
}

export function CardsPage() {
  return (
    <div className="dashboard-page">
      <PageIntro eyebrow="CARD SERVICES" title="Cards" copy="Card services are being prepared." />
      <section className="workspace-panel empty-state"><h3>COMING SOON</h3><p>Card services are not available.</p></section>
    </div>
  )
}

export function UtilityPage({ path, notifications = [], customer, onMarkRead, onRefresh }) {
  const [settings, setSettings] = useState({ email: true, push: true, sms: false, twoFactor: false })
  const [supportSent, setSupportSent] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' })
  const [faqOpen, setFaqOpen] = useState(0)
  const [pinForm, setPinForm] = useState({ currentPin: '', pin: '', confirmPin: '' })
  const [pinMessage, setPinMessage] = useState('')

  if (path === '/dashboard/statements') {
    return <div className="dashboard-page"><PageIntro eyebrow="ACCOUNT RECORDS" title="Statements & Documents" copy="Statements are not available until statement generation is connected." /><section className="workspace-panel empty-state">No statements are available for this profile.</section></div>
  }

  if (path === '/dashboard/notifications') {
    return <div className="dashboard-page"><PageIntro eyebrow="ACCOUNT UPDATES" title="Notifications" copy="Updates attached to your  profile." /><section className="workspace-panel notification-list">{notifications.length ? notifications.map((item) => <article key={item.id} className={`notification-row${item.read ? ' read' : ''}`}><span className="notification-dot" /><div><strong>{item.title}</strong><p>{item.body}</p><small>{new Date(item.date).toLocaleString()}</small></div><button className="text-button" type="button" disabled={item.read} onClick={() => onMarkRead(item.id)}>{item.read ? 'Read' : 'Mark read'}</button></article>) : <div className="empty-state">No notifications yet.</div>}</section></div>
  }

  if (path === '/dashboard/settings') {
    const preferences = [['email', 'Email alerts', 'Receive account and transfer notices by email.'], ['push', 'Push notifications', 'Get important updates on your device.'], ['sms', 'Text message alerts', 'Receive selected security alerts by text.'], ['twoFactor', 'Two-step verification', 'Add an extra verification step to sign-in.']]
    async function submitPin(event) {
      event.preventDefault()
      setPinMessage('')
      try {
        await apiRequest('/customer/pin', {
          method: customer?.pinConfigured ? 'PATCH' : 'POST',
          body: pinForm,
        })
        setPinForm({ currentPin: '', pin: '', confirmPin: '' })
        setPinMessage(customer?.pinConfigured ? 'Transaction PIN changed.' : 'Transaction PIN created.')
        await onRefresh()
      } catch (error) {
        setPinMessage(error.message)
      }
    }
    function submitPassword(event) {
      event.preventDefault()
      if (passwordForm.next.length < 8 || passwordForm.next !== passwordForm.confirm) {
        setPasswordMessage('Use at least 8 characters and make sure both new-password fields match.')
        return
      }
      setPasswordMessage('Demo only: no password was changed or stored.')
      setPasswordForm({ current: '', next: '', confirm: '' })
    }
    return <div className="dashboard-page"><PageIntro eyebrow="PROFILE & PREFERENCES" title="Settings" copy="Review details saved in your local demo profile." /><div className="settings-layout"><section className="workspace-panel settings-panel"><h3>Personal information</h3><div className="profile-summary"><span className="profile-avatar large">{customer?.name?.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase() ?? 'D'}</span><span><strong>{customer?.name ?? 'Demo customer'}</strong><small>{customer?.email ?? ''}</small></span></div><div className="settings-detail-row"><span>Phone number</span><strong>{customer?.phone ?? 'Not provided'}</strong></div><div className="settings-detail-row"><span>Mailing address</span><strong>{customer?.address ?? 'Not provided'}</strong></div><p className="inline-notice">Confirm all Informations</p></section><section className="workspace-panel settings-panel"><h3>Transaction PIN</h3><p>{customer?.pinConfigured ? 'A transaction PIN is configured. Verify your current PIN before changing it.' : 'Create a four- or six-digit PIN before submitting demo transfer requests.'}</p><form className="password-demo-form" onSubmit={submitPin}>{customer?.pinConfigured && <label>Current PIN<input type="password" inputMode="numeric" autoComplete="off" pattern="(?:[0-9]{4}|[0-9]{6})" maxLength="6" required value={pinForm.currentPin} onChange={(event) => setPinForm({ ...pinForm, currentPin: event.target.value })} /></label>}<label>{customer?.pinConfigured ? 'New PIN' : 'Create PIN'}<input type="password" inputMode="numeric" autoComplete="new-password" pattern="(?:[0-9]{4}|[0-9]{6})" maxLength="6" required value={pinForm.pin} onChange={(event) => setPinForm({ ...pinForm, pin: event.target.value })} /></label><label>Confirm PIN<input type="password" inputMode="numeric" autoComplete="new-password" pattern="(?:[0-9]{4}|[0-9]{6})" maxLength="6" required value={pinForm.confirmPin} onChange={(event) => setPinForm({ ...pinForm, confirmPin: event.target.value })} /></label><button className="secondary-button" type="submit">{customer?.pinConfigured ? 'Change transaction PIN' : 'Create transaction PIN'}</button>{pinMessage && <p className="inline-notice" role="status">{pinMessage}</p>}</form></section><section className="workspace-panel settings-panel"><h3>Notification preferences</h3>{preferences.map(([key, title, description]) => <div className="control-row" key={key}><span><strong>{title}</strong><small>{description}</small></span><button type="button" className={`toggle-switch${settings[key] ? ' on' : ''}`} aria-pressed={settings[key]} aria-label={`${settings[key] ? 'Disable' : 'Enable'} ${title}`} onClick={() => setSettings({ ...settings, [key]: !settings[key] })} /></div>)}</section><section className="workspace-panel settings-panel"><h3>Change password</h3><p></p><form className="password-demo-form" onSubmit={submitPassword}><label>Current password<input type="password" autoComplete="off" value={passwordForm.current} onChange={(event) => setPasswordForm({ ...passwordForm, current: event.target.value })} required /></label><label>New password<input type="password" autoComplete="off" value={passwordForm.next} onChange={(event) => setPasswordForm({ ...passwordForm, next: event.target.value })} required minLength={8} /></label><label>Confirm new password<input type="password" autoComplete="off" value={passwordForm.confirm} onChange={(event) => setPasswordForm({ ...passwordForm, confirm: event.target.value })} required minLength={8} /></label><button className="secondary-button" type="submit">Validate</button>{passwordMessage && <p className="inline-notice" role="status">{passwordMessage}</p>}</form></section></div></div>
  }

  return <div className="dashboard-page"><PageIntro eyebrow="WE’RE HERE TO HELP" title="Help & Support" copy="Find quick answers or send a message in this demo interface." /><div className="help-layout"><section className="workspace-panel faq-panel"><h3>Frequently asked questions</h3>{[['How do demo transfers work?', 'Transfers in this dashboard update sample balances and history only. No money is moved through a bank or payment network.'], ['Are the balances real?', 'No. Account names, balances, transactions, recipients, and card details are fictional sample data.'], ['Can I use a real account number?', 'No. Please do not enter real account or identity information in this frontend demonstration.'], ['Where can I find a statement?', 'Open Statements & Documents from the navigation to download clearly marked sample files.']].map(([question, answer], index) => <div className="faq-item" key={question}><button type="button" aria-expanded={faqOpen === index} onClick={() => setFaqOpen(faqOpen === index ? -1 : index)}><strong>{question}</strong><span>{faqOpen === index ? '−' : '+'}</span></button>{faqOpen === index && <p>{answer}</p>}</div>)}</section><form className="workspace-panel support-form" onSubmit={(event) => { event.preventDefault(); setSupportSent(true) }}><h3>Contact demo support</h3><p>This form does not send a message. Do not enter personal or account information.</p><label>Your name<input required placeholder="Name" /></label><label>Message<textarea required rows="4" placeholder="How can we help?" /></label>{supportSent ? <p className="inline-notice" role="status">Your demo message is ready. It was not sent.</p> : <button className="primary-button" type="submit">Preview message</button>}</form></div></div>
}
