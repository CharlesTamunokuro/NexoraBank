import { randomBytes } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { prisma } from '../config/database.js'
import { CSRF_COOKIE, cookieOptions, issueSession, requireAdmin, requireAdminRole, requireCsrf, requireCustomer, requireSession, SESSION_COOKIE } from '../middleware/auth.js'
import { createFunding, getAdminState, reviewTransfer, searchAccount } from '../services/adminService.js'
import { getCustomerDashboard, listCustomerTransactions } from '../services/accountService.js'
import { registerCustomer } from '../services/authService.js'
import { confirmCustomerTransfer, createInternalTransfer, createTransfer } from '../services/transferService.js'
import { createTransactionPin, verifyTransactionPin } from '../services/pinService.js'
import { asyncRoute, HttpError, publicUser, requiredText } from '../utils/http.js'

const router = Router()
const authLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 12, standardHeaders: 'draft-8', legacyHeaders: false })
const writeLimit = rateLimit({ windowMs: 60 * 1000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false })

router.get('/health', (req, res) => res.json({ status: 'ok', mode: 'demo-only' }))

router.get('/auth/csrf', (req, res) => {
  const token = randomBytes(32).toString('hex')
  res.cookie(CSRF_COOKIE, token, { ...cookieOptions(), httpOnly: false, maxAge: 8 * 60 * 60 * 1000 })
  res.json({ csrfToken: token })
})

router.post('/auth/register', authLimit, requireCsrf, asyncRoute(async (req, res) => {
  const user = await registerCustomer(req.body)
  issueSession(res, user, 'customer')
  res.status(201).json({ customer: publicUser(user), accounts: user.accounts.map((account) => ({ id: account.id, number: `•••• ${account.accountNumber.slice(-4)}`, status: account.status })) })
}))

router.post('/auth/login', authLimit, requireCsrf, asyncRoute(async (req, res) => {
  const email = requiredText(req.body.email, 'Email', 254).toLowerCase()
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !(await bcrypt.compare(String(req.body.password || ''), user.passwordHash))) throw new HttpError(401, 'Email or password is incorrect.')
  if (user.status !== 'ACTIVE') throw new HttpError(403, 'This customer profile is not active.')
  const updated = await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
  issueSession(res, updated, 'customer')
  res.json({ customer: publicUser(updated) })
}))

router.post('/admin/auth/login', authLimit, requireCsrf, asyncRoute(async (req, res) => {
  const email = requiredText(req.body.email, 'Email', 254).toLowerCase()
  const admin = await prisma.admin.findUnique({ where: { email } })
  if (!admin || !admin.active || !(await bcrypt.compare(String(req.body.password || ''), admin.passwordHash))) {
    throw new HttpError(401, 'Email or password is incorrect.')
  }
  issueSession(res, admin, 'admin')
  res.json({ admin: { id: admin.id, email: admin.email, name: admin.displayName, role: admin.role } })
}))

router.post('/auth/logout', requireCsrf, (req, res) => {
  res.clearCookie(SESSION_COOKIE, cookieOptions())
  res.json({ ok: true })
})

router.get('/auth/me', requireSession, (req, res) => {
  res.json(req.sessionKind === 'customer'
    ? { kind: 'customer', customer: publicUser(req.user) }
    : { kind: 'admin', admin: { id: req.user.id, email: req.user.email, name: req.user.displayName, role: req.user.role } })
})

router.get('/customer/dashboard', requireSession, requireCustomer, asyncRoute(async (req, res) => {
  res.json(await getCustomerDashboard(req.user.id))
}))

router.get('/customer/transactions', requireSession, requireCustomer, asyncRoute(async (req, res) => {
  res.json({ transactions: await listCustomerTransactions(req.user.id) })
}))

router.get('/customer/pin/status', requireSession, requireCustomer, asyncRoute(async (req, res) => {
  const pin = await prisma.transactionPin.findUnique({ where: { userId: req.user.id }, select: { lockedUntil: true } })
  res.json({ configured: Boolean(pin), lockedUntil: pin?.lockedUntil ?? null })
}))

