"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useIoTApp } from "@/lib/store";
import { AIMentorModal } from "@/components/ai/AIMentorModal";
import {
  GraduationCap,
  Layers,
  Cpu,
  FolderGit2,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Zap,
  Award,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckSquare,
  Square,
  Boxes,
  Kanban,
  FileText,
  Activity,
  User,
  Sliders,
} from "lucide-react";
import { GithubIcon } from "@/components/icons/SocialIcons";

export const StudentDashboard: React.FC = () => {
  const {
    student,
    tracks,
    projects,
    hardwareAssets,
    events,
    xpTransactions,
    updateTaskStatus,
  } = useIoTApp();

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [completedActionItems, setCompletedActionItems] = useState<{ [key: string]: boolean }>({});

  const currentTrack = tracks.find((t) => t.slug === "embedded-systems") || tracks[1];
  const activeProject =
    projects.find((p) => p.leadId === student.id) || projects[0];
  const issuedHardware = hardwareAssets.filter(
    (a) => a.currentHolderId === student.id || a.status === "ISSUED"
  );
  const upcomingEvent = events[0];

  // Active Project R1 Review
  const r1Review = activeProject?.reviews?.find((r) => r.roundKey === "R1");

  // Toggle student action checklist
  const toggleActionItem = (item: string) => {
    setCompletedActionItems((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      {/* 1. Student Welcome Header & Level Progression */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white font-black text-xl flex items-center justify-center shadow-sm shrink-0">
              {student.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 font-bold mb-0.5">
                <span>STUDENT MEMBER WORKSPACE</span>
                <span>•</span>
                <span>{student.rollNumber}</span>
                <span>•</span>
                <span>{student.department}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Welcome back, {student.name} 👋
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
                {student.headline || "Embedded Systems & IoT Specialization Engineer"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href={`/member/${student.username}`}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold shadow-xs transition"
            >
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>Public Portfolio</span>
            </Link>

            <button
              onClick={() => setIsAiModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Lab Mentor</span>
            </button>
          </div>
        </div>

        {/* Level Progression & XP Bar */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-[10px] text-slate-500 font-mono uppercase font-bold">
              CLUB RANK & LEVEL
            </div>
            <div className="text-base font-black text-slate-900 mt-1">
              Level {student.level}: {student.levelTitle}
            </div>
            <div className="text-[11px] text-emerald-700 font-medium mt-0.5">
              {student.xp} Total XP Earned
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-[10px] text-slate-500 font-mono uppercase font-bold">
              ACTIVE HARDWARE PROJECTS
            </div>
            <div className="text-base font-black text-slate-900 mt-1">
              {student.stats.projects} Initiatives
            </div>
            <Link
              href="/projects"
              className="text-[11px] text-emerald-700 font-bold hover:underline mt-0.5 block"
            >
              View in Project Workspace →
            </Link>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-[10px] text-slate-500 font-mono uppercase font-bold">
              BORROWED LAB ASSETS
            </div>
            <div className="text-base font-black text-slate-900 mt-1">
              {issuedHardware.length} Hardware Units
            </div>
            <Link
              href="/lab"
              className="text-[11px] text-emerald-700 font-bold hover:underline mt-0.5 block"
            >
              Inspect in IoT Lab →
            </Link>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-[10px] text-slate-500 font-mono uppercase font-bold">
              EARNED CERTIFICATES
            </div>
            <div className="text-base font-black text-slate-900 mt-1">
              {student.stats.certificates} Verified Credentials
            </div>
            <Link
              href="/verify"
              className="text-[11px] text-emerald-700 font-bold hover:underline mt-0.5 block"
            >
              Verify Credentials →
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Active Project & Review Status (Highlighting Project Workspace Features) */}
      {activeProject && (
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
                  {activeProject.category}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-mono text-emerald-700 font-bold">
                  {activeProject.progressPercent}% Completed
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900">{activeProject.title}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{activeProject.tagline}</p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Link
                href="/projects"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition"
              >
                <FolderGit2 className="w-3.5 h-3.5" />
                <span>Open Project Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Review Status Banner */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-slate-900">
                  {r1Review?.roundTitle || "R1 First Review (Round 1) Evaluation"}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    r1Review?.status === "APPROVED"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : r1Review?.status === "REVISIONS_REQUESTED"
                      ? "bg-rose-50 text-rose-800 border border-rose-200"
                      : "bg-amber-50 text-amber-800 border border-amber-200"
                  }`}
                >
                  {r1Review?.status === "APPROVED"
                    ? `Approved • ${r1Review.score || 9.2}/10`
                    : r1Review?.status === "REVISIONS_REQUESTED"
                    ? "Revisions Requested"
                    : "Pending Review"}
                </span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                {r1Review?.feedback ||
                  "First Review has not been conducted yet. Feedback and action items will be updated here live once evaluated."}
              </p>
            </div>

            <Link
              href="/projects"
              className="text-xs text-emerald-700 font-bold hover:underline shrink-0 flex items-center gap-1"
            >
              <span>View Full Evaluation Rubrics</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Action checklist from faculty */}
          {r1Review?.actionItems && r1Review.actionItems.length > 0 && (
            <div className="space-y-2 pt-1">
              <span className="text-xs font-bold text-slate-800 block">
                Outstanding Review Action Items:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {r1Review.actionItems.map((item, idx) => {
                  const isDone = !!completedActionItems[item];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleActionItem(item)}
                      className={`flex items-start gap-2 p-2.5 rounded-xl text-xs cursor-pointer transition ${
                        isDone
                          ? "bg-emerald-50 text-emerald-800 line-through"
                          : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {isDone ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      )}
                      <span className="text-[11px]">{item}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Learning & Tasks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Continue Learning */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">Active Learning Track</h3>
            </div>
            <Link
              href="/learn"
              className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1"
            >
              <span>Explore All Tracks</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase">
                  {currentTrack.title}
                </span>
                <h4 className="font-bold text-slate-900 text-sm mt-0.5">
                  ESP32 Practical MQTT & FreeRTOS Architecture
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Building resilient sensor telemetry with FreeRTOS queues, Last Will Testament, and TLS encryption.
                </p>
              </div>
              <Link
                href="/learn"
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition shrink-0 shadow-xs"
              >
                Resume
              </Link>
            </div>

            <div className="pt-2 border-t border-slate-200/60">
              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1 font-mono">
                <span>Progress</span>
                <span className="font-bold text-emerald-700">72%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full w-[72%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Issued Hardware Assets */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Boxes className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">Issued Lab Hardware</h3>
            </div>
            <Link
              href="/lab"
              className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1"
            >
              <span>Borrow Components</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {issuedHardware.slice(0, 3).map((asset) => (
              <div
                key={asset.assetId}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">{asset.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {asset.category} • Condition: {asset.condition}
                    </span>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {asset.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Upcoming Club Events & Hackathon Prep */}
      {upcomingEvent && (
        <div className="glass-card p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">Next Club Workshop</h3>
            </div>
            <Link
              href="/events"
              className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1"
            >
              <span>View All Events</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200 inline-block mb-1">
                {upcomingEvent.type}
              </span>
              <h4 className="font-bold text-slate-900 text-sm">{upcomingEvent.title}</h4>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Venue: {upcomingEvent.venue} • Date: {upcomingEvent.date} ({upcomingEvent.startTime})
              </p>
            </div>

            <Link
              href="/events"
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-xs self-start sm:self-auto"
            >
              Check-In / Register
            </Link>
          </div>
        </div>
      )}

      {/* AI Mentor Modal */}
      <AIMentorModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} />
    </div>
  );
};
