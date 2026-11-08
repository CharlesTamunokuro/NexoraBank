import { prisma } from '../config/database.js'
import { HttpError } from '../utils/http.js'

export async function getCustomerDashboard(userId) {
  const [user, accounts, transactions, notifications, pin] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.account.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } }),
    prisma.transaction.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 20 }),
    prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 20 }),
    prisma.transactionPin.findUnique({ where: { userId }, select: { lockedUntil: true } }),
  ])
  if (!user) throw new HttpError(404, 'Customer profile was not found.')
  return {
    customer: {
      id: user.id,
      customerNumber: user.customerNumber,
      name: [user.firstName, user.middleName, user.lastName].filter(Boolean).join(' '),
      email: user.email,
      phone: user.phone,
      address: [user.address, user.apartment, user.city, user.state, user.postalCode].filter(Boolean).join(', '),
      status: user.status,
      verificationStatus: user.verificationStatus,
      pinConfigured: Boolean(pin),
    },
    accounts: accounts.map((account) => ({
      id: account.id,
      name: account.name,
      type: account.type,
      number: account.accountNumber,
      status: account.status,
      available: account.ledgerBalance.sub(account.reservedBalance).toFixed(2),
      current: account.ledgerBalance.toFixed(2),
      currency: account.currency,
    })),
    transactions: transactions.map((item) => ({
      id: item.id,
      reference: item.reference,
      description: item.description,
      date: item.createdAt.toISOString(),
      type: item.kind,
      account: item.accountId,
      amount: item.amount.toFixed(2),
      fee: item.fee.toFixed(2),
      status: item.status,
    })),
    notifications: notifications.map((item) => ({
      id: item.id,
      title: item.title,
      body: item.body,
      read: Boolean(item.readAt),
      date: item.createdAt.toISOString(),
    })),
  }
}

export async function listCustomerTransactions(userId) {
  return prisma.transaction.findMany({
    where: { userId },
    include: { account: { select: { name: true, accountNumber: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
}
