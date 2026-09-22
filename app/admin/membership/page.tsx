import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { resolveUserDestination } from '@/lib/auth/server'
import {
  getAdminMembershipApplications,
  getMembershipDashboardCounts,
  ApplicationFilterParams,
} from '@/lib/admin/membership'
import MembershipReview from './review'

export const dynamic = 'force-dynamic'

interface AdminMembershipPageProps {
  searchParams: Promise<{
    status?: string
    department?: string
    year?: string
    batch?: string
    search?: string
    sort?: 'newest' | 'oldest' | 'registration_id' | 'name'
    page?: string
    pageSize?: string
  }>
}

export default async function AdminMembershipPage({ searchParams }: AdminMembershipPageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (currentProfile?.role !== 'ADMIN' && currentProfile?.role !== 'SUPER_ADMIN') {
    const destination = await resolveUserDestination(user.id)
    redirect(destination)
  }

  const resolvedParams = await searchParams
  const filterParams: ApplicationFilterParams = {
    status: resolvedParams.status || 'ALL',
    department: resolvedParams.department || 'ALL',
    year: resolvedParams.year || 'ALL',
    batch: resolvedParams.batch || 'ALL',
    search: resolvedParams.search || '',
    sort: resolvedParams.sort || 'newest',
    page: Number(resolvedParams.page) || 1,
    pageSize: Number(resolvedParams.pageSize) || 20,
  }

  const [counts, paginatedData] = await Promise.all([
    getMembershipDashboardCounts(supabase),
    getAdminMembershipApplications(supabase, filterParams),
  ])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700">
              ADMIN / MEMBERSHIP
            </p>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              Live PostgreSQL
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Membership Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Authoritative applicant review, lifecycle transitions, audit history, and Google Sheets sync outbox.
          </p>
        </div>
      </div>

      <MembershipReview
        initialData={paginatedData}
        counts={counts}
        currentFilters={filterParams}
      />
    </div>
  )
}
