"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cpu, Menu, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { defaultClubConfig } from "@/lib/clubConfig";

type SessionNav = {
  role: "STUDENT" | "TEACHER" | "ADMIN" | "SUPER_ADMIN" | null;
  membershipStatus: string | null;
  username: string | null;
};

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [session, setSession] = useState<SessionNav | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function refreshSession() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!active) return;
      if (error || !user) {
        setSession(null);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role,membership_status")
        .eq("id", user.id)
        .maybeSingle();
      if (!active) return;

      const role = (["STUDENT", "TEACHER", "ADMIN", "SUPER_ADMIN"] as const)
        .find((value) => value === profile?.role) ?? null;
      let username: string | null = null;
      if (role === "STUDENT" && profile?.membership_status === "APPROVED") {
        const { data: student } = await supabase
          .from("student_profiles")
          .select("username")
          .eq("user_id", user.id)
          .maybeSingle();
        if (!active) return;
        username = student?.username ?? null;
      }
      setSession({
        role,
        membershipStatus: profile?.membership_status ?? null,
        username,
      });
    }

    void refreshSession();
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      void refreshSession();
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const links = [{ label: "Home", href: "/" }, { label: "About", href: "/#about" }];
  if (session?.role === "STUDENT") {
    links.push(session.membershipStatus === "APPROVED"
      ? { label: "Dashboard", href: "/dashboard" }
      : { label: "Membership status", href: "/membership/status" });
    if (session.membershipStatus === "APPROVED" && session.username) {
      links.push({ label: "Profile", href: `/member/${session.username}` });
    }
  } else if (session?.role === "ADMIN" || session?.role === "SUPER_ADMIN") {
    links.push({ label: "Membership", href: "/admin/membership" });
  }

  return (
    <header className="w-full bg-white/85 border-b border-slate-200/80 sticky top-0 z-40 backdrop-blur-xl shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white shadow-sm">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-base tracking-tight">{defaultClubConfig.clubName}</span>
            <p className="text-[11px] text-emerald-600 tracking-wide font-medium hidden sm:block">{defaultClubConfig.collegeName}</p>
          </div>
        </Link>

        <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <Link key={link.href} href={link.href}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${pathname === link.href ? "bg-emerald-50 text-emerald-800 border border-emerald-200/70" : "text-slate-600 hover:text-slate-950 hover:bg-slate-100/80"}`}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {session ? (
            <Link href="/auth/account" className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs">Account</Link>
          ) : (
            <>
              <Link href="/register" className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs">Apply to Join</Link>
              <Link href="/login" className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs">Login</Link>
            </>
          )}
        </div>

        <button type="button" onClick={() => setMobileMenuOpen((open) => !open)}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen} aria-controls="mobile-navigation">
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <nav id="mobile-navigation" aria-label="Mobile navigation" className="md:hidden border-t border-slate-200 bg-white p-4 space-y-2 text-xs">
          {links.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 font-medium">{link.label}</Link>
          ))}
          <div className="pt-2 border-t border-slate-100 flex gap-2">
            {session ? (
              <Link href="/auth/account" onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2 rounded-xl bg-slate-900 text-white font-bold">Account</Link>
            ) : (
              <>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center py-2 rounded-xl bg-emerald-500 text-white font-bold">Apply to Join</Link>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center py-2 rounded-xl bg-slate-900 text-white font-bold">Login</Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};
