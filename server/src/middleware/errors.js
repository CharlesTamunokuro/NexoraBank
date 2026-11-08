import { Prisma } from '@prisma/client'
import { HttpError } from '../utils/http.js'

export function notFound(req, res) {
  res.status(404).json({ error: `No endpoint matches ${req.method} ${req.path}.` })
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error)
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    return res.status(409).json({ error: 'A record with those details already exists.' })
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
    return res.status(404).json({ error: 'The requested record was not found.' })
  }
  const status = error instanceof HttpError ? error.status : 500
  if (status >= 500) console.error(error)
  res.status(status).json({ error: status === 500 ? 'An unexpected server error occurred.' : error.message })
}
