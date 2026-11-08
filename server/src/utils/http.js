export class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

export function asyncRoute(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next)
}

export function requiredText(value, label, maxLength = 200) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > maxLength) {
    throw new HttpError(400, `${label} is required and must be at most ${maxLength} characters.`)
  }
  return value.trim()
}

export function moneyAmount(value, label = 'Amount') {
  if (typeof value !== 'string' && typeof value !== 'number') {
    throw new HttpError(400, `${label} must be a positive amount.`)
  }
  const amount = String(value).trim()
  if (!/^(?:0|[1-9]\d{0,14})(?:\.\d{1,2})?$/.test(amount) || Number(amount) <= 0) {
    throw new HttpError(400, `${label} must be a positive amount with at most two decimal places.`)
  }
  return amount
}

export function publicUser(user) {
  return {
    id: user.id,
    customerNumber: user.customerNumber,
    firstName: user.firstName,
    middleName: user.middleName,
    lastName: user.lastName,
    name: [user.firstName, user.middleName, user.lastName].filter(Boolean).join(' '),
    email: user.email,
    phone: user.phone,
    address: user.address,
    apartment: user.apartment,
    city: user.city,
    state: user.state,
    postalCode: user.postalCode,
    country: user.country,
    citizenship: user.citizenship,
    employment: user.employment,
    occupation: user.occupation,
    incomeRange: user.incomeRange,
    accountPurpose: user.accountPurpose,
    status: user.status,
    verificationStatus: user.verificationStatus,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
  }
}
