import { useMemo, useState } from 'react'
import { FaArrowRight, FaChevronLeft, FaChevronRight, FaMagnifyingGlass, FaXmark } from 'react-icons/fa6'
import Link from '../../components/Link.jsx'
import { adminDate, adminMoney, adminInitials } from '../adminData.js'

export function AdminPageHeader({ eyebrow, title, copy, action }) {
  return (
    <div className="admin-page-header">
      <div><p className="admin-eyebrow">{eyebrow}</p><h2>{title}</h2><p>{copy}</p></div>
      {action}
    </div>
  )
}

export function AdminNotice({ children, tone = 'info' }) {
  return <div className={`admin-notice notice-${tone}`} role={tone === 'error' ? 'alert' : undefined}>{children}</div>
}

export function AdminStatus({ children }) {
  const className = String(children ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return <span className={`admin-status status-${className}`}>{children}</span>
}

export function AdminMetric({ label, value, note, icon: Icon, tone = 'green' }) {
  return <article className={`admin-metric metric-${tone}`}><div className="metric-header"><span>{label}</span>{Icon && <Icon aria-hidden="true" />}</div><strong>{value}</strong>{note && <small>{note}</small>}</article>
}

export function AdminTable({ columns, rows, rowKey = 'id', emptyMessage = 'No matching records.', onRowClick }) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead><tr>{columns.map((column) => <th className={column.className ?? ''} key={column.key}>{column.label}</th>)}</tr></thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[rowKey]} onClick={onRowClick ? () => onRowClick(row) : undefined} className={onRowClick ? 'clickable-row' : ''}>
              {columns.map((column) => <td className={column.className ?? ''} key={column.key}>{column.render ? column.render(row) : row[column.key] ?? '—'}</td>)}
            </tr>
          ))}
          {!rows.length && <tr><td className="admin-empty-cell" colSpan={columns.length}>{emptyMessage}</td></tr>}
        </tbody>
      </table>
    </div>
  )
}

export function AdminSearch({ value, onChange, placeholder = 'Search records', label = 'Search records' }) {
  return <label className="admin-search"><FaMagnifyingGlass aria-hidden="true" /><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} aria-label={label} /></label>
}

export function AdminFilter({ label, value, onChange, options }) {
  return <label className="admin-filter"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} aria-label={label}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
}

export function AdminToolbar({ children }) {
  return <div className="admin-toolbar">{children}</div>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAdminPagination(items, pageSize = 8) {
  const [page, setPage] = useState(1)
  const pages = Math.max(1, Math.ceil(items.length / pageSize))
  const currentPage = Math.min(page, pages)
  const rows = useMemo(() => items.slice((currentPage - 1) * pageSize, currentPage * pageSize), [items, currentPage, pageSize])

  function Pagination() {
    if (items.length <= pageSize) return null
    return <div className="admin-pagination"><span>{(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, items.length)} of {items.length}</span><div><button type="button" aria-label="Previous page" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}><FaChevronLeft /></button><span>Page {currentPage} of {pages}</span><button type="button" aria-label="Next page" disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)}><FaChevronRight /></button></div></div>
  }

  return { rows, Pagination, setPage }
}

export function AdminModal({ title, eyebrow = 'CONFIRM ACTION', children, onClose, footer, size = 'medium' }) {
  return (
    <div className="admin-modal-backdrop" role="presentation" onClick={onClose}>
      <section className={`admin-modal modal-${size}`} role="dialog" aria-modal="true" aria-labelledby="admin-modal-title" onClick={(event) => event.stopPropagation()}>
        <button className="admin-modal-close" type="button" aria-label="Close dialog" onClick={onClose}><FaXmark /></button>
        <p className="admin-eyebrow">{eyebrow}</p><h3 id="admin-modal-title">{title}</h3>
        <div className="admin-modal-content">{children}</div>
        {footer && <div className="admin-modal-footer">{footer}</div>}
      </section>
    </div>
  )
}

export function AdminAvatar({ name, large = false }) {
  return <span className={`admin-avatar${large ? ' avatar-large' : ''}`}>{adminInitials(name)}</span>
}

export function AdminCustomerCell({ customer }) {
  return <Link className="admin-customer-cell" href={`/admin/users/${customer.id}`}><AdminAvatar name={customer.name} /><span><strong>{customer.name}</strong><small>{customer.id}</small></span><FaArrowRight /></Link>
}

export function AdminIdentity({ customer }) {
  return <span className="admin-identity"><strong>{customer?.name ?? 'Unknown customer'}</strong><small>{customer?.id ?? '—'}</small></span>
}

export function AdminMoney({ value, signed = false }) {
  return <span className={Number(value) > 0 ? 'money-positive' : Number(value) < 0 ? 'money-negative' : ''}>{signed && Number(value) > 0 ? '+' : ''}{adminMoney(value)}</span>
}

export function AdminDate({ value, withTime = false }) {
  return <time dateTime={value}>{adminDate(value, withTime)}</time>
}

export function AdminInlineAction({ children, href, onClick, disabled = false, tone = 'default' }) {
  if (href) return <Link className={`admin-inline-action action-${tone}`} href={href}>{children}</Link>
  return <button className={`admin-inline-action action-${tone}`} type="button" onClick={onClick} disabled={disabled}>{children}</button>
}

export function AdminConfirmButton({ children = 'Confirm', onClick, disabled = false }) {
  return <button type="button" className="admin-primary-button" disabled={disabled} onClick={onClick}>{children}</button>
}
