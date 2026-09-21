"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useIoTApp } from "@/lib/store";
import { HackathonOpportunity } from "@/lib/types";
import {
  Trophy,
  Award,
  Users,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  Clock,
} from "lucide-react";

export default function OpportunitiesPage() {
  const { currentUser, isAuthenticated, hackathons, updateHackathonStatus } = useIoTApp();
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");

  const filteredHackathons = hackathons.filter(
    (h) => selectedFilter === "ALL" || h.category === selectedFilter
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-slate-800">
      {/* 1. Mission Control Banner (Displayed ONLY after login) */}
      {isAuthenticated && currentUser && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#042f2e] via-[#064e3b] to-[#04362b] border border-emerald-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm text-white">
          <div>
            <span className="text-[10px] font-mono tracking-wider uppercase text-emerald-400 font-bold block mb-1">
              MISSION CONTROL
            </span>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-extrabold text-white">Welcome back, {currentUser.name.split(" ")[0]} 👋</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-medium">
                ✓ Approved
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/40 text-xs font-mono font-medium">
                Score: 9/10
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 font-mono">
              CodeVerse • MEDTECH / BIOTECH / HEALTHTECH • SIET Hackathons
            </p>
          </div>

          <Link
            href="/projects/teams"
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs shrink-0"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Find Teammates</span>
          </Link>
        </div>
      )}

      {/* Innovation & Hackathon Preparation Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base leading-tight">
              IoT Innovation & External Competition Cell (IPDC)
            </h3>
            <p className="text-xs text-emerald-50 mt-0.5 max-w-2xl leading-relaxed">
              Represent Sri Shakthi Institute of Engineering and Technology in national IoT competitions, Smart India Hackathon (SIH), and Texas Instruments design challenges.
            </p>
          </div>
        </div>
        <Link
          href="/projects/teams"
          className="px-5 py-2.5 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-xs shrink-0 shadow-xs transition flex items-center gap-1.5"
        >
          <span>Form Competition Team</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Filter Categories */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {["ALL", "Hackathons", "IoT Competitions", "Robotics", "AI & Vision", "Research"].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedFilter(cat)}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition shrink-0 ${
              selectedFilter === cat
                ? "bg-emerald-500 text-white shadow-xs font-semibold"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Active Hackathon Cards (Clean White Glass) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredHackathons.map((opp) => (
          <div
            key={opp.id}
            className="glass-card p-6 rounded-3xl flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-700 uppercase">{opp.category}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                  {opp.teamStatus}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900">{opp.title}</h3>
              <div className="text-xs text-slate-500">Organized by: {opp.organizer}</div>
              <p className="text-xs text-slate-600 leading-relaxed">{opp.description}</p>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
                <div className="text-amber-700 font-bold">Prize Pool: {opp.prizePool}</div>
                <div className="text-slate-500">Deadline: <span className="text-slate-900 font-semibold">{opp.deadline}</span> ({opp.mode})</div>
              </div>

              {opp.teamName && (
                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-900">Registered Team: {opp.teamName}</span>
                    <span className="font-mono text-[10px] text-emerald-700 font-medium">
                      {opp.teamMembers?.length} Members
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {opp.teamMembers?.map((m, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-full bg-white border border-emerald-200 text-[10px] text-slate-700 font-medium">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-[11px]">Status:</span>
                <select
                  value={opp.teamStatus}
                  onChange={(e) => updateHackathonStatus(opp.id, e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-800 text-[11px]"
                >
                  <option value="INTERESTED">INTERESTED</option>
                  <option value="LOOKING_FOR_TEAM">LOOKING FOR TEAM</option>
                  <option value="TEAM_CREATED">TEAM CREATED</option>
                  <option value="REGISTERED">REGISTERED</option>
                  <option value="PARTICIPATING">PARTICIPATING</option>
                  <option value="SUBMITTED">SUBMITTED</option>
                  <option value="FINALIST">FINALIST</option>
                  <option value="WINNER">WINNER</option>
                </select>
              </div>

              <span className="text-emerald-700 font-medium text-[11px]">Verified SIET Team</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
