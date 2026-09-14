"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useIoTApp } from "@/lib/store";
import { defaultClubConfig } from "@/lib/clubConfig";
import {
  Award,
  Cpu,
  Layers,
  Sparkles,
  Zap,
  ExternalLink,
  CheckCircle2,
  FolderGit2,
  ShieldCheck,
} from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/icons/SocialIcons";

export default function MemberProfilePage() {
  const params = useParams();
  const username = (params?.username as string) || "hari";
  const { student, projects, certificates } = useIoTApp();

  const myProjects = projects.filter((p) => p.leadId === student.id || p.id === "prj-001");

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-slate-800">
      {/* Profile Header Card */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-[#032b2b] via-[#053e3e] to-[#043333] border border-emerald-900/50 shadow-xl relative overflow-hidden text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-emerald-500/30 border border-emerald-400/40 p-1 shadow-lg flex items-center justify-center">
              <div className="w-full h-full bg-emerald-950/60 rounded-xl flex items-center justify-center font-bold text-2xl text-emerald-300">
                HD
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{student.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-mono font-bold">
                  Level {student.level} • {student.levelTitle}
                </span>
              </div>
              <p className="text-sm text-emerald-300 font-medium mt-1">{student.headline}</p>
              <p className="text-xs text-slate-200 mt-2 max-w-xl leading-relaxed">{student.bio}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href={student.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-white border border-white/20 transition"
            >
              <GithubIcon className="w-4 h-4" />
              <span>GitHub</span>
            </a>
            <a
              href={student.linkedinUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-white border border-white/20 transition"
            >
              <LinkedinIcon className="w-4 h-4" />
              <span>LinkedIn</span>
            </a>
          </div>
        </div>

        {/* Verified Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-8 pt-6 border-t border-emerald-800/60 text-xs">
          <div>
            <div className="text-[10px] font-mono text-emerald-300 uppercase">Club Projects</div>
            <div className="text-lg font-bold text-white font-mono mt-0.5">{student.stats.projects}</div>
          </div>
          <div>
            <div className="text-[10px] font-mono text-emerald-300 uppercase">Hackathons</div>
            <div className="text-lg font-bold text-white font-mono mt-0.5">{student.stats.hackathons}</div>
          </div>
          <div>
            <div className="text-[10px] font-mono text-emerald-300 uppercase">Workshops</div>
            <div className="text-lg font-bold text-white font-mono mt-0.5">{student.stats.workshops}</div>
          </div>
          <div>
            <div className="text-[10px] font-mono text-emerald-300 uppercase">Certifications</div>
            <div className="text-lg font-bold text-white font-mono mt-0.5">{student.stats.certificates}</div>
          </div>
          <div>
            <div className="text-[10px] font-mono text-emerald-300 uppercase">Mentoring</div>
            <div className="text-lg font-bold text-white font-mono mt-0.5">{student.stats.mentoringSessions}</div>
          </div>
          <div>
            <div className="text-[10px] font-mono text-emerald-300 uppercase">Total XP</div>
            <div className="text-lg font-bold text-amber-300 font-mono mt-0.5">{student.xp.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Skills Matrix & Verified Competencies */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Verified Skills Bars */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl glass-card space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Verified Technical Competencies</h3>
            <span className="text-[11px] font-mono text-emerald-700 font-bold">Faculty Rubric Evaluated</span>
          </div>

          <div className="space-y-4">
            {student.skills.map((skill, i) => (
              <div key={i} className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between font-mono">
                  <span className="font-semibold text-slate-900">{skill.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[11px]">{skill.level}</span>
                    <span className="font-bold text-emerald-700">{skill.proficiencyPercent}%</span>
                  </div>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                    style={{ width: `${skill.proficiencyPercent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Certified Credentials */}
        <div className="p-6 rounded-3xl glass-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Verified Certifications</h3>
            <Link href="/verify" className="text-xs text-emerald-700 font-bold hover:underline">
              Verify
            </Link>
          </div>

          <div className="space-y-3">
            {certificates.map((cert) => (
              <div key={cert.certificateId} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-emerald-700 font-bold">{cert.certificateId}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="font-bold text-slate-900">{cert.trackOrTopic}</div>
                <div className="text-[11px] text-slate-500">{cert.level} • {cert.issueDate}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Projects by Hari */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-900 text-lg">Engineered Projects & Firmware</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {myProjects.map((p) => (
            <div key={p.id} className="p-6 rounded-3xl glass-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                  {p.category}
                </span>
                <span className="text-[11px] font-mono text-emerald-700 font-bold">{p.progressPercent}% Complete</span>
              </div>
              <h4 className="font-bold text-slate-900 text-base">{p.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{p.description}</p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {p.techStack.map((tech, i) => (
                  <span key={i} className="px-2.5 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-[10px] text-slate-700 font-mono font-medium">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
