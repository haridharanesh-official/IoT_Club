import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get('token_hash')
  const type = request.nextUrl.searchParams.get('type')
  const origin = request.nextUrl.origin

  if (!tokenHash || (type !== 'email' && type !== 'recovery')) {
    return NextResponse.redirect(new URL('/login?auth_error=invalid_link', origin))
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
    if (error) return NextResponse.redirect(new URL('/login?auth_error=invalid_link', origin))
    return NextResponse.redirect(new URL(type === 'recovery' ? '/reset-password' : '/auth/account', origin))
  } catch {
    return NextResponse.redirect(new URL('/login?auth_error=unavailable', origin))
  }
}
