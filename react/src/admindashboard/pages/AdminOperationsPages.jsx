import { useState } from 'react'
import { FaArrowRight, FaDownload, FaFlag, FaRotateLeft, FaShieldHalved, FaSnowflake, FaUserCheck } from 'react-icons/fa6'
import Link from '../../components/Link.jsx'
import { adminDate, adminMoney, adminRoles, hasAdminPermission, maskBankAccount } from '../adminData.js'
import { useAdminData } from '../AdminDataContext.jsx'
import { AdminFilter, AdminMetric, AdminModal, AdminNotice, AdminPageHeader, AdminSearch, AdminStatus, AdminTable, AdminToolbar, useAdminPagination } from '../components/AdminShared.jsx'

export function AdminRestrictionsPage() {
  const { customers, accounts, transfers, transactions, verificationCases, activeAdmin, updateTransferReview, updateAccountStatus, addAccountNote } = useAdminData()
  const restrictedAccounts = accounts.filter((item) => ['Restricted', 'Suspended', 'Disabled'].includes(item.status))
  const flaggedTransfers = transfers.filter((item) => item.review !== 'Clear' || item.status === 'Pending' || item.status === 'Failed')
  const failedTransactions = transactions.filter((item) => item.status === 'Failed')
  const pendingVerification = verificationCases.filter((item) => ['Pending', 'In review', 'Needs information'].includes(item.status))
  const [selected, setSelected] = useState(null)
  const [note, setNote] = useState('')
  const [status, setStatus] = useState('Needs review')
  const [message, setMessage] = useState('')
  const canManage = hasAdminPermission(activeAdmin?.role, 'operations')

  async function saveTransferNote(event) {
    event.preventDefault()
    if (!note.trim()) return setMessage('Add a review note before updating the transfer.')
    const result = await updateTransferReview(selected.id, status, note.trim())
    setMessage(result.ok ? (status === 'Reviewed' ? 'Transfer reviewed. The customer can now confirm it.' : 'Review annotation saved to activity log.') : result.error)
    if (result.ok) setSelected(null)
  }

  const queueRows = [
    ...flaggedTransfers.map((item) => ({ id: item.id, kind: 'Transfer', title: `${item.method} · ${item.senderName}`, detail: `${item.recipientName} · ${adminMoney(item.amount)} · ${item.notes || item.review}`, href: item.kind === 'International' ? '/admin/international-transfers' : '/admin/domestic-transfers', tone: item.status === 'Failed' ? 'Failed' : item.review })),
    ...failedTransactions.map((item) => ({ id: item.id, kind: 'Transaction', title: item.description, detail: `${item.customerId} · ${adminMoney(item.amount)} · ${item.source}`, href: '/admin/transactions', tone: 'Failed' })),
    ...pendingVerification.map((item) => ({ id: item.id, kind: 'Verification', title: `${item.status} verification`, detail: `${customers.find((customer) => customer.id === item.customerId)?.name ?? item.customerId} · ${item.missing}`, href: '/admin/compliance', tone: item.status })),
  ]

  return (
    <div className="admin-page">
      <AdminPageHeader eyebrow="REVIEW QUEUE · SIMULATED RULES" title="Account restrictions" copy="Inspect synthetic account restrictions, failed activity, and transfers awaiting review." />
      <AdminNotice tone="warning"><FaShieldHalved /> These are illustrative flags, not fraud detection or compliance decisions. Review actions are recorded in the local audit log.</AdminNotice>
      <div className="admin-metrics-row"><AdminMetric label="Restricted accounts" value={restrictedAccounts.length} tone="amber" /><AdminMetric label="Transfers needing review" value={flaggedTransfers.length} tone="purple" /><AdminMetric label="Failed transactions" value={failedTransactions.length} tone="red" /><AdminMetric label="Verification cases" value={pendingVerification.length} tone="blue" /></div>
      <div className="admin-restriction-grid"><section className="admin-panel table-panel"><div className="admin-panel-heading"><div><h3>Restricted accounts</h3><p>Status and reason are visible on linked customer profiles</p></div></div><AdminTable rows={restrictedAccounts} columns={[
        { key: 'id', label: 'Account', render: (row) => <strong>{row.id}<small className="table-subtext">{maskBankAccount(row.number)}</small></strong> },
        { key: 'customer', label: 'Customer', render: (row) => <Link className="admin-text-link" href={`/admin/users/${row.customerId}`}>{row.name}<small className="table-subtext">{row.customerId}</small></Link> },
        { key: 'status', label: 'Status', render: (row) => <AdminStatus>{row.status}</AdminStatus> },
        { key: 'reason', label: 'Reason code', render: (row) => row.restriction || 'Review requested' },
        { key: 'action', label: 'Action', render: (row) => <button type="button" className="admin-inline-action" onClick={() => { setSelected({ ...row, kind: 'account' }); setNote(row.note ?? ''); setMessage('') }}>Inspect / note</button> },
      ]} emptyMessage="No account restrictions in the data." /></section>
        <section className="admin-panel table-panel"><div className="admin-panel-heading"><div><h3>Items needing attention <span className="record-count">{queueRows.length}</span></h3><p>Open the related record to inspect details or add review notes</p></div></div><AdminTable rows={queueRows} columns={[
          { key: 'id', label: 'Record', render: (row) => <strong>{row.id}<small className="table-subtext">{row.kind}</small></strong> },
          { key: 'title', label: 'Issue', render: (row) => <span>{row.title}<small className="table-subtext">{row.detail}</small></span> },
          { key: 'tone', label: 'Review state', render: (row) => <AdminStatus>{row.tone}</AdminStatus> },
          { key: 'open', label: 'Open', render: (row) => <Link href={row.href} className="admin-inline-action">Open record <FaArrowRight /></Link> },
        ]} emptyMessage="The demo review queue is clear." /></section></div>
      {selected && selected.kind === 'account' && <AdminModal title={`Account restriction · ${selected.id}`} eyebrow="DEMO ACCOUNT REVIEW" onClose={() => setSelected(null)}><div className="admin-detail-grid"><div><span>Customer</span><strong>{selected.name} · {selected.customerId}</strong></div><div><span>Account</span><strong>{selected.type} · {maskBankAccount(selected.number)}</strong></div><div><span>Status</span><AdminStatus>{selected.status}</AdminStatus></div><div><span>Reason</span><strong>{selected.restriction || 'Review requested'}</strong></div></div>{canManage ? <form className="admin-form-stack" onSubmit={(event) => { event.preventDefault(); const result = addAccountNote(selected.id, note.trim()); setMessage(result.ok ? 'Internal account note saved.' : result.error); if (result.ok) setSelected(null) }}><label>Internal review note<textarea rows="3" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Note for the audit trail" /></label>{message && <AdminNotice tone="error">{message}</AdminNotice>}<div className="admin-modal-actions">{selected.status !== 'Open' && <button className="admin-primary-button" type="button" onClick={() => { if (!note.trim()) return setMessage('Enter a reason before removing the restriction.'); updateAccountStatus(selected.id, 'Open', note.trim()); setSelected(null) }}>Remove restriction</button>}<button className="admin-secondary-button" type="submit">Save note</button></div></form> : <AdminNotice>Your role is read-only for restriction actions.</AdminNotice>}</AdminModal>}
      {selected && selected.kind === 'Transfer' && <AdminModal title={`Transfer review · ${selected.id}`} eyebrow="DEMO REVIEW QUEUE" onClose={() => setSelected(null)}><p>Use the transfer page to inspect full sender, recipient, fees, and processing timeline.</p>{canManage ? <form className="admin-form-stack" onSubmit={saveTransferNote}><label>Review status<select value={status} onChange={(event) => setStatus(event.target.value)}><option>Needs review</option><option>Flagged</option><option value="Reviewed">Reviewed — allow customer confirmation</option><option>Clear</option></select></label><label>Review note<textarea rows="3" required value={note} onChange={(event) => setNote(event.target.value)} /></label><button className="admin-secondary-button" type="submit"><FaFlag /> Save review decision</button></form> : <AdminNotice>Your role is read-only for review actions.</AdminNotice>}<Link className="admin-inline-action" href={selected.href}>Open transfer monitor <FaArrowRight /></Link></AdminModal>}
    </div>
  )
}

export function AdminCompliancePage() {
  const { customers, verificationCases, activeAdmin, updateVerification } = useAdminData()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [selected, setSelected] = useState(null)
  const [decision, setDecision] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const canReview = hasAdminPermission(activeAdmin?.role, 'operations')
  const visible = verificationCases.filter((item) => {
    const customer = customers.find((user) => user.id === item.customerId)
    return `${item.id} ${item.customerId} ${customer?.name} ${customer?.email} ${item.missing}`.toLowerCase().includes(query.toLowerCase()) && (status === 'all' || item.status === status)
  })

  function saveDecision(event) {
    event.preventDefault()
    if (!decision) return setError('Choose a verification outcome.')
    if (!note.trim()) return setError('Add a reviewer note explaining the demo decision.')
    const result = updateVerification(selected.id, decision, note.trim())
    if (!result.ok) return setError(result.error)
    setSelected(null)
    setError('')
  }

  return (
    <div className="admin-page">
      <AdminPageHeader eyebrow="CUSTOMER DUE DILIGENCE" title="Compliance & verification" copy="Review synthetic case statuses and fictional document metadata." />
      {/* <AdminNotice tone="warning">No identity documents are stored or verified. Case states demonstrate workflow only and are not compliance determinations.</AdminNotice> */}
      <AdminToolbar><AdminSearch value={query} onChange={setQuery} placeholder="Case, customer name, or ID" /><AdminFilter label="Verification state" value={status} onChange={setStatus} options={[{ value: 'all', label: 'All states' }, ...[...new Set(verificationCases.map((item) => item.status))].map((value) => ({ value, label: value }))]} /></AdminToolbar>
      <section className="admin-panel table-panel"><div className="admin-panel-heading"><div><h3>Verification cases <span className="record-count">{visible.length}</span></h3><p>Required items, review owner, and outstanding information</p></div></div><AdminTable rows={visible} columns={[
        { key: 'id', label: 'Case', render: (row) => <strong>{row.id}</strong> },
        { key: 'customer', label: 'Customer', render: (row) => { const customer = customers.find((item) => item.id === row.customerId); return customer ? <Link className="admin-text-link" href={`/admin/users/${customer.id}`}>{customer.name}<small className="table-subtext">{customer.id}</small></Link> : row.customerId } },
        { key: 'required', label: 'Review item', render: (row) => <span>{row.required}<small className="table-subtext">{row.missing}</small></span> },
        { key: 'reviewer', label: 'Reviewer' },
        { key: 'date', label: 'Last reviewed', render: (row) => adminDate(row.date) },
        { key: 'status', label: 'Status', render: (row) => <AdminStatus>{row.status}</AdminStatus> },
        { key: 'action', label: 'Workflow', render: (row) => <button type="button" className="admin-inline-action" onClick={() => { setSelected(row); setDecision(row.status); setNote(row.note ?? ''); setError('') }}>Review case</button> },
      ]} emptyMessage="No verification cases match the filters." /></section>
      {selected && <AdminModal title={`Review ${selected.id}`} eyebrow="SYNTHETIC VERIFICATION CASE" onClose={() => setSelected(null)}><div className="admin-detail-grid"><div><span>Customer</span><strong>{customers.find((item) => item.id === selected.customerId)?.name} · {selected.customerId}</strong></div><div><span>Verification status</span><AdminStatus>{selected.status}</AdminStatus></div><div><span>Required item</span><strong>{selected.required}</strong></div><div><span>Missing information</span><strong>{selected.missing}</strong></div><div><span>Reviewer</span><strong>{selected.reviewer}</strong></div><div><span>Review date</span><strong>{adminDate(selected.date)}</strong></div></div>{canReview ? <form className="admin-form-stack" onSubmit={saveDecision}><label>Demo review outcome<select value={decision} onChange={(event) => setDecision(event.target.value)}><option value="">Select outcome</option><option>In review</option><option>Approved</option><option>Rejected</option><option>Needs information</option></select></label><label>Reviewer note<textarea rows="3" required value={note} onChange={(event) => setNote(event.target.value)} placeholder="Required note for the audit log" /></label>{error && <p className="admin-form-error" role="alert">{error}</p>}<button type="submit" className="admin-primary-button"><FaUserCheck /> Save demo decision</button></form> : <AdminNotice>Your demo role can inspect but cannot update verification cases.</AdminNotice>}</AdminModal>}
    </div>
  )
}

export function AdminReportsPage() {
  const { customers, accounts, transfers, transactions, payments } = useAdminData()
  const [period, setPeriod] = useState('30')
  const scopedTransactions = period === 'all' ? transactions : transactions.filter((item) => item.date.slice(0, 10) >= (period === '7' ? '2026-10-22' : '2026-09-29'))
  const incoming = scopedTransactions.filter((item) => item.direction === 'Incoming').reduce((sum, item) => sum + item.amount, 0)
  const outgoing = scopedTransactions.filter((item) => item.direction === 'Outgoing').reduce((sum, item) => sum + Math.abs(item.amount), 0)
  const international = transfers.filter((item) => item.kind === 'International').reduce((sum, item) => sum + item.amount, 0)
  const domestic = transfers.filter((item) => item.kind === 'Domestic').reduce((sum, item) => sum + item.amount, 0)
  const recentReg = customers.filter((item) => period === 'all' || item.joined >= (period === '7' ? '2026-10-22' : '2026-09-29')).length
  const counts = ['Completed', 'Pending', 'Failed'].map((state) => ({ state, count: scopedTransactions.filter((item) => item.status === state).length }))

  function exportReport() {
    const rows = [['Metric', 'Value'], ['Incoming volume', incoming], ['Outgoing volume', outgoing], ['Domestic transfer volume', domestic], ['International transfer volume', international], ['New customers', recentReg], ['Pending transactions', counts.find((item) => item.state === 'Pending').count], ['Failed transactions', counts.find((item) => item.state === 'Failed').count], ['Demo administrative payments', payments.reduce((sum, item) => sum + item.amount, 0)]]
    const content = rows.map((row) => row.map((field) => `"${String(field).replaceAll('"', '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'nexora-demo-operations-report.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="admin-page">
      <AdminPageHeader eyebrow="OPERATIONAL REPORTING · DEMO DATA" title="Reports & analytics" copy="Review demo activity totals. Transaction volume is not profit or revenue." action={<button type="button" className="admin-secondary-button" onClick={exportReport}><FaDownload /> Export summary CSV</button>} />
      <AdminToolbar><AdminFilter label="Date range" value={period} onChange={setPeriod} options={[{ value: '7', label: 'Last 7 days' }, { value: '30', label: 'Last 30 days' }, { value: 'all', label: 'All demo dates' }]} /></AdminToolbar>
      <div className="admin-metrics-grid report-metrics"><AdminMetric label="Incoming volume" value={adminMoney(incoming)} note={`${scopedTransactions.filter((item) => item.direction === 'Incoming').length} transactions`} tone="green" /><AdminMetric label="Outgoing volume" value={adminMoney(outgoing)} note={`${scopedTransactions.filter((item) => item.direction === 'Outgoing').length} transactions`} tone="blue" /><AdminMetric label="Domestic transfers" value={adminMoney(domestic)} note={`${transfers.filter((item) => item.kind === 'Domestic').length} demo transfers`} tone="purple" /><AdminMetric label="International transfers" value={adminMoney(international)} note="USD sent amount · illustrative" tone="amber" /><AdminMetric label="Customer registrations" value={recentReg} note="In selected demo period" tone="green" /><AdminMetric label="Suspended customers" value={customers.filter((item) => item.status === 'Suspended').length} note={`${accounts.filter((item) => item.status === 'Restricted').length} restricted accounts`} tone="red" /><AdminMetric label="Admin payment total" value={adminMoney(payments.filter((item) => item.status === 'Completed').reduce((sum, item) => sum + item.amount, 0))} note="Completed simulated payments" tone="blue" /><AdminMetric label="Transaction records" value={scopedTransactions.length} note="Filtered synthetic ledger" tone="purple" /></div>
      <div className="admin-report-grid"><section className="admin-panel report-status-panel"><div className="admin-panel-heading"><div><h3>Transaction status breakdown</h3><p>Counts derived from selected sample records</p></div></div>{counts.map(({ state, count }) => <div className="report-count-row" key={state}><AdminStatus>{state}</AdminStatus><div className="status-track"><i className={`track-${state.toLowerCase()}`} style={{ width: `${scopedTransactions.length ? count / scopedTransactions.length * 100 : 0}%` }} /></div><strong>{count}</strong></div>)}</section><section className="admin-panel report-bars-panel"><div className="admin-panel-heading"><div><h3>Transfers by rail</h3><p>Count and USD volume in the synthetic dataset</p></div></div>{['Domestic', 'International'].map((kind) => { const amount = kind === 'Domestic' ? domestic : international; const count = transfers.filter((item) => item.kind === kind).length; const max = Math.max(domestic, international, 1); return <div className="report-bar-row" key={kind}><span>{kind}<small>{count} transfers</small></span><i><b style={{ width: `${amount / max * 100}%` }} /></i><strong>{adminMoney(amount)}</strong></div> })}</section></div>
      <AdminNotice>Data is locally held sample state for the current browser session. No live reporting feed, revenue calculation, or external financial source is connected.</AdminNotice>
    </div>
  )
}

export function AdminBeneficiariesPage() {
  const { beneficiaries, customers, updateBeneficiaryNote, activeAdmin } = useAdminData()
  const [query, setQuery] = useState('')
  const [method, setMethod] = useState('all')
  const [selected, setSelected] = useState(null)
  const filtered = beneficiaries.filter((item) => `${item.id} ${item.name} ${item.customerId} ${item.bank} ${item.country}`.toLowerCase().includes(query.toLowerCase()) && (method === 'all' || item.method === method))
  return <div className="admin-page"><AdminPageHeader eyebrow="SAVED RECIPIENTS" title="Beneficiaries" copy="Inspect customer-saved payment recipients using masked identifiers." /><AdminToolbar><AdminSearch value={query} onChange={setQuery} placeholder="Recipient, customer, bank, or country" /><AdminFilter label="Transfer type" value={method} onChange={setMethod} options={[{ value: 'all', label: 'All types' }, { value: 'Domestic', label: 'Domestic' }, { value: 'International', label: 'International' }]} /></AdminToolbar><section className="admin-panel table-panel"><div className="admin-panel-heading"><div><h3>Beneficiary register <span className="record-count">{filtered.length}</span></h3><p>Only masked account details are displayed</p></div></div><AdminTable rows={filtered} columns={[
    { key: 'id', label: 'Beneficiary', render: (row) => <strong>{row.id}</strong> },
    { key: 'name', label: 'Recipient', render: (row) => <span>{row.name}<small className="table-subtext">{row.type} · {row.method}</small></span> },
    { key: 'customer', label: 'Associated customer', render: (row) => { const customer = customers.find((item) => item.id === row.customerId); return customer ? <Link className="admin-text-link" href={`/admin/users/${customer.id}`}>{customer.name}<small className="table-subtext">{customer.id}</small></Link> : row.customerId } },
    { key: 'bank', label: 'Destination bank', render: (row) => <span>{row.bank}<small className="table-subtext">{row.country}</small></span> },
    { key: 'account', label: 'Account', render: (row) => maskBankAccount(row.account) },
    { key: 'dateAdded', label: 'Date added', render: (row) => adminDate(row.dateAdded) },
    { key: 'status', label: 'Status', render: (row) => <AdminStatus>{row.status}</AdminStatus> },
    { key: 'action', label: 'Details', render: (row) => <button type="button" className="admin-inline-action" onClick={() => setSelected(row)}>Inspect</button> },
  ]} emptyMessage="No beneficiaries match the filters." /></section>{selected && <BeneficiaryNotesModal beneficiary={selected} customer={customers.find((item) => item.id === selected.customerId)} canManage={hasAdminPermission(activeAdmin?.role, 'operations')} onSave={updateBeneficiaryNote} onClose={() => setSelected(null)} />}</div>
}

function BeneficiaryNotesModal({ beneficiary, customer, canManage, onSave, onClose }) {
  const [note, setNote] = useState(beneficiary.note ?? '')
  const [message, setMessage] = useState('')
  return <AdminModal title={beneficiary.name} eyebrow={`SAVED RECIPIENT · ${beneficiary.id}`} onClose={onClose}><div className="admin-detail-grid"><div><span>Customer</span><strong>{customer?.name} · {beneficiary.customerId}</strong></div><div><span>Recipient type</span><strong>{beneficiary.method} · {beneficiary.type}</strong></div><div><span>Destination bank</span><strong>{beneficiary.bank}</strong></div><div><span>Country</span><strong>{beneficiary.country}</strong></div><div><span>Account</span><strong>{maskBankAccount(beneficiary.account)}</strong></div><div><span>Added</span><strong>{adminDate(beneficiary.dateAdded)}</strong></div></div><AdminNotice>Full destination account details are not shown in the admin interface.</AdminNotice>{canManage ? <form className="admin-form-stack" onSubmit={(event) => { event.preventDefault(); if (!note.trim()) return setMessage('Enter an internal note before saving.'); const result = onSave(beneficiary.id, note.trim()); setMessage(result.ok ? 'Internal note added to the demo audit log.' : result.error) }}><label>Internal note<textarea rows="3" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add an internal review note" /></label>{message && <AdminNotice tone={message.startsWith('Enter') ? 'warning' : 'success'}>{message}</AdminNotice>}<button type="submit" className="admin-secondary-button">Save note</button></form> : <AdminNotice>Your demo role is read-only for beneficiary notes.</AdminNotice>}</AdminModal>
}

export function AdminCardsPage() {
  const { cards, customers, activeAdmin, updateCardStatus } = useAdminData()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [selected, setSelected] = useState(null)
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const canManage = hasAdminPermission(activeAdmin?.role, 'operations')
  const filtered = cards.filter((item) => `${item.id} ${item.customerId} ${item.customerName} ${item.number}`.toLowerCase().includes(query.toLowerCase()) && (status === 'all' || item.status === status))
  const { rows, Pagination } = useAdminPagination(filtered, 8)

  function confirm() {
    if (!reason.trim()) return setError('A reason is required for every card status change.')
    const result = updateCardStatus(selected.id, selected.nextStatus, reason.trim())
    if (!result.ok) return setError(result.error)
    setSelected(null)
  }

  return <div className="admin-page"><AdminPageHeader eyebrow="CARD SERVICES · SYNTHETIC RECORDS" title="Cards management" copy="Inspect masked demo cards and create audited status simulations." /><AdminNotice>Card numbers are masked. No CVV, PIN, or actual payment credential is stored or displayed.</AdminNotice><AdminToolbar><AdminSearch value={query} onChange={setQuery} placeholder="Card, customer, or masked number" /><AdminFilter label="Card status" value={status} onChange={setStatus} options={[{ value: 'all', label: 'All statuses' }, ...[...new Set(cards.map((item) => item.status))].map((value) => ({ value, label: value }))]} /></AdminToolbar><section className="admin-panel table-panel"><div className="admin-panel-heading"><div><h3>Demo card register <span className="record-count">{filtered.length}</span></h3></div></div><AdminTable rows={rows} columns={[
    { key: 'id', label: 'Card', render: (row) => <strong>{row.id}<small className="table-subtext">{row.number}</small></strong> },
    { key: 'customer', label: 'Cardholder', render: (row) => <Link className="admin-text-link" href={`/admin/users/${row.customerId}`}>{row.customerName}<small className="table-subtext">{row.customerId}</small></Link> },
    { key: 'type', label: 'Type' },
    { key: 'expiry', label: 'Expiry' },
    { key: 'limit', label: 'Daily limit', className: 'admin-align-right', render: (row) => adminMoney(row.limit) },
    { key: 'status', label: 'Status', render: (row) => <AdminStatus>{row.status}</AdminStatus> },
    { key: 'action', label: 'Control', render: (row) => { const nextStatus = row.status === 'Active' ? 'Frozen' : row.status === 'Frozen' ? 'Active' : 'Lost'; return canManage && row.status !== 'Lost' ? <button className={`admin-inline-action${nextStatus === 'Lost' ? ' action-danger' : ''}`} type="button" onClick={() => { setSelected({ ...row, nextStatus }); setReason(''); setError('') }}>{nextStatus === 'Frozen' ? <FaSnowflake /> : nextStatus === 'Lost' ? <FaFlag /> : <FaRotateLeft />} {nextStatus === 'Active' ? 'Unfreeze' : nextStatus === 'Frozen' ? 'Freeze' : 'Mark lost'}</button> : <span>{row.status === 'Lost' ? 'Not eligible' : 'View only'}</span> } },
  ]} emptyMessage="No card records match the search." /><Pagination /></section>{selected && <AdminModal title={`${selected.nextStatus} card ending ${selected.number.slice(-4)}?`} eyebrow={`CARD STATUS CHANGE · ${selected.id}`} onClose={() => setSelected(null)}><AdminNotice>Cardholder: {customers.find((item) => item.id === selected.customerId)?.name}. This changes only the synthetic frontend card status and will be added to the audit log.</AdminNotice><label className="admin-modal-note">Reason required<textarea rows="3" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Reason for this demo status change" /></label>{error && <p className="admin-form-error" role="alert">{error}</p>}<div className="admin-modal-actions"><button type="button" className="admin-secondary-button" onClick={() => setSelected(null)}>Cancel</button><button type="button" className={selected.nextStatus === 'Lost' ? 'admin-danger-button' : 'admin-primary-button'} onClick={confirm}>Confirm {selected.nextStatus.toLowerCase()}</button></div></AdminModal>}</div>
}

export function AdminNotificationsPage() {
  const { notifications, markNotificationRead } = useAdminData()
  const unread = notifications.filter((item) => !item.read).length
  return <div className="admin-page"><AdminPageHeader eyebrow="OPERATIONS MESSAGES" title="Notifications" copy="Review demo transfers, customer verifications, and support updates." action={<span className="admin-count-label">{unread} unread</span>} /><section className="admin-panel admin-notifications-list">{notifications.map((item) => <article className={`admin-notification${item.read ? ' is-read' : ''}`} key={item.id}><i /><div><strong>{item.title}</strong><p>{item.body}</p><time>{adminDate(item.date, true)}</time></div><Link href={item.href} className="admin-inline-action">Open <FaArrowRight /></Link>{!item.read && <button className="admin-inline-action" type="button" onClick={() => markNotificationRead(item.id)}>Mark read</button>}</article>)}</section></div>
}

export function AdminSupportPage() {
  const { tickets, customers, activeAdmin, updateTicket } = useAdminData()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [selected, setSelected] = useState(null)
  const [nextStatus, setNextStatus] = useState('')
  const [note, setNote] = useState('')
  const [message, setMessage] = useState('')
  const canManage = hasAdminPermission(activeAdmin?.role, 'support')
  const filtered = tickets.filter((ticket) => `${ticket.id} ${ticket.customerId} ${ticket.category} ${ticket.related}`.toLowerCase().includes(query.toLowerCase()) && (status === 'all' || ticket.status === status))

  function saveTicket(event) {
    event.preventDefault()
    if (!note.trim()) return setMessage('Add an internal note before saving the ticket update.')
    const result = updateTicket(selected.id, { status: nextStatus, notes: note })
    if (!result.ok) return setMessage(result.error)
    setSelected(null)
  }

  return <div className="admin-page"><AdminPageHeader eyebrow="CUSTOMER CARE · DEMO" title="Support & disputes" copy="Inspect synthetic support tickets and record internal workflow updates." /><AdminNotice>Ticket contents and customer details are fictional. No message is sent to customers.</AdminNotice><AdminToolbar><AdminSearch value={query} onChange={setQuery} placeholder="Ticket, customer, issue, or reference" /><AdminFilter label="Ticket status" value={status} onChange={setStatus} options={[{ value: 'all', label: 'All statuses' }, ...[...new Set(tickets.map((item) => item.status))].map((value) => ({ value, label: value }))]} /></AdminToolbar><section className="admin-panel table-panel"><AdminTable rows={filtered} columns={[
    { key: 'id', label: 'Ticket', render: (row) => <strong>{row.id}</strong> },
    { key: 'customer', label: 'Customer', render: (row) => <Link className="admin-text-link" href={`/admin/users/${row.customerId}`}>{customers.find((item) => item.id === row.customerId)?.name ?? row.customerId}<small className="table-subtext">{row.customerId}</small></Link> },
    { key: 'category', label: 'Issue', render: (row) => <span>{row.category}<small className="table-subtext">Related: {row.related}</small></span> },
    { key: 'priority', label: 'Priority', render: (row) => <AdminStatus>{row.priority}</AdminStatus> },
    { key: 'date', label: 'Opened', render: (row) => adminDate(row.date) },
    { key: 'assigned', label: 'Assigned to' },
    { key: 'status', label: 'Status', render: (row) => <AdminStatus>{row.status}</AdminStatus> },
    { key: 'action', label: 'Details', render: (row) => <button className="admin-inline-action" type="button" onClick={() => { setSelected(row); setNextStatus(row.status); setNote(row.notes ?? ''); setMessage('') }}>Inspect</button> },
  ]} emptyMessage="No support tickets match the filters." /></section>{selected && <AdminModal title={`${selected.category} · ${selected.id}`} eyebrow="SUPPORT TICKET · DEMO" onClose={() => setSelected(null)}><div className="admin-detail-grid"><div><span>Customer</span><strong>{customers.find((item) => item.id === selected.customerId)?.name}</strong></div><div><span>Related record</span><strong>{selected.related}</strong></div><div><span>Priority</span><AdminStatus>{selected.priority}</AdminStatus></div><div><span>Assigned</span><strong>{selected.assigned}</strong></div><div><span>Opened</span><strong>{adminDate(selected.date)}</strong></div><div><span>Current status</span><AdminStatus>{selected.status}</AdminStatus></div></div>{canManage ? <form className="admin-form-stack" onSubmit={saveTicket}><label>Demo ticket status<select value={nextStatus} onChange={(event) => setNextStatus(event.target.value)}><option>Open</option><option>In review</option><option>Resolved</option><option>Closed</option></select></label><label>Internal note<textarea rows="3" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Required internal note" /></label>{message && <p className="admin-form-error" role="alert">{message}</p>}<button className="admin-primary-button" type="submit">Save ticket update</button></form> : <AdminNotice>Your demo role can inspect tickets but cannot change them.</AdminNotice>}</AdminModal>}</div>
}

export function AdminActivityPage() {
  const { auditLogs, adminUsers } = useAdminData()
  const [query, setQuery] = useState('')
  const [action, setAction] = useState('all')
  const [period, setPeriod] = useState('all')
  const filtered = auditLogs.filter((item) => {
    const admin = adminUsers.find((user) => user.id === item.adminId)
    const text = `${item.id} ${item.action} ${item.target} ${item.reason} ${admin?.name}`.toLowerCase()
    return text.includes(query.toLowerCase()) && (action === 'all' || item.action === action) && (period === 'all' || item.date.slice(0, 10) >= (period === '7' ? '2026-10-22' : '2026-09-29'))
  })
  return <div className="admin-page"><AdminPageHeader eyebrow="ADMINISTRATIVE AUDIT TRAIL" title="Admin activity logs" copy="Review append-only demo records for administrative actions. Existing entries cannot be edited or deleted." /><AdminNotice>Audit events exist only in current frontend memory. A production audit log requires tamper-resistant backend storage and authorization.</AdminNotice><AdminToolbar><AdminSearch value={query} onChange={setQuery} placeholder="Event, action, actor, or affected record" /><AdminFilter label="Action type" value={action} onChange={setAction} options={[{ value: 'all', label: 'All actions' }, ...[...new Set(auditLogs.map((item) => item.action))].map((value) => ({ value, label: value }))]} /><AdminFilter label="Date range" value={period} onChange={setPeriod} options={[{ value: 'all', label: 'All dates' }, { value: '7', label: 'Last 7 days' }, { value: '30', label: 'Last 30 days' }]} /></AdminToolbar><section className="admin-panel table-panel"><div className="admin-panel-heading"><div><h3>Audit events <span className="record-count">{filtered.length}</span></h3></div></div><AdminTable rows={filtered} columns={[
    { key: 'id', label: 'Event reference', render: (row) => <strong>{row.id}</strong> },
    { key: 'date', label: 'Timestamp', render: (row) => adminDate(row.date, true) },
    { key: 'admin', label: 'Administrator', render: (row) => <span>{adminUsers.find((user) => user.id === row.adminId)?.name ?? row.adminId}<small className="table-subtext">{row.adminId}</small></span> },
    { key: 'action', label: 'Action' },
    { key: 'target', label: 'Affected record' },
    { key: 'reason', label: 'Reason / note' },
    { key: 'result', label: 'Result', render: (row) => <AdminStatus>{row.result}</AdminStatus> },
  ]} emptyMessage="No audit events match the filters." /></section></div>
}

export function AdminStaffPage() {
  const { adminUsers, activeAdmin, updateAdmin, updateAdminRole } = useAdminData()
  const [message, setMessage] = useState('')
  function updateMember(admin, field, value) {
    if (admin.id === activeAdmin?.id) return setMessage('For safety, the active demo administrator cannot change their own role or status.')
    const result = updateAdmin(admin.id, { [field]: value })
    setMessage(result.ok ? `${admin.name} updated in demo.` : result.error)
  }
  function previewRole(role) {
    const result = updateAdminRole(activeAdmin.id, role)
    setMessage(result.ok ? `Previewing ${role} permissions. Sign out and sign back in to reset the active demo role.` : result.error)
  }
  return <div className="admin-page"><AdminPageHeader eyebrow="ADMINISTRATOR ACCESS · DEMO" title="Staff & permissions" copy="Inspect fictional staff accounts and preview role-based interface permissions." /><AdminNotice tone="warning">These UI permissions are not security controls. Any production authorization must be enforced server-side and independently audited.</AdminNotice>{message && <AdminNotice>{message}</AdminNotice>}<section className="admin-panel table-panel"><div className="admin-panel-heading"><div><h3>Demo administrators <span className="record-count">{adminUsers.length}</span></h3><p>Role changes are local to this current session</p></div></div><AdminTable rows={adminUsers} columns={[
    { key: 'id', label: 'Staff ID', render: (row) => <strong>{row.id}</strong> },
    { key: 'name', label: 'Administrator', render: (row) => <span>{row.name}<small className="table-subtext">{row.email}</small></span> },
    { key: 'role', label: 'Role', render: (row) => <select className="admin-table-select" disabled={!hasAdminPermission(activeAdmin?.role, 'super') || row.id === activeAdmin?.id} value={row.role} onChange={(event) => updateMember(row, 'role', event.target.value)} aria-label={`Role for ${row.name}`}>{adminRoles.map((role) => <option key={role}>{role}</option>)}</select> },
    { key: 'status', label: 'Status', render: (row) => <select className="admin-table-select" disabled={!hasAdminPermission(activeAdmin?.role, 'super') || row.id === activeAdmin?.id} value={row.status} onChange={(event) => updateMember(row, 'status', event.target.value)} aria-label={`Status for ${row.name}`}><option>Active</option><option>Disabled</option></select> },
  ]} /></section><section className="admin-panel role-preview-panel"><div><h3>Permission preview</h3><p>Switch your current local demo view to inspect what a role can access. Use sign out/in with the demo credential to restore the super administrator.</p></div><div className="role-preview-actions">{adminRoles.map((role) => <button type="button" key={role} className={activeAdmin?.role === role ? 'selected' : ''} disabled={!hasAdminPermission(activeAdmin?.role, 'super')} onClick={() => previewRole(role)}>{role}</button>)}</div></section><AdminNotice>Read-only analysts can inspect records only. Customer support can manage tickets. Operations can perform demo operational actions. The super administrator can manage all demo areas.</AdminNotice></div>
}

export function AdminSettingsPage() {
  const { activeAdmin, resetDemo } = useAdminData()
  const [preferences, setPreferences] = useState({ operationalAlerts: true, verificationUpdates: true, sessionTimeout: '30 minutes', dateFormat: 'Month day, year', currency: 'USD' })
  const [message, setMessage] = useState('')
  function reset() {
    if (!window.confirm('Reset all admin demo records to the original synthetic sample data? Current in-memory changes will be lost.')) return
    resetDemo()
    setMessage('Demo data restored to the original sample dataset.')
  }
  return <div className="admin-page"><AdminPageHeader eyebrow="ADMIN PREFERENCES" title="System settings" copy="Review local display preferences and the current demo environment." /><AdminNotice tone="warning">No API keys, security tokens, real credentials, or live banking connection are configured in this frontend.</AdminNotice>{message && <AdminNotice tone="success">{message}</AdminNotice>}<div className="admin-settings-grid"><section className="admin-panel settings-card"><h3>Branding</h3><div className="admin-brand-preview"><img src="/nexora.svg" alt="" /><span>Nexora Safe Bank</span><AdminStatus>Sea green</AdminStatus></div><p>Admin views inherit the existing Nexora logo, Inter body font, Roboto headings, and sea-green color palette.</p></section><section className="admin-panel settings-card"><h3>Regional preferences</h3><label>Currency<select value={preferences.currency} onChange={(event) => setPreferences({ ...preferences, currency: event.target.value })}><option>USD</option><option>EUR</option><option>GBP</option></select></label><label>Date format<select value={preferences.dateFormat} onChange={(event) => setPreferences({ ...preferences, dateFormat: event.target.value })}><option>Month day, year</option><option>Day month year</option></select></label><p>Preference changes affect the demo settings view only.</p></section><section className="admin-panel settings-card"><h3>Notification preferences</h3>{[['operationalAlerts', 'Operational alerts'], ['verificationUpdates', 'Verification updates']].map(([key, label]) => <label className="admin-preference-toggle" key={key}><span>{label}</span><input type="checkbox" checked={preferences[key]} onChange={(event) => setPreferences({ ...preferences, [key]: event.target.checked })} /></label>)}</section><section className="admin-panel settings-card"><h3>Session display</h3><label>Demo timeout display<select value={preferences.sessionTimeout} onChange={(event) => setPreferences({ ...preferences, sessionTimeout: event.target.value })}><option>15 minutes</option><option>30 minutes</option><option>60 minutes</option></select></label><p>Session timeout is display-only and does not provide authentication security.</p><div className="settings-admin-profile"><strong>{activeAdmin?.name}</strong><span>{activeAdmin?.role} · {activeAdmin?.id}</span></div></section></div><section className="admin-panel reset-demo-panel"><div><h3>Reset demo data</h3><p>Restore the original fictional users, balances, transactions, and audit sample. This cannot be undone within the current session.</p></div><button type="button" className="admin-danger-button" onClick={reset}>Reset synthetic data</button></section></div>
}

export function AdminAccessDenied() {
  return <div className="admin-page"><AdminPageHeader eyebrow="ROLE ACCESS" title="Access restricted" copy="This demo administrator role cannot open this section." /><AdminNotice tone="warning">Use the staff permission preview or sign back in as the Super Administrator. These frontend checks do not replace backend authorization.</AdminNotice><Link href="/admin" className="admin-primary-button">Return to overview <FaArrowRight /></Link></div>
}