router.post('/customer/pin', requireSession, requireCustomer, requireCsrf, writeLimit, asyncRoute(async (req, res) => {
  const pinHash = await createTransactionPin(req.user.id, req.body.pin, req.body.confirmPin)
  await prisma.transactionPin.create({ data: { userId: req.user.id, pinHash } })
  res.status(201).json({ configured: true })
}))

router.patch('/customer/pin', requireSession, requireCustomer, requireCsrf, writeLimit, asyncRoute(async (req, res) => {
  await verifyTransactionPin(req.user.id, req.body.currentPin)
  const pinHash = await createTransactionPin(req.user.id, req.body.pin, req.body.confirmPin)
  await prisma.transactionPin.update({
    where: { userId: req.user.id },
    data: { pinHash, failedAttempts: 0, lockedUntil: null },
  })
  res.json({ configured: true })
}))

router.post('/customer/pin/verify', requireSession, requireCustomer, requireCsrf, authLimit, asyncRoute(async (req, res) => {
  await verifyTransactionPin(req.user.id, req.body.pin)
  res.json({ valid: true })
}))

router.get('/customer/beneficiaries', requireSession, requireCustomer, asyncRoute(async (req, res) => {
  const beneficiaries = await prisma.beneficiary.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' } })
  res.json({ beneficiaries })
}))

router.post('/customer/beneficiaries', requireSession, requireCustomer, requireCsrf, writeLimit, asyncRoute(async (req, res) => {
  const beneficiary = await prisma.beneficiary.create({
    data: {
      userId: req.user.id,
      name: requiredText(req.body.name, 'Recipient name', 120),
      nickname: req.body.nickname?.trim() || null,
      bankName: requiredText(req.body.bankName, 'Bank name', 120),
      accountNumber: requiredText(req.body.accountNumber, 'Account number', 64),
      country: req.body.country?.trim() || null,
      currency: req.body.currency || 'USD',
      swiftBic: req.body.swiftBic?.trim() || null,
    },
  })
  res.status(201).json({ beneficiary })
}))

router.patch('/customer/beneficiaries/:id', requireSession, requireCustomer, requireCsrf, asyncRoute(async (req, res) => {
  const beneficiary = await prisma.beneficiary.updateMany({
    where: { id: req.params.id, userId: req.user.id },
    data: {
      name: req.body.name ? requiredText(req.body.name, 'Recipient name', 120) : undefined,
      nickname: req.body.nickname?.trim() || undefined,
      bankName: req.body.bankName ? requiredText(req.body.bankName, 'Bank name', 120) : undefined,
    },
  })
  if (!beneficiary.count) throw new HttpError(404, 'Beneficiary was not found.')
  res.json({ ok: true })
}))

router.delete('/customer/beneficiaries/:id', requireSession, requireCustomer, requireCsrf, asyncRoute(async (req, res) => {
  const beneficiary = await prisma.beneficiary.deleteMany({ where: { id: req.params.id, userId: req.user.id } })
  if (!beneficiary.count) throw new HttpError(404, 'Beneficiary was not found.')
  res.json({ ok: true })
}))

router.patch('/customer/notifications/:id/read', requireSession, requireCustomer, requireCsrf, asyncRoute(async (req, res) => {
  const result = await prisma.notification.updateMany({
    where: { id: req.params.id, userId: req.user.id },
    data: { readAt: new Date() },
  })
  if (!result.count) throw new HttpError(404, 'Notification was not found.')
  res.json({ ok: true })
}))

router.post('/transfers/domestic', requireSession, requireCustomer, requireCsrf, writeLimit, asyncRoute(async (req, res) => {
  const transfer = await createTransfer(req.user, req.body, 'Domestic')
  res.status(201).json({ transfer, notice: 'Recorded for internal review only. No funds were sent.' })
}))

router.post('/transfers/internal', requireSession, requireCustomer, requireCsrf, writeLimit, asyncRoute(async (req, res) => {
  const transfer = await createInternalTransfer(req.user, req.body)
  res.status(201).json({ transfer, notice: 'Recorded as an internal demo-ledger movement only. No external funds moved.' })
}))

router.post('/transfers/international', requireSession, requireCustomer, requireCsrf, writeLimit, asyncRoute(async (req, res) => {
  const transfer = await createTransfer(req.user, req.body, 'International')
  res.status(201).json({ transfer, notice: 'Recorded for internal review only. No funds were sent.' })
}))

