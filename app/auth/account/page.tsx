import { redirect } from 'next/navigation'
import { resolveUserDestination } from '@/lib/auth/server'

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const destination = await resolveUserDestination()
  redirect(destination)
}
