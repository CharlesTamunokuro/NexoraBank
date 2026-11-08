import { HttpError } from '../utils/http.js'

export function validatePin(pin) {
  if (typeof pin !== 'string' || !/^(?:\d{4}|\d{6})$/.test(pin)) {
    throw new HttpError(400, 'Transaction PIN must contain four or six digits.')
  }
}