router.get('/transfers', requireSession, requireCustomer, asyncRoute(async (req, res) => {
  const transfers = await prisma.transfer.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' } })
  res.json({ transfers })
}))

router.get('/transfers/:id', requireSession, requireCustomer, asyncRoute(async (req, res) => {
  const transfer = await prisma.transfer.findFirst({
    where: { id: req.params.id, userId: req.user.id },
    select: { id: true, reference: true, status: true, reviewStatus: true },
  })
  if (!transfer) throw new HttpError(404, 'Transfer request was not found.')
  res.json({ transfer })
}))

router.post('/transfers/:id/confirm', requireSession, requireCustomer, requireCsrf, writeLimit, asyncRoute(async (req, res) => {
  const transfer = await confirmCustomerTransfer(req.user, req.params.id, req.body.pin)
  res.json({ transfer, notice: 'Customer confirmation recorded. No external transfer was sent.' })
}))

router.get('/admin/state', requireSession, requireAdmin, asyncRoute(async (req, res) => {
  res.json(await getAdminState())
}))

router.get('/admin/accounts/search', requireSession, requireAdmin, requireAdminRole('SUPER_ADMIN', 'OPERATIONS'), asyncRoute(async (req, res) => {
  res.json({ account: await searchAccount(String(req.query.accountNumber || '')) })
}))

router.post('/admin/funding', requireSession, requireAdmin, requireAdminRole('SUPER_ADMIN', 'OPERATIONS'), requireCsrf, writeLimit, asyncRoute(async (req, res) => {
  const funding = await createFunding(req.user, req.body)
  res.status(201).json({ funding, notice: 'ledger credit recorded.' })
}))

router.patch('/admin/users/:id/status', requireSession, requireAdmin, requireAdminRole('SUPER_ADMIN', 'OPERATIONS'), requireCsrf, asyncRoute(async (req, res) => {
  const status = req.body.status
  const reason = requiredText(req.body.reason, 'Reason', 500)
  if (!['ACTIVE', 'RESTRICTED', 'SUSPENDED', 'CLOSED'].includes(status)) throw new HttpError(400, 'Unsupported customer status.')
  const target = await prisma.user.findUnique({ where: { customerNumber: req.params.id } })
  if (!target) throw new HttpError(404, 'Customer profile was not found.')
  const updated = await prisma.$transaction(async (tx) => {
    const user = await tx.user.update({ where: { id: target.id }, data: { status } })
    if (status === 'SUSPENDED' || status === 'CLOSED' || status === 'RESTRICTED') {
      await tx.account.updateMany({
        where: { userId: target.id, status: 'OPEN' },
        data: {
          status: status === 'RESTRICTED' ? 'RESTRICTED' : 'SUSPENDED',
          statusBeforeUserSuspension: 'OPEN',
          restrictionReason: reason,
        },
      })
    }
    if (status === 'ACTIVE') {
      const accounts = await tx.account.findMany({
        where: { userId: target.id, statusBeforeUserSuspension: { not: null } },
      })
      for (const account of accounts) {
        await tx.account.update({
          where: { id: account.id },
          data: { status: account.statusBeforeUserSuspension, statusBeforeUserSuspension: null, restrictionReason: null },
        })
      }
    }
    await tx.auditLog.create({ data: { adminId: req.user.id, action: `CUSTOMER_${status}`, targetType: 'User', targetId: user.id, reason } })
    await tx.notification.create({ data: { userId: user.id, title: 'Demo profile status updated', body: `Your demo profile status is now ${status}.` } })
    return user
  })
  res.json({ customer: publicUser(updated) })
}))

