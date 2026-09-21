import { createClient } from '../../utils/supabase/server'

export async function getVerifiedUser() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()
    return error ? null : data.user
  } catch {
    return null
  }
}

export function computeUserDestination(
  profile: { role: string; membership_status: string } | null,
  application: { status: string } | null
): string {
  if (!profile) return '/register'
  if (profile.role === 'SUPER_ADMIN' || profile.role === 'ADMIN') return '/admin'
  if (profile.role === 'TEACHER') return '/teacher'
  if (!application) return '/register'
  if (application.status === 'APPROVED' && profile.membership_status === 'APPROVED') return '/dashboard'
  return '/membership/status'
}

export async function resolveUserDestination(userId?: string): Promise<string> {
  try {
    const supabase = await createClient()
    let targetUserId = userId

    if (!targetUserId) {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        return '/login'
      }
      targetUserId = user.id
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, membership_status')
      .eq('id', targetUserId)
      .maybeSingle()

    const { data: application } = await supabase
      .from('membership_applications')
      .select('status')
      .eq('user_id', targetUserId)
      .maybeSingle()

    return computeUserDestination(profile, application)
  } catch {
    return '/login'
  }
}
