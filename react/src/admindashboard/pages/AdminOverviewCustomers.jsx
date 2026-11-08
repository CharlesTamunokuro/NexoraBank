import { useEffect, useMemo, useState } from 'react'
import { FaArrowDown, FaArrowRight, FaArrowUp, FaCircleExclamation, FaClock, FaCreditCard, FaFileInvoiceDollar, FaUserCheck, FaUsers, FaWallet } from 'react-icons/fa6'
import Link from '../../components/Link.jsx'
import { adminDate, adminMoney, hasAdminPermission, maskBankAccount } from '../adminData.js'
import { useAdminData } from '../AdminDataContext.jsx'
import { AdminCustomerCell, AdminFilter, AdminMetric, AdminNotice, AdminPageHeader, AdminSearch, AdminStatus, AdminTable, AdminToolbar, useAdminPagination } from '../components/AdminShared.jsx'

function VolumeChart({ transactions }) {
  const days = ['Oct 23', 'Oct 24', 'Oct 25', 'Oct 26', 'Oct 27', 'Oct 28', 'Oct 29']
  const totals = days.map((label) => {
    const date = `2026-10-${label.slice(4)}`
    return transactions.filter((item) => item.date.startsWith(date)).reduce((sum, item) => sum + Math.abs(item.amount), 0)
  })
  const maximum = Math.max(...totals, 1)
  const points = totals.map((value, index) => `${index * 50},${104 - Math.round((value / maximum) * 78)}`).join(' ')
  const incoming = transactions.filter((item) => item.direction === 'Incoming').reduce((sum, item) => sum + item.amount, 0)
  const outgoing = transactions.filter((item) => item.direction === 'Outgoing').reduce((sum, item) => sum + Math.abs(item.amount), 0)
  const domestic = transactions.filter((item) => item.source !== 'International wire').reduce((sum, item) => sum + Math.abs(item.amount), 0)
  const international = transactions.filter((item) => item.source === 'International wire').reduce((sum, item) => sum + Math.abs(item.amount), 0)
  return (
    <div className="admin-volume-chart">
      <div className="admin-chart-head"><div><h3>Transaction volume</h3><p>Daily transaction amount · synthetic activity</p></div><span className="admin-range-chip">Last 7 days</span></div>
      <svg viewBox="0 0 300 122" preserveAspectRatio="none" role="img" aria-label="Synthetic transaction activity chart over seven demo dates">
        <path d="M0 26H300M0 52H300M0 78H300M0 104H300" stroke="#edf1ef" strokeDasharray="3 4" />
        <polyline points={points} fill="none" stroke="#168f7e" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
        {totals.map((value, index) => <circle key={days[index]} cx={index * 50} cy={104 - Math.round((value / maximum) * 78)} r="3" fill="#168f7e" />)}
      </svg>
      <div className="admin-chart-axis">{days.map((day) => <span key={day}>{day.slice(4)}</span>)}</div>
      <div className="admin-chart-legend">
        <span><i className="legend-incoming" /> Incoming <b>{adminMoney(incoming)}</b></span>
        <span><i className="legend-outgoing" /> Outgoing <b>{adminMoney(outgoing)}</b></span>
        <span><i className="legend-international" /> International <b>{adminMoney(international)}</b></span>
        <span><i className="legend-domestic" /> Domestic <b>{adminMoney(domestic)}</b></span>
      </div>
    </div>
  )
}

