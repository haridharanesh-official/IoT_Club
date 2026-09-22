'use client'

import { useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { validatePassword } from '@/lib/auth/client'

export default function ResetPasswordPage() {
  const submitting = useRef(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current) return
    setError('')
    if (!validatePassword(password)) { setError('Use at least 8 characters with uppercase, lowercase, number, and special character.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    submitting.current = true
    try {
      const supabase = createClient()
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) { setError('This reset session has expired. Request another link.'); return }
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) { setError('Unable to update your password. Request another link or try again.'); return }
      setPassword('')
      setConfirm('')
      setDone(true)
    } catch { setError('Authentication is temporarily unavailable. Please try again.') }
    finally { submitting.current = false }
  }

  return <div className="min-h-[70vh] flex items-center justify-center p-4"><div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-5"><h1 className="text-2xl font-black text-slate-900">Choose a new password</h1>{done ? <><p role="status" className="text-xs text-emerald-700">Your password has been updated.</p><Link href="/auth/account" className="text-xs text-emerald-700 font-semibold">Go to your account</Link></> : <><form onSubmit={submit} className="space-y-4"><label className="block text-xs font-semibold text-slate-700">New password<input type="password" autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} required className="block w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900" /></label><label className="block text-xs font-semibold text-slate-700">Confirm password<input type="password" autoComplete="new-password" value={confirm} onChange={event => setConfirm(event.target.value)} required className="block w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900" /></label><button className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs">Update password</button></form>{error && <p role="alert" className="text-xs text-rose-700">{error}</p>}</>}</div></div>
}
