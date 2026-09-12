"use client";

import React from "react";
import Link from "next/link";
import { useIoTApp } from "@/lib/store";
import { defaultClubConfig } from "@/lib/clubConfig";
import {
  Cpu,
  ArrowRight,
  Layers,
  Sparkles,
  Award,
  Terminal,
  Wifi,
  Eye,
  Bot,
  Cloud,
  ShieldAlert,
  Calendar,
  Users,
  CheckCircle2,
  ExternalLink,
  Code2,
  Radio,
  FileCheck2,
} from "lucide-react";

export const PublicWebsite: React.FC = () => {
  const { projects, events, telemetry } = useIoTApp();

  const featuredProjects = projects.filter((p) => p.featured);

  const domains = [
    { title: "Embedded Systems", desc: "Bare-metal C/C++, ESP32 dual-core architecture, FreeRTOS, and low-level firmware.", icon: <Layers className="w-5 h-5 text-emerald-400" /> },
    { title: "IoT Networking & Protocols", desc: "MQTT brokers, BLE mesh, HTTP REST, WebSockets, and LoRaWAN long-range communications.", icon: <Wifi className="w-5 h-5 text-cyan-400" /> },
    { title: "Edge AI & Computer Vision", desc: "OpenCV image processing, YOLO inference on Raspberry Pi, and hardware AI accelerators.", icon: <Eye className="w-5 h-5 text-violet-400" /> },
    { title: "Autonomous Robotics", desc: "Motor kinematics, LiDAR mapping, SLAM navigation, and ROS 2 autonomous rovers.", icon: <Bot className="w-5 h-5 text-emerald-400" /> },
    { title: "IoT Device Cybersecurity", desc: "Hardware secure boot, flash encryption, TLS 1.3 MQTTS, and firmware vulnerability hardening.", icon: <ShieldAlert className="w-5 h-5 text-rose-400" /> },
    { title: "Cloud IoT & Telemetry", desc: "Time-series databases (PostgreSQL/TimescaleDB), Grafana dashboards, and edge device fleets.", icon: <Cloud className="w-5 h-5 text-cyan-400" /> },
  ];

  return (
    <div className="w-full bg-circuit-grid pb-24">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-iot-emerald animate-pulse" />
              <span>Digital Engineering Operating System</span>
              <span className="text-slate-500">•</span>
              <span className="text-iot-cyan">{defaultClubConfig.collegeName}</span>
            </div>

            {/* Core Motto */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
              We Learn. <br />
              <span className="bg-gradient-to-r from-iot-emerald via-iot-cyan to-iot-violet bg-clip-text text-transparent">
                We Build. We Innovate.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              Not merely a student registration portal, but a complete digital ecosystem:
              <br className="hidden sm:inline" />
              from structured micro-controller tracks and lab hardware checkout to national hackathons and peer mentorship.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/apply"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-iot-emerald hover:bg-emerald-400 text-slate-950 font-semibold text-sm shadow-lg shadow-emerald-950/40 transition group"
              >
                <span>Apply for Recruitment</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </Link>

              <Link
                href="/projects"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-dark-card hover:bg-slate-800 border border-dark-border text-slate-200 text-sm font-medium transition"
              >
                <span>Explore Projects</span>
              </Link>

              <Link
                href="/lab/live"
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-cyan-800/40 text-cyan-300 text-xs font-mono transition"
              >
                <Radio className="w-3.5 h-3.5 text-iot-cyan animate-pulse" />
                <span>Live Lab Telemetry ({telemetry.temperatureC}°C)</span>
              </Link>
            </div>
          </div>

          {/* Seed / Demo Statistics Strip (Section 7) */}
          <div className="mt-16 pt-8 border-t border-dark-border/60">
            <div className="flex items-center justify-between mb-3 text-[11px] text-slate-400 font-mono">
              <span>ACTIVE ECOSYSTEM METRICS</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px]">
                Demo Seed Data (Section 7)
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { count: "186", label: "Club Members", sub: "Active Engineers" },
                { count: "17", label: "Active Projects", sub: "Hardware Prototypes" },
                { count: "268", label: "Lab Assets", sub: "ESP32, RPi, LoRa" },
                { count: "21", label: "Workshops", sub: "This Academic Year" },
                { count: "12", label: "Competitions", sub: "SIH, IEEE, RoboCups" },
                { count: "5", label: "Major Wins", sub: "National Trophies" },
              ].map((stat, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-dark-card/90 border border-dark-border">
                  <div className="text-2xl font-bold text-white tracking-tight">{stat.count}</div>
                  <div className="text-xs font-semibold text-slate-200 mt-0.5">{stat.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{stat.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-dark-card border border-dark-border relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-iot-emerald/10 border border-iot-emerald/30 flex items-center justify-center text-iot-emerald mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Our Vision</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              To build a multidisciplinary engineering nursery where students transform from curious beginners into independent IoT engineers capable of designing complete cyber-physical systems, deploying industrial sensor networks, and contributing to open-source hardware.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-dark-card border border-dark-border relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-iot-cyan/10 border border-iot-cyan/30 flex items-center justify-center text-iot-cyan mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Our Mission</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Deliver structured 8-track curricula with hardware simulation, maintain an open lab inventory with QR tracking, facilitate competitive hackathon teams, and ensure every student graduates with a verified technical portfolio.
            </p>
          </div>
        </div>
      </section>

      {/* Technical Domains */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Technical Specializations</h2>
          <p className="text-xs text-slate-400 mt-2">
            Structured learning tracks designed around real silicon and industrial communication protocols.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {domains.map((dom, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl bg-dark-card/90 border border-dark-border hover:border-slate-600 transition group"
            >
              <div className="p-2.5 rounded-lg bg-slate-800/80 w-fit mb-3 group-hover:scale-105 transition">
                {dom.icon}
              </div>
              <h4 className="font-semibold text-white text-sm mb-1">{dom.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{dom.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Projects Showcase */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Active Club Projects</h2>
            <p className="text-xs text-slate-400 mt-1">
              Engineered by club members and funded by our dedicated hardware inventory.
            </p>
          </div>
          <Link
            href="/projects"
            className="flex items-center gap-1.5 text-xs text-iot-cyan hover:underline font-medium"
          >
            <span>View all 17 projects</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredProjects.map((proj) => (
            <div
              key={proj.id}
              className="p-6 rounded-2xl bg-dark-card border border-dark-border hover:border-slate-600 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-iot-emerald/10 text-emerald-400 border border-iot-emerald/30">
                    {proj.category}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Lifecycle: {proj.lifecycle}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white">{proj.title}</h3>
                <p className="text-xs text-iot-cyan font-medium mt-0.5">{proj.tagline}</p>
                <p className="text-xs text-slate-300 mt-3 leading-relaxed">{proj.description}</p>

                {/* Tech Badges */}
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {proj.techStack.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-slate-300 border border-slate-700 font-mono"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-dark-border flex items-center justify-between text-xs">
                <div className="text-slate-400">
                  Lead: <span className="text-white font-medium">{proj.leadName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-emerald-400">{proj.progressPercent}% Complete</span>
                  <Link
                    href={`/projects`}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming Workshops */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Upcoming Workshops & Bootcamps</h2>
            <p className="text-xs text-slate-400 mt-1">
              Hands-on lab sessions with real hardware development kits and signed dynamic QR attendance.
            </p>
          </div>
          <Link href="/events" className="text-xs text-iot-cyan hover:underline">
            All Events →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {events.map((evt) => (
            <div key={evt.id} className="p-5 rounded-xl bg-dark-card border border-dark-border flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2 font-mono">
                  <span className="text-iot-cyan">{evt.date}</span>
                  <span>{evt.type}</span>
                </div>
                <h4 className="font-bold text-white text-sm mb-1">{evt.title}</h4>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{evt.description}</p>
                <div className="mt-3 text-[11px] text-slate-400 space-y-1">
                  <div>Venue: <span className="text-slate-200">{evt.venue}</span></div>
                  <div>Seats: <span className="text-emerald-400 font-medium">{evt.registeredCount}/{evt.capacity} registered</span></div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-dark-border">
                <Link
                  href="/events"
                  className="block text-center w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition"
                >
                  View Details & Register
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recruitment Call-to-Action */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-900 via-[#111827] to-[#0d1627] border border-slate-700 text-center space-y-6 relative overflow-hidden shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-3">
            <span className="px-3 py-1 rounded-full bg-iot-emerald/20 border border-iot-emerald/40 text-emerald-400 text-xs font-mono">
              Recruitment 2026 Batch 01 Open
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready to Build the Future of IoT?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Whether you are taking your first steps with Arduino or already building edge AI neural models, the IoT Club provides the hardware, mentorship, and platform to accelerate your engineering journey.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/apply"
              className="px-6 py-3 rounded-xl bg-iot-emerald hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-md transition"
            >
              Start Your Application →
            </Link>
            <Link
              href="/verify"
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 transition"
            >
              Verify Certificate
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