export function AdminOverviewPage() {
  const { customers, accounts, transfers, transactions, payments, auditLogs, verificationCases } = useAdminData()
  const activeUsers = customers.filter((user) => user.status === 'Active').length
  const suspended = customers.filter((user) => user.status === 'Suspended').length
  const pendingVerification = verificationCases.filter((item) => ['Pending', 'In review', 'Needs information'].includes(item.status)).length
  const pendingTransfers = transfers.filter((item) => item.status === 'Pending').length
  const pendingReview = transfers.filter((item) => item.review !== 'Clear').length + verificationCases.filter((item) => ['Pending', 'In review', 'Needs information'].includes(item.status)).length
  const failed = transactions.filter((item) => item.status === 'Failed').length
  const incoming = transactions.filter((item) => item.direction === 'Incoming').reduce((sum, item) => sum + item.amount, 0)
  const outgoing = transactions.filter((item) => item.direction === 'Outgoing').reduce((sum, item) => sum + Math.abs(item.amount), 0)
  const customerBalances = accounts.reduce((sum, account) => sum + account.current, 0)
  const todayCount = transfers.filter((item) => item.date.startsWith('2026-10-29') && item.status === 'Completed').length
  const newCustomers = customers.filter((item) => item.joined >= '2026-10-01').length
  const recentEvents = [
    ...auditLogs.slice(0, 4).map((event) => ({ id: event.id, title: event.action, detail: `${event.target} · ${event.reason}`, date: event.date, kind: 'audit' })),
    ...transfers.filter((item) => item.review !== 'Clear').slice(0, 3).map((item) => ({ id: item.id, title: `${item.kind} transfer flagged for review`, detail: `${item.id} · ${item.senderName} · ${adminMoney(item.amount)}`, date: item.date, kind: 'transfer' })),
    ...customers.filter((item) => item.joined >= '2026-10-01').map((item) => ({ id: item.id, title: 'New customer registration', detail: `${item.name} · ${item.id}`, date: item.joined, kind: 'customer' })),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7)
  const transactionStatuses = ['Completed', 'Pending', 'Failed'].map((status) => ({ status, count: transactions.filter((item) => item.status === status).length }))

  return (
    <div className="admin-page">
      <AdminNotice><strong>Demo operations environment</strong><span> All names, balances, records, risk flags, and system states are synthetic. No banking network or customer data is connected.</span></AdminNotice>
      <AdminPageHeader eyebrow="OPERATIONS SNAPSHOT · OCTOBER 29, 2026" title="Good morning, Morgan" copy="A consolidated view of sample customer, account, and payment activity." />
      <div className="admin-metrics-grid">
        <AdminMetric label="Registered customers" value={customers.length.toLocaleString('en-US')} note={`${newCustomers} joined this month`} icon={FaUsers} />
        <AdminMetric label="Active customers" value={activeUsers.toLocaleString('en-US')} note="Demo customer status" icon={FaUserCheck} tone="blue" />
        <AdminMetric label="Suspended accounts" value={suspended.toLocaleString('en-US')} note="Access and account actions tracked separately" icon={FaCircleExclamation} tone="amber" />
        <AdminMetric label="Verification queue" value={pendingVerification.toLocaleString('en-US')} note="Synthetic review cases" icon={FaClock} tone="purple" />
        <AdminMetric label="Customer account balances" value={adminMoney(customerBalances)} note="Current balances across sample accounts" icon={FaWallet} tone="green" />
        <AdminMetric label="Outgoing volume" value={adminMoney(outgoing)} note="Recorded outgoing demo transactions" icon={FaArrowUp} tone="red" />
        <AdminMetric label="Incoming volume" value={adminMoney(incoming)} note="Recorded incoming demo transactions" icon={FaArrowDown} tone="blue" />
        <AdminMetric label="Transfers pending" value={pendingTransfers.toLocaleString('en-US')} note={`${pendingReview} total items needing review`} icon={FaArrowRight} tone="amber" />
        <AdminMetric label="Failed transactions" value={failed.toLocaleString('en-US')} note="Synthetic status records" icon={FaCircleExclamation} tone="red" />
        <AdminMetric label="Transfers completed today" value={todayCount.toLocaleString('en-US')} note="October 29 · Demo data" icon={FaCreditCard} tone="green" />
        <AdminMetric label="Admin payments" value={payments.length.toLocaleString('en-US')} note="Created in this browser session" icon={FaFileInvoiceDollar} tone="purple" />
      </div>
      <div className="admin-overview-grid">
        <section className="admin-panel chart-panel"><VolumeChart transactions={transactions} /></section>
        <section className="admin-panel status-panel"><div className="admin-panel-heading"><div><h3>Transaction status</h3><p>Current sample dataset</p></div></div>{transactionStatuses.map(({ status, count }) => <div className="status-breakdown-row" key={status}><span><AdminStatus>{status}</AdminStatus></span><div className="status-track"><i className={`track-${status.toLowerCase()}`} style={{ width: `${transactions.length ? (count / transactions.length) * 100 : 0}%` }} /></div><strong>{count}</strong></div>)}<div className="status-panel-footer">Total records <strong>{transactions.length}</strong></div></section>
        <section className="admin-panel activity-feed"><div className="admin-panel-heading"><div><h3>Recent operations activity</h3><p>Audit entries, new registrations, and review flags</p></div><Link href="/admin/activity" className="admin-inline-action">View audit log <FaArrowRight /></Link></div>{recentEvents.map((event) => <div className="admin-activity-row" key={event.id}><i className={`activity-dot dot-${event.kind}`} /><span><strong>{event.title}</strong><small>{event.detail}</small></span><time>{adminDate(event.date, true)}</time></div>)}</section>
        <section className="admin-panel system-health-panel"><div className="admin-panel-heading"><div><h3>System status</h3><p>Simulated frontend indicators</p></div><span className="simulated-tag">SIMULATED</span></div>{[
          ['Transfer processing', 'Simulated'], ['Identity verification', 'Simulated'], ['Notifications', 'Demo data'], ['Banking APIs', 'Not connected'],
        ].map(([label, status]) => <div className="system-health-row" key={label}><span><i />{label}</span><AdminStatus>{status}</AdminStatus></div>)}<p className="system-health-note">No external banking or identity services are connected.</p></section>
      </div>
    </div>
  )
}

