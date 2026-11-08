const API_ROOT = import.meta.env.VITE_API_URL || '/api'

let csrfToken

async function getCsrfToken() {
  if (csrfToken) return csrfToken
  const response = await fetch(`${API_ROOT}/auth/csrf`, { credentials: 'include' })
  const body = await response.json()
  if (!response.ok) throw new Error(body.error || 'Could not start a secure session.')
  csrfToken = body.csrfToken
  return csrfToken
}

export async function apiRequest(path, { method = 'GET', body, headers = {} } = {}) {
  const options = { method, credentials: 'include', headers: { ...headers } }
  if (body !== undefined) {
    options.headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(body)
  }
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase())) {
    options.headers['x-csrf-token'] = await getCsrfToken()
  }

  const response = await fetch(`${API_ROOT}${path}`, options)
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    if (response.status === 403 && String(payload.error).includes('CSRF')) csrfToken = undefined
    const error = new Error(payload.error || `Request failed (${response.status}).`)
    error.status = response.status
    throw error
  }
  return payload
}
