import { useMemo, useState } from 'react'
import { FaDownload, FaEye, FaFlag, FaNoteSticky, FaShieldHalved } from 'react-icons/fa6'
import Link from '../../components/Link.jsx'
import { adminDate, adminMoney, hasAdminPermission, maskBankAccount } from '../adminData.js'
import { useAdminData } from '../AdminDataContext.jsx'
import { AdminFilter, AdminMetric, AdminModal, AdminNotice, AdminPageHeader, AdminSearch, AdminStatus, AdminTable, AdminToolbar, useAdminPagination } from '../components/AdminShared.jsx'
import { transferReviewNotice } from '../../dashboard/transferNotices.js'

export function AdminAccountsPage() {
  const { accounts, customers, transactions, updateAccountStatus, addAccountNote, activeAdmin } = useAdminData()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [type, setType] = useState('all')
  const [selected, setSelected] = useState(null)
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const [message, setMessage] = useState('')
  const filtered = useMemo(() => accounts.filter((account) => {
    const text = `${account.id} ${account.customerId} ${account.name} ${account.number} ${account.type}`.toLowerCase()
    return text.includes(query.toLowerCase()) && (status === 'all' || account.status === status) && (type === 'all' || account.type === type)
  }), [accounts, query, status, type])
  const { rows, Pagination, setPage } = useAdminPagination(filtered, 8)

  function changeStatus(account, next) {
    if (!hasAdminPermission(activeAdmin?.role, 'operations')) return setMessage('Your current demo role cannot change account restrictions.')
    setSelected({ ...account, action: next })
    setReason('')
    setNote('')
  }

  async function submitStatus(event) {
    event.preventDefault()
    if (!reason.trim()) return setMessage('A reason is required before changing account status.')
    const result = await updateAccountStatus(selected.id, selected.action, reason.trim(), note.trim())
    setMessage(result.ok ? `Account ${selected.id} updated in demo.` : result.error)
    if (result.ok) setSelected(null)
  }

  async function saveNote(event) {
    event.preventDefault()
    const result = await addAccountNote(selected.id, note.trim())
    setMessage(result.ok ? `Internal note saved for ${selected.id}.` : result.error)
    if (result.ok) setSelected(null)
  }

  return (
    <div className="admin-page">
      <AdminPageHeader eyebrow="CUSTOMER DEPOSIT ACCOUNTS" title="Bank accounts" copy="Inspect synthetic account balances, status, ownership, and recent activity." />
      <div className="admin-metrics-row"><AdminMetric label="Total demo accounts" value={accounts.length} /><AdminMetric label="Open accounts" value={accounts.filter((item) => item.status === 'Open').length} tone="green" /><AdminMetric label="Restricted / suspended" value={accounts.filter((item) => ['Restricted', 'Suspended', 'Disabled'].includes(item.status)).length} tone="amber" /><AdminMetric label="Customer balance total" value={adminMoney(accounts.reduce((sum, item) => sum + item.current, 0))} tone="blue" /></div>
      {message && <AdminNotice tone={message.includes('required') || message.includes('cannot') ? 'warning' : 'success'}>{message}</AdminNotice>}
      <AdminToolbar><AdminSearch value={query} onChange={(value) => { setQuery(value); setPage(1) }} placeholder="Customer, account ID, or account number" /><AdminFilter label="Account status" value={status} onChange={(value) => { setStatus(value); setPage(1) }} options={[{ value: 'all', label: 'All statuses' }, ...[...new Set(accounts.map((item) => item.status))].map((value) => ({ value, label: value }))]} /><AdminFilter label="Account type" value={type} onChange={(value) => { setType(value); setPage(1) }} options={[{ value: 'all', label: 'All account types' }, ...[...new Set(accounts.map((item) => item.type))].map((value) => ({ value, label: value }))]} /></AdminToolbar>
      <section className="admin-panel table-panel"><div className="admin-panel-heading"><div><h3>Account register <span className="record-count">{filtered.length}</span></h3><p>Full account numbers are never displayed</p></div></div><AdminTable rows={rows} columns={[
        { key: 'id', label: 'Account ID', render: (row) => <strong>{row.id}</strong> },
        { key: 'customer', label: 'Customer', render: (row) => <Link className="admin-text-link" href={`/admin/users/${row.customerId}`}>{row.name}<small className="table-subtext">{row.customerId}</small></Link> },
        { key: 'type', label: 'Type' },
        { key: 'number', label: 'Account number', render: (row) => maskBankAccount(row.number) },
        { key: 'available', label: 'Available', className: 'admin-align-right', render: (row) => adminMoney(row.available) },
        { key: 'current', label: 'Current', className: 'admin-align-right', render: (row) => adminMoney(row.current) },
        { key: 'status', label: 'Status', render: (row) => <AdminStatus>{row.status}</AdminStatus> },
        { key: 'action', label: 'Details', render: (row) => <button type="button" className="admin-inline-action" onClick={() => { setSelected(row); setMessage('') }}>Inspect</button> },
      ]} emptyMessage="No account records match these filters." /><Pagination /></section>
      {selected && !selected.action && <AdminModal title={`${selected.type} · ${maskBankAccount(selected.number)}`} eyebrow={`ACCOUNT DETAIL · ${selected.id}`} onClose={() => setSelected(null)} size="large">
        <div className="admin-detail-grid"><div><span>Customer</span><Link href={`/admin/users/${selected.customerId}`} className="admin-text-link">{customers.find((item) => item.id === selected.customerId)?.name} · {selected.customerId}</Link></div><div><span>Account status</span><AdminStatus>{selected.status}</AdminStatus></div><div><span>Available balance</span><strong>{adminMoney(selected.available)}</strong></div><div><span>Current balance</span><strong>{adminMoney(selected.current)}</strong></div><div><span>Opened</span><strong>{adminDate(selected.opened)}</strong></div><div><span>Last transaction</span><strong>{adminDate(selected.lastTransaction)}</strong></div><div><span>Routing reference</span><strong>Demo only · •••• 0210</strong></div><div><span>Restriction reason</span><strong>{selected.restriction || 'None'}</strong></div></div>
        <h4 className="modal-section-heading">Recent account transactions</h4>{transactions.filter((item) => item.accountId === selected.id).slice(0, 4).map((transaction) => <div className="admin-modal-list-row" key={transaction.id}><span>{transaction.description}<small>{transaction.id} · {adminDate(transaction.date, true)}</small></span><strong>{adminMoney(transaction.amount)} · {transaction.status}</strong></div>)}
        <div className="account-admin-note"><span>Internal note</span><form onSubmit={saveNote}><textarea rows="2" value={note} onChange={(event) => setNote(event.target.value)} placeholder={selected.note || 'Add internal note'} /><button className="admin-secondary-button" type="submit"><FaNoteSticky /> Save note</button></form></div>
        <div className="admin-modal-actions">{hasAdminPermission(activeAdmin?.role, 'operations') && (selected.status === 'Open' ? <button className="admin-danger-button" type="button" onClick={() => changeStatus(selected, 'Restricted')}>Apply restriction</button> : <button className="admin-primary-button" type="button" onClick={() => changeStatus(selected, 'Open')}>Remove restriction</button>)}<button className="admin-secondary-button" type="button" onClick={() => setSelected(null)}>Close</button></div>
      </AdminModal>}
      {selected?.action && <AdminModal title={`${selected.action} account?`} eyebrow={`CONFIRM ACCOUNT ACTION · ${selected.id}`} onClose={() => setSelected(null)}><AdminNotice>{selected.name} · {selected.id} · ${maskBankAccount(selected.number)}. The record and transaction history are retained. Restricted accounts cannot receive new outgoing demo payments.</AdminNotice><form className="admin-form-stack" onSubmit={submitStatus}><label>Reason required<textarea required rows="3" value={reason} onChange={(event) => setReason(event.target.value)} /></label><label>Internal note (optional)<textarea rows="2" value={note} onChange={(event) => setNote(event.target.value)} /></label><div className="admin-modal-actions"><button type="button" className="admin-secondary-button" onClick={() => setSelected(null)}>Cancel</button><button type="submit" className={selected.action === 'Open' ? 'admin-primary-button' : 'admin-danger-button'}>Confirm {selected.action.toLowerCase()}</button></div></form></AdminModal>}
    </div>
  )
}

