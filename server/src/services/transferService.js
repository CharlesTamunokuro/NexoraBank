import { randomUUID } from 'node:crypto'
import { Prisma } from '@prisma/client'
import { prisma } from '../config/database.js'
import { HttpError, moneyAmount, requiredText } from '../utils/http.js'
import { verifyTransactionPin } from './pinService.js'

export async function createTransfer(user, input, kind) {
  const amount = moneyAmount(input.amount)
  const amountDecimal = new Prisma.Decimal(amount)
  const idempotencyKey = requiredText(input.idempotencyKey, 'Idempotency key', 100)
  const recipientName = requiredText(input.recipientName, 'Recipient name', 120)
  const recipientBank = requiredText(input.recipientBank, 'Recipient bank', 120)
  const recipientAccount = requiredText(input.recipientAccount, 'Recipient account', 64)
  const recipientCurrency = input.currency || 'USD'
  const account = await prisma.account.findFirst({
    where: { id: input.sourceAccountId, userId: user.id },
  })
  if (!account) throw new HttpError(404, 'The selected source account was not found.')
  if (account.status !== 'OPEN') throw new HttpError(403, 'This account cannot initiate transfers.')
  if (account.ledgerBalance.sub(account.reservedBalance).lessThan(amountDecimal)) {
    throw new HttpError(409, 'The source account does not have enough available demo balance.')
  }
  const existing = await prisma.transfer.findUnique({ where: { idempotencyKey } })
  if (existing) {
    if (existing.userId !== user.id || existing.sourceAccountId !== account.id || existing.kind !== kind ||
      !existing.amount.equals(amountDecimal) || existing.recipientName !== recipientName ||
      existing.recipientBank !== recipientBank || existing.recipientAccount !== recipientAccount ||
      existing.recipientCurrency !== recipientCurrency) {
      throw new HttpError(409, 'This idempotency key was already used for a different operation.')
    }
    return existing
  }
  await verifyTransactionPin(user.id, input.pin)
  const transfer = await prisma.$transaction(async (tx) => {
    const duplicate = await tx.transfer.findUnique({ where: { idempotencyKey } })
    if (duplicate) {
      if (duplicate.userId !== user.id || duplicate.sourceAccountId !== account.id || duplicate.kind !== kind ||
        !duplicate.amount.equals(amountDecimal) || duplicate.recipientName !== recipientName ||
        duplicate.recipientBank !== recipientBank || duplicate.recipientAccount !== recipientAccount ||
        duplicate.recipientCurrency !== recipientCurrency) {
        throw new HttpError(409, 'This idempotency key was already used for a different operation.')
      }
      return duplicate
    }
    const reference = `NX-${randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase()}`
    const created = await tx.transfer.create({
      data: {
        reference,
        idempotencyKey,
        userId: user.id,
        sourceAccountId: account.id,
        recipientName,
        recipientBank,
        recipientAccount,
        recipientCountry: input.recipientCountry?.trim() || null,
        recipientCurrency,
        swiftBic: input.swiftBic?.trim() || null,
        description: input.description?.trim() || null,
        kind,
        amount,
        fee: '0.00',
        status: 'PENDING_REVIEW',
        reviewStatus: 'NOT_REVIEWED',
      },
    })
    await tx.transaction.create({
      data: {
        reference,
        userId: user.id,
        accountId: account.id,
        transferId: created.id,
        kind: kind === 'International' ? 'INTERNATIONAL_REQUEST' : 'DOMESTIC_REQUEST',
        description: `${kind} transfer request to ${created.recipientName}`,
        amount: `-${amount}`,
        fee: '0.00',
        currency: account.currency,
        status: 'PENDING_REVIEW',
      },
    })
    await tx.notification.create({
      data: {
        userId: user.id,
        title: 'Demo transfer request recorded',
        body: `${reference} is awaiting internal review. This is not a payment instruction and no funds were sent.`,
      },
    })
    return created
  })
  return transfer
}

