import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { SignOutButton } from '@/app/auth/account/sign-out-button'

export const dynamic = 'force-dynamic'

export default async function MembershipStatusPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role,membership_status,full_name').eq('id', user.id).single()
  if (profile?.role === 'TEACHER') redirect('/teacher')
  if (profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN') redirect('/admin')
  const { data: application } = await supabase.from('membership_applications').select('registration_id,status,submitted_at,review_notes').eq('user_id', user.id).maybeSingle()
  if (!application) redirect('/register')
  if (application.status === 'APPROVED' && profile?.membership_status === 'APPROVED') redirect('/dashboard')
  const description = application.status === 'PENDING' ? 'Your application is awaiting review.' : application.status === 'REJECTED' ? 'Your application was not approved.' : 'Your membership is currently suspended.'
  return <div className="min-h-[70vh] flex items-center justify-center p-4"><div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-5"><p className="text-xs font-mono text-emerald-700">MEMBERSHIP STATUS</p><h1 className="text-2xl font-black text-slate-900">{application.status}</h1><p className="text-sm text-slate-700">{description}</p><div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2"><p><strong>Registration ID:</strong> {application.registration_id}</p><p><strong>Submitted:</strong> {new Date(application.submitted_at).toLocaleDateString()}</p>{application.review_notes && <p><strong>Review notes:</strong> {application.review_notes}</p>}</div><div className="flex items-center gap-4"><Link href="/" className="text-xs text-emerald-700 font-semibold">Public website</Link><SignOutButton /></div></div></div>
}
