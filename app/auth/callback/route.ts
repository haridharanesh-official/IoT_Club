import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const flowId = request.nextUrl.searchParams.get('sb_flow_id')
  const origin = request.nextUrl.origin
  if (!code) return NextResponse.redirect(new URL('/login?auth_error=invalid_link', origin))
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code, flowId ? { flowId } : undefined)
    if (error) return NextResponse.redirect(new URL('/login?auth_error=invalid_link', origin))
    return NextResponse.redirect(new URL('/auth/account', origin))
  } catch {
    return NextResponse.redirect(new URL('/login?auth_error=unavailable', origin))
  }
}
