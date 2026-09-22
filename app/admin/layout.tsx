import { requireMembership } from '@/lib/auth/require-membership'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireMembership('admin')
  return children
}
