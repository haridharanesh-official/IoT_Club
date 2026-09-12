"use client";

import React from "react";
import Link from "next/link";
import { defaultClubConfig } from "@/lib/clubConfig";
import {
  Sparkles,
  Cpu,
  Layers,
  Award,
  Users,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Mail,
  Clock,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-iot-cyan text-xs font-mono">
          <span>ABOUT THE ECOSYSTEM</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          About {defaultClubConfig.clubName}
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          {defaultClubConfig.description}
        </p>
      </div>

      {/* Vision & Mission Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 sm:p-8 rounded-2xl bg-dark-card border border-dark-border space-y-3">
          <div className="w-10 h-10 rounded-xl bg-iot-emerald/10 border border-iot-emerald/30 flex items-center justify-center text-iot-emerald">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-white">Our Vision</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            To empower students across disciplines to become hardware innovators, firmware designers, and open-source contributors capable of leading national competitions, developing commercial products, and advancing connected systems research.
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-2xl bg-dark-card border border-dark-border space-y-3">
          <div className="w-10 h-10 rounded-xl bg-iot-cyan/10 border border-iot-cyan/30 flex items-center justify-center text-iot-cyan">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-white">Our Mission</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Provide continuous access to silicon development kits, maintain an interactive 8-track curriculum, foster peer mentorship, and support end-to-end prototyping in our dedicated laboratory facilities.
          </p>
        </div>
      </div>

      {/* Leadership & Mentorship Structure */}
      <div className="p-6 sm:p-8 rounded-2xl bg-dark-card border border-dark-border space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-dark-border">
          <div>
            <h2 className="text-xl font-bold text-white">Club Leadership & Technical Board</h2>
            <p className="text-xs text-slate-400 mt-0.5">Faculty directors, student leads, and peer mentors.</p>
          </div>
          <span className="text-xs font-mono text-iot-cyan">Academic Year 2026</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
            <div className="text-[10px] text-iot-cyan font-mono">FACULTY MENTORSHIP</div>
            <div className="font-bold text-white text-sm">{defaultClubConfig.primaryContact}</div>
            <div className="text-slate-400">{defaultClubConfig.department}</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
            <div className="text-[10px] text-emerald-400 font-mono">STUDENT TECHNICAL LEAD</div>
            <div className="font-bold text-white text-sm">Hari Dharanesh SP</div>
            <div className="text-slate-400">Level 4 IoT Builder • Project Lead (CareGrid)</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
            <div className="text-[10px] text-purple-400 font-mono">LABORATORY GOVERNANCE</div>
            <div className="font-bold text-white text-sm">Hardware & Lab Admin Board</div>
            <div className="text-slate-400">268 Physical Assets • Inventory & Calibration</div>
          </div>
        </div>
      </div>

      {/* Lab Facilities & Contact */}
      <div className="p-6 sm:p-8 rounded-2xl bg-dark-card border border-dark-border space-y-4 text-xs">
        <h3 className="font-bold text-white text-base">IoT Laboratory Facility</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-300">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-iot-cyan shrink-0 mt-0.5" />
              <span>{defaultClubConfig.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-iot-emerald shrink-0" />
              <span>{defaultClubConfig.email}</span>
            </div>
          </div>
          <div className="text-slate-400 leading-relaxed">
            Laboratory is accessible daily from 8:30 AM to 7:00 PM for registered club members with approved workstation bookings.
          </div>
        </div>
      </div>
    </div>
  );
}
