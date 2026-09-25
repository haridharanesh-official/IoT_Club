import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[65vh] max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-xs font-mono font-semibold uppercase tracking-widest text-emerald-700">404</p>
      <h1 className="text-3xl font-bold text-slate-900">Page not found</h1>
      <p className="text-sm leading-relaxed text-slate-600">
        The page may have moved, may not be published yet, or the address may be incorrect.
      </p>
      <Link href="/" className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
        Return to IoT Club
      </Link>
    </main>
  )
}
