'use client'

import { useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertCircle, ArrowRight, Cpu, Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { ACCOUNT_PATH, signIn, signUp } from '@/lib/auth/client'

export default function LoginPage() {
  const router = useRouter()
  const submitting = useRef(false)
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting.current) return
    submitting.current = true
    setIsLoading(true)
    setError('')
    setNotice('')
    try {
      const result = activeTab === 'login' ? await signIn(email, password) : await signUp(email, password)
      setPassword('')
      if (!result.ok) {
        setError(result.message)
      } else if (result.needsConfirmation) {
        setNotice('Check your email to confirm your account, then sign in. Local test email appears in Mailpit.')
      } else {
        router.replace(ACCOUNT_PATH)
        router.refresh()
      }
    } finally {
      submitting.current = false
      setIsLoading(false)
    }
  }

  const switchTab = (tab: 'login' | 'register') => {
    setActiveTab(tab)
    setPassword('')
    setError('')
    setNotice('')
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-xl w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20"><Cpu className="w-6 h-6" /></div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Sri Shakthi IoT Club Portal</h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">Sign in or create an account. Club registration and membership are separate steps.</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
          <div className="flex border-b border-slate-100 bg-slate-50/70 p-1.5 gap-1 text-xs font-bold">
            <button type="button" onClick={() => switchTab('login')} className={`flex-1 py-2.5 rounded-xl transition cursor-pointer ${activeTab === 'login' ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-500 hover:text-slate-900'}`}>Sign In with Email</button>
            <button type="button" onClick={() => switchTab('register')} className={`flex-1 py-2.5 rounded-xl transition cursor-pointer ${activeTab === 'register' ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-500 hover:text-slate-900'}`}>Create Account</button>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <form onSubmit={submit} noValidate className="space-y-4 text-xs">
              {error && <div role="alert" className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2"><AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" /><span>{error}</span></div>}
              {notice && <div role="status" className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">{notice}</div>}

              <div>
                <label htmlFor="auth-email" className="block text-slate-700 font-semibold mb-1">Email Address *</label>
                <div className="relative"><Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" /><input id="auth-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="your.name@example.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium" /></div>
              </div>

              <div>
                <label htmlFor="auth-password" className="block text-slate-700 font-semibold mb-1">Password *</label>
                <div className="relative"><Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" /><input id="auth-password" type={showPassword ? 'text' : 'password'} autoComplete={activeTab === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(event) => setPassword(event.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-10 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium" /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-3 text-slate-400 hover:text-slate-700">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div>
                {activeTab === 'register' && <p className="text-[10px] text-slate-500 mt-1">At least 8 characters with uppercase, lowercase, number, and special character.</p>}
              </div>

              <button type="submit" disabled={isLoading} className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"><span>{isLoading ? 'Please wait...' : activeTab === 'login' ? 'Sign In' : 'Create Account'}</span><ArrowRight className="w-4 h-4" /></button>
            </form>
          </div>
        </div>

        <div className="text-center"><Link href="/" className="text-xs text-slate-500 hover:text-emerald-700 font-medium transition">← Back to Public Website</Link></div>
      </div>
    </div>
  )
}
