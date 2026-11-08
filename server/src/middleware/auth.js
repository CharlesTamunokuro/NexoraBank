import jwt from 'jsonwebtoken'
import { config } from '../config/env.js'
import { prisma } from '../config/database.js'
import { HttpError } from '../utils/http.js'

export const SESSION_COOKIE = 'nexora_session'
export const CSRF_COOKIE = 'nexora_csrf'

export function cookieOptions() {
  return {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'strict',
    path: '/',
  }
}

export function issueSession(res, subject, kind) {
  const token = jwt.sign({ sub: subject.id, kind }, config.jwtSecret, { expiresIn: '8h' })
  res.cookie(SESSION_COOKIE, token, { ...cookieOptions(), maxAge: 8 * 60 * 60 * 1000 })
}

export async function requireSession(req, res, next) {
  try {
    const token = req.cookies[SESSION_COOKIE]
    if (!token) throw new HttpError(401, 'Sign in is required.')
    const payload = jwt.verify(token, config.jwtSecret)
    if (!payload || typeof payload !== 'object' || typeof payload.sub !== 'string') {
      throw new HttpError(401, 'Your session is invalid or expired.')
    }

    if (payload.kind === 'customer') {
      const user = await prisma.user.findUnique({ where: { id: payload.sub } })
      if (!user || !['ACTIVE', 'RESTRICTED'].includes(user.status)) throw new HttpError(403, 'This customer account is not active.')
      req.user = user
      req.sessionKind = 'customer'
    } else if (payload.kind === 'admin') {
      const admin = await prisma.admin.findUnique({ where: { id: payload.sub } })
      if (!admin || !admin.active) throw new HttpError(403, 'This administrator account is not active.')
      req.user = admin
      req.sessionKind = 'admin'
    } else {
      throw new HttpError(401, 'Your session is invalid or expired.')
    }
    next()
  } catch (error) {
    next(error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError
      ? new HttpError(401, 'Your session is invalid or expired.')
      : error)
  }
}

export function requireCustomer(req, res, next) {
  if (req.sessionKind !== 'customer') return next(new HttpError(403, 'Customer access is required.'))
  next()
}

export function requireAdmin(req, res, next) {
  if (req.sessionKind !== 'admin') return next(new HttpError(403, 'Administrator access is required.'))
  next()
}

export function requireAdminRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return next(new HttpError(403, 'Your administrator role cannot perform this action.'))
    next()
  }
}

export function requireCsrf(req, res, next) {
  const cookie = req.cookies[CSRF_COOKIE]
  const header = req.get('x-csrf-token')
  if (!cookie || !header || cookie !== header) return next(new HttpError(403, 'CSRF validation failed. Refresh the page and try again.'))
  next()
}
