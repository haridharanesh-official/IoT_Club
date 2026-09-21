import { redirect } from 'next/navigation'
import { getVerifiedUser } from '@/lib/auth/server'

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const user = await getVerifiedUser()
  if (!user) redirect('/login')
  redirect('/membership/status')
}
