"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useIoTApp } from "@/lib/store";
import { Users, Plus, CheckCircle2, ArrowRight, UserPlus, Sparkles, Send } from "lucide-react";

export default function TeamsPage() {
  const { teamRecruitments, applyToTeam, student } = useIoTApp();

  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [applicantNote, setApplicantNote] = useState<string>("");
  const [appliedSuccess, setAppliedSuccess] = useState<boolean>(false);

  const activePost = teamRecruitments.find((p) => p.id === selectedPostId);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPostId || !selectedRole) return;

    applyToTeam(selectedPostId, student.name, selectedRole);
    setAppliedSuccess(true);
    setTimeout(() => {
      setAppliedSuccess(false);
      setSelectedPostId(null);
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-dark-border pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-iot-cyan mb-1">
            <span>PEER COLLABORATION & MATCHMAKING</span>
            <span>•</span>
            <span className="text-emerald-400">OPEN POSITIONS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Project Team Formation Board</h1>
          <p className="text-xs text-slate-400 mt-1">
            Discover active hardware projects seeking developers, embedded engineers, and computer vision specialists.
          </p>
        </div>

        <Link
          href="/projects"
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
        >
          ← Back to Project Hub
        </Link>
      </div>

      {/* Recruitment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teamRecruitments.map((post) => (
          <div
            key={post.id}
            className="p-6 rounded-2xl bg-dark-card border border-dark-border flex flex-col justify-between space-y-5"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-iot-cyan">PROJECT OPENING</span>
                <span className="text-[11px] font-mono text-slate-400">
                  {post.applicantsCount} Candidates Applied
                </span>
              </div>
              <h3 className="text-xl font-bold text-white">{post.projectTitle}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{post.description}</p>

              <div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Seeking Specializations:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {post.openRoles.map((role, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-emerald-300 font-mono"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-dark-border flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Lead: <span className="text-white font-medium">{post.leadName}</span>
              </span>
              <button
                onClick={() => {
                  setSelectedPostId(post.id);
                  setSelectedRole(post.openRoles[0]);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-iot-emerald hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Apply for Role</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Application Modal */}
      {selectedPostId && activePost && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
          <div className="bg-dark-card border border-dark-border p-6 rounded-2xl max-w-md w-full space-y-4 text-xs">
            {appliedSuccess ? (
              <div className="text-center py-6 space-y-2">
                <CheckCircle2 className="w-12 h-12 text-iot-emerald mx-auto animate-bounce" />
                <h3 className="font-bold text-white text-base">Application Submitted!</h3>
                <p className="text-slate-300">
                  {activePost.leadName} has been notified with your student profile.
                </p>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-4">
                <div>
                  <span className="text-[10px] font-mono text-iot-cyan uppercase">JOIN PROJECT TEAM</span>
                  <h3 className="font-bold text-base text-white mt-0.5">{activePost.projectTitle}</h3>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Select Role You Wish to Fill *</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white"
                  >
                    {activePost.openRoles.map((r, i) => (
                      <option key={i} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Relevant Skills & Experience</label>
                  <textarea
                    rows={3}
                    value={applicantNote}
                    onChange={(e) => setApplicantNote(e.target.value)}
                    placeholder="Briefly mention your prior experience with ROS, C++, computer vision..."
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
                  Submitting as <span className="text-white font-medium">{student.name}</span> (Level {student.level} • {student.rollNumber}).
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPostId(null)}
                    className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-iot-emerald hover:bg-emerald-400 text-slate-950 font-bold"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Application</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
