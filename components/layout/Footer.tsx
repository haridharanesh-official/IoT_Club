"use client";

import React from "react";
import Link from "next/link";
import { defaultClubConfig } from "@/lib/clubConfig";
import { Cpu, MessageSquare, ShieldCheck, Mail, MapPin, ExternalLink } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/icons/SocialIcons";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#080c14] border-t border-dark-border text-slate-400 text-xs mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Club Identity */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-iot-emerald to-iot-cyan flex items-center justify-center text-slate-950 font-bold">
                <Cpu className="w-4 h-4" />
              </div>
              <span className="font-bold text-white text-sm">{defaultClubConfig.clubName}</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              {defaultClubConfig.description}
            </p>
            <div className="flex items-center gap-3 pt-2 text-slate-400">
              <a
                href={defaultClubConfig.socialLinks.github}
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition"
                title="GitHub"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
              <a
                href={defaultClubConfig.socialLinks.linkedin}
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition"
                title="LinkedIn"
              >
                <LinkedinIcon className="w-4 h-4" />
              </a>
              <a
                href={defaultClubConfig.socialLinks.discord}
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition"
                title="Discord"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-2">
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider">Ecosystem</h4>
            <ul className="space-y-1.5">
              <li>
                <Link href="/learn" className="hover:text-white transition">8-Track LMS Syllabus</Link>
              </li>
              <li>
                <Link href="/learn/skills" className="hover:text-white transition">Visual Skill Tree</Link>
              </li>
              <li>
                <Link href="/projects" className="hover:text-white transition">Hardware Projects Hub</Link>
              </li>
              <li>
                <Link href="/lab" className="hover:text-white transition">IoT Lab & Hardware Assets</Link>
              </li>
              <li>
                <Link href="/opportunities" className="hover:text-white transition">Hackathons & Opportunities</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Lab Governance */}
          <div className="space-y-2">
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider">Governance</h4>
            <ul className="space-y-1.5">
              <li>
                <Link href="/apply" className="hover:text-white transition">Recruitment & Selection</Link>
              </li>
              <li>
                <Link href="/teacher" className="hover:text-white transition">Faculty Rubric Evaluation</Link>
              </li>
              <li>
                <Link href="/verify" className="hover:text-white transition">Certificate Public Verification</Link>
              </li>
              <li>
                <Link href="/lab/live" className="hover:text-white transition">Live Lab MQTT Telemetry</Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition">Club Administrator Console</Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Location & Contact */}
          <div className="space-y-2">
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider">Laboratory Center</h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-iot-cyan shrink-0 mt-0.5" />
                <span>{defaultClubConfig.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-iot-emerald shrink-0" />
                <span>{defaultClubConfig.email}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-2">
                <ShieldCheck className="w-4 h-4 text-iot-emerald" />
                <span>Configurable `club_config` branding active</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-dark-border flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
          <p>© 2026 {defaultClubConfig.clubName} • {defaultClubConfig.subtitle}. Open Engineering Platform.</p>
          <div className="flex items-center gap-4">
            <span>Built with Next.js & TypeScript</span>
            <span>•</span>
            <Link href="/verify" className="hover:text-slate-400">Verify Certification</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
