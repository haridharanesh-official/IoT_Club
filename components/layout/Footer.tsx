import Link from "next/link";
import { Cpu, Sparkles } from "lucide-react";
import { defaultClubConfig } from "@/lib/clubConfig";

export function Footer() {
  return (
    <footer className="relative mt-20 overflow-hidden border-t border-slate-200/80 bg-white/75 text-slate-600 backdrop-blur-md">
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-70" />
      <div className="mx-auto max-w-7xl px-4 pb-9 pt-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 border-b border-slate-200/70 pb-10 lg:grid-cols-12">
          <div className="max-w-xl space-y-4 lg:col-span-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-sm shadow-emerald-500/30">
                <Cpu aria-hidden="true" className="h-5 w-5" />
              </div>
              <div>
                <div className="font-bold text-slate-900">{defaultClubConfig.clubName}</div>
                <p className="text-xs font-medium text-emerald-700">{defaultClubConfig.collegeName}</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed">{defaultClubConfig.description}</p>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {defaultClubConfig.subtitle}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3 lg:col-span-6">
            <div className="space-y-3">
              <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-700">Explore</h2>
              <nav aria-label="Explore" className="flex flex-col gap-2.5">
                <Link href="/about" className="hover:text-emerald-700">About</Link>
                <Link href="/#roadmap" className="hover:text-emerald-700">Roadmap</Link>
                <Link href="/projects" className="hover:text-emerald-700">Projects</Link>
                <Link href="/events" className="hover:text-emerald-700">Events</Link>
              </nav>
            </div>
            <div className="space-y-3">
              <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-700">Resources</h2>
              <nav aria-label="Footer" className="flex flex-col gap-2.5">
                <Link href="/learn" className="hover:text-emerald-700">Learn</Link>
                <Link href="/lab" className="hover:text-emerald-700">IoT Lab</Link>
                <Link href="/privacy" className="hover:text-emerald-700">Privacy</Link>
                <Link href="/club-rules" className="hover:text-emerald-700">Club rules</Link>
              </nav>
            </div>
            <div className="col-span-2 space-y-3 sm:col-span-1">
              <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-700">Portal</h2>
              <nav aria-label="Portal" className="flex flex-col gap-2.5">
                <Link href="/login" className="hover:text-emerald-700">Sign in</Link>
                <Link href="/register" className="font-semibold text-emerald-700 hover:text-emerald-800">Registration</Link>
              </nav>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-4 pt-7 text-xs text-slate-500 sm:flex-row">
          <p>© 2026 {defaultClubConfig.clubName} · {defaultClubConfig.collegeName}</p>
          <Link href="/register" className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-white shadow-sm shadow-emerald-500/25 transition hover:bg-emerald-600">
            Apply to Join <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
