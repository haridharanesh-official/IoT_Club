import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { drainGoogleSheetsOutbox } from '@/lib/integrations/google-sheets'

export const dynamic = 'force-dynamic'

/**
 * Internal protected route for triggering Google Sheets outbox drain.
 *
 * Security:
 * - Requires either:
 *   1. An active authenticated user session (e.g. admin reviewing application or student registering)
 *   2. An authorized internal header (x-internal-secret or Bearer token matching SUPABASE_SERVICE_ROLE_KEY)
 * - Anonymous / unauthenticated callers are rejected with 401.
 * - Never returns service keys or credentials to caller.
 */
export async function POST(request: NextRequest) {
  try {
    const internalSecret = request.headers.get('x-internal-secret')
    const authHeader = request.headers.get('authorization')
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    let authorized = false

    if (serviceRoleKey && (internalSecret === serviceRoleKey || authHeader === `Bearer ${serviceRoleKey}`)) {
      authorized = true
    }

    if (!authorized) {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        authorized = true
      }
    }

    if (!authorized) {
      return NextResponse.json(
        { ok: false, message: 'Unauthorized. Authentication required.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const rawBatch = searchParams.get('batchSize')
    const batchSize = rawBatch ? Math.min(Math.max(parseInt(rawBatch, 10) || 10, 1), 50) : 10

    const summary = await drainGoogleSheetsOutbox(batchSize)

    return NextResponse.json({
      ok: true,
      totalProcessed: summary.totalProcessed,
      succeeded: summary.succeeded,
      failed: summary.failed,
      error: summary.error,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal error processing outbox'
    const sanitized = msg.replace(/(?:Bearer|token|secret|key|AIza)[^\s'"]+/gi, '[REDACTED]')

    return NextResponse.json(
      { ok: false, error: sanitized },
      { status: 500 }
    )
  }
}
