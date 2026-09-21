import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { syncSelfApplication } from '@/lib/integrations/google-sheets'

export const dynamic = 'force-dynamic'

/**
 * Scoped route for an authenticated student to trigger best-effort sync of their OWN application.
 *
 * Security:
 * - Requires active authenticated session (cookie or Bearer user token).
 * - Scoped strictly to the calling user's own application.
 * - Anonymous callers rejected with 401.
 * - Never processes or drains other applications.
 * - Safe for client-side fire-and-forget after registration submission.
 */
export async function POST(request: NextRequest) {
  try {
    let userId: string | null = null

    // 1. Try cookie session
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      userId = user.id
    }

    // 2. Fallback to Bearer user token if present
    if (!userId) {
      const authHeader = request.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.slice(7).trim()
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''
        const clientWithToken = createSupabaseClient(supabaseUrl, anonKey, {
          auth: { persistSession: false },
          global: { headers: { Authorization: `Bearer ${token}` } },
        })
        const { data: { user: jwtUser } } = await clientWithToken.auth.getUser(token)
        if (jwtUser) {
          userId = jwtUser.id
        }
      }
    }

    if (!userId) {
      return NextResponse.json(
        { ok: false, message: 'Unauthorized. Authentication required.' },
        { status: 401 }
      )
    }

    const result = await syncSelfApplication(userId)

    return NextResponse.json({
      ok: true,
      synced: result.success,
      registrationId: result.registrationId,
      error: result.error,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal error syncing self application'
    const sanitized = msg.replace(/(?:Bearer|token|secret|key|AIza)[^\s'"]+/gi, '[REDACTED]')

    return NextResponse.json(
      { ok: false, error: sanitized },
      { status: 500 }
    )
  }
}
