import { createClient } from '../../utils/supabase/client'

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

export type AuthResult = { ok: true; needsConfirmation?: boolean } | { ok: false; message: string }

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
      if (process.env.NODE_ENV === 'development') {
        console.error('Supabase signup failed:', { message: error.message, status: error.status, code: error.code })
      }
      if (error.status === 0) return { ok: false, message: 'Authentication is temporarily unavailable. Please try again.' }
      if (error.code === 'user_already_exists' || error.message.toLowerCase().includes('already registered')) {
        return { ok: false, message: 'An account already exists with this email. Please log in instead.' }
      }
      if (error.code === 'email_address_invalid' || error.message.toLowerCase().includes('invalid email')) return { ok: false, message: 'Enter a valid email address.' }
      if (error.code === 'weak_password' || error.message.toLowerCase().includes('password')) return { ok: false, message: error.message }
      if (error.status === 429 || error.code === 'over_email_send_rate_limit' || error.message.toLowerCase().includes('rate limit')) return { ok: false, message: 'Too many attempts. Please wait and try again.' }
      return { ok: false, message: 'Unable to create an account. Please try again.' }
    }
    // Supabase may deliberately return an empty identities array for an
    // existing confirmed user to avoid leaking account existence.
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      return { ok: false, message: 'An account already exists with this email. Please log in instead.' }
    }
    return { ok: true, needsConfirmation: !data.session }
  } catch {
    return { ok: false, message: 'Authentication is temporarily unavailable. Please try again.' }
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
