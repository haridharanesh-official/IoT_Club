'use client'

import { useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { normalizeEmail, validateEmail } from '@/lib/auth/client'

export default function ForgotPasswordPage() {
  const submitting = useRef(false)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current) return
    setError('')
    setMessage('')
    if (!validateEmail(email)) { setError('Enter a valid email address.'); return }
    submitting.current = true
    try {
      const { error: requestError } = await createClient().auth.resetPasswordForEmail(normalizeEmail(email))
      if (requestError?.status === 0) setError('Authentication is temporarily unavailable. Please try again.')
      else setMessage('If this account exists, a password reset link has been sent. Please check your inbox.')
    } catch {
      setError('Authentication is temporarily unavailable. Please try again.')
    } finally { submitting.current = false }
  }

  return <div className="min-h-[70vh] flex items-center justify-center p-4"><div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-5"><h1 className="text-2xl font-black text-slate-900">Reset your password</h1><p className="text-xs text-slate-600">Enter your account email and check your inbox for a reset link.</p><form onSubmit={submit} className="space-y-4"><label className="block text-xs font-semibold text-slate-700">Email address<input type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} className="block w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900" /></label><button className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs">Send reset link</button></form>{error && <p role="alert" className="text-xs text-rose-700">{error}</p>}{message && <p role="status" className="text-xs text-emerald-700">{message}</p>}<Link href="/login" className="block text-xs text-emerald-700 font-semibold">Back to sign in</Link></div></div>
}