export async function createInternalTransfer(user, input) {
  const amountText = moneyAmount(input.amount)
  const amount = new Prisma.Decimal(amountText)
  const idempotencyKey = requiredText(input.idempotencyKey, 'Idempotency key', 100)
  const recipientName = requiredText(input.recipientName, 'Transfer label', 120)
  const source = await prisma.account.findFirst({ where: { id: input.sourceAccountId, userId: user.id } })
  const destination = await prisma.account.findFirst({ where: { id: input.destinationAccountId, userId: user.id } })
  if (!source || !destination) throw new HttpError(404, 'Both accounts must belong to the signed-in customer.')
  if (source.id === destination.id) throw new HttpError(400, 'Choose two different accounts.')
  if (source.status !== 'OPEN' || destination.status !== 'OPEN') throw new HttpError(403, 'Both accounts must be open.')
  if (source.currency !== destination.currency) throw new HttpError(400, 'Internal demo transfers require matching currencies.')

  const duplicate = await prisma.transfer.findUnique({ where: { idempotencyKey } })
  if (duplicate) {
    if (duplicate.userId !== user.id || duplicate.sourceAccountId !== source.id || duplicate.kind !== 'INTERNAL' ||
      !duplicate.amount.equals(amount) || duplicate.recipientAccount !== destination.accountNumber ||
      duplicate.recipientName !== recipientName) {
      throw new HttpError(409, 'This idempotency key was already used for a different operation.')
    }
    return duplicate
  }
  if (source.ledgerBalance.sub(source.reservedBalance).lessThan(amount)) {
    throw new HttpError(409, 'The source account does not have enough available balance.')
  }
  await verifyTransactionPin(user.id, input.pin)
  return prisma.$transaction(async (tx) => {
    const duplicate = await tx.transfer.findUnique({ where: { idempotencyKey } })
    if (duplicate) {
      if (duplicate.userId !== user.id || duplicate.sourceAccountId !== source.id || duplicate.kind !== 'INTERNAL' ||
        !duplicate.amount.equals(amount) || duplicate.recipientAccount !== destination.accountNumber ||
        duplicate.recipientName !== recipientName) {
        throw new HttpError(409, 'This idempotency key was already used for a different operation.')
      }
      return duplicate
    }
    const reference = `NX-${randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase()}`
    const transfer = await tx.transfer.create({
      data: {
        reference,
        idempotencyKey,
        userId: user.id,
        sourceAccountId: source.id,
        recipientName,
        recipientBank: 'Nexora account',
        recipientAccount: destination.accountNumber,
        recipientCurrency: source.currency,
        kind: 'INTERNAL',
        amount,
        fee: '0.00',
        status: 'PENDING_REVIEW',
        reviewStatus: 'NOT_REVIEWED',
      },
    })
    await tx.transaction.create({
      data: {
        reference: `${reference}-OUT`,
        userId: user.id,
        accountId: source.id,
        transferId: transfer.id,
        kind: 'INTERNAL_TRANSFER',
        description: `Transfer to ${destination.name}`,
        amount: amount.negated(),
        currency: source.currency,
        status: 'PENDING_REVIEW',
      },
    })
    await tx.notification.create({
      data: { userId: user.id, title: 'Internal transfer request recorded', body: `${reference} is awaiting internal review. No balance has been moved.` },
    })
    return transfer
  })
}

