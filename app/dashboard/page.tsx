import { redirect } from 'next/navigation'
import { StudentDashboard } from "@/components/student/StudentDashboard"
import { resolveUserDestination } from '@/lib/auth/server'
import { createClient } from '@/utils/supabase/server'
import { getStudentDashboardData } from '@/lib/student/dashboard'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const destination = await resolveUserDestination()
  if (destination !== '/dashboard') {
    redirect(destination)
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const dashboardData = await getStudentDashboardData(user.id, supabase)
  if (!dashboardData) {
    redirect('/membership/status')
  }

  return <StudentDashboard initialData={dashboardData} />
}