function TransferDetail({ transfer, customer, onClose, onUpdate, canManage }) {
  const [review, setReview] = useState(transfer.review)
  const [note, setNote] = useState(transfer.notes ?? '')
  const [message, setMessage] = useState('')
  const [saved, setSaved] = useState(false)

  async function save(event) {
    event.preventDefault()
    const result = await onUpdate(transfer.id, review, note)
    setMessage(result.ok ? review === 'Reviewed' ? 'Transfer reviewed. The amount is reserved from the customer’s available demo balance and confirmation is enabled.' : 'Review and internal note saved to demo activity log.' : result.error)
    if (result.ok) setSaved(true)
  }

  return <AdminModal title={`${transfer.kind} transfer · ${transfer.id}`} eyebrow="TRANSFER DETAIL · DEMO DATA" onClose={onClose} size="large">
    <div className="admin-detail-grid"><div><span>Sender</span><Link className="admin-text-link" href={`/admin/users/${transfer.customerId}`}>{customer?.name ?? transfer.senderName} · {transfer.customerId}</Link></div><div><span>Sender account</span><strong>{maskBankAccount(transfer.senderAccountId)}</strong></div><div><span>Recipient</span><strong>{transfer.recipientName}</strong></div><div><span>Recipient bank</span><strong>{transfer.recipientBank}</strong></div><div><span>Recipient account</span><strong>{maskBankAccount(transfer.recipientAccount)}</strong></div><div><span>Destination</span><strong>{transfer.country}</strong></div><div><span>Amount sent</span><strong>{adminMoney(transfer.amount)} USD</strong></div><div><span>Transfer fee</span><strong>{adminMoney(transfer.fee)}</strong></div><div><span>Transfer method</span><strong>{transfer.method}</strong></div><div><span>Transfer status</span><AdminStatus>{transfer.status}</AdminStatus></div><div><span>Estimated delivery</span><strong>{adminDate(transfer.eta)}</strong></div><div><span>Initiated</span><strong>{adminDate(transfer.date, true)}</strong></div>{transfer.kind === 'International' && <><div><span>Destination currency</span><strong>{transfer.currency}</strong></div><div><span>Illustrative demo exchange rate</span><strong>1 USD = {transfer.rate} {transfer.currency}</strong></div><div><span>Recipient amount (demo)</span><strong>{Number(transfer.recipientAmount).toLocaleString('en-US')} {transfer.currency}</strong></div><div><span>SWIFT/BIC (synthetic)</span><strong>{transfer.swift}</strong></div></>}</div>
    <AdminNotice>{transferReviewNotice} Currency conversion is illustrative demo data. Selecting “Reviewed” reserves the amount from the customer’s available demo balance and enables confirmation; it does not send or settle the transfer.</AdminNotice>
    <h4 className="modal-section-heading">Simulated processing timeline</h4><ol className="transfer-timeline">{transfer.events.map((event, index) => <li key={`${transfer.id}-${index}`}><i />{event}<small>{adminDate(transfer.date, true)}</small></li>)}</ol>
    {canManage ? <form className="admin-transfer-review" onSubmit={save}><label>Administrative review status<select value={review} onChange={(event) => { setReview(event.target.value); setSaved(false) }}><option>Clear</option><option>Needs review</option><option>Flagged</option><option value="Reviewed">Reviewed — allow customer confirmation</option></select></label><label>Internal review note<textarea rows="2" value={note} onChange={(event) => { setNote(event.target.value); setSaved(false) }} placeholder="Add a note to the audit trail" required /></label>{message && <AdminNotice tone={saved ? 'success' : 'error'}>{message}</AdminNotice>}<button type="submit" className="admin-secondary-button"><FaFlag /> Save review decision</button></form> : <AdminNotice>Your current demo role can inspect but cannot change review annotations.</AdminNotice>}
  </AdminModal>
}

