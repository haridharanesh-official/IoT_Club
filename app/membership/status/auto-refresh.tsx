'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

interface AutoRefreshProps {
  initialStatus: string
}

export function MembershipStatusAutoRefresh({
  initialStatus,
}: AutoRefreshProps) {
  const router = useRouter()

  useEffect(() => {
    if (initialStatus !== 'PENDING') return

    const supabase = createClient()
    let cancelled = false

    // A registration can be safely persisted in Supabase even when the
    // Google Sheets mirror is temporarily unavailable. Retry the scoped
    // self-sync whenever a pending member visits this status page.
    void fetch('/api/internal/google-sheets/sync/self', {
      method: 'POST',
      cache: 'no-store',
    })
      .then(async (response) => {
        if (response.ok || cancelled) return

        let error = `Google Sheets retry failed with HTTP ${response.status}`

        try {
          const payload = await response.json()
          if (payload?.error) error = payload.error
        } catch {
          // Keep the HTTP status fallback.
        }

        console.error('[membership-status] Google Sheets retry failed:', error)
      })
      .catch((error) => {
        if (!cancelled) {
          console.error(
            '[membership-status] Google Sheets retry request failed:',
            error
          )
        }
      })

    const intervalId = setInterval(async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

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
        // Suppress transient polling errors.
      }
    }, 10000)

    return () => {
      cancelled = true
      clearInterval(intervalId)
    }
  }, [initialStatus, router])

  return null
}
