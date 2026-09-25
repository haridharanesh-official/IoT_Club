import type { Metadata } from 'next'
import { requireMembership } from '@/lib/auth/require-membership'


export const metadata: Metadata = {
  robots: { index: false, follow: false },
}
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireMembership('student')
  return children
}
