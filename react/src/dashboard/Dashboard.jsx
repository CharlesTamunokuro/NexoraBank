import { useCallback, useEffect, useState } from 'react'
import { navigateTo, useCurrentPath } from '../navigation.js'
import { apiRequest } from '../api.js'
import DashboardSidebar from './components/DashboardSidebar.jsx'
import DashboardTopbar from './components/DashboardTopbar.jsx'
import OverviewPage from './pages/OverviewPage.jsx'
import TransferPage from './pages/TransferPage.jsx'
import { AccountsPage, BeneficiariesPage, CardsPage, TransactionHistoryPage, UtilityPage } from './pages/WorkspacePages.jsx'
import './dashboard.css'

export default function Dashboard() {
  const path = useCurrentPath()
  const [balancesVisible, setBalancesVisible] = useState(() => window.sessionStorage.getItem('nexora:balances-visible') !== 'false')
  const [accounts, setAccounts] = useState([])
  const [transactions, setTransactions] = useState([])
  const [recipients, setRecipients] = useState([])
  const [notifications, setNotifications] = useState([])
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [transactionSearchQuery, setTransactionSearchQuery] = useState('')

  useEffect(() => {
    window.sessionStorage.setItem('nexora:balances-visible', String(balancesVisible))
  }, [balancesVisible])

  const loadDashboard = useCallback(async () => {
    const data = await apiRequest('/customer/dashboard')
    setCustomer(data.customer)
    const statuses = { OPEN: 'Open', RESTRICTED: 'Restricted', SUSPENDED: 'Suspended', CLOSED: 'Closed' }
    setAccounts(data.accounts.map((account) => ({ ...account, status: statuses[account.status] ?? account.status, available: Number(account.available), current: Number(account.current) })))
    setTransactions(data.transactions.map((transaction) => ({ ...transaction, amount: Number(transaction.amount), fee: Number(transaction.fee), date: transaction.date.slice(0, 10), status: transaction.status === 'RECORDED_DEMO_ONLY' ? 'Recorded' : transaction.status.replaceAll('_', ' ').toLowerCase().replace(/^\w/, (letter) => letter.toUpperCase()) })))
    setNotifications(data.notifications)
    const beneficiaryData = await apiRequest('/customer/beneficiaries')
    setRecipients(beneficiaryData.beneficiaries.map((beneficiary) => ({
      id: beneficiary.id,
      name: beneficiary.name,
      nickname: beneficiary.nickname ?? '',
      bank: beneficiary.bankName,
      account: beneficiary.accountNumber,
      country: beneficiary.country,
      currency: beneficiary.currency,
      swift: beneficiary.swiftBic,
      method: beneficiary.country ? 'International' : 'Domestic',
      type: 'Checking',
    })))
  }, [])

  useEffect(() => {
    let active = true
    Promise.resolve().then(loadDashboard)
      .catch((error) => {
        if (error.status === 401) {
          navigateTo('/login')
          return
        }
        if (active) setLoadError(error.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [loadDashboard])

  function navigate(pathname) {
    navigateTo(pathname)
    setMenuOpen(false)
  }

  function addRecipient(recipient) {
    return apiRequest('/customer/beneficiaries', {
      method: 'POST',
      body: {
        name: recipient.name,
        nickname: recipient.nickname,
        bankName: recipient.bank,
        accountNumber: recipient.account,
        country: recipient.country,
        currency: recipient.currency,
        swiftBic: recipient.swift,
      },
    }).then(async (result) => {
      await loadDashboard()
      return result
    }).catch((error) => {
      setLoadError(error.message)
      throw error
    })
  }

  async function removeRecipient(id) {
    try {
      await apiRequest(`/customer/beneficiaries/${encodeURIComponent(id)}`, { method: 'DELETE' })
      await loadDashboard()
    } catch (error) {
      setLoadError(error.message)
    }
  }

  async function updateRecipient(id, updates) {
    try {
      await apiRequest(`/customer/beneficiaries/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: { name: updates.nickname, bankName: updates.bank },
      })
      await loadDashboard()
    } catch (error) {
      setLoadError(error.message)
    }
  }

  async function markNotificationRead(id) {
    try {
      await apiRequest(`/customer/notifications/${encodeURIComponent(id)}/read`, { method: 'PATCH' })
      await loadDashboard()
    } catch (error) {
      setLoadError(error.message)
    }
  }

  async function completeTransfer({ transferType, sourceAccountId, destinationAccountId, recipientName, recipientBank, recipientAccount, recipientCountry, currency, swiftBic, description, amount, idempotencyKey, pin }) {
    const requestBody = {
      sourceAccountId,
      recipientName,
      recipientBank,
      recipientAccount,
      recipientCountry,
      currency,
      swiftBic,
      description,
      amount: String(amount),
      idempotencyKey,
      pin,
    }
    const path = transferType === 'own' ? '/transfers/internal'
      : transferType === 'international' ? '/transfers/international'
        : '/transfers/domestic'
    const result = await apiRequest(path, {
      method: 'POST',
      body: transferType === 'own' ? { ...requestBody, destinationAccountId } : requestBody,
    })
    await loadDashboard()
    return result.transfer
  }

  const getTransferStatus = useCallback(async (transferId) => {
    const result = await apiRequest(`/transfers/${encodeURIComponent(transferId)}`)
    return result.transfer
  }, [])

  const listTransfers = useCallback(async () => apiRequest('/transfers'), [])

  const confirmCustomerTransfer = useCallback(async ({ transferId, pin }) => {
    const result = await apiRequest(`/transfers/${encodeURIComponent(transferId)}/confirm`, {
      method: 'POST',
      body: { pin },
    })
    await loadDashboard()
    return result.transfer
  }, [loadDashboard])

  async function logout() {
    try {
      await apiRequest('/auth/logout', { method: 'POST' })
    } finally {
      navigateTo('/login')
    }
  }

  function searchTransactions(query) {
    setTransactionSearchQuery(query)
    navigate('/dashboard/transactions')
  }

  function renderPage() {
    if (path === '/dashboard' || path === '/dashboard/overview') {
      return <OverviewPage customer={customer} accounts={accounts} transactions={transactions} balancesVisible={balancesVisible} onNavigate={navigate} />
    }
    if (path === '/dashboard/accounts') return <AccountsPage accounts={accounts} transactions={transactions} balancesVisible={balancesVisible} onNavigate={navigate} />
    if (path.startsWith('/dashboard/transfers')) return <TransferPage key={path} path={path} accounts={accounts} recipients={recipients} customer={customer} balancesVisible={balancesVisible} onAddRecipient={addRecipient} onComplete={completeTransfer} onListTransfers={listTransfers} onGetTransferStatus={getTransferStatus} onConfirmTransfer={confirmCustomerTransfer} onRefreshDashboard={loadDashboard} onNavigate={navigate} />
    if (path === '/dashboard/transactions') return <TransactionHistoryPage key={transactionSearchQuery} accounts={accounts} transactions={transactions} initialQuery={transactionSearchQuery} />
    if (path === '/dashboard/beneficiaries') return <BeneficiariesPage recipients={recipients} onAdd={addRecipient} onRemove={removeRecipient} onUpdate={updateRecipient} onNavigate={navigate} />
    if (path === '/dashboard/cards') return <CardsPage />
    return <UtilityPage path={path} customer={customer} notifications={notifications} onMarkRead={markNotificationRead} onRefresh={loadDashboard} />
  }

  return (
    <div className="dashboard-shell">
      <DashboardSidebar path={path} open={menuOpen} onClose={() => setMenuOpen(false)} onLogout={logout} customer={customer} />
      <div className="dashboard-main">
        <DashboardTopbar path={path} onMenuOpen={() => setMenuOpen(true)} onSearch={searchTransactions} customer={customer} balancesVisible={balancesVisible} onToggleBalances={() => setBalancesVisible((visible) => !visible)} />
        {loading ? <div className="dashboard-page"><p role="status">Loading your profile…</p></div> : loadError ? <div className="dashboard-page"><p className="form-error" role="alert">{loadError}</p><button className="primary-button" type="button" onClick={() => { setLoadError(''); setLoading(true); loadDashboard().catch((error) => setLoadError(error.message)).finally(() => setLoading(false)) }}>Retry</button></div> : renderPage()}
        <footer className="dashboard-footer"><span>© 2026 Nexora Safe Bank</span></footer>
      </div>
    </div>
  )
}
