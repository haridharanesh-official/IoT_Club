import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { resolveUserDestination } from '@/lib/auth/server'

function isSafeRelativeUrl(url: string | null): boolean {
  if (!url) return false
  return url.startsWith('/') && !url.startsWith('//') && !url.includes('\\')
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const origin = request.nextUrl.origin

  // 1. Check for provider-level errors or cancellations
  const providerError = searchParams.get('error') || searchParams.get('error_description')
  if (providerError) {
    return NextResponse.redirect(new URL('/login?auth_error=cancelled', origin))
  }

  // 2. Check for exchange code
  const code = searchParams.get('code')
  const flowId = searchParams.get('sb_flow_id')
  const rawNext = searchParams.get('next')

  if (!code) {
    return NextResponse.redirect(new URL('/login?auth_error=invalid_link', origin))
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code, flowId ? { flowId } : undefined)
    if (error) {
      return NextResponse.redirect(new URL('/login?auth_error=invalid_link', origin))
    }

    // 3. Determine authoritative server-side destination
    const destination = await resolveUserDestination()

    // 4. If an internal next URL was requested and destination allows it, preserve it
    let target = destination
    if (isSafeRelativeUrl(rawNext)) {
      if (destination === '/dashboard' && rawNext?.startsWith('/dashboard')) {
        target = rawNext
      } else if (destination === '/admin' && rawNext?.startsWith('/admin')) {
        target = rawNext
      } else if (destination === '/teacher' && rawNext?.startsWith('/teacher')) {
        target = rawNext
      }
    }

    return NextResponse.redirect(new URL(target, origin))
  } catch {
    return NextResponse.redirect(new URL('/login?auth_error=unavailable', origin))
  }
}
