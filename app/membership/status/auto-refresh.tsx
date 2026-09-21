'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

interface AutoRefreshProps {
  initialStatus: string
}

/**
 * Lightweight client component that polls while the student's status is PENDING.
 * When the status changes in PostgreSQL (e.g. admin approves or rejects),
 * it triggers router.refresh(), causing the server component to re-render
 * or redirect to /dashboard.
 */
export function MembershipStatusAutoRefresh({ initialStatus }: AutoRefreshProps) {
  const router = useRouter()

  useEffect(() => {
    if (initialStatus !== 'PENDING') return

    const supabase = createClient()

    const intervalId = setInterval(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: app } = await supabase
          .from('membership_applications')
          .select('status')
          .eq('user_id', user.id)
          .maybeSingle()

        if (app && app.status !== 'PENDING') {
          router.refresh()
        }
      } catch {
        // Suppress transient polling errors
      }
    }, 10000)

    return () => clearInterval(intervalId)
  }, [initialStatus, router])

  return null
}
