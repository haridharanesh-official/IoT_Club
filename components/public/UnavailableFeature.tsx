import Link from 'next/link'
import { ArrowLeft, Cpu, Radio, ShieldCheck } from 'lucide-react'

export function UnavailableFeature({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="bg-circuit-grid min-h-[68vh] px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="glass-card relative overflow-hidden rounded-3xl p-7 sm:p-12">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-emerald-200/70 via-teal-100/40 to-transparent blur-3xl" />
          <div className="relative grid items-center gap-10 md:grid-cols-[1fr_220px]">
            <div className="space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-emerald-700">
                <Radio className="h-3.5 w-3.5" aria-hidden="true" /> Not yet available
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">{title}</h1>
              <p className="max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">{detail}</p>
              <div className="glass-card-mint flex items-start gap-3 rounded-2xl p-4 text-sm text-emerald-950">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" aria-hidden="true" />
                <p>No request, registration, submission, approval, or verification is recorded from this page.</p>
              </div>
            </div>
            <div className="glass-card-lavender hidden aspect-square items-center justify-center rounded-[2rem] md:flex">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-xl shadow-emerald-500/20">
                <Cpu className="h-12 w-12" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
        <Link href="/" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Return to home
        </Link>
      </div>
    </div>
  )
}