const userColumns = [
  { key: 'customer', label: 'Customer', render: (row) => <AdminCustomerCell customer={row} /> },
  { key: 'account', label: 'Primary account', render: (row) => <span>{row.account ? maskBankAccount(row.account.number) : '—'}<small className="table-subtext">{row.account?.type ?? 'No funded account'}</small></span> },
  { key: 'balance', label: 'Available balance', className: 'admin-align-right', render: (row) => adminMoney(row.balance) },
  { key: 'status', label: 'Customer status', render: (row) => <AdminStatus>{row.status}</AdminStatus> },
  { key: 'verification', label: 'Verification', render: (row) => <AdminStatus>{row.verification}</AdminStatus> },
  { key: 'joined', label: 'Registered', render: (row) => adminDate(row.joined) },
  { key: 'access', label: 'Online access', render: (row) => <AdminStatus>{row.accessStatus ?? 'Enabled'}</AdminStatus> },
]

export function AdminUsersPage() {
  const { customers, accounts } = useAdminData()
  const [query, setQuery] = useState(() => new URLSearchParams(window.location.search).get('q') ?? '')
  const [status, setStatus] = useState('all')
  const [verification, setVerification] = useState('all')
  const [type, setType] = useState('all')
  const [joinedWithin, setJoinedWithin] = useState('all')
  const [sort, setSort] = useState('name')
  useEffect(() => {
    const syncSearch = () => setQuery(new URLSearchParams(window.location.search).get('q') ?? '')
    window.addEventListener('app:navigate', syncSearch)
    window.addEventListener('popstate', syncSearch)
    return () => {
      window.removeEventListener('app:navigate', syncSearch)
      window.removeEventListener('popstate', syncSearch)
    }
  }, [])
  const filtered = useMemo(() => {
    const latestJoinDate = customers.reduce((latest, item) => item.joined > latest ? item.joined : latest, '')
    const cutoff = joinedWithin === 'all' ? '' : new Date(new Date(`${latestJoinDate}T00:00:00`).getTime() - Number(joinedWithin) * 86400000).toISOString().slice(0, 10)
    const rows = customers.map((customer) => {
      const linked = accounts.filter((account) => account.customerId === customer.id)
      return { ...customer, account: linked[0], balance: linked.reduce((sum, account) => sum + account.available, 0) }
    }).filter((customer) => {
      const match = `${customer.name} ${customer.id} ${customer.email} ${accounts.filter((account) => account.customerId === customer.id).map((account) => account.number).join(' ')}`.toLowerCase().includes(query.toLowerCase())
      return match && (status === 'all' || customer.status === status) && (verification === 'all' || customer.verification === verification) && (type === 'all' || customer.type === type) && (!cutoff || customer.joined >= cutoff)
    })
    return rows.sort((a, b) => sort === 'balance' ? b.balance - a.balance : sort === 'joined' ? b.joined.localeCompare(a.joined) : sort === 'lastActivity' ? b.lastActivity.localeCompare(a.lastActivity) : a.name.localeCompare(b.name))
  }, [customers, accounts, query, status, verification, type, joinedWithin, sort])
  const { rows, Pagination, setPage } = useAdminPagination(filtered, 8)

  return (
    <div className="admin-page">
      <AdminPageHeader eyebrow="CUSTOMER OPERATIONS" title="User management" copy="Search synthetic customer records, inspect profiles, and manage demo account access." />
      <AdminNotice>All customer profiles use fictional contact details. Banking identifiers remain masked in the interface.</AdminNotice>
      <AdminToolbar>
        <AdminSearch value={query} onChange={(value) => { setQuery(value); setPage(1) }} placeholder="Name, ID, email, or account number" />
        <AdminFilter label="Customer status" value={status} onChange={(value) => { setStatus(value); setPage(1) }} options={[{ value: 'all', label: 'All statuses' }, ...['Active', 'Pending', 'Restricted', 'Suspended'].map((value) => ({ value, label: value }))]} />
        <AdminFilter label="Verification" value={verification} onChange={(value) => { setVerification(value); setPage(1) }} options={[{ value: 'all', label: 'All verification' }, ...[...new Set(customers.map((item) => item.verification))].map((value) => ({ value, label: value }))]} />
        <AdminFilter label="Account type" value={type} onChange={(value) => { setType(value); setPage(1) }} options={[{ value: 'all', label: 'All types' }, ...[...new Set(customers.map((item) => item.type))].map((value) => ({ value, label: value }))]} />
        <AdminFilter label="Registration date" value={joinedWithin} onChange={(value) => { setJoinedWithin(value); setPage(1) }} options={[{ value: 'all', label: 'Any date' }, { value: '30', label: 'Last 30 days' }, { value: '90', label: 'Last 90 days' }]} />
        <AdminFilter label="Sort by" value={sort} onChange={setSort} options={[{ value: 'name', label: 'Name' }, { value: 'balance', label: 'Balance' }, { value: 'joined', label: 'Registration date' }, { value: 'lastActivity', label: 'Last activity' }]} />
      </AdminToolbar>
      <section className="admin-panel table-panel"><div className="admin-panel-heading"><div><h3>Customers <span className="record-count">{filtered.length}</span></h3><p>Customer details, status, and verification overview · Open a profile to manage status</p></div></div><AdminTable columns={userColumns} rows={rows} emptyMessage="No customer records match these filters." /><Pagination /></section>
    </div>
  )
}

