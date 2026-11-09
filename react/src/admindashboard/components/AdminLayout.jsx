import { useState } from 'react'
import {
  FaArrowRightArrowLeft, FaBars, FaBell, FaChartLine, FaCircleExclamation, FaCreditCard, FaFileInvoiceDollar,
  FaFileLines, FaGaugeHigh, FaGear, FaGlobe, FaHandshake, FaListCheck, FaMagnifyingGlass, FaPeopleGroup, FaRightFromBracket,
  FaShieldHalved, FaUserCheck, FaUsers, FaWallet,
} from 'react-icons/fa6'
import Link from '../../components/Link.jsx'
import { ADMIN_ROUTE_ITEMS, adminInitials, hasAdminPermission } from '../adminData.js'
import { useAdminData } from '../AdminDataContext.jsx'

const iconComponents = {
  gauge: FaGaugeHigh,
  users: FaUsers,
  wallet: FaWallet,
  beneficiaries: FaHandshake,
  transfer: FaArrowRightArrowLeft,
  globe: FaGlobe,
  transactions: FaFileLines,
  payment: FaFileInvoiceDollar,
  card: FaCreditCard,
  restriction: FaCircleExclamation,
  compliance: FaUserCheck,
  reports: FaChartLine,
  notifications: FaBell,
  support: FaPeopleGroup,
  activity: FaListCheck,
  staff: FaPeopleGroup,
  settings: FaGear,
}

const routeTitles = Object.fromEntries(ADMIN_ROUTE_ITEMS.map((item) => [item.path, item.label]))

export function AdminLayout({ path, children }) {
  const { activeAdmin, signOut } = useAdminData()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const groups = [...new Set(ADMIN_ROUTE_ITEMS.map((item) => item.group))]
  const pageTitle = path.startsWith('/admin/users/') ? 'Customer details' : routeTitles[path] ?? 'Dashboard Overview'

  function logout() {
    signOut()
    window.history.pushState({}, '', '/admin/login')
    window.dispatchEvent(new Event('app:navigate'))
  }

  return (
    <div className="admin-shell">
      {drawerOpen && <button className="admin-drawer-scrim" type="button" aria-label="Close admin navigation" onClick={() => setDrawerOpen(false)} />}
      <aside className={`admin-sidebar${drawerOpen ? ' drawer-open' : ''}`}>
        <Link className="admin-brand" href="/admin" onClick={() => setDrawerOpen(false)}><img src="/nexora.svg" alt="" /><span>Nexora <small>Safe Bank · Admin</small></span></Link>
        <div className="admin-env-tag"><span /> ADMIN OPERATIONS</div>
        <nav className="admin-side-nav" aria-label="Admin navigation">
          {groups.map((group) => {
            const items = ADMIN_ROUTE_ITEMS.filter((item) => item.group === group && (!item.permission || hasAdminPermission(activeAdmin?.role, item.permission)))
            if (!items.length) return null
            return <div className="admin-nav-group" key={group}><p>{group}</p>{items.map((item) => {
              const Icon = iconComponents[item.icon]
              const current = item.path === '/admin'
                ? path === '/admin'
                : item.path === '/admin/users'
                  ? path === '/admin/users' || path.startsWith('/admin/users/')
                  : path === item.path
              return <Link key={item.path} href={item.path} className={`admin-nav-link${current ? ' is-active' : ''}`} aria-current={current ? 'page' : undefined} onClick={() => setDrawerOpen(false)}><Icon aria-hidden="true" /><span>{item.label}</span></Link>
            })}</div>
          })}
        </nav>
        <div className="admin-profile">
          <span className="admin-profile-avatar">{adminInitials(activeAdmin?.name ?? 'Admin')}</span>
          <span><strong>{activeAdmin?.name ?? 'Admin'}</strong><small>{activeAdmin?.role ?? 'Administrator'}</small></span>
          <button type="button" aria-label="Sign out of admin demo" onClick={logout}><FaRightFromBracket /></button>
        </div>
        <p className="admin-permission-footnote">UI permissions are simulated. A secure backend must enforce all administrator access.</p>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <button type="button" className="admin-menu-button" aria-label="Open admin navigation" onClick={() => setDrawerOpen(true)}><FaBars /></button>
          <div className="admin-breadcrumb"><span>Administration</span><b>/</b><strong>{pageTitle}</strong></div>
          <div className="admin-top-actions">
            <label className="admin-global-search"><FaMagnifyingGlass /><input aria-label="Search customers, accounts, transfers" placeholder="Search customers, accounts…" onKeyDown={(event) => {
              if (event.key === 'Enter' && event.currentTarget.value.trim()) {
                window.history.pushState({}, '', `/admin/users?q=${encodeURIComponent(event.currentTarget.value.trim())}`)
                window.dispatchEvent(new Event('app:navigate'))
              }
            }} /></label>
            <Link href="/admin/notifications" className="admin-top-notifications" aria-label="Admin notifications"><FaBell /></Link>
            <span className="admin-top-avatar">{adminInitials(activeAdmin?.name ?? 'Admin')}</span>
          </div>
        </header>
        <main className="admin-content">{children}</main>
        <footer className="admin-footer"><span>© 2026 Nexora Safe Bank · Administration demo</span><span><FaShieldHalved /> Synthetic data · no banking services connected</span></footer>
      </div>
    </div>
  )
}
