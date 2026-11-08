import { randomUUID } from 'node:crypto'
import { Prisma } from '@prisma/client'
import { prisma } from '../config/database.js'
import { HttpError, moneyAmount, requiredText } from '../utils/http.js'

const titleStatus = (value) => String(value).toLowerCase().replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())

export async function getAdminState() {
  const [users, accounts, transactions, transfers, fundings, auditLogs] = await Promise.all([
    prisma.user.findMany({ include: { accounts: true }, orderBy: { createdAt: 'desc' } }),
    prisma.account.findMany({ where: { userId: { not: '' } }, include: { user: true }, orderBy: { createdAt: 'desc' } }),
    prisma.transaction.findMany({ include: { user: true, account: true }, orderBy: { createdAt: 'desc' }, take: 300 }),
    prisma.transfer.findMany({ include: { user: true, sourceAccount: true, reviews: true }, orderBy: { createdAt: 'desc' }, take: 300 }),
    prisma.fundingRecord.findMany({ include: { account: { include: { user: true } }, admin: true }, orderBy: { createdAt: 'desc' }, take: 300 }),
    prisma.auditLog.findMany({ include: { admin: true }, orderBy: { createdAt: 'desc' }, take: 300 }),
  ])
  const customerMap = users.map((user) => ({
    id: user.customerNumber,
    userId: user.id,
    firstName: user.firstName,
    middleName: user.middleName,
    lastName: user.lastName,
    name: [user.firstName, user.middleName, user.lastName].filter(Boolean).join(' '),
    email: user.email,
    phone: user.phone,
    dateOfBirth: user.dateOfBirth?.toISOString().slice(0, 10) ?? null,
    address: user.address ?? '',
    apartment: user.apartment ?? '',
    city: user.city ?? '',
    state: user.state ?? '',
    postalCode: user.postalCode ?? '',
    country: user.country,
    citizenship: user.citizenship ?? '',
    employment: user.employment ?? '',
    occupation: user.occupation ?? '',
    incomeRange: user.incomeRange ?? '',
    accountPurpose: user.accountPurpose ?? '',
    status: titleStatus(user.status),
    verification: titleStatus(user.verificationStatus),
    type: 'Personal',
    joined: user.createdAt.toISOString().slice(0, 10),
    lastLogin: user.lastLoginAt?.toISOString() ?? 'Never',
    lastActivity: user.lastLoginAt?.toISOString().slice(0, 10) ?? '—',
    accessStatus: 'Enabled',
    adminNote: user.adminNote ?? '',
    statusReason: '',
    manager: '—',
  }))
  const accountsOut = accounts.map((account) => ({
    id: account.id,
    customerId: account.user.customerNumber,
    name: [account.user.firstName, account.user.lastName].join(' '),
    type: account.type,
    number: account.accountNumber,
    available: Number(account.ledgerBalance.sub(account.reservedBalance).toFixed(2)),
    current: Number(account.ledgerBalance.toFixed(2)),
    status: titleStatus(account.status),
    restriction: account.restrictionReason || '',
    opened: account.createdAt.toISOString().slice(0, 10),
    lastTransaction: '—',
    note: account.internalNote ?? '',
  }))
  return {
    customers: customerMap,
    accounts: accountsOut,
    transactions: transactions.map((item) => ({
      id: item.reference,
      userId: item.userId,
      customerId: item.user.customerNumber,
      accountId: item.accountId,
      description: item.description,
      date: item.createdAt.toISOString(),
      type: titleStatus(item.kind),
      amount: Number(item.amount.toFixed(2)),
      fee: Number(item.fee.toFixed(2)),
      status: item.status.includes('PENDING') ? 'Pending' : item.status.includes('FAILED') ? 'Failed' : 'Completed',
      source: 'Demo ledger',
      direction: item.amount.isNegative() ? 'Outgoing' : 'Incoming',
      transferId: item.transferId ?? '',
      adminNote: item.adminNote ?? '',
    })),
    transfers: transfers.map((item) => ({
      id: item.id,
      reference: item.reference,
      internalReference: item.internalReference ?? '',
      customerId: item.user.customerNumber,
      senderName: [item.user.firstName, item.user.lastName].join(' '),
      senderAccountId: item.sourceAccount.accountNumber,
      recipientName: item.recipientName,
      recipientBank: item.recipientBank,
      recipientAccount: item.recipientAccount,
      country: item.recipientCountry,
      currency: item.recipientCurrency,
      amount: item.amount.toFixed(2),
      fee: item.fee.toFixed(2),
      kind: item.kind,
      method: item.kind,
      status: item.status === 'PENDING_REVIEW' || item.status === 'INFORMATION_REQUESTED' ? 'Pending' : item.status === 'COMPLETED_INTERNAL' ? 'Completed' : titleStatus(item.status),
      review: item.reviewStatus === 'NOT_REVIEWED' ? 'Needs review' : titleStatus(item.reviewStatus),
      notes: item.reviewNote,
      date: item.createdAt.toISOString(),
      events: [`${item.reference} recorded`,],
      eta: '—',
      rate: null,
      recipientAmount: Number(item.amount.toFixed(2)),
      swift: item.swiftBic ?? '',
    })),
    fundings: fundings.map((item) => ({
      id: item.reference,
      customerId: item.account.user.customerNumber,
      customerName: [item.account.user.firstName, item.account.user.lastName].join(' '),
      accountId: item.accountId,
      amount: Number(item.amount.toFixed(2)),
      currency: item.currency,
      category: item.category,
      description: item.description,
      admin: item.admin.displayName,
      date: item.createdAt.toISOString(),
      status: 'Completed',
      fee: 0,
      total: Number(item.amount.toFixed(2)),
      source: 'Simulated demo ledger credit',
      reference: item.reference,
      note: item.internalNote ?? '',
    })),
    auditLogs: auditLogs.map((item) => ({
      id: item.id,
      admin: item.admin.displayName,
      action: item.action,
      target: item.targetId,
      reason: item.reason,
      date: item.createdAt.toISOString(),
    })),
  }
}

