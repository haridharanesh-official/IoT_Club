import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { resolveUserDestination } from '@/lib/auth/server'
import MembershipReview from './review'

export const dynamic = 'force-dynamic'

export default async function AdminMembershipPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (currentProfile?.role !== 'ADMIN' && currentProfile?.role !== 'SUPER_ADMIN') {
    const destination = await resolveUserDestination(user.id)
    redirect(destination)
  }

  const { data, error } = await supabase.from('membership_applications')
    .select('id,registration_id,status,submitted_at,reason_for_joining,skill_level,previous_iot_experience,experience_description,review_notes,user_id,profiles!membership_applications_user_id_fkey(full_name,email)')
    .order('submitted_at', { ascending: false })
  const userIds = (data ?? []).map(item => item.user_id)
  const applicationIds = (data ?? []).map(item => item.id)
  const [studentResult, interestsResult, skillsResult, syncResult] = userIds.length ? await Promise.all([
    supabase.from('student_profiles').select('user_id,date_of_birth,gender,mobile_number,personal_email,college_email,register_number,department,degree_programme,year_of_study,semester,section,batch,github_url,linkedin_url,portfolio_url').in('user_id', userIds),
    supabase.from('student_interests').select('user_id,interest').in('user_id', userIds),
    supabase.from('student_skills').select('user_id,category,skill,level').in('user_id', userIds),
    supabase.from('sheet_sync_logs').select('entity_id,sync_status,synced_at,last_attempt_at').in('entity_id', applicationIds),
  ]) : [{ data: [], error: null }, { data: [], error: null }, { data: [], error: null }, { data: [], error: null }]
  const applications = (data ?? []).map(item => {
    const joined = item.profiles as unknown as { full_name: string | null; email: string } | { full_name: string | null; email: string }[] | null
    const profile = Array.isArray(joined) ? joined[0] : joined
    const student = (studentResult.data ?? []).find(row => row.user_id === item.user_id)
    const syncLog = (syncResult.data ?? []).find(row => row.entity_id === item.id)
    return {
      id: item.id, registrationId: item.registration_id, status: item.status,
      submittedAt: item.submitted_at, reason: item.reason_for_joining,
      name: profile?.full_name, email: profile?.email,
      sheetSyncStatus: syncLog?.sync_status || 'PENDING',
      details: {
        dateOfBirth: student?.date_of_birth, gender: student?.gender, mobile: student?.mobile_number,
        personalEmail: student?.personal_email, collegeEmail: student?.college_email,
        registerNumber: student?.register_number, department: student?.department,
        degree: student?.degree_programme, year: student?.year_of_study,
        semester: student?.semester, section: student?.section, batch: student?.batch,
        skillLevel: item.skill_level, previousExperience: item.previous_iot_experience,
        experienceDescription: item.experience_description,
        interests: (interestsResult.data ?? []).filter(row => row.user_id === item.user_id).map(row => row.interest),
        skills: (skillsResult.data ?? []).filter(row => row.user_id === item.user_id).map(row => `${row.category}: ${row.skill} (${row.level})`),
        github: student?.github_url, linkedin: student?.linkedin_url, portfolio: student?.portfolio_url,
      },
    }
  })
  return <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6 text-slate-800"><div><p className="text-xs font-mono text-emerald-700">ADMIN / MEMBERSHIP</p><h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Membership applications</h1><p className="text-xs text-slate-500 mt-1">Review submissions and record decisions.</p></div>{error || studentResult.error || interestsResult.error || skillsResult.error ? <div role="alert" className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-800">Applications are unavailable. Please try again.</div> : <MembershipReview applications={applications} />}</div>
}
