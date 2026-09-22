import { requireMembership } from '@/lib/auth/require-membership'

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  await requireMembership('teacher')
  return children
}
