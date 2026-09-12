"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Lightbulb, TrendingUp, AlertCircle, Sparkles, BookOpen } from "lucide-react";

export default function TeacherAnalyticsPage() {
  const batchSkills = [
    { name: "Arduino & Basics", percent: 84, color: "bg-emerald-500", status: "High Competence" },
    { name: "ESP32 Architecture", percent: 81, color: "bg-emerald-400", status: "High Competence" },
    { name: "Git & Version Control", percent: 73, color: "bg-cyan-500", status: "Adequate" },
    { name: "MQTT & Pub/Sub", percent: 67, color: "bg-cyan-400", status: "Adequate" },
    { name: "Raspberry Pi Gateways", percent: 55, color: "bg-violet-500", status: "Needs Practice" },
    { name: "Linux & Shell Scripting", percent: 44, color: "bg-amber-500", status: "Needs Focus" },
    { name: "IoT Device Security & TLS", percent: 31, color: "bg-rose-500", status: "Critical Gap" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Link */}
      <Link
        href="/teacher"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Teacher Portal</span>
      </Link>

      {/* Header */}
      <div className="border-b border-dark-border pb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-iot-cyan mb-1">
          <span>COHORT PROFICIENCY ENGINE</span>
          <span>•</span>
          <span className="text-emerald-400">186 CLUB MEMBERS</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Batch-Level Skill Analytics (Section 31)</h1>
        <p className="text-xs text-slate-400 mt-1">
          Cohort capability distribution across microcontrollers, networking protocols, Linux, and hardware security.
        </p>
      </div>

      {/* Recommendations Banner based on data */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-slate-900 border border-amber-800/60 flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
          <Lightbulb className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs">
          <h3 className="font-bold text-white text-sm">Curriculum Recommendation for Next Workshop</h3>
          <p className="text-slate-300 leading-relaxed">
            Data indicates that while <span className="text-emerald-400 font-semibold">Arduino (84%)</span> and{" "}
            <span className="text-cyan-400 font-semibold">ESP32 (81%)</span> are well-mastered,{" "}
            <span className="text-rose-400 font-semibold">IoT Device Security & TLS (31%)</span> and{" "}
            <span className="text-amber-400 font-semibold">Linux Shell (44%)</span> represent significant cohort skill gaps.
          </p>
          <div className="pt-2 text-iot-cyan font-mono text-[11px]">
            Action: Schedule an "Embedded Cryptography & Flash Security Bootcamp" prior to national hackathons.
          </div>
        </div>
      </div>

      {/* Skill Distribution Bars */}
      <div className="p-6 sm:p-8 rounded-2xl bg-dark-card border border-dark-border space-y-6">
        <h3 className="font-bold text-white text-base">Cohort Capability Distribution (186 Students)</h3>

        <div className="space-y-4">
          {batchSkills.map((skill, idx) => (
            <div key={idx} className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between font-mono">
                <span className="font-semibold text-white">{skill.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 text-[11px]">{skill.status}</span>
                  <span className="font-bold text-iot-cyan text-sm">{skill.percent}%</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                <div
                  className={`h-full ${skill.color} transition-all duration-700`}
                  style={{ width: `${skill.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
