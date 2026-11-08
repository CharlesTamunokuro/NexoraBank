export const initialAccounts = [
  { id: 'checking', name: 'Everyday Checking', type: 'Checking', number: '•••• 4821', status: 'Open', available: 8420.55, current: 8495.55 },
  { id: 'savings', name: 'High-Yield Savings', type: 'Savings', number: '•••• 1907', status: 'Open', available: 12650.0, current: 12650.0 },
]

export const initialTransactions = [
  { id: 'txn-1', description: 'Northstar Payroll', date: '2026-10-28', type: 'Deposit', account: 'checking', amount: 3250, status: 'Completed' },
  { id: 'txn-2', description: 'Rent - Maple Apartments', date: '2026-10-27', type: 'Payment', account: 'checking', amount: -1850, status: 'Completed' },
  { id: 'txn-3', description: 'Fresh Market', date: '2026-10-26', type: 'Card purchase', account: 'checking', amount: -86.42, status: 'Completed' },
  { id: 'txn-4', description: 'Electric Utility Co.', date: '2026-10-25', type: 'Bill payment', account: 'checking', amount: -112.7, status: 'Pending' },
  { id: 'txn-5', description: 'Monthly savings transfer', date: '2026-10-24', type: 'Transfer', account: 'savings', amount: 400, status: 'Completed' },
  { id: 'txn-6', description: 'Streamline Media', date: '2026-10-22', type: 'Subscription', account: 'checking', amount: -14.99, status: 'Completed' },
  { id: 'txn-7', description: 'Corner Pharmacy', date: '2026-10-21', type: 'Card purchase', account: 'checking', amount: -32.18, status: 'Completed' },
  { id: 'txn-8', description: 'Transfer to savings', date: '2026-10-20', type: 'Transfer', account: 'checking', amount: -400, status: 'Completed' },
]

export const initialRecipients = [
  { id: 'recipient-1', name: 'Jordan Lee', nickname: 'Rent', bank: 'Cedar National Bank', account: '•••• 1184', type: 'Checking', method: 'Domestic' },
  { id: 'recipient-2', name: 'Taylor Morgan', nickname: 'Shared expenses', bank: 'Summit Credit Union', account: '•••• 7720', type: 'Checking', method: 'Domestic' },
  { id: 'recipient-3', name: 'Alex Kim', nickname: 'Family', bank: 'Harbor Bank', account: '•••• 3506', type: 'Savings', method: 'Domestic' },
]

export const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
export const demoNow = Date.now()

export function formatDate(value) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${value}T12:00:00`))
}

export function createDemoId(prefix) {
  return `${prefix}-${Date.now()}`
}

export function maskAccount(value) {
  const digits = String(value).replace(/\D/g, '')
  return `•••• ${digits.slice(-4) || '••••'}`
}
