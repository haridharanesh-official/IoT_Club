import { redirect } from 'next/navigation'
import { getVerifiedUser } from '@/lib/auth/server'

export default async function OpportunitiesLayout({ children }: { children: React.ReactNode }) {
  if (!await getVerifiedUser()) redirect('/login')
  return children
}