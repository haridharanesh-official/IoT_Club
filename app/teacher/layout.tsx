import type { Metadata } from 'next'
import { requireMembership } from '@/lib/auth/require-membership'


export const metadata: Metadata = {
  robots: { index: false, follow: false },
}
export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  await requireMembership('teacher')
  return children
}
