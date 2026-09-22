import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function requireMembership(area: 'student' | 'teacher' | 'admin') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile, error } = await supabase.from('profiles').select('role,membership_status').eq('id', user.id).single()
  if (error || !profile) redirect('/login')
  if (area === 'admin' && (profile.role === 'ADMIN' || profile.role === 'SUPER_ADMIN')) return
  if (area === 'teacher' && profile.role === 'TEACHER') return
  if (area === 'student' && profile.role === 'STUDENT' && profile.membership_status === 'APPROVED') return
  if (profile.role === 'ADMIN' || profile.role === 'SUPER_ADMIN') redirect('/admin')
  if (profile.role === 'TEACHER') redirect('/teacher')
  redirect('/membership/status')
}
