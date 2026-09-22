import React from "react";
import Link from "next/link";
import { getPublicMemberProfile } from "@/lib/student/dashboard";
import { GithubIcon, LinkedinIcon } from "@/components/icons/SocialIcons";
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
  Globe,
  User,
  ArrowLeft,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface MemberProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function MemberProfilePage({ params }: MemberProfilePageProps) {
  const { username } = await params;
  const member = await getPublicMemberProfile(username);

  if (!member) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <User className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900">Member Not Found</h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            The member profile for <span className="font-mono font-bold text-slate-700">@{username}</span> could not be found or is not currently active.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to IoT Club</span>
        </Link>
      </div>
    );
  }

  const initials = member.fullName
    ? member.fullName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join("")
    : "MB";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-slate-800">
      {/* Profile Header Card */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-[#032b2b] via-[#053e3e] to-[#043333] border border-emerald-900/50 shadow-xl relative overflow-hidden text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-emerald-500/30 border border-emerald-400/40 p-1 shadow-lg flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-emerald-950/60 rounded-xl flex items-center justify-center font-black text-2xl text-emerald-300">
                {initials}
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{member.fullName}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-mono font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>VERIFIED MEMBER</span>
                </span>
              </div>
              <p className="text-sm text-emerald-300 font-medium mt-1">
                {member.headline || "IoT Club Member • Hardware & Firmware Specialist"}
              </p>
              {member.bio && (
                <p className="text-xs text-slate-200 mt-2 max-w-xl leading-relaxed">{member.bio}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {member.githubUrl && (
              <a
                href={member.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-white border border-white/20 transition"
              >
                <GithubIcon className="w-4 h-4" />
                <span>GitHub</span>
              </a>
            )}
            {member.linkedinUrl && (
              <a
                href={member.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-white border border-white/20 transition"
              >
                <LinkedinIcon className="w-4 h-4" />
                <span>LinkedIn</span>
              </a>
            )}
            {member.portfolioUrl && (
              <a
                href={member.portfolioUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-white border border-white/20 transition"
              >
                <Globe className="w-4 h-4" />
                <span>Website</span>
              </a>
            )}
          </div>
        </div>

        {/* Academic Profile Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-emerald-800/60 text-xs">
          <div>
            <div className="text-[10px] font-mono text-emerald-300 uppercase">Department</div>
            <div className="text-sm font-bold text-white font-mono mt-0.5">
              {member.department || "IoT Club"}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-mono text-emerald-300 uppercase">Degree Programme</div>
            <div className="text-sm font-bold text-white font-mono mt-0.5">
              {member.degreeProgramme || "Engineering"}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-mono text-emerald-300 uppercase">Academic Year</div>
            <div className="text-sm font-bold text-white font-mono mt-0.5">
              {member.yearOfStudy ? `Year ${member.yearOfStudy}` : "Active"}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-mono text-emerald-300 uppercase">Batch</div>
            <div className="text-sm font-bold text-white font-mono mt-0.5">
              {member.batch || "2024-2028"}
            </div>
          </div>
        </div>
      </div>

      {/* Verified Skills & Interests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl glass-card space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Verified Technical Competencies</h3>
            <span className="text-[11px] font-mono text-emerald-700 font-bold">Faculty Evaluated</span>
          </div>

          {member.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {member.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 ${
                    skill.category === "HARDWARE"
                      ? "bg-amber-50 text-amber-900 border-amber-200"
                      : skill.category === "PROGRAMMING"
                      ? "bg-sky-50 text-sky-900 border-sky-200"
                      : "bg-emerald-50 text-emerald-900 border-emerald-200"
                  }`}
                >
                  <span className="font-bold">{skill.skill}</span>
                  <span className="text-[10px] opacity-70 font-mono uppercase">
                    ({skill.level.toLowerCase()})
                  </span>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">Technical skills in assessment.</p>
          )}

          {member.interests.length > 0 && (
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <span className="text-xs font-bold text-slate-700 block">Areas of Specialization:</span>
              <div className="flex flex-wrap gap-2">
                {member.interests.map((interest, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl text-xs font-medium bg-purple-50 text-purple-900 border border-purple-200"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Credentials / Verification */}
        <div className="p-6 rounded-3xl glass-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Verified Credential</h3>
            <Link href="/verify" className="text-xs text-emerald-700 font-bold hover:underline">
              Verify
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-emerald-700 font-bold">
                {member.registrationId || "IOT-MEMBER"}
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="font-bold text-slate-900">IoT Club Foundation Membership</div>
            <div className="text-[11px] text-slate-500">Verified On-Campus Active Status</div>
          </div>
        </div>
      </div>

      {/* Projects Showcase */}
      {member.projects.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 text-lg">Engineered Projects & Firmware</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {member.projects.map((p) => (
              <div key={p.id} className="p-6 rounded-3xl glass-card space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                    {p.status}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-base">{p.title}</h4>
                {p.description && <p className="text-xs text-slate-600 leading-relaxed">{p.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
