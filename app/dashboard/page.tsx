import { redirect } from 'next/navigation'
import { StudentDashboard } from "@/components/student/StudentDashboard"
import { resolveUserDestination } from '@/lib/auth/server'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const destination = await resolveUserDestination()
  if (destination !== '/dashboard') {
    redirect(destination)
  }

  return <StudentDashboard />
}
