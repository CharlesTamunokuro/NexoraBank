import { useState } from 'react'
import { FaBars, FaBell, FaEye, FaEyeSlash, FaMagnifyingGlass } from 'react-icons/fa6'
import Link from '../../components/Link.jsx'

const titles = {
  '/dashboard': 'Overview',
  '/dashboard/accounts': 'Accounts',
  '/dashboard/transfers': 'Transfer & Payments',
  '/dashboard/transfers/domestic': 'Domestic transfer',
  '/dashboard/transfers/international': 'International transfer',
  '/dashboard/beneficiaries': 'Beneficiaries',
  '/dashboard/transactions': 'Transaction history',
  '/dashboard/cards': 'Cards',
  '/dashboard/statements': 'Statements & Documents',
  '/dashboard/notifications': 'Notifications',
  '/dashboard/settings': 'Settings',
  '/dashboard/support': 'Help & Support',
}

export default function DashboardTopbar({ path, onMenuOpen, onSearch, customer, balancesVisible, onToggleBalances }) {
  const [query, setQuery] = useState('')

  return (
    <header className="dashboard-topbar">
      <button className="mobile-menu-button" type="button" aria-label="Open dashboard menu" onClick={onMenuOpen}><FaBars /></button>
      <div className="topbar-title">
        <span className="topbar-overline">PERSONAL BANKING</span>
        <h1>{titles[path] ?? 'Overview'}</h1>
      </div>
      <div className="topbar-actions">
        <label className="dashboard-search">
          <FaMagnifyingGlass aria-hidden="true" />
          <input type="search" placeholder="Search" aria-label="Search transactions" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => {
            if (event.key === 'Enter' && query.trim()) onSearch(query.trim())
          }} />
        </label>
        <button className="balance-visibility-toggle" type="button" onClick={onToggleBalances} aria-label={balancesVisible ? 'Hide balances' : 'Show balances'} aria-pressed={!balancesVisible} title={balancesVisible ? 'Hide balances' : 'Show balances'}>
          {balancesVisible ? <FaEye /> : <FaEyeSlash />}
        </button>
        <Link className="topbar-notifications" href="/dashboard" aria-label="Notifications"><FaBell /><i /></Link>
        <span className="topbar-avatar" aria-label={customer?.name ?? 'customer'}>{customer?.name?.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase() ?? 'D'}</span>
      </div>
    </header>
  )
}