export async function searchAccount(accountNumber) {
  const account = await prisma.account.findUnique({
    where: { accountNumber },
    include: { user: true },
  })
  if (!account) throw new HttpError(404, 'No account matches that exact account number.')
  return {
    id: account.id,
    accountNumber: `•••• ${account.accountNumber.slice(-4)}`,
    type: account.type,
    status: account.status,
    available: account.ledgerBalance.sub(account.reservedBalance).toFixed(2),
    current: account.ledgerBalance.toFixed(2),
    customer: {
      customerNumber: account.user.customerNumber,
      name: [account.user.firstName, account.user.middleName, account.user.lastName].filter(Boolean).join(' '),
      status: account.user.status,
      verificationStatus: account.user.verificationStatus,
    },
  }
}

export async function createFunding(admin, input) {
  const amount = moneyAmount(input.amount)
  const category = requiredText(input.category, 'Funding category', 80)
  const description = requiredText(input.description, 'Description', 240)
  const idempotencyKey = requiredText(input.idempotencyKey, 'Idempotency key', 100)
  const account = await prisma.account.findUnique({ where: { id: input.accountId }, include: { user: true } })
  if (!account || !account.userId) throw new HttpError(404, 'Customer account was not found.')
  if (account.status !== 'OPEN' || account.user.status !== 'ACTIVE') throw new HttpError(403, 'The customer account is not eligible for a credit.')
  return prisma.$transaction(async (tx) => {
    const existing = await tx.fundingRecord.findUnique({ where: { idempotencyKey } })
    if (existing) {
      if (existing.adminId !== admin.id || existing.accountId !== account.id || !existing.amount.equals(new Prisma.Decimal(amount))) {
        throw new HttpError(409, 'This idempotency key was already used for a different funding record.')
      }
      return existing
    }
    const reference = `DEMO-${randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase()}`
    const funding = await tx.fundingRecord.create({
      data: {
        reference,
        idempotencyKey,
        accountId: account.id,
        adminId: admin.id,
        amount,
        category,
        internalReference: input.reference?.trim() || null,
        description,
        internalNote: input.internalNote?.trim() || null,
      },
    })
    await tx.account.update({ where: { id: account.id }, data: { ledgerBalance: { increment: amount } } })
    await tx.ledgerEntry.createMany({
      data: [
        { operationKey: reference, ledgerCode: `ACCOUNT:${account.id}`, accountId: account.id, amount, entryType: 'DEMO_CREDIT', description },
        { operationKey: reference, ledgerCode: 'DEMO_TREASURY', accountId: null, amount: `-${amount}`, entryType: 'DEMO_OFFSET', description: 'Account funding source' },
      ],
    })
    await tx.transaction.create({
      data: {
        reference,
        userId: account.userId,
        accountId: account.id,
        kind: 'ACCOUNT_FUNDING',
        description,
        amount,
        currency: account.currency,
        status: 'RECORDED',
      },
    })
    await tx.notification.create({
      data: {
        userId: account.userId,
        title: 'Simulated demo credit recorded',
        body: `${amount} ${account.currency} was added to the  ledger.`,
      },
    })
    await tx.auditLog.create({
      data: {
        adminId: admin.id,
        action: 'SIMULATED_FUNDING',
        targetType: 'Account',
        targetId: account.id,
        reason: `${reference}: ${description}`,
      },
    })
    return funding
  })
}

