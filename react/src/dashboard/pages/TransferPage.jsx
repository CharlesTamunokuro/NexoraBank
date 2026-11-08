import { useEffect, useMemo, useRef, useState } from 'react'
import { FaArrowLeft, FaArrowRight, FaCheck, FaCircleInfo } from 'react-icons/fa6'
import { createDemoId, formatDate, maskAccount, money } from '../demoData.js'
import { transferReviewNotice, transferSafetyNotice } from '../transferNotices.js'

const transferTypes = [
  { id: 'own', label: 'Between my accounts', description: 'Move money between your Nexora accounts.', fee: 0, eta: 'Usually available immediately' },
  { id: 'ach', label: 'US bank transfer (ACH)', description: 'Standard electronic transfer to another US bank. Delivery is not instant.', fee: 0, eta: 'Typically 1–3 business days' },
  { id: 'wire', label: 'Domestic wire', description: 'Prepare a simulated domestic wire request for internal review.', fee: 0, eta: '' },
  { id: 'bill', label: 'Pay a bill', description: 'Prepare a payment to a utility or service provider.', fee: 0, eta: 'Scheduled payment' },
  { id: 'international', label: 'International wire', description: 'Prepare an international transfer request for internal review.', fee: 0, eta: '' },
]

const initialForm = { recipientId: '', recipientName: '', nickname: '', bankName: '', routingNumber: '', accountNumber: '', recipientType: 'Checking', destinationAccount: '', country: 'United Kingdom', currency: 'GBP', address: '', swift: '', sourceAccount: '', amount: '', memo: '', transactionPin: '' }

function addBusinessDays(days) {
  const date = new Date()
  let added = 0
  while (added < days) {
    date.setDate(date.getDate() + 1)
    if (date.getDay() !== 0 && date.getDay() !== 6) added += 1
  }
  return date.toISOString().slice(0, 10)
}

function fieldValue(event) {
  return event.target.value
}

function restoreTransferDraft(key, fallback) {
  const saved = window.sessionStorage.getItem(key)
  if (!saved) return fallback

  try {
    const draft = JSON.parse(saved)
    if (
      draft.version !== 1
      || !Number.isInteger(draft.step)
      || draft.step < 0
      || draft.step > 4
      || !transferTypes.some((item) => item.id === draft.type) && draft.type !== null
      || !draft.form
      || typeof draft.form !== 'object'
    ) {
      throw new Error('The saved transfer draft is invalid.')
    }
    return {
      ...fallback,
      ...draft,
      form: { ...fallback.form, ...draft.form, transactionPin: '' },
      idempotencyKey: typeof draft.idempotencyKey === 'string' ? draft.idempotencyKey : null,
    }
  } catch (error) {
    window.sessionStorage.removeItem(key)
    console.warn('Could not restore the saved transfer draft.', error)
    return fallback
  }
}

