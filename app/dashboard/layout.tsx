import { requireMembership } from '@/lib/auth/require-membership'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireMembership('student')
  return children
}
