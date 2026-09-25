import Link from "next/link";
import { Cpu } from "lucide-react";
import { defaultClubConfig } from "@/lib/clubConfig";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white text-slate-600">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-8">
        <div className="max-w-md space-y-3">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <Cpu aria-hidden="true" className="h-5 w-5 text-emerald-600" />
            {defaultClubConfig.clubName}
          </div>
          <p className="text-sm">{defaultClubConfig.collegeName}</p>
          <p className="text-sm leading-relaxed">{defaultClubConfig.description}</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
          <Link href="/about" className="hover:text-emerald-700">About</Link>
          <Link href="/register" className="hover:text-emerald-700">Apply</Link>
          <Link href="/login" className="hover:text-emerald-700">Sign in</Link>
          <Link href="/privacy" className="hover:text-emerald-700">Privacy</Link>
          <Link href="/club-rules" className="hover:text-emerald-700">Club rules</Link>
        </nav>
      </div>
    </footer>
  );
}
