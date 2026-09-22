import Link from 'next/link'
import { defaultClubConfig } from '@/lib/clubConfig'

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl space-y-8 px-4 py-16 text-slate-700 sm:px-6">
      <div className="space-y-4">
        <p className="text-sm font-semibold text-emerald-700">{defaultClubConfig.collegeName}</p>
        <h1 className="text-4xl font-bold text-slate-900">About the {defaultClubConfig.clubName}</h1>
        <p className="max-w-2xl leading-relaxed">{defaultClubConfig.description}</p>
      </div>
      <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6">
        <h2 className="text-xl font-semibold text-slate-900">Our focus</h2>
        <p className="mt-3 leading-relaxed">
          The club focuses on learning and building connected systems. This site currently supports
          membership applications and an authenticated student profile. Other areas are shown as
          unavailable until their records and approval workflows can be verified.
        </p>
      </section>
      <div className="flex flex-wrap gap-3">
        <Link href="/register" className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700">Apply for membership</Link>
        <Link href="/club-rules" className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-800 hover:bg-slate-50">Read club rules</Link>
      </div>
    </main>
  )
}
