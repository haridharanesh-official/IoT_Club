import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { resolveUserDestination } from '@/lib/auth/server'
import { AdminPortal } from "@/components/admin/AdminPortal"

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role !== 'ADMIN' && profile?.role !== 'SUPER_ADMIN') {
    const destination = await resolveUserDestination(user.id)
    redirect(destination)
  }

  return <AdminPortal />
}
