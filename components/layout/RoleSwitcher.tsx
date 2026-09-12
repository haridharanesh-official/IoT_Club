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
    <aside aria-label="Demo Role Switcher" className="w-full bg-[#0d1322] border-b border-dark-border text-xs px-3 py-2 z-50 sticky top-0 backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left Side: Notice & Telemetry Pulse */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-slate-400 font-mono text-[11px]">
            <Cpu className="w-3 h-3 text-iot-cyan animate-pulse" />
            <span className="font-semibold text-slate-200">DEMO ENVIRONMENT</span>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-slate-400 text-[11px] font-mono">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-iot-emerald animate-ping" />
              <span>Lab Telemetry:</span>
            </span>
            <span className="text-emerald-400 font-semibold">{telemetry.temperatureC}°C</span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-400">{telemetry.humidityPercent}% RH</span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-400">{telemetry.powerConsumptionKw} kW</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300">{telemetry.nodesOnline}/{telemetry.nodesTotal} ESP32 Online</span>
          </div>
        </div>

        {/* Center: Interactive Role Switcher */}
        <div className="flex items-center gap-1.5 bg-[#090e1a] p-1 rounded-lg border border-dark-border">
          <span className="text-slate-400 font-medium px-2 hidden sm:inline text-[11px]">View as:</span>
          {roles.map((r) => {
            const isActive = demoRole === r.role;
            return (
              <button
                key={r.role}
                onClick={() => setDemoRole(r.role)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-all font-medium text-[11px] ${
                  isActive
                    ? "bg-slate-800 text-white shadow-sm border border-slate-600"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                {r.icon}
                <span>{r.label}</span>
                {isActive && (
                  <span className="hidden md:inline text-[9px] px-1 py-0.2 rounded bg-slate-900 border border-slate-700 text-slate-300 font-mono">
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
            <div className="absolute right-0 top-8 w-80 bg-dark-surface border border-dark-border rounded-lg shadow-2xl p-3 z-50 text-slate-200">
              <div className="flex items-center justify-between pb-2 border-b border-dark-border mb-2">
                <span className="font-semibold text-xs text-white">Notifications ({unreadNotifs.length} new)</span>
                <span className="text-[10px] text-slate-400">Live Updates</span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationAsRead(n.id)}
                    className={`p-2 rounded border transition cursor-pointer text-[11px] ${
                      n.read
                        ? "bg-slate-900/40 border-slate-800 text-slate-400"
                        : "bg-slate-800/80 border-slate-700 text-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold mb-0.5">
                      <span className="text-white text-xs">{n.title}</span>
                      <span className="text-[9px] text-slate-400">{n.timestamp}</span>
                    </div>
                    <p className="text-slate-300 leading-tight">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reset Demo Button */}
          <button
            onClick={() => setShowConfirmReset(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-red-950/50 hover:border-red-800 border border-slate-700 text-slate-300 hover:text-red-300 transition text-[11px]"
            title="Reset demo data to clean seed state"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Reset Demo */}
      {showConfirmReset && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-dark-card border border-dark-border p-5 rounded-xl max-w-sm w-full space-y-3">
            <h3 className="font-semibold text-sm text-white flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-400" /> Reset Interactive Demo Data?
            </h3>
            <p className="text-xs text-slate-400">
              This will restore all applications, evaluations, hardware inventory, lab bookings, and XP transactions to their initial seed state.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-3 py-1.5 text-xs rounded border border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetDemoState();
                  setShowConfirmReset(false);
                }}
                className="px-3 py-1.5 text-xs rounded bg-red-600 hover:bg-red-500 text-white font-medium"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
