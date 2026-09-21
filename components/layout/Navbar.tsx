"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useIoTApp } from "@/lib/store";
import { defaultClubConfig } from "@/lib/clubConfig";
import {
  Cpu,
  Compass,
  BookOpen,
  FolderGit2,
  Sliders,
  CheckCircle,
  Sparkles,
  Menu,
  X,
  FileCheck2,
  Terminal,
  Layers,
  ShieldCheck,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { currentUser, isAuthenticated, logout, student } = useIoTApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dynamic Navigation Items based on verified authentication & role
  const getNavLinks = () => {
    if (!isAuthenticated || !currentUser) {
      return [
        { label: "Home", href: "/" },
        { label: "About", href: "/#about" },
        { label: "Roadmap", href: "/#roadmap" },
        { label: "IPDC Cell", href: "/opportunities" },
      ];
    }

    switch (currentUser.role) {
      case "TEACHER":
        return [
          { label: "Evaluations", href: "/teacher" },
          { label: "Projects Review", href: "/projects" },
          { label: "Hardware Approvals", href: "/teacher/hardware" },
          { label: "Batch Analytics", href: "/teacher/analytics" },
          { label: "Workshops", href: "/events" },
        ];
      case "CLUB_LEAD":
        return [
          { label: "Project Workspace", href: "/projects" },
          { label: "Student Dashboard", href: "/dashboard" },
          { label: "Teams & Recruitment", href: "/projects/teams" },
          { label: "Live Lab Telemetry", href: "/lab/live" },
          { label: "Challenges", href: "/challenges" },
        ];
      case "ADMIN":
        return [
          { label: "Admin Console", href: "/admin" },
          { label: "Projects Governance", href: "/projects" },
          { label: "Recruitment Kanban", href: "/admin/recruitment" },
          { label: "Hardware Inventory", href: "/lab/inventory" },
          { label: "Live Lab Telemetry", href: "/lab/live" },
          { label: "Audit Logs", href: "/admin/audit" },
          { label: "Verify Cert", href: "/verify" },
        ];
      case "STUDENT":
      default:
        return [
          { label: "Dashboard", href: "/dashboard" },
          { label: "Skill Tree", href: "/learn/skills" },
          { label: "Projects", href: "/projects" },
          { label: "IoT Lab", href: "/lab" },
          { label: "Competitions", href: "/opportunities" },
          { label: "Verify Cert", href: "/verify" },
          { label: "Profile", href: `/member/${student.username}` },
        ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <>
      <header className="w-full bg-white/85 border-b border-slate-200/80 sticky top-0 z-40 backdrop-blur-xl shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/30 group-hover:scale-105 transition">
              <Cpu className="w-5 h-5 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 text-base tracking-tight">
                  {defaultClubConfig.clubName}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                  IoT Club
                </span>
              </div>
              <p className="text-[11px] text-emerald-600 tracking-wide font-medium hidden sm:block">
                {defaultClubConfig.collegeName}
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200/70 font-semibold"
                      : "text-slate-600 hover:text-slate-950 hover:bg-slate-100/80"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div className="hidden lg:flex items-center gap-2.5">
            {/* User Session or Sign In */}
            {isAuthenticated && currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-slate-200">
                <Link
                  href={currentUser.portalRedirect}
                  className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition text-xs"
                >
                  <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white font-bold text-[10px] flex items-center justify-center">
                    {currentUser.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <span className="font-bold text-slate-900 block leading-tight truncate max-w-[110px]">
                      {currentUser.name.split(" ")[0]}
                    </span>
                    <span className="text-[9px] font-mono text-emerald-700 font-bold block">
                      {currentUser.role}
                    </span>
                  </div>
                </Link>

                <button
                  onClick={logout}
                  className="px-2.5 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold transition cursor-pointer"
                  title="Sign Out"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/apply"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition"
                >
                  <span>Apply to Join</span>
                </Link>
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition"
                >
                  <span>Login</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Nav Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl p-4 space-y-2 text-xs">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 font-medium"
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-2 border-t border-slate-100">
              {isAuthenticated && currentUser ? (
                <div className="flex items-center justify-between pt-1">
                  <span className="font-bold text-slate-800">
                    {currentUser.name} ({currentUser.role})
                  </span>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-rose-600 font-bold"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/apply"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition"
                  >
                    Apply to Join
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition"
                  >
                    Login
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};
