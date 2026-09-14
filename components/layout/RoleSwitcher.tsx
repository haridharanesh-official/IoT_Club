"use client";

import React, { useState } from "react";
import { useIoTApp } from "@/lib/store";
import { DemoRole } from "@/lib/types";
import {
  ShieldAlert,
  UserCheck,
  GraduationCap,
  Sparkles,
  RotateCcw,
  Bell,
  CheckCircle2,
  Activity,
  Cpu,
  Eye,
} from "lucide-react";

export const RoleSwitcher: React.FC = () => {
  const { demoRole, setDemoRole, notifications, markNotificationAsRead, resetDemoState, telemetry } = useIoTApp();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.read);

  const roles: { role: DemoRole; label: string; icon: React.ReactNode; badge: string; color: string }[] = [
    {
      role: "public",
      label: "Public Portal",
      icon: <Eye className="w-3.5 h-3.5" />,
      badge: "Visitor View",
      color: "border-slate-600 text-slate-300 hover:border-slate-400",
    },
    {
      role: "applicant",
      label: "Applicant",
      icon: <UserCheck className="w-3.5 h-3.5" />,
      badge: "Recruitment Pipeline",
      color: "border-iot-amber/50 text-amber-400 hover:border-iot-amber",
    },
    {
      role: "student",
      label: "Student (Hari)",
      icon: <GraduationCap className="w-3.5 h-3.5" />,
      badge: "Level 4 IoT Builder",
      color: "border-iot-emerald/50 text-emerald-400 hover:border-iot-emerald",
    },
    {
      role: "teacher",
      label: "Teacher / Mentor",
      icon: <Sparkles className="w-3.5 h-3.5" />,
      badge: "Faculty Evaluation",
      color: "border-iot-cyan/50 text-cyan-400 hover:border-iot-cyan",
    },
    {
      role: "admin",
      label: "Club & Lab Admin",
      icon: <ShieldAlert className="w-3.5 h-3.5" />,
      badge: "Full Governance",
      color: "border-iot-violet/50 text-purple-400 hover:border-iot-violet",
    },
  ];

  return (
    <aside aria-label="Demo Role Switcher" className="w-full bg-white/75 border-b border-slate-200/80 text-xs px-3 py-1.5 z-50 sticky top-0 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left Side: Notice & Telemetry Pulse */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold">DEMO MODE</span>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-slate-500 text-[11px] font-mono">
            <span className="text-slate-400">Lab Telemetry:</span>
            <span className="text-emerald-600 font-semibold">{telemetry.temperatureC}°C</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600">{telemetry.humidityPercent}% RH</span>
            <span className="text-slate-300">|</span>
            <span className="text-emerald-700 font-medium">{telemetry.nodesOnline}/{telemetry.nodesTotal} ESP32 Online</span>
          </div>
        </div>

        {/* Center: Interactive Role Switcher */}
        <div className="flex items-center gap-1 bg-slate-100/80 p-0.5 rounded-lg border border-slate-200/60">
          <span className="text-slate-400 font-medium px-2 hidden sm:inline text-[11px]">View as:</span>
          {roles.map((r) => {
            const isActive = demoRole === r.role;
            return (
              <button
                key={r.role}
                onClick={() => setDemoRole(r.role)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all font-medium text-[11px] ${
                  isActive
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                    : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                {r.icon}
                <span>{r.label}</span>
                {isActive && (
                  <span className="hidden md:inline text-[9px] px-1 py-0.2 rounded bg-emerald-50 text-emerald-700 font-mono">
                    {r.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Side: Notifications & Reset Demo */}
        <div className="flex items-center gap-2 relative">
          {/* Notification Button */}
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-iot-rose text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                {unreadNotifs.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifs && (
            <div className="absolute right-0 top-8 w-80 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl p-3 z-50 text-slate-800">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <span className="font-bold text-xs text-slate-900">Notifications ({unreadNotifs.length} new)</span>
                <span className="text-[10px] text-emerald-700 font-semibold">Live Updates</span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationAsRead(n.id)}
                    className={`p-2.5 rounded-xl border transition cursor-pointer text-[11px] ${
                      n.read
                        ? "bg-slate-50 border-slate-200/80 text-slate-500"
                        : "bg-emerald-50/70 border-emerald-200 text-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold mb-0.5">
                      <span className="text-slate-900 text-xs">{n.title}</span>
                      <span className="text-[9px] text-slate-400 font-mono">{n.timestamp}</span>
                    </div>
                    <p className="text-slate-600 leading-tight">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reset Demo Button */}
          <button
            onClick={() => setShowConfirmReset(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 border border-slate-200 text-slate-600 hover:text-rose-600 transition text-[11px]"
            title="Reset demo data to clean seed state"
          >
            <RotateCcw className="w-3 h-3 text-slate-500" />
            <span className="hidden sm:inline font-medium">Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Reset Demo */}
      {showConfirmReset && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl max-w-sm w-full space-y-3 shadow-2xl">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-500" /> Reset Interactive Demo Data?
            </h3>
            <p className="text-xs text-slate-600">
              This will restore all applications, evaluations, hardware inventory, lab bookings, and XP transactions to their initial seed state.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetDemoState();
                  setShowConfirmReset(false);
                }}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs"
              >
                Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
