import Link from 'next/link'

export function UnavailableFeature({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-5">
      <div className="rounded-3xl border border-emerald-100 bg-white p-8 shadow-sm space-y-4">
        <p className="text-xs uppercase tracking-widest font-semibold text-emerald-700">Not yet available</p>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="text-sm leading-relaxed text-slate-600">{detail}</p>
        <p className="text-xs text-slate-500">No request, registration, submission, approval, or verification is recorded from this page.</p>
      </div>
      <Link href="/" className="inline-block text-emerald-700 font-semibold underline">Return to home</Link>
    </div>
  )
}
