"use client";

import React from "react";
import Link from "next/link";
import { Trophy, Award, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

export default function AchievementsPage() {
  const achievements = [
    {
      title: "Smart India Hackathon (SIH) 2026 – Finalist",
      team: "Team CareGrid (Led by Hari Dharanesh SP)",
      category: "Healthcare IoT",
      desc: "Selected among top 30 teams nationwide for designing an ultra-low latency mesh vitals monitoring grid with ESP32-S3 hardware nodes.",
      year: "2026",
    },
    {
      title: "IEEE International Edge AI Challenge – Winner",
      team: "Autonomous Inspection Rover Team",
      category: "Robotics & Computer Vision",
      desc: "Awarded 1st place in Edge Robotics division for deploying quantized YOLOv8 object detection on low-power single-board computers.",
      year: "2025",
    },
    {
      title: "National Smart Agriculture Innovation Award",
      team: "AgriSense LoRa Team",
      category: "Agritech IoT",
      desc: "Honored for deploying a 15uA deep-sleep soil sensor network broadcasting over 5km in rural micro-climates.",
      year: "2025",
    },
    {
      title: "Best University Open Hardware Chapter",
      team: "IoT Club Technical Community",
      category: "Institutional",
      desc: "Recognized for maintaining over 1,200 open-source GitHub contributions and facilitating 21 hands-on hardware workshops.",
      year: "2025",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-2">
          <Trophy className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Achievements & Wall of Fame</h1>
        <p className="text-xs text-slate-400">
          National hackathon podium finishes, technical conference papers, and student engineering distinctions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {achievements.map((item, idx) => (
          <div key={idx} className="p-6 rounded-2xl bg-dark-card border border-dark-border space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-iot-cyan">{item.category}</span>
              <span className="text-amber-400 font-bold">{item.year}</span>
            </div>
            <h3 className="text-lg font-bold text-white">{item.title}</h3>
            <p className="text-xs text-slate-400 font-mono">Team: {item.team}</p>
            <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
