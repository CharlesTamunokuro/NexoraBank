import bcrypt from 'bcryptjs'
import { randomInt, randomUUID } from 'node:crypto'
import { prisma } from '../config/database.js'
import { HttpError, requiredText } from '../utils/http.js'

function accountNumber() {
  return `9${Array.from({ length: 11 }, () => randomInt(0, 10)).join('')}`
}

async function uniqueAccountNumber(tx) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const number = accountNumber()
    const exists = await tx.account.findUnique({ where: { accountNumber: number }, select: { id: true } })
    if (!exists) return number
  }
  throw new HttpError(503, 'Could not generate an account number. Please try again.')
}

export async function registerCustomer(input) {
  const email = requiredText(input.email, 'Email', 254).toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, 'Enter a valid email address.')
  if (typeof input.password !== 'string' || input.password.length < 12 || input.password.length > 128) {
    throw new HttpError(400, 'Password must be between 12 and 128 characters.')
  }
  const dateOfBirth = new Date(input.dateOfBirth)
  if (!input.dateOfBirth || Number.isNaN(dateOfBirth.getTime())) throw new HttpError(400, 'A valid date of birth is required.')
  const cutoff = new Date()
  cutoff.setFullYear(cutoff.getFullYear() - 18)
  if (dateOfBirth > cutoff) throw new HttpError(400, 'Customers must be at least 18 years old.')
  const firstName = requiredText(input.firstName, 'First name', 80)
  const lastName = requiredText(input.lastName, 'Last name', 80)
  const phone = requiredText(input.phone, 'Phone number', 40)
  const passwordHash = await bcrypt.hash(input.password, 12)

  return prisma.$transaction(async (tx) => {
    if (await tx.user.findUnique({ where: { email }, select: { id: true } })) {
      throw new HttpError(409, 'An account with this email already exists.')
    }
    const user = await tx.user.create({
      data: {
        customerNumber: `NX-${randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase()}`,
        firstName,
        middleName: input.middleName?.trim() || null,
        lastName,
        email,
        phone,
        passwordHash,
        dateOfBirth,
        address: input.address?.trim() || null,
        apartment: input.apartment?.trim() || null,
        city: input.city?.trim() || null,
        state: input.state?.trim() || null,
        postalCode: input.zip?.trim() || null,
        country: 'United States',
        citizenship: input.citizenship?.trim() || null,
        employment: input.employment?.trim() || null,
        occupation: input.occupation?.trim() || null,
        incomeRange: input.income?.trim() || null,
        accountPurpose: input.accountPurpose?.trim() || null,
        accounts: {
          create: {
            accountNumber: await uniqueAccountNumber(tx),
            name: 'Everyday Checking',
            type: 'Checking',
            currency: 'USD',
            ledgerBalance: '0.00',
          },
        },
        notifications: {
          create: { title: 'profile created', body: 'Your profile was created with a zero-balance account.' },
        },
      },
      include: { accounts: true },
    })
    return user
  })
}
