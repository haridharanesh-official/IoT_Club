import assert from 'node:assert/strict'
import test from 'node:test'
import {
  AUTH_NETWORK_ERROR_MESSAGE,
  classifySignupAuthError,
} from '../lib/auth/signup-errors.ts'

test('classifies a returned network-style Auth failure', () => {
  assert.deepEqual(classifySignupAuthError({ status: 0, message: 'Failed to fetch' }), {
    ok: false,
    reason: 'NETWORK_FAILURE',
    message: AUTH_NETWORK_ERROR_MESSAGE,
  })
})

test('maps known Supabase Auth errors without exposing internal details', () => {
  assert.equal(classifySignupAuthError({ code: 'user_already_exists', message: 'internal duplicate detail' }).reason, 'DUPLICATE_ACCOUNT')
  assert.equal(classifySignupAuthError({ code: 'email_address_invalid', message: 'internal email detail' }).message, 'Enter a valid email address.')
  assert.equal(classifySignupAuthError({ code: 'weak_password', message: 'internal policy detail' }).message, 'Your password does not meet the security requirements.')
  assert.equal(classifySignupAuthError({ status: 429, message: 'internal limiter detail' }).reason, 'RATE_LIMITED')
  assert.equal(classifySignupAuthError({ code: 'signup_disabled', message: 'internal configuration detail' }).reason, 'SIGNUP_DISABLED')
})

test('uses a safe generic message for an unknown returned Auth error', () => {
  assert.deepEqual(classifySignupAuthError({ status: 500, code: 'unexpected_failure', message: 'sensitive internal detail' }), {
    ok: false,
    reason: 'AUTH_ERROR',
    message: 'Unable to create an account. Please try again.',
  })
})
