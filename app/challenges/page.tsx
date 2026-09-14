"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useIoTApp } from "@/lib/store";
import { Trophy, CheckCircle2, Zap, ArrowRight, Clock, Send, Sparkles } from "lucide-react";

export default function ChallengesPage() {
  const { monthlyChallenges, registerForChallenge } = useIoTApp();
  const [challengeSubmitted, setChallengeSubmitted] = useState(false);
  const [repoUrl, setRepoUrl] = useState("");

  const currentChallenge = monthlyChallenges[0];

  const handleSubmitChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;
    setChallengeSubmitted(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 font-bold mb-1">
            <span>MONTHLY HACKING COMPETITION</span>
            <span>•</span>
            <span className="text-emerald-600">{currentChallenge.month}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Monthly IoT Innovation Challenge</h1>
          <p className="text-xs text-slate-500 mt-1">
            Test your hardware firmware and telemetry skills against an open university engineering challenge.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-mono font-bold shadow-xs">
          <Zap className="w-4 h-4 text-amber-600" />
          <span>Reward: +{currentChallenge.xpReward} XP</span>
        </div>
      </div>

      {/* Challenge Card */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card space-y-6 shadow-xs border border-slate-200/90 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">{currentChallenge.title}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-mono font-bold">
                {currentChallenge.difficulty}
              </span>
            </div>
            <p className="text-xs text-emerald-700 mt-1 font-semibold">{currentChallenge.tagline}</p>
          </div>

          <div className="text-xs text-slate-500 font-mono text-left sm:text-right">
            <div>Deadline: <span className="text-slate-900 font-bold">{currentChallenge.deadline}</span></div>
            <div className="text-emerald-700 font-semibold mt-0.5">{currentChallenge.participantsCount} Engineers Registered</div>
          </div>
        </div>

        {/* Technical Requirements Checklist */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Required Deliverables & Hardware:
          </h3>
          <div className="space-y-2">
            {currentChallenge.requirements.map((req, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3 text-xs text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{req}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action / Submission Area */}
        <div className="pt-4 border-t border-slate-200">
          {challengeSubmitted ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Your solution repository has been submitted for evaluation! Results will be published on October 1st.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmitChallenge} className="space-y-4 text-xs">
              <h4 className="font-bold text-slate-900 text-sm">Submit Challenge Solution</h4>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="url"
                  required
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/your-username/smart-energy-monitor-esp32"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                />
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Solution</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
