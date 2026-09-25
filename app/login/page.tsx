'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertCircle, ArrowRight, Cpu, Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { ACCOUNT_PATH, signIn, signInWithGoogle } from '@/lib/auth/client'

export default function LoginPage() {
  const router = useRouter()
  const submitting = useRef(false)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [linkError, setLinkError] = useState(false)

  useEffect(() => {
    setLinkError(new URLSearchParams(window.location.search).has('auth_error'))
  }, [])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting.current) return
    submitting.current = true
    setIsLoading(true)
    setError('')
    setNotice('')
    try {
      const result = await signIn(email, password)
      setPassword('')
      if (!result.ok) {
        setError(result.message)
      } else {
        router.replace(ACCOUNT_PATH)
        router.refresh()
      }
    } finally {
      submitting.current = false
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    setError('')
    try {
      const nextTarget = new URLSearchParams(window.location.search).get('next') || ACCOUNT_PATH
      const result = await signInWithGoogle(nextTarget)
      if (!result.ok) {
        setError(result.message)
        setIsGoogleLoading(false)
      }
    } catch {
      setError('Unable to initiate Google sign-in. Please try again.')
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-xl w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
            <Cpu className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Sri Shakthi IoT Club Portal</h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">Sign in with the email used for your IoT Club account.</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/70 py-3 px-6 text-xs font-bold text-slate-700">
            Sign In
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Google OAuth Option */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isLoading}
              className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100/80 text-slate-700 font-semibold text-xs shadow-xs transition flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[10px] text-slate-400 uppercase font-mono tracking-wider shrink-0">
                or continue with email
              </span>
              <div className="border-t border-slate-200 w-full" />
            </div>

            <form onSubmit={submit} noValidate className="space-y-4 text-xs">
              {(error || linkError) && (
                <div role="alert" className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{error || 'This authentication link is invalid or expired. Please request a new one.'}</span>
                </div>
              )}
              {notice && (
                <div role="status" className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                  {notice}
                </div>
              )}

              <div>
                <label htmlFor="auth-email" className="block text-slate-700 font-semibold mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    id="auth-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="auth-password" className="block text-slate-700 font-semibold mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-10 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? 'Signing in...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-1">
                <Link href="/forgot-password" className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold">
                  Forgot password?
                </Link>
              </div>
            </form>

            {/* New Student Registration Route */}
            <div className="pt-6 border-t border-slate-100 text-center space-y-3">
              <p className="text-xs text-slate-500 font-medium">New Student?</p>
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs shadow-xs transition cursor-pointer"
              >
                <span>Start Full Registration</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="text-xs text-slate-500 hover:text-emerald-700 font-medium transition">
            ← Back to Public Website
          </Link>
        </div>
      </div>
    </div>
  )
}