router.patch('/admin/accounts/:id/status', requireSession, requireAdmin, requireAdminRole('SUPER_ADMIN', 'OPERATIONS'), requireCsrf, asyncRoute(async (req, res) => {
  const status = req.body.status
  const reason = requiredText(req.body.reason, 'Reason', 500)
  if (!['OPEN', 'RESTRICTED', 'SUSPENDED', 'CLOSED'].includes(status)) throw new HttpError(400, 'Unsupported account status.')
  const account = await prisma.$transaction(async (tx) => {
    const updated = await tx.account.update({
      where: { id: req.params.id },
      data: { status, restrictionReason: status === 'OPEN' ? null : reason },
    })
    await tx.auditLog.create({ data: { adminId: req.user.id, action: `ACCOUNT_${status}`, targetType: 'Account', targetId: updated.id, reason } })
    await tx.notification.create({ data: { userId: updated.userId, title: 'Demo account status updated', body: `An administrator changed a demo account status to ${status}.` } })
    return updated
  })
  res.json({ account: { id: account.id, status: account.status } })
}))

router.patch('/admin/accounts/:id/note', requireSession, requireAdmin, requireAdminRole('SUPER_ADMIN', 'OPERATIONS'), requireCsrf, asyncRoute(async (req, res) => {
  const note = requiredText(req.body.note, 'Internal note', 1000)
  const account = await prisma.account.update({ where: { id: req.params.id }, data: { internalNote: note } })
  await prisma.auditLog.create({ data: { adminId: req.user.id, action: 'ACCOUNT_NOTE_UPDATED', targetType: 'Account', targetId: account.id, reason: note } })
  res.json({ ok: true })
}))

router.patch('/admin/users/:id/note', requireSession, requireAdmin, requireAdminRole('SUPER_ADMIN', 'OPERATIONS'), requireCsrf, asyncRoute(async (req, res) => {
  const note = requiredText(req.body.note, 'Internal note', 1000)
  const user = await prisma.user.findUnique({ where: { customerNumber: req.params.id } })
  if (!user) throw new HttpError(404, 'Customer profile was not found.')
  await prisma.user.update({ where: { id: user.id }, data: { adminNote: note } })
  await prisma.auditLog.create({ data: { adminId: req.user.id, action: 'CUSTOMER_NOTE_UPDATED', targetType: 'User', targetId: user.id, reason: note } })
  res.json({ ok: true })
}))

router.patch('/admin/transactions/:id/note', requireSession, requireAdmin, requireAdminRole('SUPER_ADMIN', 'OPERATIONS'), requireCsrf, asyncRoute(async (req, res) => {
  const note = requiredText(req.body.note, 'Internal note', 1000)
  const transaction = await prisma.transaction.findUnique({ where: { reference: req.params.id } })
  if (!transaction) throw new HttpError(404, 'Transaction was not found.')
  await prisma.transaction.update({ where: { id: transaction.id }, data: { adminNote: note } })
  await prisma.auditLog.create({ data: { adminId: req.user.id, action: 'TRANSACTION_NOTE_UPDATED', targetType: 'Transaction', targetId: transaction.reference, reason: note } })
  res.json({ ok: true })
}))

router.patch('/admin/transfers/:id/review', requireSession, requireAdmin, requireAdminRole('SUPER_ADMIN', 'OPERATIONS'), requireCsrf, asyncRoute(async (req, res) => {
  const transfer = await reviewTransfer(req.user, req.params.id, req.body.action, req.body.reason)
  res.json({ transfer, notice: 'Internal review is not evidence that a transfer was sent, settled, or completed.' })
}))

router.get('/admin/audit', requireSession, requireAdmin, asyncRoute(async (req, res) => {
  const auditLogs = await prisma.auditLog.findMany({ include: { admin: true }, orderBy: { createdAt: 'desc' }, take: 300 })
  res.json({ auditLogs })
}))

router.get('/admin/notifications', requireSession, requireAdmin, asyncRoute(async (req, res) => {
  const notifications = await prisma.notification.findMany({ orderBy: { createdAt: 'desc' }, take: 100 })
  res.json({ notifications })
}))

router.get('/admin/summary', requireSession, requireAdmin, asyncRoute(async (req, res) => {
  const [customers, accounts, pendingReviews, fundings] = await Promise.all([
    prisma.user.count(),
    prisma.account.count({ where: { userId: { not: '' } } }),
    prisma.transfer.count({ where: { status: 'PENDING_REVIEW' } }),
    prisma.fundingRecord.count(),
  ])
  res.json({ customers, accounts, pendingReviews, fundings, mode: 'DEMO_ONLY' })
}))

export default router
