export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12" role="status" aria-live="polite">
      <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
      <div className="mt-4 h-10 w-2/3 animate-pulse rounded-xl bg-slate-200" />
      <div className="mt-6 space-y-3">
        <div className="h-4 animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
      </div>
      <span className="sr-only">Loading</span>
    </div>
  )
}
