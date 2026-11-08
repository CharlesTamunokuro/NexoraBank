import { FaArrowRightArrowLeft, FaBell, FaCircleQuestion, FaCreditCard, FaFileLines, FaGaugeHigh, FaGear, FaUsers, FaRightFromBracket, FaWallet, FaClockRotateLeft } from 'react-icons/fa6'
import Link from '../../components/Link.jsx'

const navigation = [
  { label: 'Overview', path: '/dashboard', Icon: FaGaugeHigh },
  { label: 'Accounts', path: '/dashboard/accounts', Icon: FaWallet },
  { label: 'Transfer & Payments', path: '/dashboard/transfers', Icon: FaArrowRightArrowLeft },
  { label: 'Domestic Transfers', path: '/dashboard/transfers/domestic', Icon: FaArrowRightArrowLeft, child: true },
  { label: 'International Transfers', path: '/dashboard/transfers/international', Icon: FaArrowRightArrowLeft, child: true },
  { label: 'Beneficiaries', path: '/dashboard/beneficiaries', Icon: FaUsers },
  // { label: 'Transaction History', path: '/dashboard/transactions', Icon: FaClockRotateLeft },
  { label: 'Cards', path: '/dashboard/cards', Icon: FaCreditCard },
  { label: 'Statements & Documents', path: '/dashboard/statements', Icon: FaFileLines },
  // { label: 'Notifications', path: '/dashboard/notifications', Icon: FaBell },
  { label: 'Settings', path: '/dashboard/settings', Icon: FaGear },
  // { label: 'Help & Support', path: '/dashboard/support', Icon: FaCircleQuestion },
]

export default function DashboardSidebar({ path, open, onClose, onLogout, customer }) {
  const active = path === '/dashboard' ? '/dashboard' : path

  return (
    <>
      {open && <button className="dashboard-scrim" aria-label="Close navigation" onClick={onClose} />}
      <aside className={`dashboard-sidebar${open ? ' is-open' : ''}`}>
        <Link href="/" className="dashboard-brand" onClick={onClose}>
          <img src="/nexora.svg" alt="" />
          <span>Nexora <small>Safe Bank</small></span>
        </Link>
        <p className="sidebar-label">BANKING</p>
        <nav className="dashboard-nav" aria-label="Dashboard navigation">
          {navigation.map(({ label, path: itemPath, Icon, child }) => {
            const selected = active === itemPath || (itemPath === '/dashboard/transfers' && active.startsWith('/dashboard/transfers/'))
            return (
              <Link
                key={itemPath}
                href={itemPath}
                className={`dashboard-nav-link${selected ? ' active' : ''}${child ? ' child-link' : ''}`}
                aria-current={selected ? 'page' : undefined}
                onClick={onClose}
              >
                <Icon aria-hidden="true" />
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="sidebar-profile">
          <span className="profile-avatar">{customer?.name?.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase() ?? 'D'}</span>
          <span className="profile-name"><strong>{customer?.name ?? 'customer'}</strong><small>profile</small></span>
          <button type="button" className="sidebar-logout" onClick={onLogout} aria-label="Log out"><FaRightFromBracket /></button>
        </div>
      </aside>
    </>
  )
}
