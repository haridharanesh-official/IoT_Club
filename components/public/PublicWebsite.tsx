"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useIoTApp } from "@/lib/store";
import { defaultClubConfig } from "@/lib/clubConfig";
import {
  Cpu,
  ArrowRight,
  Sparkles,
  Award,
  Layers,
  Wifi,
  Bot,
  Globe,
  Compass,
  Rocket,
  Wrench,
  BookOpen,
  Briefcase,
  Target,
  Check,
  Send,
  Heart,
  TrendingUp,
  CreditCard,
  Radio,
  ChevronRight,
  Calendar,
  Users,
  ShieldCheck,
} from "lucide-react";

export const PublicWebsite: React.FC = () => {
  const { telemetry } = useIoTApp();

  // Interactive Tab States
  const [activeTechTab, setActiveTechTab] = useState<"hardware" | "communication" | "software">("hardware");
  const [activeRoadmapPhase, setActiveRoadmapPhase] = useState<number>(1);

  // Essential Tech Stack
  const techCategories = {
    hardware: [
      { name: "Arduino", desc: "Beginner-friendly microcontrollers for sensors and electronics basics." },
      { name: "ESP32", desc: "Dual-core Wi-Fi & Bluetooth powerhouse for connected smart devices." },
      { name: "Raspberry Pi", desc: "Mini Linux computer for edge computing and camera vision." },
      { name: "STM32", desc: "Industry standard ARM microcontrollers for advanced firmware." },
      { name: "Sensors & Actuators", desc: "Temperature, motion, ultrasound, relays, and servo motors." },
      { name: "OLED & LCDs", desc: "Displays for real-time dashboard data and local readouts." },
    ],
    communication: [
      { name: "Wi-Fi & Bluetooth", desc: "Direct pairing and high-speed local network connectivity." },
      { name: "MQTT Protocol", desc: "Lightweight, ultra-fast messaging protocol made for IoT sensors." },
      { name: "HTTP / REST APIs", desc: "Web connectivity to send data to servers and trigger webhooks." },
      { name: "LoRa & LoRaWAN", desc: "Long-range wireless transmitting telemetry over multiple kilometers." },
      { name: "I2C & SPI Buses", desc: "High-speed wired communication between chips and sensors." },
      { name: "UART Serial", desc: "Device-to-device serial links for debugging and GPS modules." },
    ],
    software: [
      { name: "C / C++", desc: "Fast bare-metal programming for microcontrollers and hardware chips." },
      { name: "Python", desc: "Rapid scripting, data processing, and edge AI on Raspberry Pi." },
      { name: "Node-RED", desc: "Visual flow-based tool to connect devices, APIs, and dashboards." },
      { name: "Git & GitHub", desc: "Version control to collaborate smoothly in student project teams." },
      { name: "Cloud IoT (AWS / Azure)", desc: "Centralized cloud platforms to monitor and manage device fleets." },
      { name: "IoT Dashboards", desc: "Real-time telemetry graphs and remote control toggles." },
    ],
  };

  // 6-Phase Roadmap Data
  const roadmapSteps = [
    {
      phase: 1,
      title: "IoT & Electronics Foundations",
      months: "Months 1–3",
      summary: "Master basic electronics, digital circuits, Arduino, and C/C++ basics.",
      challenge: "IoT & Electronics Challenge — Build your first sensor device.",
    },
    {
      phase: 2,
      title: "Microcontrollers & Embedded",
      months: "Months 4–6",
      summary: "Level up to ESP32, Raspberry Pi, PWM motor control, and sensor interfacing.",
      challenge: "Smart Device Challenge — Design an autonomous embedded gadget.",
    },
    {
      phase: 3,
      title: "IoT Connectivity",
      months: "Months 7–9",
      summary: "Connect devices over Wi-Fi, Bluetooth, MQTT, and long-range LoRa.",
      challenge: "Connected Systems Challenge — Stream live telemetry to the web.",
    },
    {
      phase: 4,
      title: "Cloud & Edge IoT",
      months: "Months 10–12",
      summary: "Build cloud databases, live web dashboards, and edge device intelligence.",
      challenge: "IoT Innovation Hackathon — Compete with complete smart solutions.",
    },
    {
      phase: 5,
      title: "Advanced & Industrial IoT",
      months: "Months 13–15",
      summary: "Explore PLC fundamentals, predictive sensing, edge AI, and industrial automation.",
      challenge: "Industrial Automation Challenge — Solve factory floor problems.",
    },
    {
      phase: 6,
      title: "Professional Capstone",
      months: "Month 16+",
      summary: "PCB design, cloud deployment, system architecture, and portfolio building.",
      challenge: "IoT Innovation Expo & Demo Day — Present your capstone project.",
    },
  ];

  return (
    <div className="w-full bg-[#f4f6f8] bg-circuit-grid min-h-screen text-slate-800 pb-20">
      {/* ---------------------------------------------------- */}
      {/* HERO SECTION WITH TRUSTVEST-STYLE GLASS CARDS        */}
      {/* ---------------------------------------------------- */}
      <section className="relative pt-12 pb-16 md:pt-16 md:pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Friendly Hero Intro */}
            <div className="lg:col-span-7 space-y-6">
              {/* Institution Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-medium shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold">Sri Shakthi Institute of Engineering and Technology</span>
                <span className="text-emerald-300">•</span>
                <span className="text-emerald-600">IoT Club</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Build the <br />
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-500 bg-clip-text text-transparent">
                  Connected Future
                </span>
              </h1>

              {/* Friendly Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                Learn how physical devices, software, and communication technologies come together to create intelligent systems.
              </p>

              {/* Friendly Motto Badge */}
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <span className="px-3 py-1 rounded-xl bg-white border border-slate-200/80 shadow-xs text-slate-700">
                  ✨ Learn
                </span>
                <span className="px-3 py-1 rounded-xl bg-white border border-slate-200/80 shadow-xs text-slate-700">
                  ⚡ Build
                </span>
                <span className="px-3 py-1 rounded-xl bg-white border border-slate-200/80 shadow-xs text-slate-700">
                  🌐 Connect
                </span>
                <span className="px-3 py-1 rounded-xl bg-white border border-slate-200/80 shadow-xs text-slate-700">
                  🚀 Innovate
                </span>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/register"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm shadow-md shadow-emerald-500/25 transition-all hover:translate-y-[-1px]"
                >
                  <span>Join IoT Club</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="#roadmap"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 font-medium text-sm shadow-xs transition"
                >
                  <Compass className="w-4 h-4 text-emerald-600" />
                  <span>Explore Learning Path</span>
                </a>
              </div>

              <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Open to all departments & years. No prior IoT experience required.</span>
              </p>
            </div>

            {/* Right Column: 3 Pastel Glassmorphic Cards (Matching TrustVest UI!) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Card 2: Pastel Warm Cream / Peach Card */}
              <div className="glass-card-peach p-5 rounded-3xl transition hover:translate-y-[-2px]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-700">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">16+ Month Roadmap</h4>
                      <p className="text-[11px] text-amber-800">Zero to Production Engineer</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-800 font-mono">6 Phases</span>
                </div>

                <div className="flex items-center justify-between mt-3 text-xs text-slate-700">
                  <span className="font-medium">Phase 01: Foundations</span>
                  <span className="text-emerald-700 font-semibold">Enrolling Now</span>
                </div>
                <div className="w-full bg-amber-200/60 rounded-full h-1.5 mt-1.5">
                  <div className="bg-amber-500 h-1.5 rounded-full w-1/4" />
                </div>
              </div>

              {/* Card 3: Pastel Soft Lavender / Periwinkle Card */}
              <div className="glass-card-lavender p-5 rounded-3xl transition hover:translate-y-[-2px]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-700">
                      <Rocket className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">IPDC Project Cell</h4>
                      <p className="text-[11px] text-indigo-800">Hackathons & Real Innovation</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-indigo-800 font-mono">8 Domains</span>
                </div>

                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Support for Smart Agriculture, Smart Healthcare, Smart Campus, and national competitions (SIH, IEEE).
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
            {[
              { label: "Hardware Inventory", val: "268+", sub: "Sensors, ESP32, RPi" },
              { label: "Active Projects", val: "17", sub: "Working Prototypes" },
              { label: "Hands-on Learning", val: "100%", sub: "Practical Silicon" },
            ].map((stat, i) => (
              <div key={i} className="glass-card p-4 rounded-2xl text-center">
                <div className="text-2xl font-bold text-slate-900">{stat.val}</div>
                <div className="text-xs font-semibold text-emerald-700 mt-0.5">{stat.label}</div>
                <div className="text-[11px] text-slate-500">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* ABOUT THE CLUB — SIMPLE & FRIENDLY                   */}
      {/* ---------------------------------------------------- */}
      <section id="about" className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
            About the Club
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900">Beyond the Classroom</h2>
          <p className="text-sm text-slate-600">
            We bridge the gap between academic theory and industry requirements through structured technical training and hands-on building.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: "Hands-on Hardware",
              desc: "Build real circuits with ESP32, Arduino, and sensors instead of just reading slides.",
              icon: <Cpu className="w-5 h-5 text-emerald-600" />,
            },
            {
              title: "Interactive Workshops",
              desc: "Weekend bootcamps guided by technical mentors and senior student coordinators.",
              icon: <Wrench className="w-5 h-5 text-teal-600" />,
            },
            {
              title: "Hackathons & Contests",
              desc: "Compete in Smart India Hackathon (SIH), design expos, and technical challenges.",
              icon: <Rocket className="w-5 h-5 text-indigo-600" />,
            },
            {
              title: "Career & Certifications",
              desc: "Guidance toward AWS, Azure IoT, Cisco, and NPTEL industry certifications.",
              icon: <Award className="w-5 h-5 text-amber-600" />,
            },
          ].map((item, idx) => (
            <div key={idx} className="glass-card p-6 rounded-3xl flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* WHAT YOU WILL WORK WITH — CLEAN GLASS TABS           */}
      {/* ---------------------------------------------------- */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
            Silicon & Protocols
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900">What You Will Work With</h2>
          <p className="text-sm text-slate-600">
            Gain practical, hands-on experience with technologies used across modern IoT and Embedded Systems.
          </p>

          {/* Friendly Switcher Tabs */}
          <div className="flex items-center justify-center gap-2 pt-3">
            {[
              { key: "hardware", label: "Hardware Platforms" },
              { key: "communication", label: "Communication Protocols" },
              { key: "software", label: "Software & Cloud" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTechTab(tab.key as any)}
                className={`px-4 py-2 rounded-2xl text-xs font-semibold transition shadow-xs ${
                  activeTechTab === tab.key
                    ? "bg-emerald-500 text-white shadow-emerald-500/20"
                    : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tech Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {techCategories[activeTechTab].map((t, idx) => (
            <div key={idx} className="glass-card p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-900 text-sm">{t.name}</h4>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{t.desc}</p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-emerald-700 font-medium">
                <span>Hands-on Available in Lab</span>
                <Check className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 16+ MONTH ROADMAP — VISUAL & INTUITIVE               */}
      {/* ---------------------------------------------------- */}
      <section id="roadmap" className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
            Progressive Syllabus
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900">16+ Month IoT Learning Roadmap</h2>
          <p className="text-sm text-slate-600">
            A structured path combining <strong>Theory + Hardware + Programming + Projects + Challenges</strong>.
          </p>

          {/* Phase selector pill buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
            {roadmapSteps.map((s) => (
              <button
                key={s.phase}
                onClick={() => setActiveRoadmapPhase(s.phase)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                  activeRoadmapPhase === s.phase
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50"
                }`}
              >
                Phase 0{s.phase} ({s.months})
              </button>
            ))}
          </div>
        </div>

        {/* Highlighted Phase Card */}
        {(() => {
          const cur = roadmapSteps.find((s) => s.phase === activeRoadmapPhase) || roadmapSteps[0];
          return (
            <div className="glass-card-mint p-6 sm:p-8 rounded-3xl max-w-3xl mx-auto space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-emerald-300/60">
                <div>
                  <span className="text-xs font-mono font-bold text-emerald-800">PHASE 0{cur.phase} • {cur.months}</span>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{cur.title}</h3>
                </div>
                <span className="px-3 py-1 rounded-full bg-white/80 border border-emerald-300 text-emerald-800 text-xs font-bold">
                  Core Milestone
                </span>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed">{cur.summary}</p>

              <div className="p-4 rounded-2xl bg-white/90 border border-emerald-200/80 space-y-1">
                <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider font-mono">
                  🏆 Signature Phase Challenge:
                </div>
                <div className="text-xs font-semibold text-slate-900">{cur.challenge}</div>
              </div>
            </div>
          );
        })()}
      </section>

      {/* ---------------------------------------------------- */}
      {/* REAL WORLD FOCUS DOMAINS                             */}
      {/* ---------------------------------------------------- */}
      <section id="vision" className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
            Real-World Impact
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900">Club Focus Areas</h2>
          <p className="text-sm text-slate-600">
            We transform classroom concepts into working prototypes and deployable systems.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {[
            { title: "Smart Agriculture", desc: "Automated irrigation, soil health sensors & solar pumps." },
            { title: "Smart Healthcare", desc: "Patient telemetry, vitals monitoring & wearable alerts." },
            { title: "Home Automation", desc: "Smart lighting, voice relays & power optimization." },
            { title: "Smart Campus", desc: "Lab asset tracking & classroom smart monitors." },
            { title: "Autonomous Robotics", desc: "Obstacle avoidance rovers & edge camera tracking." },
            { title: "Industrial IoT", desc: "Factory monitoring, PLC links & predictive maintenance." },
          ].map((d, idx) => (
            <div key={idx} className="glass-card p-4 rounded-2xl text-left flex flex-col justify-between">
              <div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mb-2" />
                <h4 className="font-bold text-slate-900 text-xs mb-1">{d.title}</h4>
                <p className="text-[11px] text-slate-500 leading-snug">{d.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* PROJECT DEVELOPMENT CELL & HACKATHONS                */}
      {/* ---------------------------------------------------- */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card p-8 rounded-3xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                IPDC Support
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                IoT Project Development Cell
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                The IoT Club maintains a shared competition calendar and supports student teams with hardware components, circuit design, cloud accounts, and internal mock hackathons.
              </p>
              <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-700">
                <span className="px-3 py-1 rounded-xl bg-slate-100 border border-slate-200">Problem Identification</span>
                <span className="px-3 py-1 rounded-xl bg-slate-100 border border-slate-200">Hardware Prototype</span>
                <span className="px-3 py-1 rounded-xl bg-slate-100 border border-slate-200">Software Integration</span>
                <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">Demo & Submission</span>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="glass-card-mint p-6 rounded-2xl space-y-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-700" /> Build to Compete
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Join internal project reviews, test your prototypes against evaluation rubrics, and represent Sri Shakthi Institute at national competitions with club faculty mentorship.
                </p>
                <div className="pt-1">
                  <Link
                    href="/opportunities"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                  >
                    <span>View Upcoming Hackathons</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* READY TO JOIN? — CLEAN FRIENDLY CTA                  */}
      {/* ---------------------------------------------------- */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card-mint p-8 sm:p-12 rounded-3xl text-center space-y-5 border border-emerald-200/80 shadow-sm">
          <span className="px-3.5 py-1.5 rounded-full bg-white border border-emerald-200 text-emerald-800 text-xs font-medium">
            Open to All Students • Sri Shakthi Institute
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Ready to Build the Future?
          </h2>
          <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            No previous IoT experience required. Whether you want to program your first microcontroller or build an edge AI system, the IoT Club is here for you.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/register"
              className="px-7 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm shadow-md shadow-emerald-500/25 transition hover:translate-y-[-1px]"
            >
              Join the IoT Club →
            </Link>
            <Link
              href="/register"
              className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium text-sm transition"
            >
              Full Registration Portal
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
