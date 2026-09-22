"use client";

import React from "react";
import Link from "next/link";
import { defaultClubConfig } from "@/lib/clubConfig";
import {
  Cpu,
  CheckCircle2,
  MapPin,
  Mail,
  Award,
  Users,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 text-slate-800">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
          <span>{defaultClubConfig.collegeName}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          {defaultClubConfig.clubName}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          {defaultClubConfig.description}
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link
            href="/register"
            className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs shadow-xs transition"
          >
            Join IoT Club
          </Link>
          <Link
            href="/#roadmap"
            className="px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium transition shadow-xs"
          >
            16+ Month Roadmap
          </Link>
        </div>
      </div>

      {/* Beyond the Classroom */}
      <div className="glass-card p-8 rounded-3xl space-y-6">
        <div className="max-w-3xl space-y-2">
          <span className="text-xs font-mono font-bold text-emerald-700 uppercase">Core Identity</span>
          <h2 className="text-2xl font-bold text-slate-900">Beyond the Classroom</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            The Internet of Things Club bridges the gap between <strong>academic learning and industry requirements</strong> through structured technical training and real-world development activities.
          </p>
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-900 font-medium">
            Our goal is to help students develop the ability to <strong>design, build, test and demonstrate complete IoT systems</strong>.
          </div>
        </div>

        <div>
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider font-mono block mb-3">
            Members Learn Through 11 Key Channels:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
            {[
              "Technical training",
              "Hands-on hardware sessions",
              "Workshops",
              "Seminars",
              "Certifications",
              "Mini projects",
              "Technical challenges",
              "Hackathons",
              "Competitions",
              "Research activities",
              "Real-world project development",
            ].map((activity, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200/80 text-slate-700 font-medium shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{activity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Student Leadership */}
      <div id="leadership" className="glass-card p-8 rounded-3xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
          <div>
            <span className="text-xs font-mono font-bold text-emerald-700 uppercase">Community Governance</span>
            <h2 className="text-2xl font-bold text-slate-900">Student Leadership</h2>
            <p className="text-xs text-slate-500">Build the Club. Lead the Community.</p>
          </div>
          <span className="text-xs font-mono text-slate-500">Sri Shakthi Chapter</span>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Students are selected for leadership roles based on: <strong>Participation, Skills, Leadership qualities, and Contribution to the club</strong>.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          {[
            { role: "President", desc: "Overall community strategy & institutional liaison." },
            { role: "Vice President", desc: "Operations, project tracking & team alignment." },
            { role: "Student Coordinator", desc: "Student intake, schedule management & member support." },
            { role: "Technical Leads", desc: "Curriculum delivery, code reviews & hardware guidance." },
            { role: "Event Coordinators", desc: "Hackathon prep, bootcamps & workshop execution." },
            { role: "Project Coordinators", desc: "IPDC pipeline, milestone audits & BOM logistics." },
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-1 shadow-xs">
              <div className="font-bold text-slate-900 text-sm">{item.role}</div>
              <p className="text-[11px] text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Student Ambassador Program */}
      <div className="glass-card-lavender p-8 rounded-3xl space-y-5">
        <div>
          <span className="text-xs font-mono font-bold text-indigo-800 uppercase">Special Initiative</span>
          <h2 className="text-2xl font-bold text-slate-900">Student Ambassador Program</h2>
          <p className="text-xs text-indigo-700 font-medium">Represent. Mentor. Inspire.</p>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          Between <strong>2 and 5 Student Ambassadors</strong> may be identified each year from enrolled members and the club core team. Selection is based on <strong>technical performance, participation, leadership, and club contribution</strong>.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white/90 border border-indigo-200 space-y-2">
            <h4 className="font-bold text-emerald-800 text-xs">Knowledge Expectations:</h4>
            <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-700">
              <div>• Internet of Things</div>
              <div>• Embedded Systems</div>
              <div>• Microcontrollers</div>
              <div>• Sensors</div>
              <div>• Communication Protocols</div>
              <div>• Hardware Interfacing</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/90 border border-indigo-200 space-y-2">
            <h4 className="font-bold text-indigo-800 text-xs">Leadership & Mentorship:</h4>
            <div className="space-y-1 text-[11px] text-slate-700">
              <div>• Consistent participation & teamwork</div>
              <div>• Ability to mentor juniors in project teams</div>
              <div>• Hackathon, competition & certification involvement</div>
              <div>• Initiative in organizing club activities</div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/90 border border-indigo-200 text-xs text-slate-700">
          Student Ambassadors represent the IoT Club at: <strong className="text-slate-900">Inter-college events, Technical forums, and Institutional activities</strong>.
        </div>
      </div>

      {/* Lab Facilities & Contact */}
      <div className="glass-card p-8 rounded-3xl space-y-4 text-xs">
        <h3 className="font-bold text-slate-900 text-base">IoT Laboratory Facility</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-slate-600">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{defaultClubConfig.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
              <a href={`mailto:${defaultClubConfig.email}`} className="text-slate-800 hover:text-emerald-700 transition">
                {defaultClubConfig.email}
              </a>
            </div>
          </div>
          <div className="text-slate-500 leading-relaxed">
            Laboratory is accessible daily for registered club members with approved workstation bookings and hardware kit issuances.
          </div>
        </div>
      </div>
    </div>
  );
}