export default function TransferPage({ path, accounts, recipients, customer, balancesVisible, onAddRecipient, onComplete, onListTransfers, onGetTransferStatus, onConfirmTransfer, onRefreshDashboard, onNavigate }) {
  const routeType = path.endsWith('/international') ? 'international' : path.endsWith('/domestic') ? 'ach' : path.endsWith('/bill') ? 'bill' : null
  const routeRecipientId = new URLSearchParams(window.location.search).get('recipient')
  const routeRecipient = recipients.find((recipient) => recipient.id === routeRecipientId)
  const draftKey = `nexora:transfer-draft:${customer?.id ?? customer?.email ?? 'customer'}:${path}:${routeRecipientId ?? 'new'}`
  const initialDraft = {
    version: 1,
    type: routeType,
    step: routeType ? 1 : 0,
    form: routeRecipient ? {
      ...initialForm,
      recipientId: routeRecipient.id,
      recipientName: routeRecipient.name,
      bankName: routeRecipient.bank,
      accountNumber: routeRecipient.account,
      recipientType: routeRecipient.type,
      country: routeRecipient.country ?? initialForm.country,
      currency: routeRecipient.currency ?? initialForm.currency,
      address: routeRecipient.address ?? '',
      swift: routeRecipient.swift ?? '',
      routingNumber: routeRecipient.routingNumber ?? '',
    } : initialForm,
    result: null,
    idempotencyKey: null,
  }
  const [draft] = useState(() => restoreTransferDraft(draftKey, initialDraft))
  const [type, setType] = useState(draft.type)
  const [step, setStep] = useState(draft.step)
  const [form, setForm] = useState(draft.form)
  const [error, setError] = useState('')
  const [statusError, setStatusError] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [result, setResult] = useState(draft.result)
  const [transferRequests, setTransferRequests] = useState([])
  const [requestsLoading, setRequestsLoading] = useState(true)
  const [requestsError, setRequestsError] = useState('')
  const transferSubmitted = useRef(false)
  const confirmationSubmitted = useRef(false)
  const [idempotencyKey, setIdempotencyKey] = useState(draft.idempotencyKey)
  const selectedType = transferTypes.find((item) => item.id === type)
  const sourceAccountId = accounts.some((account) => account.id === form.sourceAccount) ? form.sourceAccount : accounts[0]?.id
  const destinationAccountId = accounts.some((account) => account.id === form.destinationAccount)
    ? form.destinationAccount
    : accounts[1]?.id ?? accounts[0]?.id
  const source = accounts.find((account) => account.id === sourceAccountId)
  const destination = accounts.find((account) => account.id === destinationAccountId)
  const amount = Number(form.amount)
  const international = type === 'international'
  const exchangeRate = international ? ({ EUR: 0.92, JPY: 149.3, CAD: 1.37, GBP: 0.79 }[form.currency] ?? 0.79) : 1
  const receiveAmount = amount * exchangeRate
  const totalDeducted = amount + (selectedType?.fee ?? 0)
  const arrivalDate = useMemo(() => {
    return addBusinessDays(type === 'international' ? 5 : type === 'ach' ? 3 : type === 'bill' ? 1 : 0)
  }, [type])
  const transferId = result?.transfer?.id
  const transferStatus = result?.transfer?.status
  const transferReviewStatus = result?.transfer?.reviewStatus

  useEffect(() => {
    window.sessionStorage.setItem(draftKey, JSON.stringify({
      version: 1,
      type,
      step,
      form: { ...form, transactionPin: '' },
      result,
      idempotencyKey,
    }))
  }, [draftKey, type, step, form, result, idempotencyKey])

  useEffect(() => {
    let active = true
    onListTransfers()
      .then(({ transfers }) => {
        if (active) setTransferRequests(transfers.filter((transfer) => ['PENDING_REVIEW', 'INFORMATION_REQUESTED'].includes(transfer.status)))
      })
      .catch((requestError) => {
        if (active) setRequestsError(requestError.message)
      })
      .finally(() => {
        if (active) setRequestsLoading(false)
      })
    return () => { active = false }
  }, [onListTransfers])

  useEffect(() => {
    if (step !== 4 || !transferId || !['PENDING_REVIEW', 'INFORMATION_REQUESTED'].includes(transferStatus) || transferReviewStatus === 'CUSTOMER_CONFIRMED') return undefined
    let active = true
    async function refreshTransferStatus() {
      try {
        const updatedTransfer = await onGetTransferStatus(transferId)
        if (active) {
          setResult((current) => current ? { ...current, transfer: { ...current.transfer, ...updatedTransfer } } : current)
          setTransferRequests((current) => current.map((transfer) => transfer.id === transferId ? { ...transfer, ...updatedTransfer } : transfer))
          setStatusError('')
        }
      } catch (requestError) {
        if (active) setStatusError(requestError.message)
      }
    }
    refreshTransferStatus()
    const timer = window.setInterval(refreshTransferStatus, 2500)
    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [step, transferId, transferStatus, transferReviewStatus, onGetTransferStatus])

  useEffect(() => {
    if (step !== 4 || transferReviewStatus !== 'REVIEWED') return
    onRefreshDashboard().catch((refreshError) => setStatusError(`Could not refresh account balances: ${refreshError.message}`))
  }, [step, transferReviewStatus, onRefreshDashboard])

  function resumeTransfer(transfer) {
    const resumedType = transfer.kind === 'INTERNAL' ? 'own' : transfer.kind === 'International' ? 'international' : 'ach'
    const destinationAccount = accounts.find((account) => account.number === transfer.recipientAccount)
    setType(resumedType)
    setForm({
      ...initialForm,
      sourceAccount: transfer.sourceAccountId,
      destinationAccount: destinationAccount?.id ?? '',
      recipientName: transfer.recipientName,
      bankName: transfer.recipientBank,
      accountNumber: transfer.recipientAccount,
      amount: String(transfer.amount),
    })
    setResult({ reference: transfer.reference, transfer })
    setError('')
    setStatusError('')
    setStep(4)
  }

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
    setError('')
  }

  function chooseRecipient(id) {
    const recipient = recipients.find((item) => item.id === id)
    setForm((current) => ({
      ...current,
      recipientId: id,
      recipientName: recipient?.name ?? '',
      bankName: recipient?.bank ?? '',
      accountNumber: recipient?.account ?? '',
      recipientType: recipient?.type ?? 'Checking',
      country: recipient?.country ?? 'United Kingdom',
      currency: recipient?.currency ?? 'GBP',
      address: recipient?.address ?? '',
      swift: recipient?.swift ?? '',
      routingNumber: recipient?.routingNumber ?? '',
    }))
  }

  function next() {
    setError('')
    if (step === 1) {
      if (type !== 'own' && !form.recipientName.trim()) return setError(type === 'bill' ? 'Select the biller.' : 'Enter the recipient’s legal name.')
      if (type === 'own' && (source?.id === destinationAccountId || !destinationAccountId)) return setError('Choose a different destination account.')
      if (type === 'bill' && form.accountNumber.trim().length < 3) return setError('Enter the biller reference or account identifier.')
      if (type !== 'own' && type !== 'bill' && !form.bankName.trim()) return setError('Enter the recipient’s bank name.')
      if (type === 'ach' || type === 'wire') {
        const validSavedRecipient = Boolean(form.recipientId)
        if (!validSavedRecipient && (form.routingNumber.replace(/\D/g, '').length !== 9 || form.accountNumber.replace(/\D/g, '').length < 4)) return setError('Enter a 9-digit routing number and an account number with at least 4 digits.')
      }
      if (international) {
        const accountValid = form.recipientId || form.accountNumber.replace(/\s/g, '').length >= 6
        const localCode = form.routingNumber.replace(/\D/g, '')
        const bankCodeValid = form.country === 'United Kingdom'
          ? localCode.length === 6
          : form.country === 'Canada'
            ? localCode.length >= 8
            : form.country === 'Japan'
              ? localCode.length >= 7
              : /^[A-Z0-9]{8}([A-Z0-9]{3})?$/i.test(form.swift.trim())
        if (!form.country || !form.address.trim() || !accountValid || !bankCodeValid) return setError('Complete the recipient address, account details, and the bank code required for the selected country.')
      }
    }
    if (step === 2) {
      if (!Number.isFinite(amount) || amount <= 0) return setError('Enter an amount greater than $0.')
      if (!source || totalDeducted > source.available) return setError('This amount plus any fee is more than the available balance.')
    }
    setStep((current) => current + 1)
  }

  async function completeTransfer() {
    if (transferSubmitted.current) return
    if (!customer?.pinConfigured) {
      setError('Create a transaction PIN in Settings before submitting a transfer request.')
      return
    }
    if (!/^(?:\d{4}|\d{6})$/.test(form.transactionPin)) {
      setError('Enter your four- or six-digit transaction PIN.')
      return
    }
    if (!selectedType || !source || !Number.isFinite(amount) || amount <= 0 || totalDeducted > source.available) {
      setError('Please review the amount and available balance before confirming.')
      return
    }
    transferSubmitted.current = true
    const recipientName = type === 'own' ? (form.recipientName.trim() || destination?.name || 'Own account') : form.recipientName.trim()
    const requestIdempotencyKey = idempotencyKey ?? crypto.randomUUID()
    setIdempotencyKey(requestIdempotencyKey)
    try {
      if (type !== 'own' && type !== 'bill' && !form.recipientId) {
        const saved = await onAddRecipient({
          id: createDemoId('recipient'),
          name: recipientName,
          nickname: form.nickname.trim(),
          bank: form.bankName.trim(),
          account: form.accountNumber.trim(),
          type: form.recipientType,
          method: international ? 'International' : 'Domestic',
          ...(international ? { country: form.country, currency: form.currency, address: form.address.trim(), swift: form.swift.trim() } : {}),
        })
        setForm((current) => ({ ...current, recipientId: saved.beneficiary.id }))
      }
      const result = await onComplete({
        transferType: type,
        sourceAccountId: source.id,
        destinationAccountId,
        recipientName,
        recipientBank: form.bankName.trim() || (type === 'own' ? 'Nexora account' : type === 'bill' ? 'Biller' : ''),
        recipientAccount: type === 'own' ? destination?.number ?? '' : form.accountNumber.trim(),
        recipientCountry: international ? form.country : undefined,
        currency: international ? form.currency : source.currency,
        swiftBic: form.swift.trim(),
        description: form.memo.trim(),
        amount,
        idempotencyKey: requestIdempotencyKey,
        pin: form.transactionPin,
      })
      const transfer = {
        id: result.id,
        status: result.status,
        reviewStatus: result.reviewStatus,
        description: type === 'own' ? `Transfer to ${destination?.name}` : `${international ? 'International request to ' : 'Transfer request to '}${recipientName}`,
        amount: -amount,
        date: new Date().toISOString().slice(0, 10),
        account: source.id,
        type: international ? 'International transfer request' : type === 'own' ? 'Internal transfer' : type === 'bill' ? 'Bill payment request' : 'Domestic transfer request',
        reference: result.reference,
      }
      setResult({ reference: result.reference, transfer })
      setTransferRequests((current) => [result, ...current.filter((item) => item.id !== result.id)])
      setError('')
      setStep(4)
    } catch (requestError) {
      transferSubmitted.current = false
      setError(requestError.message)
    }
  }

  async function confirmReviewedTransfer() {
    if (confirmationSubmitted.current || confirming) return
    if (!customer?.pinConfigured || !/^(?:\d{4}|\d{6})$/.test(form.transactionPin)) {
      setError('Enter your four- or six-digit transaction PIN to confirm.')
      return
    }
    if (transferStatus !== 'PENDING_REVIEW' || transferReviewStatus !== 'REVIEWED') {
      setError('This transfer has not been approved for customer confirmation.')
      return
    }
    confirmationSubmitted.current = true
    setConfirming(true)
    setError('')
    try {
      const updatedTransfer = await onConfirmTransfer({ transferId, pin: form.transactionPin })
      setResult((current) => current ? { ...current, transfer: { ...current.transfer, ...updatedTransfer } } : current)
      setTransferRequests((current) => current.map((transfer) => transfer.id === transferId ? { ...transfer, ...updatedTransfer } : transfer))
      setStatusError('')
    } catch (requestError) {
      setError(requestError.message)
      confirmationSubmitted.current = false
    } finally {
      setConfirming(false)
    }
  }

  function reset() {
    setType(routeType)
    setStep(routeType ? 1 : 0)
    setForm(initialForm)
    setError('')
    setStatusError('')
    setConfirming(false)
    setResult(null)
    transferSubmitted.current = false
    confirmationSubmitted.current = false
    setIdempotencyKey(null)
  }

  return (
    <div className="dashboard-page transfer-page">
      {/* <div className="demo-banner"><span>SIMULATED TRANSFER</span> This frontend demo does not connect to payment networks or move real money.</div> */}
      <p className="inline-notice transfer-safety-notice" role="note"><FaCircleInfo /><span><strong>{transferSafetyNotice.title}:</strong> {transferSafetyNotice.message}</span></p>
      {step < 4 && <div className="transfer-heading"><div><p className="page-eyebrow">TRANSFER CENTER</p><h2>{step === 0 ? 'Choose how to transfer' : step === 3 ? 'Review transfer' : selectedType?.label ?? 'New transfer'}</h2><p>Complete each step to prepare a transfer.</p></div><div className="step-count">Step {step + 1} of 4</div></div>}
      {step > 0 && step < 4 && <div className="transfer-progress" aria-label={`Step ${step + 1} of 4`}><span style={{ width: `${(step / 3) * 100}%` }} /></div>}

      {step === 0 && (
        <>
          <section className="workspace-panel">
            <h3>Your transfer requests</h3>
            {requestsLoading && <p role="status">Loading your transfer requests…</p>}
            {requestsError && <p className="form-error" role="alert">Could not load transfer requests: {requestsError}</p>}
            {!requestsLoading && !requestsError && (transferRequests.length ? transferRequests.map((transfer) => (
              <article className="notification-row" key={transfer.id}>
                <div><strong>{transfer.recipientName} · {money.format(Number(transfer.amount))}</strong><p>{transfer.reference} · {transfer.reviewStatus === 'CUSTOMER_CONFIRMED' ? 'balance deducted.' : transfer.reviewStatus === 'REVIEWED' ? 'Reviewed — amount reserved from available balance' : 'Awaiting admin review'}</p></div>
                <button className="text-button" type="button" onClick={() => resumeTransfer(transfer)}>Open request</button>
              </article>
            )) : <p>No open transfer requests.</p>)}
          </section>
          <div className="transfer-types">
            {transferTypes.map((option) => (
              <button type="button" key={option.id} className="transfer-type-option" onClick={() => { setType(option.id); setStep(1); setError('') }}>
                <span><strong>{option.label}</strong><small>{option.description}</small><small className="transfer-delivery">Estimated delivery: {option.eta} · fee: {money.format(option.fee)}</small></span><FaArrowRight />
              </button>
            ))}
            {error && <p className="form-error" role="alert">{error}</p>}
          </div>
        </>
      )}

      {step === 1 && (
        <div className="transfer-form-panel">
          {type === 'own' ? (
            <div className="form-grid">
              <label>From account<select value={sourceAccountId ?? ''} onChange={(event) => update('sourceAccount', fieldValue(event))}>{accounts.map((account) => <option key={account.id} value={account.id}>{account.name} · {account.number}</option>)}</select></label>
              <label>To account<select value={destinationAccountId ?? ''} onChange={(event) => update('destinationAccount', fieldValue(event))}>{accounts.map((account) => <option key={account.id} value={account.id}>{account.name} · {account.number}</option>)}</select></label>
              <label className="form-span">Transfer label<input value={form.recipientName} onChange={(event) => update('recipientName', fieldValue(event))} placeholder="e.g. Monthly savings" /></label>
            </div>
          ) : type === 'bill' ? (
            <div className="form-grid">
              <label>Payee<select value={form.recipientName} onChange={(event) => update('recipientName', fieldValue(event))}><option value="">Select a biller</option><option>Electric Utility Co.</option><option>Maple Apartments</option><option>Streamline Media</option></select></label>
              <label>From account<select value={sourceAccountId ?? ''} onChange={(event) => update('sourceAccount', fieldValue(event))}>{accounts.map((account) => <option key={account.id} value={account.id}>{account.name} · {account.number}</option>)}</select></label>
              <label className="form-span">Biller account or reference number<input value={form.accountNumber} onChange={(event) => update('accountNumber', fieldValue(event))} placeholder="Fictional reference" /></label>
            </div>
          ) : (
            <>
              {recipients.length > 0 && <label className="form-span saved-recipient-select">Choose a saved recipient<select value={form.recipientId} onChange={(event) => chooseRecipient(fieldValue(event))}><option value="">Enter a new recipient</option>{recipients.filter((recipient) => international ? recipient.method === 'International' : recipient.method === 'Domestic').map((recipient) => <option key={recipient.id} value={recipient.id}>{recipient.nickname || recipient.name} · {recipient.bank} · {recipient.account}</option>)}</select></label>}
              <div className="form-grid">
                <label>Recipient legal name<input autoComplete="off" value={form.recipientName} onChange={(event) => update('recipientName', fieldValue(event))} placeholder="Full name" /></label>
                <label>Nickname (optional)<input value={form.nickname} onChange={(event) => update('nickname', fieldValue(event))} placeholder="e.g. Rent" /></label>
                <label>Recipient bank<input value={form.bankName} onChange={(event) => update('bankName', fieldValue(event))} placeholder="Bank name" /></label>
                <label>Account type<select value={form.recipientType} onChange={(event) => update('recipientType', fieldValue(event))}><option>Checking</option><option>Savings</option></select></label>
                {international ? (
                  <>
                    <label>Destination country<select value={form.country} onChange={(event) => update('country', fieldValue(event))}><option>United Kingdom</option><option>Canada</option><option>France</option><option>Germany</option><option>Japan</option></select></label>
                    <label>Recipient currency<select value={form.currency} onChange={(event) => update('currency', fieldValue(event))}><option value="GBP">GBP · British pound</option><option value="EUR">EUR · Euro</option><option value="JPY">JPY · Japanese yen</option><option value="CAD">CAD · Canadian dollar</option></select></label>
                    <label>{['France', 'Germany'].includes(form.country) ? 'IBAN' : 'Account number'}<input autoComplete="off" value={form.accountNumber} onChange={(event) => update('accountNumber', fieldValue(event))} placeholder="Account number" /></label>
                    {form.country === 'United Kingdom' && <label>Sort code<input inputMode="numeric" autoComplete="off" value={form.routingNumber} onChange={(event) => update('routingNumber', fieldValue(event))} placeholder="6 digits Number" maxLength="6" /></label>}
                    {form.country === 'Canada' && <label>Institution and transit number<input inputMode="numeric" autoComplete="off" value={form.routingNumber} onChange={(event) => update('routingNumber', fieldValue(event))} placeholder="8+ digits" /></label>}
                    {form.country === 'Japan' && <label>Bank and branch code<input inputMode="numeric" autoComplete="off" value={form.routingNumber} onChange={(event) => update('routingNumber', fieldValue(event))} placeholder="7+ digits" /></label>}
                    {['France', 'Germany'].includes(form.country) && <label>SWIFT / BIC<input autoComplete="off" value={form.swift} onChange={(event) => update('swift', fieldValue(event))} placeholder="8 or 11 characters" /></label>}
                    <label className="form-span">Recipient address<input value={form.address} onChange={(event) => update('address', fieldValue(event))} placeholder="Street, city, postal code" /></label>
                  </>
                ) : (
                  <>
                    <label>Routing number<input inputMode="numeric" autoComplete="off" value={form.routingNumber} onChange={(event) => update('routingNumber', fieldValue(event))} placeholder="9 digits Routing Number" maxLength="9" /></label>
                    <label>Account number<input inputMode="numeric" autoComplete="off" value={form.accountNumber} onChange={(event) => update('accountNumber', fieldValue(event))} placeholder="10 Digits Account Number" /></label>
                  </>
                )}
              </div>
            </>
          )}
          {/* <div className="sensitive-data-note"><FaShieldHalved /> Do not enter real bank account, routing, or recipient information. Values entered here are not saved to a bank service.</div> */}
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="transfer-actions"><button type="button" className="secondary-button" onClick={() => setStep(0)}><FaArrowLeft /> Back</button><button type="button" className="primary-button" onClick={next}>Continue <FaArrowRight /></button></div>
        </div>
      )}

      {step === 2 && (
        <div className="transfer-form-panel">
          <div className="form-grid">
            <label>From account<select value={sourceAccountId ?? ''} onChange={(event) => update('sourceAccount', fieldValue(event))}>{accounts.map((account) => <option key={account.id} value={account.id}>{account.name} · Available {balancesVisible ? money.format(account.available) : '••••••'}</option>)}</select></label>
            <label>Amount to send (USD)<div className="amount-input"><span>$</span><input inputMode="decimal" value={form.amount} onChange={(event) => update('amount', fieldValue(event))} placeholder="0.00" /></div></label>
            <label className="form-span">Memo (optional)<input maxLength="80" value={form.memo} onChange={(event) => update('memo', fieldValue(event))} placeholder="Add a note for this transfer" /></label>
          </div>
          <div className="transfer-estimate">
            <div><span>Delivery method</span><strong>{selectedType?.label}</strong></div>
            <div><span>Estimated delivery</span><strong>{selectedType?.eta}</strong></div>
            <div><span>Transfer fee</span><strong>{money.format(selectedType?.fee ?? 100)}</strong></div>
            {international && <><div><span>Illustrative exchange rate</span><strong>1 USD = {exchangeRate} {form.currency}</strong></div><div><span>Estimated recipient amount</span><strong>{Number.isFinite(receiveAmount) ? new Intl.NumberFormat('en-US', { style: 'currency', currency: form.currency }).format(receiveAmount) : '—'}</strong></div></>}
          </div>
          {international && <p className="inline-notice"><FaCircleInfo />Intermediary banks may apply additional fees.</p>}
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="transfer-actions"><button type="button" className="secondary-button" onClick={() => setStep(1)}><FaArrowLeft /> Back</button><button type="button" className="primary-button" onClick={next}>Review transfer <FaArrowRight /></button></div>
        </div>
      )}

      {step === 3 && (
        <div className="transfer-form-panel review-panel">
          <div className="review-recipient"><span className="profile-avatar">{(form.recipientName || '').split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span><div><small>Recipient</small><strong>{form.recipientName || destination?.name}</strong><span>{type === 'own' ? destination?.number : `${form.bankName} · ${maskAccount(form.accountNumber)}`}</span></div></div>
          <div className="review-list">
            <div><span>From</span><strong>{source?.name} · {source?.number}</strong></div>
            <div><span>Amount</span><strong>{money.format(amount)}</strong></div>
            <div><span>Fee</span><strong>{money.format(selectedType?.fee ?? 0)}</strong></div>
            <div><span>Total deducted</span><strong>{money.format(totalDeducted)}</strong></div>
            <div><span>Delivery</span><strong>{selectedType?.eta}</strong></div>
            <div><span>Estimated arrival</span><strong>{type === 'own' ? 'Usually immediate' : formatDate(arrivalDate)}</strong></div>
            {international && <div><span>Recipient receives (illustrative)</span><strong>{new Intl.NumberFormat('en-US', { style: 'currency', currency: form.currency }).format(receiveAmount)} {form.currency}</strong></div>}
            {form.memo && <div><span>Memo</span><strong>{form.memo}</strong></div>}
          </div>
          {international && <p className="inline-notice" role="note"><FaCircleInfo /> {transferReviewNotice}</p>}
          {customer?.pinConfigured
            ? <label className="form-span">Transaction PIN<input type="password" inputMode="numeric" autoComplete="off" maxLength="6" value={form.transactionPin} onChange={(event) => update('transactionPin', fieldValue(event))} required aria-label="Transaction PIN" /><small className="transfer-pin-note">This PIN is never saved and must be re-entered after a refresh.</small></label>
            : <p className="inline-notice"><FaCircleInfo /> Create a transaction PIN in Settings before submitting a transfer request.</p>}
          <p className="inline-notice"><FaCircleInfo />Anti-Money Laundering (AML) Code is applied to all transfers Contact the Customer Service Support Chat Bot for more information.</p>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="transfer-actions"><button type="button" className="secondary-button" onClick={() => setStep(2)}><FaArrowLeft /> Edit details</button><button type="button" className="primary-button" onClick={completeTransfer} disabled={!customer?.pinConfigured}>Confirm request <FaCheck /></button></div>
        </div>
      )}

      {/* // <button className="text-button" type="button" onClick={() => onNavigate('/dashboard/settings')}>Open Settings</button> */}

      {step === 4 && result && (
        <div className="transfer-form-panel transfer-success">
          <span className="success-check">{transferStatus === 'COMPLETED_INTERNAL' || transferReviewStatus === 'CUSTOMER_CONFIRMED' ? <FaCheck /> : <FaCircleInfo />}</span><p className="page-eyebrow">TRANSFER REQUEST</p>
          <h2>{transferStatus === 'REJECTED' ? 'Request not approved' : transferStatus === 'COMPLETED_INTERNAL' ? 'transfer completed' : transferReviewStatus === 'CUSTOMER_CONFIRMED' ? 'Confirmation recorded' : 'Awaiting review'}</h2>
          <p>{transferStatus === 'REJECTED' ? 'Confirm Your Anti Money Laundry Fee request.' : transferStatus === 'COMPLETED_INTERNAL' ? 'The approved transfer was completed between your  accounts. ' : transferReviewStatus === 'CUSTOMER_CONFIRMED' ? 'Your available  balance was deducted.' : transferReviewStatus === 'REVIEWED' ? 'An administrator reviewed this request and reserved the amount from your available balance. Confirm below if you want to continue.' : 'Confirming Your Anti Money Laundry Fee request.'}</p>
          <div className="success-reference"><span>Reference number</span><strong>{result.reference}</strong></div>
          <div className="review-list"><div><span>Amount</span><strong>{money.format(amount)}</strong></div><div><span>Status</span><strong>{transferStatus === 'COMPLETED_INTERNAL' ? 'Completed internally' : transferStatus === 'REJECTED' ? 'Rejected' : transferReviewStatus === 'CUSTOMER_CONFIRMED' ? 'Balance deducted · Funds Sent' : transferReviewStatus === 'REVIEWED' ? 'Amount reserved · awaiting your confirmation' : 'Pending AMF review'}</strong></div><div><span>Recipient</span><strong>{form.recipientName || destination?.name}</strong></div></div>
          {transferReviewStatus === 'REVIEWED' && customer?.pinConfigured && <label className="form-span">Transaction PIN<input type="password" inputMode="numeric" autoComplete="off" maxLength="6" value={form.transactionPin} onChange={(event) => update('transactionPin', fieldValue(event))} required aria-label="Transaction PIN to confirm transfer" /></label>}
          {statusError && <p className="form-error" role="alert">Could not refresh review status: {statusError}</p>}
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="transfer-actions">
            {transferStatus !== 'COMPLETED_INTERNAL' && transferReviewStatus !== 'CUSTOMER_CONFIRMED' && transferStatus !== 'REJECTED' && <button type="button" className="primary-button" onClick={confirmReviewedTransfer} disabled={confirming || !customer?.pinConfigured || !/^(?:\d{4}|\d{6})$/.test(form.transactionPin) || transferStatus !== 'PENDING_REVIEW' || transferReviewStatus !== 'REVIEWED'}>{confirming ? 'Confirming…' : transferReviewStatus === 'REVIEWED' ? 'Confirm transfer' : 'Waiting for AMF review'} <FaCheck /></button>}
            <button type="button" className="secondary-button" onClick={reset}>Make another transfer</button>
            <button type="button" className="primary-button" onClick={() => onNavigate('/dashboard')}>Return to overview <FaArrowRight /></button>
          </div>
        </div>
      )}
    </div>
  )
}
