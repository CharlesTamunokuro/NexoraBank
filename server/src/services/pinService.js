import bcrypt from 'bcryptjs'
import { prisma } from '../config/database.js'
import { HttpError } from '../utils/http.js'
import { validatePin } from './pinValidation.js'

export { validatePin } from './pinValidation.js'

export async function createTransactionPin(userId, pin, confirmation) {
  validatePin(pin)
  validatePin(confirmation)
  if (pin !== confirmation) throw new HttpError(400, 'PIN values do not match.')
  const pinHash = await bcrypt.hash(pin, 12)
  return pinHash
}

export async function verifyTransactionPin(userId, pin) {
  validatePin(pin)
  const record = await prisma.transactionPin.findUnique({ where: { userId } })
  if (!record) throw new HttpError(428, 'Create a transaction PIN in Settings before submitting a transfer.')
  if (record.lockedUntil && record.lockedUntil > new Date()) {
    throw new HttpError(429, 'Transaction PIN verification is temporarily locked. Try again later.')
  }

  const succeeded = await bcrypt.compare(pin, record.pinHash)
  await prisma.$transaction(async (tx) => {
    const updated = await tx.transactionPin.update({
      where: { userId },
      data: succeeded
        ? { failedAttempts: 0, lockedUntil: null }
        : { failedAttempts: { increment: 1 } },
    })
    if (!succeeded && updated.failedAttempts >= 5) {
      await tx.transactionPin.update({
        where: { userId },
        data: { lockedUntil: new Date(Date.now() + 15 * 60 * 1000) },
      })
    }
    await tx.pinAttempt.create({ data: { userId, succeeded } })
  })
  if (!succeeded) throw new HttpError(401, 'Transaction PIN is incorrect.')
}
