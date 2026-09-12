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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Profile Header Card */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-[#11192e] to-[#0c1626] border border-slate-700 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-iot-emerald via-iot-cyan to-iot-violet p-1 shadow-xl">
              <div className="w-full h-full bg-dark-bg rounded-2xl flex items-center justify-center font-bold text-2xl text-white">
                HD
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">{student.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-iot-emerald/20 text-emerald-400 border border-iot-emerald/40 text-xs font-mono font-bold">
                  Level {student.level} • {student.levelTitle}
                </span>
              </div>
              <p className="text-sm text-iot-cyan font-medium mt-1">{student.headline}</p>
              <p className="text-xs text-slate-300 mt-2 max-w-xl leading-relaxed">{student.bio}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href={student.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-white border border-slate-700 transition"
            >
              <GithubIcon className="w-4 h-4" />
              <span>GitHub</span>
            </a>
            <a
              href={student.linkedinUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-white border border-slate-700 transition"
            >
              <LinkedinIcon className="w-4 h-4" />
              <span>LinkedIn</span>
            </a>
          </div>
        </div>

        {/* Verified Stats Strip (Section 7) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-8 pt-6 border-t border-slate-800 text-xs">
          <div>
            <div className="text-[10px] font-mono text-slate-500 uppercase">Club Projects</div>
            <div className="text-lg font-bold text-white font-mono mt-0.5">{student.stats.projects}</div>
          </div>
          <div>
            <div className="text-[10px] font-mono text-slate-500 uppercase">Hackathons</div>
            <div className="text-lg font-bold text-white font-mono mt-0.5">{student.stats.hackathons}</div>
          </div>
          <div>
            <div className="text-[10px] font-mono text-slate-500 uppercase">Workshops</div>
            <div className="text-lg font-bold text-white font-mono mt-0.5">{student.stats.workshops}</div>
          </div>
          <div>
            <div className="text-[10px] font-mono text-slate-500 uppercase">Certifications</div>
            <div className="text-lg font-bold text-white font-mono mt-0.5">{student.stats.certificates}</div>
          </div>
          <div>
            <div className="text-[10px] font-mono text-slate-500 uppercase">Mentoring</div>
            <div className="text-lg font-bold text-white font-mono mt-0.5">{student.stats.mentoringSessions}</div>
          </div>
          <div>
            <div className="text-[10px] font-mono text-slate-500 uppercase">Total XP</div>
            <div className="text-lg font-bold text-amber-400 font-mono mt-0.5">{student.xp.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Skills Matrix & Verified Competencies */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Verified Skills Bars (Section 7) */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-2xl bg-dark-card border border-dark-border space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base">Verified Technical Competencies</h3>
            <span className="text-[11px] font-mono text-emerald-400">Faculty Rubric Evaluated</span>
          </div>

          <div className="space-y-4">
            {student.skills.map((skill, i) => (
              <div key={i} className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between font-mono">
                  <span className="font-semibold text-white">{skill.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[11px]">{skill.level}</span>
                    <span className="font-bold text-iot-cyan">{skill.proficiencyPercent}%</span>
                  </div>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-iot-emerald to-iot-cyan"
                    style={{ width: `${skill.proficiencyPercent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Certified Credentials */}
        <div className="p-6 rounded-2xl bg-dark-card border border-dark-border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base">Verified Certifications</h3>
            <Link href="/verify" className="text-xs text-iot-cyan hover:underline">
              Verify
            </Link>
          </div>

          <div className="space-y-3">
            {certificates.map((cert) => (
              <div key={cert.certificateId} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-iot-cyan font-bold">{cert.certificateId}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-iot-emerald" />
                </div>
                <div className="font-bold text-white">{cert.trackOrTopic}</div>
                <div className="text-[11px] text-slate-400">{cert.level} • {cert.issueDate}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Projects by Hari */}
      <div className="space-y-4">
        <h3 className="font-bold text-white text-lg">Engineered Projects & Firmware</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {myProjects.map((p) => (
            <div key={p.id} className="p-6 rounded-2xl bg-dark-card border border-dark-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-iot-cyan border border-slate-800">
                  {p.category}
                </span>
                <span className="text-[11px] font-mono text-emerald-400">{p.progressPercent}% Complete</span>
              </div>
              <h4 className="font-bold text-white text-base">{p.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{p.description}</p>
              <div className="flex flex-wrap gap-1 pt-2">
                {p.techStack.map((tech, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">
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
