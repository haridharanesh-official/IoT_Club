import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient, type User } from '@supabase/supabase-js'
import { drainGoogleSheetsOutbox } from '@/lib/integrations/google-sheets'

export const dynamic = 'force-dynamic'

function getServiceRoleKey(): string | undefined {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) return process.env.SUPABASE_SERVICE_ROLE_KEY
  try {
    const { existsSync, readFileSync } = require('node:fs')
    if (existsSync('.env.local')) {
      const match = readFileSync('.env.local', 'utf8').match(/^SUPABASE_SERVICE_ROLE_KEY=(.*)$/m)
      if (match) return match[1].trim().replace(/^['"]|['"]$/g, '')
    }
  } catch {
    // ignore
  }
  return undefined
}

/**
 * Internal protected route for triggering Google Sheets outbox drain.
 *
 * Hardened Authorization Rules:
 * - Allowed callers:
 *   1. Valid internal server secret:
 *      Header 'x-internal-secret' matching SUPABASE_SERVICE_ROLE_KEY.
 *      OR 'Authorization: Bearer <secret>' matching SUPABASE_SERVICE_ROLE_KEY.
 *   2. Authenticated user with role ADMIN or SUPER_ADMIN in public.profiles.
 * - Denied callers:
 *   - Anonymous callers without credentials -> 401 Unauthorized.
 *   - Authenticated users with role STUDENT or TEACHER -> 403 Forbidden.
 *   - Invalid internal secret -> 403 Forbidden.
 */
export async function POST(request: NextRequest) {
  try {
    const internalSecret = request.headers.get('x-internal-secret')
    const authHeader = request.headers.get('authorization')
    const serviceRoleKey = getServiceRoleKey()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''

    let authorized = false
    let callerUser: User | null = null

    // 1. Check explicit internal secret header
    if (internalSecret) {
      if (serviceRoleKey && internalSecret === serviceRoleKey) {
        authorized = true
      } else {
        return NextResponse.json(
          { ok: false, message: 'Forbidden. Invalid internal secret.' },
          { status: 403 }
        )
      }
    } else if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim()
      if (serviceRoleKey && token === serviceRoleKey) {
        authorized = true
      } else {
        // Token may be a user JWT access token
        const clientWithToken = createSupabaseClient(supabaseUrl, anonKey, {
          auth: { persistSession: false },
          global: { headers: { Authorization: `Bearer ${token}` } },
        })
        const { data: { user } } = await clientWithToken.auth.getUser(token)
        if (user) {
          callerUser = user
        } else {
          return NextResponse.json(
            { ok: false, message: 'Forbidden. Invalid authorization token.' },
            { status: 403 }
          )
        }
      }
    }

    // 2. Check session if not yet authorized by server secret
    if (!authorized) {
      if (!callerUser) {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        callerUser = user
      }

      if (!callerUser) {
        return NextResponse.json(
          { ok: false, message: 'Unauthorized. Authentication required.' },
          { status: 401 }
        )
      }

      // Check role in profiles
      const adminClient = createSupabaseClient(supabaseUrl, serviceRoleKey || anonKey, {
        auth: { persistSession: false },
      })
      const { data: profile } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', callerUser.id)
        .single()

      if (profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN') {
        authorized = true
      } else {
        return NextResponse.json(
          { ok: false, message: 'Forbidden. Administrator privileges required.' },
          { status: 403 }
        )
      }
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
