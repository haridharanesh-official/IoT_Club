'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

type Application = {
  id: string; registrationId: string; status: string; submittedAt: string; reason: string; name?: string | null; email?: string | null;
  details: Record<string, string | number | boolean | string[] | null | undefined>
}

export default function MembershipReview({ applications }: { applications: Application[] }) {
  const router = useRouter()
  const submitting = useRef(false)
  const [active, setActive] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function decide(applicationId: string, decision: 'APPROVED' | 'REJECTED' | 'SUSPENDED') {
    if (submitting.current) return
    if (decision !== 'APPROVED' && !notes[applicationId]?.trim()) { setError('Review notes are required for rejection or suspension.'); return }
    submitting.current = true; setActive(applicationId); setError(''); setSuccess('')
    try {
      const { error: reviewError } = await createClient().rpc('review_membership_application', { application_id: applicationId, decision, notes: notes[applicationId]?.trim() || null })
      if (reviewError) { setError('Unable to save the decision. Check your access and try again.'); return }
      setSuccess(`Application ${decision.toLowerCase()}.`); setNotes(previous => ({ ...previous, [applicationId]: '' })); router.refresh()
    } catch { setError('The review service is temporarily unavailable. Please try again.') }
    finally { submitting.current = false; setActive(null) }
  }

  return <div className="space-y-4">{error && <p role="alert" className="text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-xl p-3">{error}</p>}{success && <p role="status" className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl p-3">{success}</p>}{applications.length === 0 ? <p className="text-xs text-slate-600 bg-white border border-slate-200 rounded-2xl p-6">No applications yet.</p> : applications.map(application => <article key={application.id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3"><div className="flex flex-wrap justify-between gap-2"><div><h2 className="text-sm font-bold text-slate-900">{application.name || application.email || 'Applicant'}</h2><p className="text-xs text-slate-500">{application.registrationId} · {new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC' }).format(new Date(application.submittedAt))}</p></div><span className="text-xs font-bold text-emerald-800 bg-emerald-50 rounded-xl px-3 py-1.5 h-fit">{application.status}</span></div><details className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3"><summary className="cursor-pointer font-bold">Review submitted details</summary><div className="grid sm:grid-cols-2 gap-x-4 gap-y-1 mt-3"><p><strong>Reason for joining:</strong> {application.reason}</p>{Object.entries(application.details).map(([key, value]) => <p key={key}><strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, first => first.toUpperCase())}:</strong> {Array.isArray(value) ? value.join(', ') : typeof value === 'boolean' ? value ? 'Yes' : 'No' : value ?? '—'}</p>)}</div></details><label className="block text-xs font-semibold text-slate-700">Review notes<textarea value={notes[application.id] ?? ''} onChange={event => setNotes(previous => ({ ...previous, [application.id]: event.target.value }))} className="block w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl p-3 min-h-16" /></label><div className="flex flex-wrap gap-2">{(['APPROVED','REJECTED','SUSPENDED'] as const).map(decision => <button key={decision} type="button" disabled={active !== null || application.status === decision} onClick={() => decide(application.id, decision)} className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold disabled:opacity-40">{decision === 'APPROVED' ? 'Approve' : decision === 'REJECTED' ? 'Reject' : 'Suspend'}</button>)}</div></article>)}</div>
}
