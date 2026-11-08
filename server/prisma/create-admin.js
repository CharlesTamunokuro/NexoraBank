import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME = 'Administrator' } = process.env

if (!ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 16) {
  throw new Error('Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 16 characters in server/.env.')
}

try {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12)
  await prisma.admin.upsert({
    where: { email: ADMIN_EMAIL.toLowerCase() },
    update: { passwordHash, displayName: ADMIN_NAME, active: true },
    create: { email: ADMIN_EMAIL.toLowerCase(), passwordHash, displayName: ADMIN_NAME, role: 'SUPER_ADMIN' },
  })
  console.log(`administrator ready: ${ADMIN_EMAIL}`)
} finally {
  await prisma.$disconnect()
}
