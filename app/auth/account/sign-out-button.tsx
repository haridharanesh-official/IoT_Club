'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth/client'

export function SignOutButton() {
  const router = useRouter()
  const pending = useRef(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {
    if (pending.current) return
    pending.current = true
    setLoading(true)
    setError('')
    try {
      const result = await signOut()
      if (!result.ok) {
        setError(result.message)
      } else {
        router.replace('/login')
        router.refresh()
      }
    } finally {
      pending.current = false
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      {error && <p role="alert" className="text-xs text-rose-700">{error}</p>}
      <button type="button" onClick={handleSignOut} disabled={loading} className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition disabled:opacity-50">{loading ? 'Signing out...' : 'Sign Out'}</button>
    </div>
  )
}
