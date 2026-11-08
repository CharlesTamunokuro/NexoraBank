import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../api.js'
import { adminRoles } from './adminData.js'

const AdminDataContext = createContext(null)
const roleLabels = {
  SUPER_ADMIN: 'Super Administrator',
  OPERATIONS: 'Operations Administrator',
  SUPPORT: 'Customer Support',
  READ_ONLY: 'Read-Only Analyst',
}
const statusNames = { OPEN: 'Open', RESTRICTED: 'Restricted', SUSPENDED: 'Suspended', CLOSED: 'Closed' }

const emptyState = {
  customers: [],
  accounts: [],
  transfers: [],
  transactions: [],
  payments: [],
  beneficiaries: [],
  cards: [],
  verificationCases: [],
  tickets: [],
  notifications: [],
  auditLogs: [],
  adminUsers: [],
}

function adminProfile(admin) {
  return { ...admin, role: roleLabels[admin.role] ?? admin.role, status: 'Active' }
}

export function AdminDataProvider({ children }) {
  const [records, setRecords] = useState(emptyState)
  const [activeAdmin, setActiveAdmin] = useState(null)
  const [sourceBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [sessionError, setSessionError] = useState('')

  const refreshState = useCallback(async () => {
    const data = await apiRequest('/admin/state')
    setRecords({
      customers: data.customers,
      accounts: data.accounts.map((item) => ({ ...item, status: statusNames[item.status.toUpperCase()] ?? item.status })),
      transfers: data.transfers,
      transactions: data.transactions,
      payments: data.fundings,
      beneficiaries: [],
      cards: [],
      verificationCases: [],
      tickets: [],
      notifications: [],
      auditLogs: data.auditLogs,
      adminUsers: [],
    })
  }, [])

  useEffect(() => {
    let active = true
    apiRequest('/auth/me')
      .then(async (session) => {
        if (!active) return
        if (session.kind !== 'admin') {
          setActiveAdmin(null)
          return
        }
        setActiveAdmin(adminProfile(session.admin))
        await refreshState()
      })
      .catch((error) => {
        if (!active) return
        if (error.status === 401) {
          setActiveAdmin(null)
          setSessionError('')
        } else {
          setSessionError(error.message)
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [refreshState])

  const signIn = useCallback(async (email, password) => {
    try {
      const { admin } = await apiRequest('/admin/auth/login', { method: 'POST', body: { email, password } })
      await refreshState()
      setActiveAdmin(adminProfile(admin))
      setSessionError('')
      return { ok: true }
    } catch (error) {
      setActiveAdmin(null)
      return { ok: false, error: error.message }
    }
  }, [refreshState])

  const signOut = useCallback(async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' })
    } finally {
      setActiveAdmin(null)
      setRecords(emptyState)
      setSessionError('')
    }
  }, [])

  const updateUserStatus = useCallback(async (customerId, status, reason) => {
    const values = { Active: 'ACTIVE', Restricted: 'RESTRICTED', Suspended: 'SUSPENDED', Disabled: 'SUSPENDED', Closed: 'CLOSED' }
    try {
      await apiRequest(`/admin/users/${encodeURIComponent(customerId)}/status`, {
        method: 'PATCH',
        body: { status: values[status], reason },
      })
      await refreshState()
      return { ok: true }
    } catch (error) {
      return { ok: false, error: error.message }
    }
  }, [refreshState])

  const updateAccessStatus = useCallback(() => ({
    ok: false,
    error: 'Separate online-access suspension is not implemented in the demo backend.',
  }), [])

  const updateAccountStatus = useCallback(async (accountId, status, reason) => {
    const values = { Open: 'OPEN', Restricted: 'RESTRICTED', Suspended: 'SUSPENDED', Closed: 'CLOSED' }
    try {
      await apiRequest(`/admin/accounts/${encodeURIComponent(accountId)}/status`, {
        method: 'PATCH',
        body: { status: values[status], reason },
      })
      await refreshState()
      return { ok: true }
    } catch (error) {
      return { ok: false, error: error.message }
    }
  }, [refreshState])

  const addAccountNote = useCallback(async (accountId, note) => {
    try {
      await apiRequest(`/admin/accounts/${encodeURIComponent(accountId)}/note`, { method: 'PATCH', body: { note } })
      await refreshState()
      return { ok: true }
    } catch (error) {
      return { ok: false, error: error.message }
    }
  }, [refreshState])

  const addCustomerNote = useCallback(async (customerId, note) => {
    try {
      await apiRequest(`/admin/users/${encodeURIComponent(customerId)}/note`, { method: 'PATCH', body: { note } })
      await refreshState()
      return { ok: true }
    } catch (error) {
      return { ok: false, error: error.message }
    }
  }, [refreshState])

  const updateTransferReview = useCallback(async (transferId, review, note) => {
    try {
      await apiRequest(`/admin/transfers/${encodeURIComponent(transferId)}/review`, {
        method: 'PATCH',
        body: { action: review, reason: note },
      })
      await refreshState()
      return { ok: true }
    } catch (error) {
      return { ok: false, error: error.message }
    }
  }, [refreshState])

  const updateTransactionNote = useCallback(async (transactionId, note) => {
    try {
      await apiRequest(`/admin/transactions/${encodeURIComponent(transactionId)}/note`, { method: 'PATCH', body: { note } })
      await refreshState()
      return { ok: true }
    } catch (error) {
      return { ok: false, error: error.message }
    }
  }, [refreshState])

  const searchAccount = useCallback(async (accountNumber) => {
    try {
      const { account: match } = await apiRequest(`/admin/accounts/search?accountNumber=${encodeURIComponent(accountNumber)}`)
      const account = records.accounts.find((item) => item.id === match.id)
      const customer = account && records.customers.find((item) => item.id === account.customerId)
      if (!account || !customer) return { ok: false, error: 'The exact account was found but its customer record is unavailable.' }
      return {
        ok: true,
        recipient: {
          account: { ...account, ...match, number: account.number, status: statusNames[match.status] ?? match.status },
          customer: {
            ...customer,
            name: match.customer.name,
            id: match.customer.customerNumber,
            status: match.customer.status.replaceAll('_', ' ').toLowerCase().replace(/^\w/, (letter) => letter.toUpperCase()),
            verification: match.customer.verificationStatus.replaceAll('_', ' ').toLowerCase().replace(/^\w/, (letter) => letter.toUpperCase()),
          },
        },
      }
    } catch (error) {
      return { ok: false, error: error.message }
    }
  }, [records.accounts, records.customers])

  const createAdminPayment = useCallback(async (payload) => {
    try {
      const { funding } = await apiRequest('/admin/funding', {
        method: 'POST',
        body: {
          accountId: payload.accountId,
          amount: String(payload.amount),
          category: payload.category,
          reference: payload.reference,
          description: payload.description,
          internalNote: payload.note,
          idempotencyKey: payload.idempotencyKey,
        },
      })
      await refreshState()
      const account = records.accounts.find((item) => item.id === payload.accountId)
      const customer = records.customers.find((item) => item.id === (payload.customerId ?? account?.customerId))
      return {
        ok: true,
        payment: {
          id: funding.reference,
          customerId: customer?.id,
          customerName: customer?.name,
          accountId: payload.accountId,
          amount: Number(funding.amount),
          fee: 0,
          total: Number(funding.amount),
          category: payload.category,
          reference: funding.reference,
          description: payload.description,
          note: payload.note ?? '',
          date: new Date().toISOString(),
          status: 'Completed',
        },
      }
    } catch (error) {
      return { ok: false, error: error.message }
    }
  }, [records.accounts, records.customers, refreshState])

  const updateAdminPaymentStatus = useCallback(() => ({
    ok: false,
    error: 'Recorded demo ledger credits are immutable; create a correcting entry instead.',
  }), [])

  const unsupported = useCallback((feature) => ({
    ok: false,
    error: `${feature} management is not implemented in this demo backend.`,
  }), [])

  const value = useMemo(() => ({
    ...records,
    activeAdmin,
    loading,
    sessionError,
    sourceBalance,
    signIn,
    signOut,
    updateAdminRole: () => unsupported('Administrator role'),
    updateUserStatus,
    updateAccessStatus,
    updateAccountStatus,
    addAccountNote,
    addCustomerNote,
    updateTransferReview,
    updateTransactionNote,
    searchAccount,
    createAdminPayment,
    updateAdminPaymentStatus,
    updateVerification: () => unsupported('Verification'),
    updateCardStatus: () => unsupported('Card'),
    updateTicket: () => unsupported('Support ticket'),
    markNotificationRead: () => unsupported('Notification'),
    updateBeneficiaryNote: () => unsupported('Beneficiary note'),
    updateAdmin: () => unsupported('Administrator'),
    resetDemo: () => unsupported('Demo reset'),
    addAudit: () => unsupported('Audit log'),
    adminRoles,
  }), [
    records, activeAdmin, loading, sessionError, sourceBalance, signIn, signOut, updateUserStatus, updateAccessStatus,
    updateAccountStatus, addAccountNote, addCustomerNote, updateTransferReview, updateTransactionNote,
    searchAccount, createAdminPayment, updateAdminPaymentStatus, unsupported,
  ])

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAdminData() {
  const context = useContext(AdminDataContext)
  if (!context) throw new Error('useAdminData must be used within AdminDataProvider')
  return context
}
