'use client'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="mx-auto flex min-h-[65vh] max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-xs font-mono font-semibold uppercase tracking-widest text-rose-700">Temporary error</p>
      <h1 className="text-3xl font-bold text-slate-900">Something went wrong</h1>
      <p className="text-sm leading-relaxed text-slate-600">
        Your account data was not changed by this message. Please retry the page. If the problem continues, contact the IoT Club administration through the institute&apos;s official channels.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
      >
        Try again
      </button>
    </main>
  )
}