export async function confirmCustomerTransfer(user, id, pin) {
  const transfer = await prisma.transfer.findFirst({ where: { id, userId: user.id } })
  if (!transfer) throw new HttpError(404, 'Transfer request was not found.')
  if (transfer.status === 'COMPLETED_INTERNAL' || transfer.reviewStatus === 'CUSTOMER_CONFIRMED') return transfer
  if (transfer.status !== 'PENDING_REVIEW' || transfer.reviewStatus !== 'REVIEWED') {
    throw new HttpError(409, 'This transfer is not ready for customer confirmation.')
  }
  await verifyTransactionPin(user.id, pin)

  return prisma.$transaction(async (tx) => {
    const claimed = await tx.transfer.updateMany({
      where: { id, userId: user.id, status: 'PENDING_REVIEW', reviewStatus: 'REVIEWED' },
      data: { reviewStatus: 'CUSTOMER_CONFIRMED' },
    })
    if (claimed.count !== 1) throw new HttpError(409, 'This transfer is no longer ready for customer confirmation.')

    if (transfer.kind === 'INTERNAL') {
      const source = await tx.account.findFirst({ where: { id: transfer.sourceAccountId, userId: user.id } })
      const destination = await tx.account.findFirst({ where: { userId: user.id, accountNumber: transfer.recipientAccount } })
      const amount = transfer.amount
      if (!source || !destination || source.id === destination.id) throw new HttpError(409, 'The internal transfer accounts are no longer available.')
      if (source.status !== 'OPEN' || destination.status !== 'OPEN') {
        throw new HttpError(409, 'The internal transfer accounts are no longer available.')
      }
      const debited = await tx.account.updateMany({
        where: { id: source.id, userId: user.id, status: 'OPEN', ledgerBalance: { gte: amount }, reservedBalance: { gte: amount } },
        data: { ledgerBalance: { decrement: amount }, reservedBalance: { decrement: amount } },
      })
      if (debited.count !== 1) throw new HttpError(409, 'The reserved demo balance is no longer available.')
      await tx.account.update({ where: { id: destination.id }, data: { ledgerBalance: { increment: amount } } })
      await tx.transfer.update({ where: { id }, data: { status: 'COMPLETED_INTERNAL' } })
      await tx.ledgerEntry.createMany({
        data: [
          { operationKey: transfer.reference, ledgerCode: `ACCOUNT:${source.id}`, accountId: source.id, amount: amount.negated(), entryType: 'INTERNAL_DEBIT', description: transfer.recipientName },
          { operationKey: transfer.reference, ledgerCode: `ACCOUNT:${destination.id}`, accountId: destination.id, amount, entryType: 'INTERNAL_CREDIT', description: transfer.recipientName },
        ],
      })
      await tx.transaction.updateMany({
        where: { transferId: id, userId: user.id },
        data: { status: 'COMPLETED_INTERNAL' },
      })
      await tx.transaction.create({
        data: {
          reference: `${transfer.reference}-IN`,
          userId: user.id,
          accountId: destination.id,
          transferId: id,
          kind: 'INTERNAL_TRANSFER',
          description: `Transfer from ${source.name}`,
          amount,
          currency: source.currency,
          status: 'COMPLETED_INTERNAL',
        },
      })
    } else {
      const source = await tx.account.findFirst({ where: { id: transfer.sourceAccountId, userId: user.id } })
      if (!source || source.status !== 'OPEN') throw new HttpError(409, 'The source account is no longer available.')
      const debited = await tx.account.updateMany({
        where: {
          id: source.id,
          userId: user.id,
          status: 'OPEN',
          ledgerBalance: { gte: transfer.amount },
          reservedBalance: { gte: transfer.amount },
        },
        data: {
          ledgerBalance: { decrement: transfer.amount },
          reservedBalance: { decrement: transfer.amount },
        },
      })
      if (debited.count !== 1) throw new HttpError(409, 'The reserved demo balance is no longer available.')
      await tx.ledgerEntry.create({
        data: {
          operationKey: transfer.reference,
          ledgerCode: `ACCOUNT:${source.id}`,
          accountId: source.id,
          amount: transfer.amount.negated(),
          currency: source.currency,
          entryType: 'DEMO_TRANSFER_DEBIT',
          description: transfer.recipientName,
        },
      })
      await tx.transaction.updateMany({
        where: { transferId: id, userId: user.id },
        data: { status: 'RECORDED_DEMO_ONLY' },
      })
      await tx.notification.create({
        data: {
          userId: user.id,
          title: 'Demo transfer recorded',
          body: `${transfer.reference} was deducted from your available demo balance. No external transfer was sent.`,
        },
      })
    }
    if (transfer.kind === 'INTERNAL') {
      await tx.notification.create({
        data: {
          userId: user.id,
          title: 'Internal transfer confirmed',
          body: `${transfer.reference} was moved between your  accounts. `,
        },
      })
    }

    return tx.transfer.findUnique({ where: { id } })
  })
}
