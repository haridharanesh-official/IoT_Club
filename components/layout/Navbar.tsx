"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useIoTApp } from "@/lib/store";
import { defaultClubConfig } from "@/lib/clubConfig";
import { AIMentorModal } from "@/components/ai/AIMentorModal";
import {
  Cpu,
  Compass,
  BookOpen,
  FolderGit2,
  Sliders,
  CheckCircle,
  Sparkles,
  Bot,
  Menu,
  X,
  FileCheck2,
  Terminal,
  Layers,
  ShieldCheck,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { demoRole, student } = useIoTApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Dynamic Navigation Items based on the active role / experience
  const getNavLinks = () => {
    switch (demoRole) {
      case "public":
        return [
          { label: "Home", href: "/" },
          { label: "About", href: "/about" },
          { label: "Projects", href: "/projects" },
          { label: "Events & Workshops", href: "/events" },
          { label: "Achievements", href: "/achievements" },
          { label: "Apply to Join", href: "/apply", highlight: true },
        ];
      case "applicant":
        return [
          { label: "Recruitment Status", href: "/apply" },
          { label: "Learning Syllabus", href: "/learn" },
          { label: "Showcase Projects", href: "/projects" },
          { label: "Workshops", href: "/events" },
        ];
      case "teacher":
        return [
          { label: "Evaluations", href: "/teacher" },
          { label: "Hardware Approvals", href: "/teacher/hardware" },
          { label: "Batch Analytics", href: "/teacher/analytics" },
          { label: "Workshops & QR", href: "/events" },
          { label: "Projects Review", href: "/projects" },
        ];
      case "admin":
        return [
          { label: "Admin Console", href: "/admin" },
          { label: "Recruitment Kanban", href: "/admin/recruitment" },
          { label: "Hardware Inventory", href: "/lab/inventory" },
          { label: "Live Lab Telemetry", href: "/lab/live" },
          { label: "Audit Logs", href: "/admin/audit" },
        ];
      case "student":
      default:
        return [
          { label: "Dashboard", href: "/dashboard" },
          { label: "Learn", href: "/learn" },
          { label: "Skill Tree", href: "/learn/skills" },
          { label: "Projects", href: "/projects" },
          { label: "Lab & Hardware", href: "/lab" },
          { label: "Hackathons", href: "/opportunities" },
          { label: "Profile", href: `/member/${student.username}` },
        ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <>
      <header className="w-full bg-dark-surface/90 border-b border-dark-border sticky top-8 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-iot-emerald to-iot-cyan flex items-center justify-center text-slate-950 shadow-md group-hover:scale-105 transition">
              <Cpu className="w-5 h-5 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-base tracking-tight">{defaultClubConfig.clubName}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-iot-emerald/10 text-emerald-400 border border-iot-emerald/30 font-mono">
                  v2.6 OS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 tracking-wide font-medium">{defaultClubConfig.subtitle}</p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    link.highlight
                      ? "bg-iot-emerald hover:bg-emerald-400 text-slate-950 font-semibold shadow-sm"
                      : isActive
                      ? "bg-slate-800 text-white border border-slate-700"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons: Certificate Verify + AI Mentor */}
          <div className="hidden lg:flex items-center gap-2">
            <Link
              href="/verify"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dark-border text-slate-300 hover:text-white hover:bg-slate-800 text-xs transition"
              title="Verify Certificate Authenticity"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-iot-cyan" />
              <span>Verify Cert</span>
            </Link>

            <button
              onClick={() => setIsAiModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600/30 to-cyan-600/30 border border-violet-500/40 text-violet-200 hover:border-cyan-400 text-xs font-medium transition shadow-sm"
            >
              <Bot className="w-3.5 h-3.5 text-iot-cyan" />
              <span>AI Mentor</span>
              <span className="w-1.5 h-1.5 rounded-full bg-iot-cyan animate-pulse" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Nav Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-dark-border bg-dark-surface p-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-dark-border flex flex-col gap-2">
              <Link
                href="/verify"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/80 text-xs text-slate-200"
              >
                <FileCheck2 className="w-4 h-4 text-iot-cyan" /> Verify Certificate
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsAiModalOpen(true);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-950/50 border border-violet-800 text-xs text-violet-300"
              >
                <Bot className="w-4 h-4 text-iot-cyan" /> Ask AI IoT Mentor
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Interactive AI Mentor Modal */}
      <AIMentorModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} />
    </>
  );
};
