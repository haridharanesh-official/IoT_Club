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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-dark-border pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
            <span>MONTHLY HACKING COMPETITION</span>
            <span>•</span>
            <span className="text-iot-cyan">{currentChallenge.month}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Monthly IoT Innovation Challenge</h1>
          <p className="text-xs text-slate-400 mt-1">
            Test your hardware firmware and telemetry skills against an open university engineering challenge.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-950/40 text-amber-300 border border-amber-800 text-xs font-mono font-bold">
          <Zap className="w-4 h-4" />
          <span>Reward: +{currentChallenge.xpReward} XP</span>
        </div>
      </div>

      {/* Challenge Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-dark-card border border-dark-border space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-dark-border">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">{currentChallenge.title}</h2>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-cyan-400 border border-slate-700 text-[11px] font-mono">
                {currentChallenge.difficulty}
              </span>
            </div>
            <p className="text-xs text-iot-cyan mt-1 font-medium">{currentChallenge.tagline}</p>
          </div>

          <div className="text-xs text-slate-400 font-mono text-left sm:text-right">
            <div>Deadline: <span className="text-white font-bold">{currentChallenge.deadline}</span></div>
            <div className="text-emerald-400 mt-0.5">{currentChallenge.participantsCount} Engineers Registered</div>
          </div>
        </div>

        {/* Technical Requirements Checklist */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Required Deliverables & Hardware:
          </h3>
          <div className="space-y-2">
            {currentChallenge.requirements.map((req, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center gap-3 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-iot-emerald shrink-0" />
                <span>{req}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action / Submission Area */}
        <div className="pt-4 border-t border-dark-border">
          {challengeSubmitted ? (
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-iot-emerald" />
              <span>Your solution repository has been submitted for evaluation! Results will be published on October 1st.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmitChallenge} className="space-y-4 text-xs">
              <h4 className="font-semibold text-white text-sm">Submit Challenge Solution</h4>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="url"
                  required
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/your-username/smart-energy-monitor-esp32"
                  className="flex-1 bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-iot-cyan"
                />
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 px-6 py-2 rounded-xl bg-iot-emerald hover:bg-emerald-400 text-slate-950 font-bold transition shadow-md"
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
