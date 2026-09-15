"use client";

import React, { useState } from "react";
import { useIoTApp } from "@/lib/store";
import { Megaphone, X, AlertTriangle, CheckCircle2, Info, Bell } from "lucide-react";
import Link from "next/link";

export const AnnouncementBanner: React.FC = () => {
  const { systemAnnouncement, currentUser } = useIoTApp();
  const [dismissed, setDismissed] = useState(false);

  if (!systemAnnouncement || !systemAnnouncement.active || dismissed) {
    return null;
  }

  const getStyle = () => {
    switch (systemAnnouncement.type) {
      case "warning":
        return {
          bg: "bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-white",
          badge: "bg-amber-700/60 text-amber-100 border-amber-300/30",
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-100 shrink-0" />,
        };
      case "alert":
        return {
          bg: "bg-gradient-to-r from-rose-600 via-rose-700 to-rose-600 text-white",
          badge: "bg-rose-900/60 text-rose-100 border-rose-300/30",
          icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-100 shrink-0" />,
        };
      case "success":
        return {
          bg: "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white",
          badge: "bg-emerald-900/60 text-emerald-100 border-emerald-300/30",
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-100 shrink-0" />,
        };
      case "info":
      default:
        return {
          bg: "bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 text-white",
          badge: "bg-emerald-900/60 text-emerald-100 border-emerald-400/30",
          icon: <Megaphone className="w-3.5 h-3.5 text-emerald-100 shrink-0" />,
        };
    }
  };

  const style = getStyle();

  return (
    <div className={`relative w-full ${style.bg} px-4 py-2 shadow-xs transition-all text-xs z-50`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="p-1 rounded-lg bg-black/15 shadow-inner">
            {style.icon}
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${style.badge}`}>
              {systemAnnouncement.type}
            </span>
            <span className="font-bold tracking-tight">{systemAnnouncement.title}:</span>
            <span className="opacity-95 truncate max-w-xl md:max-w-3xl">
              {systemAnnouncement.message}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {currentUser?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="hidden sm:inline-flex px-2 py-0.5 rounded-md bg-white/20 hover:bg-white/30 text-[10px] font-mono font-semibold transition"
            >
              Admin Edit →
            </Link>
          )}
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-lg hover:bg-black/20 text-white/80 hover:text-white transition"
            aria-label="Dismiss Announcement"
            title="Dismiss Announcement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
