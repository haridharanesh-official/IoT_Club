import { describe, expect, it } from 'vitest'
import { validateEmail, validatePassword } from '../../lib/auth/client'

describe('authentication validation', () => {
  it('accepts valid account emails', () => {
    expect(validateEmail('student@example.com')).toBe(true)
    expect(validateEmail('  STUDENT@EXAMPLE.COM ')).toBe(true)
  })

  it('rejects malformed email addresses', () => {
    expect(validateEmail('student@')).toBe(false)
    expect(validateEmail('not-an-email')).toBe(false)
  })

  it('enforces the shared password policy', () => {
    expect(validatePassword('Strong#1')).toBe(true)
    expect(validatePassword('lowercase#1')).toBe(false)
    expect(validatePassword('UPPERCASE#1')).toBe(false)
    expect(validatePassword('NoNumber#')).toBe(false)
    expect(validatePassword('NoSpecial1')).toBe(false)
    expect(validatePassword('Sh0rt!')).toBe(false)
  })
})