const profileTabs = ['Overview', 'Bank accounts', 'Transactions', 'Transfers', 'Verification']

export function AdminUserDetailPage({ customerId }) {
  const { customers, accounts, transactions, transfers, verificationCases, activeAdmin, updateUserStatus, updateAccessStatus, addCustomerNote } = useAdminData()
  const customer = customers.find((item) => item.id === customerId)
  const [tab, setTab] = useState('Overview')
  const [modalAction, setModalAction] = useState('')
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  if (!customer) return <div className="admin-page"><AdminPageHeader eyebrow="CUSTOMER RECORD" title="Customer not found" copy="No matching synthetic customer record exists." /><Link href="/admin/users" className="admin-primary-button">Back to user management</Link></div>

  const userAccounts = accounts.filter((item) => item.customerId === customer.id)
  const userTransactions = transactions.filter((item) => item.customerId === customer.id)
  const userTransfers = transfers.filter((item) => item.customerId === customer.id)
  const verification = verificationCases.filter((item) => item.customerId === customer.id)

  async function submitStatus(event) {
    event.preventDefault()
    if (!reason.trim()) return setError('A reason is required before confirming this administrative action.')
    const action = modalAction
    let result
    if (action === 'Suspend online access' || action === 'Reactivate online access') {
      result = await updateAccessStatus(customer.id, action === 'Suspend online access' ? 'Disabled' : 'Enabled', reason.trim())
    } else {
      const status = action === 'Suspend account activity' ? 'Suspended'
        : action === 'Disable customer account' ? 'Disabled'
          : action === 'Place account under review' ? 'Restricted' : 'Active'
      result = await updateUserStatus(customer.id, status, reason.trim(), note.trim())
    }
    if (!result.ok) return setError(result.error)
    setModalAction('')
    setReason('')
    setNote('')
    setError('')
  }

  async function saveNote(event) {
    event.preventDefault()
    if (!note.trim()) return setError('Enter an internal note before saving.')
    const result = await addCustomerNote(customer.id, note.trim())
    setError(result.error ?? '')
    if (result.ok) setNote('')
  }

  return (
    <div className="admin-page">
      <div className="admin-back-link"><Link href="/admin/users">← User management</Link></div>
      <AdminPageHeader eyebrow={`CUSTOMER PROFILE · ${customer.id}`} title={customer.name} copy={`${customer.email} · ${customer.phone}`} action={<div className="admin-profile-actions"><AdminStatus>{customer.status}</AdminStatus><AdminStatus>{customer.verification}</AdminStatus></div>} />
      <div className="admin-profile-summary-grid"><article className="admin-panel customer-profile-card"><div className="admin-profile-large">{customer.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</div><h3>{customer.name}</h3><p>{customer.email}</p><p>{customer.phone}</p><p>{customer.address}</p><div className="profile-fact"><span>Customer ID</span><strong>{customer.id}</strong></div><div className="profile-fact"><span>Joined</span><strong>{adminDate(customer.joined)}</strong></div><div className="profile-fact"><span>Last login</span><strong>{customer.lastLogin}</strong></div><div className="profile-fact"><span>Account manager</span><strong>{customer.manager}</strong></div><div className="profile-fact"><span>Online access</span><AdminStatus>{customer.accessStatus ?? 'Enabled'}</AdminStatus></div>{customer.statusReason && <AdminNotice tone="warning">Status reason: {customer.statusReason}</AdminNotice>}</article>
        <section className="admin-panel customer-detail-panel"><div className="admin-tabs" role="tablist">{profileTabs.map((name) => <button key={name} type="button" role="tab" aria-selected={tab === name} className={tab === name ? 'active' : ''} onClick={() => setTab(name)}>{name}</button>)}</div>
          {tab === 'Overview' && <div className="customer-overview-content"><div className="customer-quick-stats"><div><span>Linked accounts</span><strong>{userAccounts.length}</strong></div><div><span>Transactions</span><strong>{userTransactions.length}</strong></div><div><span>Transfers</span><strong>{userTransfers.length}</strong></div></div><h3>Administrative account controls</h3>{hasAdminPermission(activeAdmin?.role, 'operations') ? <div className="profile-action-grid">{customer.accessStatus === 'Disabled' ? <button type="button" className="admin-secondary-button" onClick={() => setModalAction('Reactivate online access')}>Reactivate online access</button> : <button type="button" className="admin-secondary-button" onClick={() => setModalAction('Suspend online access')}>Suspend online access</button>}{customer.status === 'Suspended' || customer.status === 'Disabled' ? <button type="button" className="admin-primary-button" onClick={() => setModalAction('Reactivate customer account')}>Reactivate account</button> : <button type="button" className="admin-danger-button" onClick={() => setModalAction('Suspend account activity')}>Suspend account activity</button>}<button type="button" className="admin-secondary-button" onClick={() => setModalAction('Place account under review')}>Place under review</button><button type="button" className="admin-danger-button" onClick={() => setModalAction('Disable customer account')}>Disable customer account</button></div> : <AdminNotice>Your current demo role is read-only for customer status actions.</AdminNotice>}
            <h3>Internal customer note</h3><form className="admin-note-form" onSubmit={saveNote}><textarea value={note} onChange={(event) => setNote(event.target.value)} rows="3" placeholder={customer.adminNote || 'Add an internal note for this demo record'} aria-label="Internal customer note" /><button className="admin-secondary-button" type="submit">Save note</button></form>{error && <AdminNotice tone="error">{error}</AdminNotice>}</div>}
          {tab === 'Bank accounts' && <div className="detail-list">{userAccounts.map((account) => <article key={account.id} className="detail-list-row"><div><strong>{account.type}</strong><small>{account.id} · {maskBankAccount(account.number)} · Opened {adminDate(account.opened)}</small></div><div><strong>{adminMoney(account.available)} available</strong><small>{adminMoney(account.current)} current · {account.status}</small></div><Link className="admin-inline-action" href="/admin/accounts">Account details →</Link></article>)}</div>}
          {tab === 'Transactions' && <div className="detail-list">{userTransactions.map((transaction) => <article key={transaction.id} className="detail-list-row"><div><strong>{transaction.description}</strong><small>{transaction.id} · {transaction.type} · {adminDate(transaction.date, true)}</small></div><div><strong>{adminMoney(transaction.amount)}</strong><small>{transaction.direction} · {transaction.status}</small></div><Link className="admin-inline-action" href="/admin/transactions">Open transactions →</Link></article>)}</div>}
          {tab === 'Transfers' && <div className="detail-list">{userTransfers.map((transfer) => <article key={transfer.id} className="detail-list-row"><div><strong>{transfer.recipientName}</strong><small>{transfer.id} · {transfer.method} · {transfer.country}</small></div><div><strong>{adminMoney(transfer.amount)} {transfer.currency}</strong><small>{transfer.status} · Review: {transfer.review}</small></div><Link className="admin-inline-action" href={transfer.kind === 'International' ? '/admin/international-transfers' : '/admin/domestic-transfers'}>Open transfer →</Link></article>)}</div>}
          {tab === 'Verification' && <div className="detail-list">{verification.length ? verification.map((item) => <article key={item.id} className="detail-list-row"><div><strong>{item.required}</strong><small>{item.id} · Assigned to {item.reviewer} · {adminDate(item.date)}</small></div><div><AdminStatus>{item.status}</AdminStatus><small>{item.missing}</small></div><Link className="admin-inline-action" href="/admin/compliance">Review case →</Link></article>) : <AdminNotice>No verification case is linked to this customer in the demo data.</AdminNotice>}</div>}
        </section></div>
      {modalAction && <div className="admin-modal-backdrop" role="presentation" onClick={() => setModalAction('')}><section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="customer-status-title" onClick={(event) => event.stopPropagation()}><button type="button" className="admin-modal-close" aria-label="Close dialog" onClick={() => setModalAction('')}>×</button><p className="admin-eyebrow">CUSTOMER STATUS WORKFLOW</p><h3 id="customer-status-title">{modalAction}</h3><AdminNotice>{customer.name} · {customer.id} · Accounts: {userAccounts.map((item) => maskBankAccount(item.number)).join(', ')}<br />{modalAction.includes('online access') ? 'Only demo sign-in access will change. This does not change account transaction status.' : 'Account status changes can prevent simulated outgoing transactions. Customer and account history will be retained.'}</AdminNotice><form onSubmit={submitStatus} className="admin-form-stack"><label>Reason code / reason<textarea rows="3" required value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Required reason for this status change" /></label><label>Internal note (optional)<textarea rows="2" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Internal note for the audit record" /></label>{error && <p className="admin-form-error" role="alert">{error}</p>}<div className="admin-modal-footer"><button type="button" className="admin-secondary-button" onClick={() => setModalAction('')}>Cancel</button><button type="submit" className={modalAction.includes('Suspend') || modalAction.includes('Disable') ? 'admin-danger-button' : 'admin-primary-button'}>Confirm {modalAction.toLowerCase()}</button></div></form></section></div>}
    </div>
  )
}
