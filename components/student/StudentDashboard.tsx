"use client";

import React from "react";
import Link from "next/link";
import { useIoTApp } from "@/lib/store";
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
  Radio,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

export const StudentDashboard: React.FC = () => {
  const { student, tracks, projects, hardwareAssets, events, xpTransactions, updateTaskStatus } = useIoTApp();

  const currentTrack = tracks.find((t) => t.slug === "embedded-systems") || tracks[1];
  const activeProject = projects.find((p) => p.leadId === student.id) || projects[0];
  const issuedHardware = hardwareAssets.filter((a) => a.currentHolderId === student.id);
  const upcomingEvent = events[0];

  const pendingTasks = activeProject.tasks.filter((t) => t.status !== "COMPLETED");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Student Welcome & Level Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#11192e] to-[#0c1626] border border-dark-border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-iot-emerald via-iot-cyan to-iot-violet p-0.5 shadow-lg">
            <div className="w-full h-full bg-dark-bg rounded-2xl flex items-center justify-center font-bold text-xl text-white">
              HD
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                Good afternoon, {student.name} 👋
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-iot-emerald/20 text-emerald-400 border border-iot-emerald/40 text-xs font-mono font-semibold">
                Level {student.level} • {student.levelTitle}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {student.headline} • {student.department} ({student.rollNumber})
            </p>
          </div>
        </div>

        {/* Quick XP & Stats Pills */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700">
            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" /> TOTAL XP EARNED
            </div>
            <div className="text-lg font-bold text-amber-400 font-mono">{student.xp.toLocaleString()} XP</div>
          </div>

          <div className="px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700">
            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
              <Award className="w-3 h-3 text-iot-cyan" /> CERTIFICATES
            </div>
            <div className="text-lg font-bold text-white font-mono">{student.stats.certificates} Verified</div>
          </div>

          <Link
            href={`/member/${student.username}`}
            className="px-4 py-2.5 rounded-xl bg-iot-emerald hover:bg-emerald-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5"
          >
            <span>Public Portfolio</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Answer Immediately Grid (Section 10) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-dark-card border border-dark-border">
          <div className="text-[10px] text-slate-400 font-mono">ACTIVE PROJECT</div>
          <div className="text-sm font-bold text-white mt-1 truncate">{activeProject.title}</div>
          <div className="text-[10px] text-emerald-400 mt-0.5">{activeProject.progressPercent}% progress</div>
        </div>

        <div className="p-3.5 rounded-xl bg-dark-card border border-dark-border">
          <div className="text-[10px] text-slate-400 font-mono">PENDING TASKS</div>
          <div className="text-sm font-bold text-amber-400 mt-1">{pendingTasks.length} Action Items</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Assigned to you</div>
        </div>

        <div className="p-3.5 rounded-xl bg-dark-card border border-dark-border">
          <div className="text-[10px] text-slate-400 font-mono">CURRENT TRACK</div>
          <div className="text-sm font-bold text-cyan-400 mt-1 truncate">{currentTrack.title}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{currentTrack.progressPercent}% complete</div>
        </div>

        <div className="p-3.5 rounded-xl bg-dark-card border border-dark-border">
          <div className="text-[10px] text-slate-400 font-mono">ISSUED HARDWARE</div>
          <div className="text-sm font-bold text-emerald-400 mt-1">{issuedHardware.length} Physical Units</div>
          <div className="text-[10px] text-slate-400 mt-0.5">ESP32-S3 (#ESP024)</div>
        </div>

        <div className="p-3.5 rounded-xl bg-dark-card border border-dark-border">
          <div className="text-[10px] text-slate-400 font-mono">UPCOMING WORKSHOP</div>
          <div className="text-sm font-bold text-white mt-1 truncate">{upcomingEvent.title}</div>
          <div className="text-[10px] text-cyan-400 mt-0.5">This Saturday 10 AM</div>
        </div>

        <div className="p-3.5 rounded-xl bg-dark-card border border-dark-border">
          <div className="text-[10px] text-slate-400 font-mono">HACKATHONS</div>
          <div className="text-sm font-bold text-violet-400 mt-1">SIH 2026 Finalist</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Team CareGrid</div>
        </div>
      </div>

      {/* Main Sections: 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Learning & Projects */}
        <div className="lg:col-span-2 space-y-8">
          {/* Continue Learning Card */}
          <div className="p-6 rounded-2xl bg-dark-card border border-dark-border space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-iot-cyan" />
                <h2 className="font-bold text-white text-base">Continue Learning</h2>
              </div>
              <Link href="/learn" className="text-xs text-iot-cyan hover:underline flex items-center gap-1">
                <span>View 8 Tracks</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono text-iot-cyan uppercase">Track 2 • Module 202</span>
                  <h3 className="font-bold text-white text-sm mt-0.5">ESP32 Practical MQTT Automation</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Building resilient MQTT publisher/subscriber nodes with FreeRTOS queues, Last Will Testament, and BH1750 sensors.
                  </p>
                </div>
                <Link
                  href="/learn"
                  className="px-3.5 py-1.5 rounded-lg bg-iot-cyan hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition shrink-0"
                >
                  Resume Module
                </Link>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-1">
                  <span>Track Progress</span>
                  <span className="text-emerald-400">{currentTrack.progressPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-iot-emerald to-iot-cyan transition-all duration-500"
                    style={{ width: `${currentTrack.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
              <span>Next Milestone: ESP32 Developer Badge</span>
              <Link href="/learn/skills" className="text-slate-300 hover:text-white flex items-center gap-1">
                <span>Interactive Skill Tree</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Active Project & Tasks */}
          <div className="p-6 rounded-2xl bg-dark-card border border-dark-border space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-iot-emerald" />
                <h2 className="font-bold text-white text-base">My Active Project: {activeProject.title}</h2>
              </div>
              <Link href="/projects" className="text-xs text-iot-cyan hover:underline">
                Project Workspace →
              </Link>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{activeProject.description}</p>

            {/* Task Checklist */}
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Assigned Sprint Tasks ({activeProject.tasks.length})
              </h3>
              <div className="space-y-2">
                {activeProject.tasks.map((task) => {
                  const isDone = task.status === "COMPLETED";
                  return (
                    <div
                      key={task.id}
                      className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            updateTaskStatus(
                              activeProject.id,
                              task.id,
                              isDone ? "TODO" : "COMPLETED"
                            )
                          }
                          className={`w-5 h-5 rounded flex items-center justify-center transition ${
                            isDone
                              ? "bg-iot-emerald text-slate-950"
                              : "border border-slate-700 hover:border-slate-500 text-transparent"
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <div>
                          <div className={`font-medium ${isDone ? "line-through text-slate-500" : "text-white"}`}>
                            {task.title}
                          </div>
                          <div className="text-[11px] text-slate-400">{task.description}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                            task.priority === "HIGH"
                              ? "bg-rose-950/40 text-rose-400 border border-rose-800"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {task.priority}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{task.dueDate}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Lab, Hardware & XP Ledger */}
        <div className="space-y-8">
          {/* Issued Hardware Status */}
          <div className="p-6 rounded-2xl bg-dark-card border border-dark-border space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-amber-400" />
                <h2 className="font-bold text-white text-base">Lab Hardware In Hand</h2>
              </div>
              <Link href="/lab" className="text-xs text-iot-cyan hover:underline">
                Lab Inventory →
              </Link>
            </div>

            <div className="space-y-2.5">
              {issuedHardware.map((asset) => (
                <div key={asset.assetId} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-emerald-400 font-bold">#{asset.assetId}</span>
                    <span className="px-1.5 py-0.2 rounded bg-amber-950/40 text-amber-400 border border-amber-800/60 text-[10px]">
                      Return by {asset.expectedReturnDate}
                    </span>
                  </div>
                  <div className="font-semibold text-white">{asset.name}</div>
                  <div className="text-[11px] text-slate-400">Allocated to: {asset.projectAllocation}</div>
                </div>
              ))}
            </div>

            <Link
              href="/lab"
              className="block text-center w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
            >
              Request Additional Sensors / Boards
            </Link>
          </div>

          {/* XP Transactions Ledger (Section 15) */}
          <div className="p-6 rounded-2xl bg-dark-card border border-dark-border space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <h2 className="font-bold text-white text-base">XP Ledger Activity</h2>
              </div>
              <span className="text-[11px] font-mono text-slate-400">{xpTransactions.length} Transactions</span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {xpTransactions.slice(0, 6).map((tx) => (
                <div key={tx.id} className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800 text-xs flex items-center justify-between gap-2">
                  <div>
                    <div className="font-medium text-slate-200">{tx.reason}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{tx.timestamp} • {tx.category}</div>
                  </div>
                  <span className="font-mono font-bold text-amber-400 text-xs shrink-0">
                    +{tx.amount} XP
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
