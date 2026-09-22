import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import RegistrationForm from './registration-form'

export const dynamic = 'force-dynamic'

export default async function RegisterPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role,membership_status')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.role === 'TEACHER') redirect('/teacher')
    if (profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN') redirect('/admin')

    const { data: application } = await supabase
      .from('membership_applications')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (application) redirect('/membership/status')
  }

  return (
    <RegistrationForm
      initialUser={user ? { id: user.id, email: user.email ?? '' } : null}
    />
  )
}