export function AdminTransfersPage({ kind }) {
  const { transfers, customers, updateTransferReview, activeAdmin } = useAdminData()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [method, setMethod] = useState('all')
  const [review, setReview] = useState('all')
  const [selected, setSelected] = useState(null)
  const isInternational = kind === 'International'
  const filtered = useMemo(() => transfers.filter((item) => item.kind === kind).filter((item) => {
    const text = `${item.id} ${item.senderName} ${item.customerId} ${item.recipientName} ${item.recipientBank} ${item.recipientAccount} ${item.country}`.toLowerCase()
    return text.includes(query.toLowerCase()) && (status === 'all' || item.status === status) && (method === 'all' || item.method === method) && (review === 'all' || item.review === review)
  }), [transfers, kind, query, status, method, review])
  const { rows, Pagination, setPage } = useAdminPagination(filtered, 8)
  const title = isInternational ? 'International transfers' : 'Domestic transfers'

  return (
    <div className="admin-page">
      <AdminPageHeader eyebrow="TRANSFER MONITORING · DEMO" title={title} copy="Inspect transfer metadata, status, delivery estimates, and administrative review notes." />
      <AdminNotice>{isInternational ? 'Exchange rates and recipient amounts are illustrative sample values, not live quotes. Administrative review is not evidence that a transfer was sent or completed.' : 'ACH delivery estimates are not instant; timelines are synthetic examples only.'} No payment network is connected.</AdminNotice>
      <AdminToolbar><AdminSearch value={query} onChange={(value) => { setQuery(value); setPage(1) }} placeholder="Transfer, sender, recipient, or bank" /><AdminFilter label="Transfer status" value={status} onChange={(value) => { setStatus(value); setPage(1) }} options={[{ value: 'all', label: 'All statuses' }, ...['Pending', 'Completed', 'Failed'].map((value) => ({ value, label: value }))]} /><AdminFilter label="Method" value={method} onChange={(value) => { setMethod(value); setPage(1) }} options={[{ value: 'all', label: 'All methods' }, ...[...new Set(transfers.filter((item) => item.kind === kind).map((item) => item.method))].map((value) => ({ value, label: value }))]} /><AdminFilter label="Review" value={review} onChange={(value) => { setReview(value); setPage(1) }} options={[{ value: 'all', label: 'All review states' }, ...[...new Set(transfers.filter((item) => item.kind === kind).map((item) => item.review))].map((value) => ({ value, label: value }))]} /></AdminToolbar>
      <section className="admin-panel table-panel"><div className="admin-panel-heading"><div><h3>{title} register <span className="record-count">{filtered.length}</span></h3><p>Use Inspect to view recipient details, timeline, and review annotations</p></div></div><AdminTable rows={rows} onRowClick={setSelected} columns={[
        { key: 'id', label: 'Transfer reference', render: (row) => <strong>{row.id}</strong> },
        { key: 'sender', label: 'Sender', render: (row) => <span>{row.senderName}<small className="table-subtext">{row.customerId}</small></span> },
        { key: 'recipient', label: 'Recipient', render: (row) => <span>{row.recipientName}<small className="table-subtext">{row.recipientBank}</small></span> },
        { key: 'destination', label: isInternational ? 'Destination' : 'Recipient account', render: (row) => isInternational ? row.country : maskBankAccount(row.recipientAccount) },
        { key: 'amount', label: isInternational ? 'Amount sent' : 'Amount', className: 'admin-align-right', render: (row) => <span>{adminMoney(row.amount)}<small className="table-subtext">{isInternational ? `${row.currency} · fee ${adminMoney(row.fee)}` : row.method}</small></span> },
        { key: 'date', label: 'Initiated', render: (row) => adminDate(row.date, true) },
        { key: 'status', label: 'Status', render: (row) => <AdminStatus>{row.status}</AdminStatus> },
        { key: 'review', label: 'Review', render: (row) => <AdminStatus>{row.review}</AdminStatus> },
        { key: 'inspect', label: 'Details', render: (row) => <button type="button" className="admin-inline-action" onClick={(event) => { event.stopPropagation(); setSelected(row) }}><FaEye /> Inspect</button> },
      ]} emptyMessage={`No ${kind.toLowerCase()} transfers match these filters.`} /><Pagination /></section>
      {selected && <TransferDetail transfer={selected} customer={customers.find((item) => item.id === selected.customerId)} onClose={() => setSelected(null)} onUpdate={updateTransferReview} canManage={hasAdminPermission(activeAdmin?.role, 'operations')} />}
    </div>
  )
}

