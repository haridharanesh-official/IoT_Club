'use client'

import React, { useState, useRef, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import {
  HydratedAdminApplication,
  PaginatedAdminApplications,
  MembershipDashboardCounts,
  ApplicationFilterParams,
  AuditHistoryItem,
} from '@/lib/admin/membership'
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  UserX,
  Clock,
  Calendar,
  Mail,
  Phone,
  BookOpen,
  Layers,
  Award,
  X,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react'

const DEPARTMENTS = [
  'Information Technology',
  'Computer Science and Engineering',
  'Electronics and Communication Engineering',
  'Electrical and Electronics Engineering',
  'Mechanical Engineering',
  'Artificial Intelligence and Data Science',
  'Cybersecurity',
]

const YEARS = [
  { value: '1', label: '1st Year' },
  { value: '2', label: '2nd Year' },
  { value: '3', label: '3rd Year' },
  { value: '4', label: '4th Year' },
]

const BATCHES = ['2023-2027', '2024-2028', '2025-2029', '2026-2030']

interface MembershipReviewProps {
  initialData: PaginatedAdminApplications
  counts: MembershipDashboardCounts
  currentFilters: ApplicationFilterParams
}

export default function MembershipReview({
  initialData,
  counts,
  currentFilters,
}: MembershipReviewProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  // Local filter states
  const [searchInput, setSearchInput] = useState(currentFilters.search || '')
  const [statusFilter, setStatusFilter] = useState(currentFilters.status || 'ALL')
  const [deptFilter, setDeptFilter] = useState(currentFilters.department || 'ALL')
  const [yearFilter, setYearFilter] = useState(currentFilters.year || 'ALL')
  const [batchFilter, setBatchFilter] = useState(currentFilters.batch || 'ALL')
  const [sortOption, setSortOption] = useState(currentFilters.sort || 'newest')

  // UI action states
  const [selectedApp, setSelectedApp] = useState<HydratedAdminApplication | null>(null)
  const [modalNotes, setModalNotes] = useState('')
  const [activeSubmittingId, setActiveSubmittingId] = useState<string | null>(null)
  const [isRetryingSync, setIsRetryingSync] = useState(false)
  const [alertError, setAlertError] = useState<string | null>(null)
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null)

  // Audit history state for the selected application
  const [auditHistory, setAuditHistory] = useState<AuditHistoryItem[]>([])
  const [loadingAudit, setLoadingAudit] = useState(false)

  const isSubmitting = useRef(false)

  // Apply filters via URL search params
  const updateRoute = (overrides: Partial<ApplicationFilterParams> = {}) => {
    const params = new URLSearchParams()
    const nextStatus = overrides.status !== undefined ? overrides.status : statusFilter
    const nextDept = overrides.department !== undefined ? overrides.department : deptFilter
    const nextYear = overrides.year !== undefined ? overrides.year : yearFilter
    const nextBatch = overrides.batch !== undefined ? overrides.batch : batchFilter
    const nextSearch = overrides.search !== undefined ? overrides.search : searchInput
    const nextSort = overrides.sort !== undefined ? overrides.sort : sortOption
    const nextPage = overrides.page !== undefined ? overrides.page : 1

    if (nextStatus && nextStatus !== 'ALL') params.set('status', nextStatus)
    if (nextDept && nextDept !== 'ALL') params.set('department', nextDept)
    if (nextYear && nextYear !== 'ALL') params.set('year', nextYear)
    if (nextBatch && nextBatch !== 'ALL') params.set('batch', nextBatch)
    if (nextSearch && nextSearch.trim()) params.set('search', nextSearch.trim())
    if (nextSort && nextSort !== 'newest') params.set('sort', nextSort)
    if (nextPage && nextPage > 1) params.set('page', String(nextPage))

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateRoute({ search: searchInput, page: 1 })
  }

  const handleClearFilters = () => {
    setSearchInput('')
    setStatusFilter('ALL')
    setDeptFilter('ALL')
    setYearFilter('ALL')
    setBatchFilter('ALL')
    setSortOption('newest')
    startTransition(() => {
      router.push(pathname)
    })
  }

  // Open modal and fetch its audit history
  const openDetailModal = async (app: HydratedAdminApplication) => {
    setSelectedApp(app)
    setModalNotes(app.reviewNotes || '')
    setAlertError(null)
    setAlertSuccess(null)
    setLoadingAudit(true)
    try {
      const res = await fetch(`/api/admin/membership/audit?id=${encodeURIComponent(app.id)}`)
      if (res.ok) {
        const json = await res.json()
        setAuditHistory(json.auditHistory || [])
      } else {
        setAuditHistory([])
      }
    } catch {
      setAuditHistory([])
    } finally {
      setLoadingAudit(false)
    }
  }

  // Review Decision Handler (Approve / Reject / Suspend / Reactivate)
  const handleDecision = async (
    applicationId: string,
    decision: 'APPROVED' | 'REJECTED' | 'SUSPENDED',
    notesText?: string
  ) => {
    if (isSubmitting.current) return

    const finalNotes = (notesText ?? modalNotes).trim()
    if ((decision === 'REJECTED' || decision === 'SUSPENDED') && !finalNotes) {
      setAlertError(`Review notes are required when ${decision === 'REJECTED' ? 'rejecting' : 'suspending'} an application.`)
      return
    }

    isSubmitting.current = true
    setActiveSubmittingId(applicationId)
    setAlertError(null)
    setAlertSuccess(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.rpc('review_membership_application', {
        application_id: applicationId,
        decision,
        notes: finalNotes || null,
      })

      if (error) {
        setAlertError(
          error.message.includes('42501') || error.message.includes('not authorized')
            ? 'Unauthorized: You do not have permission to review applications.'
            : error.message.includes('cannot be updated') || error.message.includes('already has this status')
            ? `Invalid action: ${error.message}`
            : 'Unable to save the decision. Please try again.'
        )
        return
      }

      setAlertSuccess(
        decision === 'APPROVED'
          ? 'Application approved successfully.'
          : decision === 'REJECTED'
          ? 'Application rejected.'
          : 'Membership suspended.'
      )

      // Trigger background Sheets drain (best effort)
      fetch('/api/internal/google-sheets/sync', { method: 'POST' }).catch(() => {})

      // Close modal if active, or refresh audit history
      if (selectedApp?.id === applicationId) {
        const updatedApp = {
          ...selectedApp,
          status: decision,
          reviewedAt: new Date().toISOString(),
          reviewNotes: finalNotes || null,
          sheetSync: { ...selectedApp.sheetSync, status: 'PENDING' as const },
        }
        setSelectedApp(updatedApp)
        // Refresh audit history
        fetch(`/api/admin/membership/audit?id=${encodeURIComponent(applicationId)}`)
          .then((r) => r.json())
          .then((j) => setAuditHistory(j.auditHistory || []))
          .catch(() => {})
      }

      router.refresh()
    } catch {
      setAlertError('A network error occurred while processing the review.')
    } finally {
      isSubmitting.current = false
      setActiveSubmittingId(null)
    }
  }

  // Sheets Sync Retry Handler
  const handleRetrySync = async () => {
    if (isRetryingSync) return
    setIsRetryingSync(true)
    setAlertError(null)
    setAlertSuccess(null)

    try {
      const res = await fetch('/api/internal/google-sheets/sync', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setAlertSuccess(
          `Google Sheets sync completed. Processed ${data.processed ?? 0} record(s).`
        )
        router.refresh()
      } else {
        setAlertError(data.error || 'Failed to trigger Sheets sync.')
      }
    } catch {
      setAlertError('Network error while requesting Sheets sync retry.')
    } finally {
      setIsRetryingSync(false)
    }
  }

  const { applications, totalCount, currentPage, totalPages, pageSize } = initialData

  return (
    <div className="space-y-6">
      {/* Global Alerts */}
      {alertError && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{alertError}</span>
          </div>
          <button
            onClick={() => setAlertError(null)}
            className="text-rose-500 hover:text-rose-700 text-sm font-bold"
          >
            ×
          </button>
        </div>
      )}

      {alertSuccess && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{alertSuccess}</span>
          </div>
          <button
            onClick={() => setAlertSuccess(null)}
            className="text-emerald-500 hover:text-emerald-700 text-sm font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Top Status Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { key: 'ALL', label: 'All Applications', count: counts.total, color: 'text-slate-900' },
          { key: 'PENDING', label: 'Pending Review', count: counts.pending, color: 'text-amber-700' },
          { key: 'APPROVED', label: 'Approved Members', count: counts.approved, color: 'text-emerald-700' },
          { key: 'REJECTED', label: 'Rejected', count: counts.rejected, color: 'text-rose-700' },
          { key: 'SUSPENDED', label: 'Suspended', count: counts.suspended, color: 'text-slate-600' },
        ].map((tab) => {
          const isActive = statusFilter === tab.key
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setStatusFilter(tab.key)
                updateRoute({ status: tab.key, page: 1 })
              }}
              className={`p-3.5 rounded-2xl border text-left transition cursor-pointer shadow-xs ${
                isActive
                  ? 'bg-white border-emerald-600 ring-2 ring-emerald-600/20 shadow-sm'
                  : 'bg-white/80 hover:bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-mono font-medium text-slate-500">
                <span>{tab.label}</span>
                {isActive && <div className="w-2 h-2 rounded-full bg-emerald-600" />}
              </div>
              <div className={`text-xl font-extrabold font-mono mt-1 ${tab.color}`}>
                {tab.count}
              </div>
            </button>
          )
        })}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by Registration ID, Roll No, Full Name, or Email..."
              className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition"
            />
            <button
              type="submit"
              disabled={isPending}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Actions on right: Retry Sheets Sync */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRetrySync}
              disabled={isRetryingSync}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 shadow-xs transition cursor-pointer disabled:opacity-50"
              title="Drain pending/failed records to Google Sheets"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isRetryingSync ? 'animate-spin' : ''}`} />
              <span>{isRetryingSync ? 'Syncing Sheets...' : 'Retry Sheets Sync'}</span>
            </button>
          </div>
        </div>

        {/* Filter Dropdowns Strip */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 text-slate-400 font-medium mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Department Filter */}
          <select
            value={deptFilter}
            onChange={(e) => {
              setDeptFilter(e.target.value)
              updateRoute({ department: e.target.value, page: 1 })
            }}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="ALL">All Departments</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          {/* Year Filter */}
          <select
            value={yearFilter}
            onChange={(e) => {
              setYearFilter(e.target.value)
              updateRoute({ year: e.target.value, page: 1 })
            }}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="ALL">All Years</option>
            {YEARS.map((yr) => (
              <option key={yr.value} value={yr.value}>
                {yr.label}
              </option>
            ))}
          </select>

          {/* Batch Filter */}
          <select
            value={batchFilter}
            onChange={(e) => {
              setBatchFilter(e.target.value)
              updateRoute({ batch: e.target.value, page: 1 })
            }}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="ALL">All Batches</option>
            {BATCHES.map((b) => (
              <option key={b} value={b}>
                Batch {b}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortOption}
            onChange={(e) => {
              const val = (e.target.value as 'newest' | 'oldest' | 'registration_id' | 'name') || 'newest'
              setSortOption(val)
              updateRoute({ sort: val, page: 1 })
            }}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="registration_id">Registration ID</option>
            <option value="name">Full Name</option>
          </select>

          {/* Clear Filters Button */}
          {(statusFilter !== 'ALL' ||
            deptFilter !== 'ALL' ||
            yearFilter !== 'ALL' ||
            batchFilter !== 'ALL' ||
            searchInput ||
            sortOption !== 'newest') && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition ml-auto cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <UserX className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No applications found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No membership applications match your selected status, department, or search query.
          </p>
          {(statusFilter !== 'ALL' ||
            deptFilter !== 'ALL' ||
            yearFilter !== 'ALL' ||
            batchFilter !== 'ALL' ||
            searchInput) && (
            <button
              onClick={handleClearFilters}
              className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => {
            const isRowSubmitting = activeSubmittingId === app.id
            return (
              <article
                key={app.id}
                className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl p-5 space-y-3 shadow-xs transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-sm font-bold text-slate-900">{app.fullName}</h2>
                      <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        {app.registrationId}
                      </span>
                      {app.registerNumber && (
                        <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          Roll: {app.registerNumber}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                      <span>{app.department || 'Department N/A'}</span>
                      {app.yearOfStudy && <span>· Year {app.yearOfStudy}</span>}
                      {app.batch && <span>· {app.batch}</span>}
                      <span>
                        · Submitted {new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(app.submittedAt))}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {/* Sheet Sync Badge */}
                    <span
                      className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border ${
                        app.sheetSync.status === 'SYNCED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : app.sheetSync.status === 'FAILED'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : app.sheetSync.status === 'SYNCING'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                      title={app.sheetSync.errorMessage || `Sync status: ${app.sheetSync.status}`}
                    >
                      Sheet: {app.sheetSync.status}
                    </span>

                    {/* Membership Status Badge */}
                    <span
                      className={`text-xs font-mono font-bold px-3 py-1 rounded-xl border ${
                        app.status === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : app.status === 'REJECTED'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : app.status === 'SUSPENDED'
                          ? 'bg-slate-100 text-slate-700 border-slate-300'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>
                </div>

                {/* Card Summary Line */}
                {app.reasonForJoining && (
                  <p className="text-xs text-slate-600 line-clamp-1 bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                    <strong className="text-slate-700">Reason:</strong> {app.reasonForJoining}
                  </p>
                )}

                {/* Bottom Card Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => openDetailModal(app)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-600" />
                    <span>View Application Details</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {app.status === 'PENDING' && (
                      <>
                        <button
                          type="button"
                          disabled={isRowSubmitting}
                          onClick={() => handleDecision(app.id, 'APPROVED')}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition disabled:opacity-40 cursor-pointer"
                        >
                          {isRowSubmitting ? 'Saving...' : 'Approve'}
                        </button>
                        <button
                          type="button"
                          onClick={() => openDetailModal(app)}
                          className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition cursor-pointer"
                        >
                          Reject...
                        </button>
                      </>
                    )}

                    {app.status === 'APPROVED' && (
                      <button
                        type="button"
                        onClick={() => openDetailModal(app)}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition cursor-pointer"
                      >
                        Suspend...
                      </button>
                    )}

                    {app.status === 'SUSPENDED' && (
                      <button
                        type="button"
                        disabled={isRowSubmitting}
                        onClick={() => handleDecision(app.id, 'APPROVED', 'Reactivated by Administrator')}
                        className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition disabled:opacity-40 cursor-pointer"
                      >
                        {isRowSubmitting ? 'Saving...' : 'Reactivate'}
                      </button>
                    )}

                    {app.status === 'REJECTED' && (
                      <span className="text-xs text-slate-400 font-mono italic">
                        Decision Final
                      </span>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs text-xs">
          <div className="text-slate-500 font-mono">
            Showing{' '}
            <span className="font-bold text-slate-800">
              {(currentPage - 1) * pageSize + 1}
            </span>{' '}
            to{' '}
            <span className="font-bold text-slate-800">
              {Math.min(currentPage * pageSize, totalCount)}
            </span>{' '}
            of <span className="font-bold text-slate-800">{totalCount}</span> applications
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1 || isPending}
              onClick={() => updateRoute({ page: currentPage - 1 })}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold transition disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <span className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold text-slate-700">
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages || isPending}
              onClick={() => updateRoute({ page: currentPage + 1 })}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold transition disabled:opacity-30 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* APPLICATION DETAIL MODAL */}
      {selectedApp && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        >
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 text-slate-800 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-slate-900">{selectedApp.fullName}</h2>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                    {selectedApp.registrationId}
                  </span>
                  <span
                    className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                      selectedApp.status === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : selectedApp.status === 'REJECTED'
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : selectedApp.status === 'SUSPENDED'
                        ? 'bg-slate-100 text-slate-700 border-slate-300'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {selectedApp.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Submitted {new Intl.DateTimeFormat('en-GB', { dateStyle: 'full', timeStyle: 'short', timeZone: 'UTC' }).format(new Date(selectedApp.submittedAt))}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Personal & Academic Details Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Personal Information */}
                <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 space-y-2.5 text-xs">
                  <h3 className="font-bold text-slate-900 flex items-center gap-1.5 pb-1 border-b border-slate-200">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span>Personal Information</span>
                  </h3>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Email Address:</span>
                      <span className="font-mono text-slate-800">{selectedApp.contactEmail || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Mobile Number:</span>
                      <span className="font-mono text-slate-800">{selectedApp.mobileNumber || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Gender:</span>
                      <span className="text-slate-800">{selectedApp.gender || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Date of Birth:</span>
                      <span className="font-mono text-slate-800">{selectedApp.dateOfBirth || '—'}</span>
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 space-y-2.5 text-xs">
                  <h3 className="font-bold text-slate-900 flex items-center gap-1.5 pb-1 border-b border-slate-200">
                    <BookOpen className="w-4 h-4 text-teal-600" />
                    <span>Academic Information</span>
                  </h3>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Register / Roll No:</span>
                      <span className="font-mono font-bold text-slate-800">{selectedApp.registerNumber || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Department:</span>
                      <span className="text-slate-800 text-right">{selectedApp.department || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Degree & Year:</span>
                      <span className="text-slate-800">{selectedApp.degreeProgramme || 'BE'} · Year {selectedApp.yearOfStudy || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Semester & Section:</span>
                      <span className="text-slate-800">Sem {selectedApp.semester || '—'} (Sec {selectedApp.section || '—'})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Batch:</span>
                      <span className="font-mono text-slate-800">{selectedApp.batch || '—'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* IoT Background & Reason */}
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 space-y-3 text-xs">
                <h3 className="font-bold text-slate-900 flex items-center gap-1.5 pb-1 border-b border-slate-200">
                  <Award className="w-4 h-4 text-indigo-600" />
                  <span>IoT Background & Statement</span>
                </h3>

                {selectedApp.reasonForJoining && (
                  <div>
                    <span className="text-slate-500 block font-medium">Reason for Joining:</span>
                    <p className="text-slate-800 mt-1 bg-white p-3 rounded-xl border border-slate-200/70">
                      {selectedApp.reasonForJoining}
                    </p>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-slate-500">Skill Level:</span>
                    <span className="ml-2 font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      {selectedApp.skillLevel}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Previous IoT Experience:</span>
                    <span className="ml-2 font-bold text-slate-800">
                      {selectedApp.previousIotExperience ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                {selectedApp.previousIotExperience && selectedApp.experienceDescription && (
                  <div>
                    <span className="text-slate-500 block font-medium">Experience Description:</span>
                    <p className="text-slate-800 mt-1 bg-white p-3 rounded-xl border border-slate-200/70">
                      {selectedApp.experienceDescription}
                    </p>
                  </div>
                )}
              </div>

              {/* Categorized Skills & Interests */}
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>Skills & Areas of Interest</span>
                </h3>

                <div className="grid sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                    <h4 className="font-bold text-slate-700 mb-2">Programming</h4>
                    {selectedApp.categorizedSkills.programming.length === 0 ? (
                      <p className="text-slate-400 italic">None specified</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedApp.categorizedSkills.programming.map((s, idx) => (
                          <span
                            key={idx}
                            className="bg-white border border-slate-200 text-slate-800 px-2 py-0.5 rounded-md text-[11px]"
                          >
                            {s.skill} <span className="text-slate-400 text-[10px]">({s.level})</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                    <h4 className="font-bold text-slate-700 mb-2">Hardware</h4>
                    {selectedApp.categorizedSkills.hardware.length === 0 ? (
                      <p className="text-slate-400 italic">None specified</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedApp.categorizedSkills.hardware.map((s, idx) => (
                          <span
                            key={idx}
                            className="bg-white border border-slate-200 text-slate-800 px-2 py-0.5 rounded-md text-[11px]"
                          >
                            {s.skill} <span className="text-slate-400 text-[10px]">({s.level})</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                    <h4 className="font-bold text-slate-700 mb-2">Technology</h4>
                    {selectedApp.categorizedSkills.technology.length === 0 ? (
                      <p className="text-slate-400 italic">None specified</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedApp.categorizedSkills.technology.map((s, idx) => (
                          <span
                            key={idx}
                            className="bg-white border border-slate-200 text-slate-800 px-2 py-0.5 rounded-md text-[11px]"
                          >
                            {s.skill} <span className="text-slate-400 text-[10px]">({s.level})</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Interests Tags */}
                {selectedApp.interests.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="text-slate-500 font-medium">Interests:</span>
                    {selectedApp.interests.map((i, idx) => (
                      <span
                        key={idx}
                        className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-lg text-[11px] font-medium"
                      >
                        {i}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Profiles & External Links */}
              <div className="flex flex-wrap gap-2 text-xs">
                {selectedApp.githubUrl && (
                  <a
                    href={selectedApp.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>GitHub Profile</span>
                  </a>
                )}
                {selectedApp.linkedinUrl && (
                  <a
                    href={selectedApp.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>LinkedIn Profile</span>
                  </a>
                )}
                {selectedApp.portfolioUrl && (
                  <a
                    href={selectedApp.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Portfolio</span>
                  </a>
                )}
              </div>

              {/* Google Sheets Sync Card */}
              <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4 text-xs space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-slate-600" />
                    <h3 className="font-bold text-slate-900">Google Sheets Sync Outbox</h3>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                        selectedApp.sheetSync.status === 'SYNCED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : selectedApp.sheetSync.status === 'FAILED'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : selectedApp.sheetSync.status === 'SYNCING'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {selectedApp.sheetSync.status}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleRetrySync}
                    disabled={isRetryingSync}
                    className="px-3 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 font-bold text-slate-700 transition cursor-pointer disabled:opacity-50"
                  >
                    {isRetryingSync ? 'Retrying...' : 'Retry Sync'}
                  </button>
                </div>

                <div className="grid sm:grid-cols-3 gap-2 text-[11px] font-mono text-slate-500 pt-1">
                  <div>Attempts: {selectedApp.sheetSync.attemptCount}</div>
                  <div>
                    Last Attempt:{' '}
                    {selectedApp.sheetSync.lastAttemptAt
                      ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'short', timeStyle: 'short', timeZone: 'UTC' }).format(new Date(selectedApp.sheetSync.lastAttemptAt))
                      : '—'}
                  </div>
                  <div>
                    Synced At:{' '}
                    {selectedApp.sheetSync.syncedAt
                      ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'short', timeStyle: 'short', timeZone: 'UTC' }).format(new Date(selectedApp.sheetSync.syncedAt))
                      : '—'}
                  </div>
                </div>

                {selectedApp.sheetSync.errorMessage && (
                  <p className="text-rose-700 bg-rose-50 p-2 rounded-lg font-mono text-[11px] border border-rose-200 mt-1">
                    Error: {selectedApp.sheetSync.errorMessage}
                  </p>
                )}
              </div>

              {/* Audit History Timeline */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <Clock className="w-4 h-4 text-slate-600" />
                  <span>Audit Trail</span>
                </h3>

                {loadingAudit ? (
                  <p className="text-xs text-slate-400 italic">Loading audit trail...</p>
                ) : auditHistory.length === 0 ? (
                  <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-slate-200">
                    No prior review events recorded for this application.
                  </p>
                ) : (
                  <div className="space-y-2 border-l-2 border-slate-200 pl-3 ml-2">
                    {auditHistory.map((item) => (
                      <div key={item.id} className="text-xs space-y-1 relative">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 absolute -left-[17px] top-1.5 ring-4 ring-white" />
                        <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
                          <span>
                            {new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }).format(new Date(item.timestamp))}
                          </span>
                          <span>·</span>
                          <span className="font-bold text-slate-700">{item.actorName}</span>
                          <span>({item.actorEmail})</span>
                        </div>
                        <div className="font-semibold text-slate-800">
                          Status Transition:{' '}
                          <span className="font-mono text-slate-600">{item.previousStatus || 'INIT'}</span> →{' '}
                          <span className="font-mono text-emerald-700">{item.newStatus}</span>
                        </div>
                        {item.notes && (
                          <p className="text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200 text-[11px]">
                            {item.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Review Decision Controls (Bottom of Modal) */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <label className="block text-xs font-bold text-slate-800">
                  Review Notes / Reason
                  <span className="text-slate-400 font-normal ml-1">
                    (Required when rejecting or suspending)
                  </span>
                  <textarea
                    value={modalNotes}
                    onChange={(e) => setModalNotes(e.target.value)}
                    placeholder="Enter technical justification or review feedback..."
                    rows={2}
                    className="w-full mt-1.5 p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </label>

                <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                  {/* Approve: valid for PENDING or SUSPENDED (Reactivate) */}
                  {(selectedApp.status === 'PENDING' || selectedApp.status === 'SUSPENDED') && (
                    <button
                      type="button"
                      disabled={isSubmitting.current}
                      onClick={() => handleDecision(selectedApp.id, 'APPROVED')}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition disabled:opacity-40 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{selectedApp.status === 'SUSPENDED' ? 'Reactivate Member' : 'Approve Membership'}</span>
                    </button>
                  )}

                  {/* Reject: valid only for PENDING */}
                  {selectedApp.status === 'PENDING' && (
                    <button
                      type="button"
                      disabled={isSubmitting.current}
                      onClick={() => handleDecision(selectedApp.id, 'REJECTED')}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition disabled:opacity-40 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject Application</span>
                    </button>
                  )}

                  {/* Suspend: valid only for APPROVED */}
                  {selectedApp.status === 'APPROVED' && (
                    <button
                      type="button"
                      disabled={isSubmitting.current}
                      onClick={() => handleDecision(selectedApp.id, 'SUSPENDED')}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition disabled:opacity-40 cursor-pointer"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Suspend Membership</span>
                    </button>
                  )}

                  {selectedApp.status === 'REJECTED' && (
                    <span className="text-xs text-slate-400 font-mono italic">
                      This application was rejected and cannot be transitioned.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
