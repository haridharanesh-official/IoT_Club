"use client";

import React from "react";
import Link from "next/link";
import { defaultClubConfig } from "@/lib/clubConfig";
import { Cpu, Mail, MapPin, Sparkles } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/icons/SocialIcons";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-white/70 border-t border-slate-200/80 text-slate-600 text-xs mt-20 relative overflow-hidden backdrop-blur-md">
      {/* Decorative light green gradient line */}
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-60" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12">
        {/* Top Branding & Short Description */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10 border-b border-slate-200/70">
          <div className="lg:col-span-6 space-y-3.5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white font-bold shadow-sm shadow-emerald-500/30">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-base tracking-tight block">
                  {defaultClubConfig.clubName}
                </span>
                <span className="text-[11px] text-emerald-700 font-medium">
                  {defaultClubConfig.collegeName}
                </span>
              </div>
            </div>

            <p className="text-slate-600 text-xs leading-relaxed max-w-xl">
              {defaultClubConfig.footerDescription || defaultClubConfig.description}
            </p>

            <div className="flex items-center gap-2 text-[11px]">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Learn. Build. Connect. Innovate.
              </span>
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
            <div className="space-y-2 text-xs text-slate-700 bg-white/80 p-4 rounded-2xl border border-slate-200/70 shadow-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{defaultClubConfig.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                <a href={`mailto:${defaultClubConfig.email}`} className="text-slate-700 hover:text-emerald-700 transition">
                  {defaultClubConfig.email}
                </a>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <a
                  href={defaultClubConfig.socialLinks.github}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition border border-slate-200/80 shadow-xs"
                  title="GitHub"
                >
                  <GithubIcon className="w-4 h-4" />
                </a>
                <a
                  href={defaultClubConfig.socialLinks.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition border border-slate-200/80 shadow-xs"
                  title="LinkedIn"
                >
                  <LinkedinIcon className="w-4 h-4" />
                </a>
              </div>

              <Link
                href="/apply"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs shadow-xs shadow-emerald-500/30 transition"
              >
                <span>Join IoT Club</span>
                <Sparkles className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* 5-Column Navigation Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 py-9">
          {/* Col 1: Club */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-emerald-700 font-mono">
              Club
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/about" className="hover:text-emerald-700 transition">About</Link>
              </li>
              <li>
                <Link href="/#vision" className="hover:text-emerald-700 transition">Vision</Link>
              </li>
              <li>
                <Link href="/#roadmap" className="hover:text-emerald-700 transition">Learning Journey</Link>
              </li>
              <li>
                <Link href="/projects" className="hover:text-emerald-700 transition">Projects</Link>
              </li>
              <li>
                <Link href="/achievements" className="hover:text-emerald-700 transition">Achievements</Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Learn */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-emerald-700 font-mono">
              Learn
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/#roadmap" className="hover:text-emerald-700 transition">Training Phases</Link>
              </li>
              <li>
                <Link href="/#certifications" className="hover:text-emerald-700 transition">Certifications</Link>
              </li>
              <li>
                <Link href="/challenges" className="hover:text-emerald-700 transition">Challenges</Link>
              </li>
              <li>
                <Link href="/learn" className="hover:text-emerald-700 transition">Resources</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Participate */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-emerald-700 font-mono">
              Participate
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/apply" className="hover:text-emerald-700 transition font-semibold text-emerald-600">Join Club</Link>
              </li>
              <li>
                <Link href="/opportunities" className="hover:text-emerald-700 transition">Hackathons</Link>
              </li>
              <li>
                <Link href="/projects" className="hover:text-emerald-700 transition">Projects</Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-emerald-700 transition">Events</Link>
              </li>
              <li>
                <Link href="/opportunities" className="hover:text-emerald-700 transition">Competitions</Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Community */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-emerald-700 font-mono">
              Community
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/dashboard" className="hover:text-emerald-700 transition">Members</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-emerald-700 transition">Core Team</Link>
              </li>
              <li>
                <Link href="/#ambassadors" className="hover:text-emerald-700 transition">Student Ambassadors</Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Portal */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-emerald-700 font-mono">
              Portal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/dashboard" className="hover:text-emerald-700 transition">Student Login</Link>
              </li>
              <li>
                <Link href="/teacher" className="hover:text-emerald-700 transition">Teacher Login</Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-emerald-700 transition">Admin Login</Link>
              </li>
              <li>
                <Link href="/apply" className="hover:text-emerald-700 transition font-semibold text-emerald-600">
                  Registration Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="mt-6 pt-5 border-t border-slate-200/70 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
          <p>
            © 2026 {defaultClubConfig.clubName} • {defaultClubConfig.collegeName}. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <Link href="/verify" className="hover:text-slate-800 transition">Verify Certification</Link>
            <span>•</span>
            <Link href="/#curriculum" className="hover:text-slate-800 transition">Curriculum</Link>
            <span>•</span>
            <span className="text-emerald-600 font-medium">Sri Shakthi Engineers</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
