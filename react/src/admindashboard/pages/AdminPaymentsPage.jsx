import { useMemo, useRef, useState } from 'react'
import { FaArrowRight, FaCheck, FaMagnifyingGlass, FaShieldHalved } from 'react-icons/fa6'
import { adminMoney, hasAdminPermission, maskBankAccount } from '../adminData.js'
import { useAdminData } from '../AdminDataContext.jsx'
import { AdminMetric, AdminNotice, AdminPageHeader, AdminSearch, AdminStatus, AdminTable, AdminToolbar, useAdminPagination } from '../components/AdminShared.jsx'

const initialForm = { source: 'Simulated demo ledger offset', category: '', reference: '', description: '', note: '', amount: '' }

export default function AdminPaymentsPage() {
  const { payments, activeAdmin, searchAccount, createAdminPayment } = useAdminData()
  const [query, setQuery] = useState('')
  const [recipient, setRecipient] = useState(null)
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const submitLock = useRef(false)
  const fundingIdempotencyKey = useRef(null)
  const canPay = hasAdminPermission(activeAdmin?.role, 'payments')
  const filteredPayments = useMemo(() => payments.filter((payment) => `${payment.id} ${payment.customerName} ${payment.customerId} ${payment.description}`.toLowerCase().includes(query.toLowerCase())), [payments, query])
  const { rows, Pagination } = useAdminPagination(filteredPayments, 8)

  async function searchRecipient(event) {
    event.preventDefault()
    setError('')
    setRecipient(null)
    const needle = query.trim().toLowerCase()
    if (!needle) return setError('Enter the complete account number.')
    const accountNumber = needle.replace(/\D/g, '')
    const found = await searchAccount(accountNumber)
    if (!found.ok) return setError(found.error)
    setRecipient(found.recipient)
  }

  function updateForm(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
    setError('')
  }

  function continueFlow() {
    if (!canPay) return setError('Your current demo role cannot create administrative payments.')
    if (!recipient) return setError('Find and select a recipient account first.')
    if (recipient.account.status !== 'Open' || recipient.customer.status !== 'Active') return setError('The selected recipient account is not eligible for a simulated ledger credit.')
    fundingIdempotencyKey.current = crypto.randomUUID()
    setStep(1)
  }

  function reviewPayment(event) {
    event.preventDefault()
    const amount = Number(form.amount)
    if (!Number.isFinite(amount) || amount <= 0) return setError('Enter an amount greater than $0.')
    if (!form.category.trim() || !form.reference.trim() || !form.description.trim()) return setError('Complete the payment category, internal reference, and description.')
    setStep(2)
    setError('')
  }

  async function confirmPayment() {
    if (submitLock.current) return
    submitLock.current = true
    const result = await createAdminPayment({
      accountId: recipient.account.id,
      customerId: recipient.customer.id,
      source: form.source,
      amount: form.amount,
      category: form.category,
      reference: form.reference,
      description: form.description,
      note: form.note,
      idempotencyKey: fundingIdempotencyKey.current,
    })
    submitLock.current = false
    if (!result.ok) return setError(result.error)
    setResult(result.payment)
    setStep(3)
    setError('')
  }

  function reset() {
    setStep(0)
    setQuery('')
    setRecipient(null)
    setForm(initialForm)
    setError('')
    setResult(null)
    fundingIdempotencyKey.current = null
  }

  return (
    <div className="admin-page">
      <AdminNotice tone="warning"><strong>Simulated customer credit · DEMO ONLY</strong><span> This adds a simulated credit to the local demo ledger; it is not a real payment and no external funds are received or moved. Enter the complete fictional account number to find one exact account.</span></AdminNotice>
      <AdminPageHeader eyebrow="OPERATIONS DEMO LEDGER WORKFLOW" title="Administer demo credits" copy="Find an eligible demo account by account number and record a simulated ledger credit." />
      {!canPay && <AdminNotice tone="error">Your active role ({activeAdmin?.role}) has view-only access to administrative payments.</AdminNotice>}
      <div className="admin-payment-layout">
        <section className="admin-panel admin-payment-workflow">
          <div className="payment-steps"><span className={step >= 0 ? 'current' : ''}>1 <small>Find recipient</small></span><i /><span className={step >= 1 ? 'current' : ''}>2 <small>Payment details</small></span><i /><span className={step >= 2 ? 'current' : ''}>3 <small>Review</small></span></div>
          {step === 0 && <div className="payment-step-body"><h3>Find demo account</h3><p>The backend searches the exact account number. It will not select another customer or account if no exact match is found.</p><form className="recipient-lookup" onSubmit={searchRecipient}><AdminSearch value={query} onChange={(value) => { setQuery(value); setError(''); setRecipient(null);  }} placeholder="Complete fictional account number" /><button className="admin-secondary-button" type="submit"><FaMagnifyingGlass /> Find account</button></form>{recipient && <div className="payment-recipient-card"><span className="payment-recipient-avatar">{recipient.customer.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span><div><strong>{recipient.customer.name}</strong><small>{recipient.customer.id} · {recipient.account.type} demo account</small></div><div><strong>{recipient.account.number}</strong><small>Demo balance {adminMoney(recipient.account.available)}</small></div><AdminStatus>{recipient.account.status}</AdminStatus><AdminStatus>{recipient.customer.verification}</AdminStatus></div>}{error && <p className="admin-form-error" role="alert">{error}</p>}<button type="button" className="admin-primary-button" disabled={!canPay || !recipient} onClick={continueFlow}>Continue to simulated credit <FaArrowRight /></button></div>}
          {step === 1 && <form className="payment-step-body" onSubmit={reviewPayment}><h3>Enter simulated credit details</h3><div className="admin-form-grid"><label>Credit source<input readOnly value={form.source} /><small>This is an internal demo offset, not proof of received external funds.</small></label><label>Recipient account<input readOnly value={`${recipient.customer.name} · ${recipient.account.number}`} /></label><label>Credit amount (USD)<div className="admin-amount-input"><span>$</span><input inputMode="decimal" required min="0.01" step="0.01" value={form.amount} onChange={(event) => updateForm('amount', event.target.value)} placeholder="0.00" /></div></label><label>Category<select required value={form.category} onChange={(event) => updateForm('category', event.target.value)}><option value="">Select category</option><option>Training credit</option><option>Account correction simulation</option><option>Other adjustment</option></select></label><label>Internal reference<input required maxLength="40" value={form.reference} onChange={(event) => updateForm('reference', event.target.value)} placeholder="e.g. CASE-DEMO-1042" /></label><label className="admin-form-span">Description<input required maxLength="100" value={form.description} onChange={(event) => updateForm('description', event.target.value)} placeholder="Short customer-visible demo credit description" /></label><label className="admin-form-span">Internal note (optional)<textarea rows="2" value={form.note} onChange={(event) => updateForm('note', event.target.value)} placeholder="Internal operations context" /></label></div>{Number(form.amount) > 0 && <div className="payment-total-row"><span>credit</span><strong>{adminMoney(form.amount)}</strong><span>External funds received</span><strong></strong></div>}{error && <p className="admin-form-error" role="alert">{error}</p>}<div className="admin-form-actions"><button type="button" className="admin-secondary-button" onClick={() => setStep(0)}>Back to recipient</button><button type="submit" className="admin-primary-button">Review credit <FaArrowRight /></button></div></form>}
          {step === 2 && <div className="payment-step-body"><h3>Review before confirmation</h3><p>Confirm the exact customer account, amount, category, and reference. This creates a local simulated ledger credit only.</p><div className="admin-detail-grid"><div><span>Customer</span><strong>{recipient.customer.name} · {recipient.customer.id}</strong></div><div><span>Recipient account</span><strong>{recipient.account.type} · {maskBankAccount(recipient.account.number)}</strong></div><div><span>Source</span><strong>{form.source} ·  external funds</strong></div><div><span>Amount</span><strong>{adminMoney(form.amount)}</strong></div><div><span>Fee</span><strong>{adminMoney(0)}</strong></div><div><span>Category</span><strong>{form.category}</strong></div><div><span>Internal reference</span><strong>{form.reference}</strong></div><div><span>Processing status</span><AdminStatus>Recorded in ledger</AdminStatus></div><div className="admin-detail-span"><span>Description</span><strong>{form.description}</strong></div></div><AdminNotice><FaShieldHalved /></AdminNotice>{error && <p className="admin-form-error" role="alert">{error}</p>}<div className="admin-form-actions"><button type="button" className="admin-secondary-button" onClick={() => setStep(1)}>Edit details</button><button type="button" className="admin-primary-button" onClick={confirmPayment}>Confirm simulated credit <FaCheck /></button></div></div>}
          {step === 3 && result && <div className="payment-step-body payment-result"><span className="payment-result-icon"><FaCheck /></span><p className="admin-eyebrow">LEDGER ENTRY RECORDED</p><h3>Simulated credit recorded</h3><p>external funds were received and moved.</p><div className="payment-reference"><span>Account reference</span><strong>{result.id}</strong></div><div className="admin-detail-grid"><div><span>Recipient</span><strong>{result.customerName}</strong></div><div><span>Amount</span><strong>{adminMoney(result.amount)}</strong></div><div><span>Status</span><AdminStatus>{result.status}</AdminStatus></div></div><div className="admin-form-actions"><button type="button" className="admin-secondary-button" onClick={reset}>Prepare another credit</button><button type="button" className="admin-primary-button" onClick={() => { setStep(0); setResult(null); setQuery('') }}>Return to workflow</button></div></div>}
        </section>
        <aside className="admin-payment-aside"><AdminMetric label="Funding model" value="Demo ledger" note="No external funds" icon={FaMagnifyingGlass} tone="blue" /><div className="admin-panel payment-rules"><h3>Eligibility checks</h3><ul><li>One exact account number must match.</li><li>Customer status must be Active.</li><li>Account status must be Open.</li><li>Amount must be positive.</li><li>Category and internal reference are required.</li></ul><p>The API enforces administrator authorization and creates balanced ledger entries.</p></div></aside>
      </div>
      <AdminToolbar><AdminSearch value={query} onChange={setQuery} placeholder="Filter demo payment history" /></AdminToolbar>
      <section className="admin-panel table-panel"><div className="admin-panel-heading"><div><h3>Payment history <span className="record-count">{filteredPayments.length}</span></h3><p>Pending items reserve demo funding until completion or failure</p></div></div><AdminTable rows={rows} columns={[
        { key: 'id', label: 'Payment reference', render: (row) => <strong>{row.id}</strong> },
        { key: 'customer', label: 'Recipient', render: (row) => <span>{row.customerName}<small className="table-subtext">{row.customerId} · {maskBankAccount(row.account)}</small></span> },
        { key: 'description', label: 'Description / category', render: (row) => <span>{row.description}<small className="table-subtext">{row.category}</small></span> },
        { key: 'date', label: 'Initiated', render: (row) => row.date },
        { key: 'amount', label: 'Amount', className: 'admin-align-right', render: (row) => adminMoney(row.total) },
        { key: 'status', label: 'Status', render: (row) => <AdminStatus>{row.status}</AdminStatus> },
      ]} emptyMessage="all administrative payments have been created in this session." /><Pagination /></section>
    </div>
  )
}