export async function reviewTransfer(admin, id, action, reason) {
  const note = requiredText(reason, 'Review reason', 500)
  const transfer = await prisma.transfer.findUnique({ where: { id } })
  if (!transfer) throw new HttpError(404, 'Transfer request was not found.')
  if (['REJECTED', 'CANCELLED', 'COMPLETED_INTERNAL'].includes(transfer.status) || transfer.reviewStatus === 'CUSTOMER_CONFIRMED') {
    throw new HttpError(409, `A transfer in ${transfer.status} status cannot be reviewed again.`)
  }
  const annotation = ['Clear', 'Needs review', 'Flagged', 'Reviewed'].includes(action)
  const status = action === 'REQUEST_INFORMATION' ? 'INFORMATION_REQUESTED'
    : action === 'REJECT' ? 'REJECTED'
      : action === 'Reviewed' ? 'PENDING_REVIEW'
      : annotation ? transfer.status
        : null
  if (!status) throw new HttpError(400, 'Unsupported transfer review action.')
  return prisma.$transaction(async (tx) => {
    const updatedCount = await tx.transfer.updateMany({
      where: { id, status: transfer.status, reviewStatus: transfer.reviewStatus },
      data: { status, reviewStatus: annotation ? action.toUpperCase().replaceAll(' ', '_') : action, reviewNote: note, reviewUpdatedAt: new Date() },
    })
    if (!updatedCount.count) throw new HttpError(409, 'The transfer changed while it was being reviewed. Refresh and try again.')
    if (action === 'Reviewed' && transfer.reviewStatus !== 'REVIEWED') {
      const account = await tx.account.findFirst({ where: { id: transfer.sourceAccountId, userId: transfer.userId } })
      if (!account || account.status !== 'OPEN' || account.ledgerBalance.sub(account.reservedBalance).lessThan(transfer.amount)) {
        throw new HttpError(409, 'The source account does not have enough available demo balance to approve this transfer.')
      }
      const reserved = await tx.account.updateMany({
        where: {
          id: account.id,
          userId: transfer.userId,
          status: 'OPEN',
          ledgerBalance: account.ledgerBalance,
          reservedBalance: account.reservedBalance,
        },
        data: { reservedBalance: { increment: transfer.amount } },
      })
      if (!reserved.count) throw new HttpError(409, 'The source account balance changed during review. Refresh and try again.')
    } else if (transfer.reviewStatus === 'REVIEWED' && action !== 'Reviewed') {
      const released = await tx.account.updateMany({
        where: { id: transfer.sourceAccountId, userId: transfer.userId, reservedBalance: { gte: transfer.amount } },
        data: { reservedBalance: { decrement: transfer.amount } },
      })
      if (!released.count) throw new HttpError(409, 'The reserved demo balance could not be released. Refresh and try again.')
    }
    const updated = await tx.transfer.findUnique({ where: { id } })
    await tx.transferReview.create({ data: { transferId: id, adminId: admin.id, action, note } })
    await tx.auditLog.create({
      data: { adminId: admin.id, action: `TRANSFER_${action}`, targetType: 'Transfer', targetId: id, reason: note },
    })
    await tx.notification.create({
      data: {
        userId: transfer.userId,
        title: action === 'REJECT' ? 'transfer request rejected' : action === 'REQUEST_INFORMATION' ? 'More information requested' : action === 'Reviewed' ? 'transfer ready for confirmation' : 'transfer reviewed',
        body: action === 'Reviewed'
          ? `An administrator reviewed ${transfer.reference}. The amount is now reserved from your available demo balance. Confirm the request in your dashboard to continue. No external transfer has been sent.`
          : transfer.reviewStatus === 'REVIEWED'
            ? `The review status for ${transfer.reference} changed. Its amount is no longer reserved from your available demo balance. ${note}`
          : `Internal review update: ${note}. This does not mean the transfer was sent, settled, or completed.`,
      },
    })
    return updated
  })
}
