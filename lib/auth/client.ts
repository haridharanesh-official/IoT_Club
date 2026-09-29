import { createClient } from '../../utils/supabase/client'
import {
  AUTH_NETWORK_ERROR_MESSAGE,
  classifySignupAuthError,
  type AuthErrorLike,
  type AuthFailureReason,
} from './signup-errors'

export { AUTH_NETWORK_ERROR_MESSAGE, classifySignupAuthError } from './signup-errors'

export const ACCOUNT_PATH = '/auth/account'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function validateEmail(email: string) {
  return emailPattern.test(normalizeEmail(email))
}

export function validatePassword(password: string) {
  return password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password)
}

export type AuthResult =
  | { ok: true; needsConfirmation?: boolean }
  | { ok: false; message: string; reason?: AuthFailureReason }

function logSignupFailure(error: unknown, failureType: 'AUTH_ERROR' | 'NETWORK_FAILURE') {
  if (process.env.NODE_ENV !== 'development') return
  const candidate = error && typeof error === 'object' ? error as AuthErrorLike : {}
  console.error('Supabase signup failed:', {
    failureType,
    name: candidate.name || 'UnknownError',
    message: candidate.message || String(error),
    status: candidate.status,
    code: candidate.code,
    navigatorOnline: typeof navigator !== 'undefined' ? navigator.onLine : undefined,
  })
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const cleanEmail = normalizeEmail(email)
  if (!validateEmail(cleanEmail)) return { ok: false, message: 'Enter a valid email address.' }
  if (!password) return { ok: false, message: 'Enter your password.' }

  try {
    const { error } = await createClient().auth.signInWithPassword({ email: cleanEmail, password })
    if (error?.status === 0) return { ok: false, message: 'Authentication is temporarily unavailable. Please try again.' }
    if (error) return { ok: false, message: 'Unable to sign in. Check your email and password, or confirm your email if required.' }
    return { ok: true }
  } catch {
    return { ok: false, message: 'Authentication is temporarily unavailable. Please try again.' }
  }
}

export async function signUp(email: string, password: string): Promise<AuthResult> {
  const cleanEmail = normalizeEmail(email)
  if (!validateEmail(cleanEmail)) return { ok: false, message: 'Enter a valid email address.' }
  if (!validatePassword(password)) {
    return { ok: false, message: 'Use at least 8 characters including lowercase, uppercase, a number, and a symbol.' }
  }

  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
    const emailRedirectTo = new URL('/auth/confirm', origin).toString()
    const { data, error } = await createClient().auth.signUp({ email: cleanEmail, password, options: { emailRedirectTo } })
    if (error) {
      const result = classifySignupAuthError(error)
      logSignupFailure(error, result.reason === 'NETWORK_FAILURE' ? 'NETWORK_FAILURE' : 'AUTH_ERROR')
      return result
    }
    // Supabase may deliberately return an empty identities array for an
    // existing confirmed user to avoid leaking account existence.
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      return { ok: false, reason: 'DUPLICATE_ACCOUNT', message: 'An account already exists with this email. Please log in instead.' }
    }
    return { ok: true, needsConfirmation: !data.session }
  } catch (error) {
    logSignupFailure(error, 'NETWORK_FAILURE')
    return { ok: false, reason: 'NETWORK_FAILURE', message: AUTH_NETWORK_ERROR_MESSAGE }
  }
}

export async function signOut(): Promise<AuthResult> {
  try {
    const { error } = await createClient().auth.signOut()
    if (error) return { ok: false, message: 'Unable to sign out. Please try again.' }
    return { ok: true }
  } catch {
    return { ok: false, message: 'Authentication is temporarily unavailable. Please try again.' }
  }
}

export function sanitizeInternalRedirect(path: string | null | undefined, fallback = '/auth/account'): string {
  if (!path) return fallback
  // Must start with '/' and must not start with '//' or contain backslashes
  if (path.startsWith('/') && !path.startsWith('//') && !path.includes('\\')) {
    return path
  }
  return fallback
}

export async function signInWithGoogle(redirectTo?: string): Promise<AuthResult> {
  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
    const callbackUrl = new URL('/auth/callback', origin)
    if (redirectTo) {
      callbackUrl.searchParams.set('next', sanitizeInternalRedirect(redirectTo))
    }
    const { error } = await createClient().auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl.toString(),
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
    if (error) {
      if (error.status === 0) return { ok: false, message: 'Google authentication is temporarily unavailable. Please try again.' }
      return { ok: false, message: error.message }
    }
    return { ok: true }
  } catch {
    return { ok: false, message: 'Google authentication is temporarily unavailable. Please try again.' }
  }
}
