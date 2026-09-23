import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { syncSelfApplication } from '@/lib/integrations/google-sheets'

export const dynamic = 'force-dynamic'

function getServiceRoleKey(): string | undefined {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return process.env.SUPABASE_SERVICE_ROLE_KEY
  }

  try {
    const { existsSync, readFileSync } = require('node:fs')
    if (existsSync('.env.local')) {
      const match = readFileSync('.env.local', 'utf8').match(
        /^SUPABASE_SERVICE_ROLE_KEY=(.*)$/m
      )
      if (match) {
        return match[1].trim().replace(/^['"]|['"]$/g, '')
      }
    }
  } catch {
    // ignore
  }

  return undefined
}

export async function POST(request: NextRequest) {
  try {
    const internalSecret = request.headers.get('x-internal-secret')
    const authHeader = request.headers.get('authorization')
    const serviceRoleKey = getServiceRoleKey()

    if (serviceRoleKey) {
      if (internalSecret && internalSecret === serviceRoleKey) {
        return NextResponse.json(
          {
            ok: false,
            message: 'Forbidden. Service role key is not permitted.',
          },
          { status: 403 }
        )
      }

      if (
        authHeader &&
        (authHeader === `Bearer ${serviceRoleKey}` ||
          authHeader.slice(7).trim() === serviceRoleKey)
      ) {
        return NextResponse.json(
          {
            ok: false,
            message: 'Forbidden. Service role key is not permitted.',
          },
          { status: 403 }
        )
      }
    }

    let userId: string | null = null

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      userId = user.id
    }

    if (!userId && authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim()
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      const anonKey =
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''

      const clientWithToken = createSupabaseClient(
        supabaseUrl,
        anonKey,
        {
          auth: { persistSession: false },
          global: {
            headers: { Authorization: `Bearer ${token}` },
          },
        }
      )

      const {
        data: { user: jwtUser },
      } = await clientWithToken.auth.getUser(token)

      if (jwtUser) {
        userId = jwtUser.id
      }
    }

    if (!userId) {
      return NextResponse.json(
        {
          ok: false,
          message: 'Unauthorized. Authentication required.',
        },
        { status: 401 }
      )
    }

    const result = await syncSelfApplication(userId)

    if (!result.success) {
      console.error('[google-sheets/self-sync] failed', {
        registrationId: result.registrationId,
        error: result.error,
      })

      return NextResponse.json(
        {
          ok: false,
          synced: false,
          registrationId: result.registrationId,
          error: result.error,
        },
        { status: 502 }
      )
    }

    return NextResponse.json({
      ok: true,
      synced: true,
      registrationId: result.registrationId,
    })
  } catch (err: unknown) {
    const msg =
      err instanceof Error
        ? err.message
        : 'Internal error syncing self application'

    const sanitized = msg.replace(
      /(?:Bearer|token|secret|key|AIza)[^\s'"]+/gi,
      '[REDACTED]'
    )

    return NextResponse.json(
      { ok: false, error: sanitized },
      { status: 500 }
    )
  }
}
