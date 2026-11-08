import { AdminDataProvider, useAdminData } from './AdminDataContext.jsx'
import AdminLogin from './components/AdminLogin.jsx'
import { AdminLayout } from './components/AdminLayout.jsx'
import { hasAdminPermission } from './adminData.js'
import {
  AdminAccessDenied,
  AdminActivityPage,
  AdminBeneficiariesPage,
  AdminCardsPage,
  AdminCompliancePage,
  AdminNotificationsPage,
  AdminReportsPage,
  AdminRestrictionsPage,
  AdminSettingsPage,
  AdminStaffPage,
  AdminSupportPage,
} from './pages/AdminOperationsPages.jsx'
import { AdminOverviewPage, AdminUserDetailPage, AdminUsersPage } from './pages/AdminOverviewCustomers.jsx'
import { AdminAccountsPage, AdminTransactionsPage, AdminTransfersPage } from './pages/AdminBankingRecords.jsx'
import AdminPaymentsPage from './pages/AdminPaymentsPage.jsx'
import './dashboard.css'

const routePermissions = {
  '/admin/payments': 'payments',
  '/admin/cards': 'operations',
  '/admin/compliance': 'operations',
  '/admin/staff': 'super',
  '/admin/settings': 'super',
}

function AdminRouteContent({ path }) {
  const { activeAdmin } = useAdminData()
  const userDetail = path.match(/^\/admin\/users\/([^/]+)$/)
  let page

  if (path === '/admin' || path === '/admin/') page = <AdminOverviewPage />
  else if (path === '/admin/users') page = <AdminUsersPage />
  else if (userDetail) page = <AdminUserDetailPage customerId={userDetail[1]} />
  else if (path === '/admin/accounts') page = <AdminAccountsPage />
  else if (path === '/admin/beneficiaries') page = <AdminBeneficiariesPage />
  else if (path === '/admin/domestic-transfers') page = <AdminTransfersPage kind="Domestic" />
  else if (path === '/admin/international-transfers') page = <AdminTransfersPage kind="International" />
  else if (path === '/admin/transactions') page = <AdminTransactionsPage />
  else if (path === '/admin/payments') page = <AdminPaymentsPage />
  else if (path === '/admin/cards') page = <AdminCardsPage />
  else if (path === '/admin/restrictions') page = <AdminRestrictionsPage />
  else if (path === '/admin/compliance') page = <AdminCompliancePage />
  else if (path === '/admin/reports') page = <AdminReportsPage />
  else if (path === '/admin/notifications') page = <AdminNotificationsPage />
  else if (path === '/admin/support') page = <AdminSupportPage />
  else if (path === '/admin/activity') page = <AdminActivityPage />
  else if (path === '/admin/staff') page = <AdminStaffPage />
  else if (path === '/admin/settings') page = <AdminSettingsPage />
  else page = <AdminAccessDenied />

  const permission = routePermissions[path]
  if (permission && !hasAdminPermission(activeAdmin?.role, permission)) page = <AdminAccessDenied />

  return <AdminLayout path={path}>{page}</AdminLayout>
}

function AdminDashboardContent({ path }) {
  const { activeAdmin, loading, sessionError } = useAdminData()
  if (loading) return <main className="admin-login-page"><p role="status">Restoring administrator session…</p></main>
  if (sessionError) return <main className="admin-login-page"><section className="admin-login-card"><p role="alert">Could not restore the administrator session: {sessionError}</p><button type="button" className="admin-primary-button" onClick={() => window.location.reload()}>Try again</button></section></main>
  if (!activeAdmin) return <AdminLogin />
  return <AdminRouteContent path={path === '/admin/login' ? '/admin' : path} />
}

export default function AdminDashboard({ path }) {
  return <AdminDataProvider><AdminDashboardContent path={path} /></AdminDataProvider>
}
