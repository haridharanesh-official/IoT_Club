import { redirect } from 'next/navigation'
import { getVerifiedUser } from '@/lib/auth/server'
import { SignOutButton } from './sign-out-button'

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const user = await getVerifiedUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 text-white flex items-center justify-center font-black">IoT</div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Your account</h1>
          <p className="text-xs text-emerald-700 font-semibold mt-1">Authenticated</p>
        </div>
        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
          <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Email</span>
          <span className="block text-sm font-semibold text-slate-900 break-all mt-1">{user.email}</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">Club registration and profile integration are not active yet. An authenticated account is not an approved IoT Club membership.</p>
        <SignOutButton />
      </div>
    </div>
  )
}
