import { createClient } from '@/utils/supabase/server'
import MembershipReview from './review'

export const dynamic = 'force-dynamic'

export default async function AdminMembershipPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('membership_applications')
    .select('id,registration_id,status,submitted_at,reason_for_joining,skill_level,review_notes,user_id,profiles!membership_applications_user_id_fkey(full_name,email)')
    .order('submitted_at', { ascending: false })
  const applications = (data ?? []).map(item => {
    const joined = item.profiles as unknown as { full_name: string | null; email: string } | { full_name: string | null; email: string }[] | null
    const profile = Array.isArray(joined) ? joined[0] : joined
    return {
      id: item.id, registrationId: item.registration_id, status: item.status,
      submittedAt: item.submitted_at, reason: item.reason_for_joining,
      name: profile?.full_name, email: profile?.email,
    }
  })
  return <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6 text-slate-800"><div><p className="text-xs font-mono text-emerald-700">ADMIN / MEMBERSHIP</p><h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Membership applications</h1><p className="text-xs text-slate-500 mt-1">Review submissions and record decisions.</p></div>{error ? <div role="alert" className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-800">Applications are unavailable. Please try again.</div> : <MembershipReview applications={applications} />}</div>
}
