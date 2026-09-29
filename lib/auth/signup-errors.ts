export const AUTH_NETWORK_ERROR_MESSAGE = "We couldn't reach the authentication service. Check your internet connection, VPN, ad blocker, or privacy extensions and try again."

export type AuthFailureReason =
  | 'NETWORK_FAILURE'
  | 'DUPLICATE_ACCOUNT'
  | 'INVALID_EMAIL'
  | 'WEAK_PASSWORD'
  | 'RATE_LIMITED'
  | 'SIGNUP_DISABLED'
  | 'AUTH_ERROR'

export type SignupFailure = { ok: false; message: string; reason: AuthFailureReason }

export type AuthErrorLike = { name?: string; message?: string; status?: number; code?: string }

export function classifySignupAuthError(error: AuthErrorLike): SignupFailure {
  const message = error.message || ''
  const normalizedMessage = message.toLowerCase()

  if (error.status === 0) return { ok: false, reason: 'NETWORK_FAILURE', message: AUTH_NETWORK_ERROR_MESSAGE }
  if (error.code === 'user_already_exists' || normalizedMessage.includes('already registered')) {
    return { ok: false, reason: 'DUPLICATE_ACCOUNT', message: 'An account already exists with this email. Please log in instead.' }
  }
  if (error.code === 'email_address_invalid' || normalizedMessage.includes('invalid email')) {
    return { ok: false, reason: 'INVALID_EMAIL', message: 'Enter a valid email address.' }
  }
  if (error.code === 'weak_password' || normalizedMessage.includes('password')) {
    return { ok: false, reason: 'WEAK_PASSWORD', message: 'Your password does not meet the security requirements.' }
  }
  if (error.status === 429 || error.code === 'over_email_send_rate_limit' || normalizedMessage.includes('rate limit')) {
    return { ok: false, reason: 'RATE_LIMITED', message: 'Too many attempts. Please wait a moment and try again.' }
  }
  if (error.code === 'signup_disabled' || normalizedMessage.includes('signups not allowed') || normalizedMessage.includes('signup is disabled')) {
    return { ok: false, reason: 'SIGNUP_DISABLED', message: 'Account registration is currently unavailable. Please try again later.' }
  }
  return { ok: false, reason: 'AUTH_ERROR', message: 'Unable to create an account. Please try again.' }
}