export function AdminTransactionsPage() {
  const { transactions, customers, accounts, updateTransactionNote, activeAdmin } = useAdminData()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [direction, setDirection] = useState('all')
  const [type, setType] = useState('all')
  const [period, setPeriod] = useState('all')
  const [selected, setSelected] = useState(null)
  const [note, setNote] = useState('')
  const [message, setMessage] = useState('')
  const filtered = useMemo(() => transactions.filter((item) => {
    const text = `${item.id} ${item.description} ${item.customerId} ${item.accountId} ${item.type} ${item.source}`.toLowerCase()
    const withinPeriod = period === 'all' || item.date.slice(0, 10) >= (period === '7' ? '2026-10-22' : '2026-09-29')
    return text.includes(query.toLowerCase()) && withinPeriod && (status === 'all' || item.status === status) && (direction === 'all' || item.direction === direction) && (type === 'all' || item.type === type)
  }), [transactions, query, period, status, direction, type])
  const { rows, Pagination, setPage } = useAdminPagination(filtered, 10)

  function exportRows() {
    const fields = ['id', 'date', 'customerId', 'accountId', 'type', 'description', 'amount', 'currency', 'direction', 'status', 'source']
    const content = [fields, ...filtered.map((row) => fields.map((field) => row[field] ?? ''))].map((row) => row.map((field) => `"${String(field).replaceAll('"', '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'nexora-demo-admin-transactions.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  async function flag(event) {
    event.preventDefault()
    const result = await updateTransactionNote(selected.id, note.trim())
    setMessage(result.ok ? 'Review note added. Original transaction amount and history remain unchanged.' : result.error)
    if (result.ok) setSelected(null)
  }

  return (
    <div className="admin-page">
      <AdminPageHeader eyebrow="FINANCIAL ACTIVITY · DEMO" title="All transactions" copy="Search the combined synthetic ledger. Completed financial amounts cannot be edited." action={<button type="button" className="admin-secondary-button" onClick={exportRows}><FaDownload /> Export filtered CSV</button>} />
      <AdminToolbar><AdminSearch value={query} onChange={(value) => { setQuery(value); setPage(1) }} placeholder="Reference, customer, description, or account" /><AdminFilter label="Status" value={status} onChange={(value) => { setStatus(value); setPage(1) }} options={[{ value: 'all', label: 'All statuses' }, ...['Completed', 'Pending', 'Failed'].map((value) => ({ value, label: value }))]} /><AdminFilter label="Direction" value={direction} onChange={(value) => { setDirection(value); setPage(1) }} options={[{ value: 'all', label: 'Incoming and outgoing' }, { value: 'Incoming', label: 'Incoming' }, { value: 'Outgoing', label: 'Outgoing' }]} /><AdminFilter label="Type" value={type} onChange={(value) => { setType(value); setPage(1) }} options={[{ value: 'all', label: 'All types' }, ...[...new Set(transactions.map((item) => item.type))].map((value) => ({ value, label: value }))]} /><AdminFilter label="Date range" value={period} onChange={(value) => { setPeriod(value); setPage(1) }} options={[{ value: 'all', label: 'All dates' }, { value: '7', label: 'Last 7 days' }, { value: '30', label: 'Last 30 days' }]} /></AdminToolbar>
      <section className="admin-panel table-panel"><div className="admin-panel-heading"><div><h3>Unified ledger <span className="record-count">{filtered.length}</span></h3><p>Transfers, deposits, card activity, bills, and administrative payments</p></div></div><AdminTable rows={rows} columns={[
        { key: 'id', label: 'Reference', render: (row) => <strong>{row.id}</strong> },
        { key: 'customer', label: 'Customer', render: (row) => <Link className="admin-text-link" href={`/admin/users/${row.customerId}`}>{customers.find((user) => user.id === row.customerId)?.name ?? 'Unknown'}<small className="table-subtext">{row.customerId}</small></Link> },
        { key: 'account', label: 'Account', render: (row) => maskBankAccount(accounts.find((account) => account.id === row.accountId)?.number ?? row.accountId) },
        { key: 'type', label: 'Type / description', render: (row) => <span>{row.type}<small className="table-subtext">{row.description}</small></span> },
        { key: 'date', label: 'Date', render: (row) => adminDate(row.date, true) },
        { key: 'direction', label: 'Direction', render: (row) => <AdminStatus>{row.direction}</AdminStatus> },
        { key: 'amount', label: 'Amount', className: 'admin-align-right', render: (row) => <span>{adminMoney(row.amount)}<small className="table-subtext">{row.currency} · {row.source}</small></span> },
        { key: 'status', label: 'Status', render: (row) => <AdminStatus>{row.status}</AdminStatus> },
        { key: 'action', label: 'Review', render: (row) => <button type="button" className="admin-inline-action" onClick={() => { setSelected(row); setNote(row.adminNote ?? ''); setMessage('') }}>Inspect</button> },
      ]} emptyMessage="No transaction records match these filters." /><Pagination /></section>
      {selected && <AdminModal title={selected.description} eyebrow={`TRANSACTION DETAIL · ${selected.id}`} onClose={() => setSelected(null)} size="large">
        <div className="admin-detail-grid"><div><span>Customer</span><Link className="admin-text-link" href={`/admin/users/${selected.customerId}`}>{customers.find((item) => item.id === selected.customerId)?.name ?? 'Unknown customer'} · {selected.customerId}</Link></div><div><span>Account reference</span><strong>{maskBankAccount(accounts.find((account) => account.id === selected.accountId)?.number ?? selected.accountId)}</strong></div><div><span>Amount</span><strong>{adminMoney(selected.amount)} {selected.currency}</strong></div><div><span>Fee</span><strong>{adminMoney(selected.fee)}</strong></div><div><span>Direction</span><AdminStatus>{selected.direction}</AdminStatus></div><div><span>Status</span><AdminStatus>{selected.status}</AdminStatus></div><div><span>Source</span><strong>{selected.source}</strong></div><div><span>Date</span><strong>{adminDate(selected.date, true)}</strong></div><div><span>Related transfer</span><strong>{selected.transferId || 'None'}</strong></div></div>
        <AdminNotice><FaShieldHalved /> The recorded amount and status are not editable. Add a separate review annotation to preserve ledger history.</AdminNotice>
        {hasAdminPermission(activeAdmin?.role, 'operations') ? <form className="admin-form-stack" onSubmit={flag}><label>Internal review note<textarea required rows="3" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Reason for review" /></label>{message && <AdminNotice>{message}</AdminNotice>}<button type="submit" className="admin-secondary-button"><FaFlag /> Flag and add annotation</button></form> : <AdminNotice>Your demo role can inspect records but cannot flag transactions.</AdminNotice>}
      </AdminModal>}
    </div>
  )
}
