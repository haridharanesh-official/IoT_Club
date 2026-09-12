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
} from "lucide-react";

export default function OpportunitiesPage() {
  const { hackathons, updateHackathonStatus } = useIoTApp();
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");

  const filteredHackathons = hackathons.filter(
    (h) => selectedFilter === "ALL" || h.category === selectedFilter
  );

  const getStatusColor = (status: HackathonOpportunity["teamStatus"]) => {
    switch (status) {
      case "WINNER":
        return "bg-amber-950/60 text-amber-300 border-amber-800 font-bold";
      case "FINALIST":
        return "bg-emerald-950/60 text-emerald-300 border-emerald-800 font-bold";
      case "REGISTERED":
      case "PARTICIPATING":
        return "bg-cyan-950/60 text-cyan-300 border-cyan-800 font-bold";
      case "LOOKING_FOR_TEAM":
        return "bg-violet-950/60 text-violet-300 border-violet-800";
      default:
        return "bg-slate-800 text-slate-400";
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-dark-border pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-iot-cyan mb-1">
            <span>EXTERNAL COMPETITIONS & RESEARCH</span>
            <span>•</span>
            <span className="text-emerald-400">SIH & IEEE PIPELINES</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Hackathons & Technical Opportunities</h1>
          <p className="text-xs text-slate-400 mt-1">
            Form competition rosters, maintain technical submission repositories, and track national finalist rankings.
          </p>
        </div>

        <Link
          href="/projects/teams"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-iot-emerald hover:bg-emerald-400 text-slate-950 text-xs font-bold transition"
        >
          <Users className="w-3.5 h-3.5" />
          <span>Find Teammates</span>
        </Link>
      </div>

      {/* Categories Filter Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
        {["ALL", "Hackathons", "IoT Competitions", "Robotics", "AI & Vision", "Research"].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedFilter(cat)}
            className={`px-3 py-1.5 rounded-lg transition shrink-0 ${
              selectedFilter === cat
                ? "bg-iot-cyan text-slate-950 font-bold"
                : "bg-dark-card border border-dark-border text-slate-400 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Opportunities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredHackathons.map((opp) => (
          <div
            key={opp.id}
            className="p-6 rounded-2xl bg-dark-card border border-dark-border flex flex-col justify-between space-y-5"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-iot-cyan uppercase">{opp.category}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border ${getStatusColor(opp.teamStatus)}`}>
                  {opp.teamStatus}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white">{opp.title}</h3>
              <div className="text-xs text-slate-400 font-mono">Organized by: {opp.organizer}</div>
              <p className="text-xs text-slate-300 leading-relaxed">{opp.description}</p>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1 font-mono">
                <div className="text-amber-400 font-bold">Prize Pool: {opp.prizePool}</div>
                <div className="text-slate-400">Deadline: <span className="text-white">{opp.deadline}</span> ({opp.mode})</div>
              </div>

              {opp.teamName && (
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="font-semibold text-white">Registered Team: {opp.teamName}</span>
                    <span className="font-mono text-[10px] text-emerald-400">
                      {opp.teamMembers?.length} Members
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {opp.teamMembers?.map((m, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-dark-border flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-mono text-[11px]">Update Status:</span>
                <select
                  value={opp.teamStatus}
                  onChange={(e) => updateHackathonStatus(opp.id, e.target.value as any)}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-white font-mono text-[11px]"
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

              <span className="text-emerald-400 font-mono text-[11px]">Verified Entry</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
