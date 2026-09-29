import Link from 'next/link'
import { defaultClubConfig } from '@/lib/clubConfig'

export default function AboutPage() {
  return (
    <main className="bg-circuit-grid min-h-[70vh] px-4 py-16 text-slate-700 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-8">
      <div className="glass-card relative overflow-hidden rounded-3xl p-8 sm:p-12">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-emerald-200/70 via-teal-100/40 to-transparent blur-3xl" />
        <div className="relative max-w-3xl space-y-4">
          <p className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{defaultClubConfig.collegeName}</p>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">About the {defaultClubConfig.clubName}</h1>
          <p className="max-w-2xl leading-relaxed">{defaultClubConfig.description}</p>
        </div>
      </div>
      <section className="glass-card-mint rounded-3xl p-7 sm:p-9">
        <h2 className="text-xl font-semibold text-slate-900">Our focus</h2>
        <p className="mt-3 leading-relaxed">
          The club focuses on learning and building connected systems. This site currently supports
          membership applications and an authenticated student profile. Other areas are shown as
          unavailable until their records and approval workflows can be verified.
        </p>
      </section>
      <div className="flex flex-wrap gap-3">
        <Link href="/register" className="rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-600">Apply for membership</Link>
        <Link href="/club-rules" className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-800 shadow-sm hover:bg-slate-50">Read club rules</Link>
      </div>
      </div>
    </main>
  )
}
