import assert from 'node:assert/strict'
import test from 'node:test'
import { validatePin } from './pinValidation.js'

test('accepts four- and six-digit transaction PINs', () => {
  assert.doesNotThrow(() => validatePin('1234'))
  assert.doesNotThrow(() => validatePin('123456'))
})

test('rejects transaction PINs with unsupported lengths or characters', () => {
  for (const pin of ['123', '12345', '1234567', '12a4', '', null]) {
    assert.throws(() => validatePin(pin), { status: 400 })
  }
})
