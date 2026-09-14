"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useIoTApp } from "@/lib/store";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  QrCode,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  X,
} from "lucide-react";

export default function EventsPage() {
  const { events, registerForEvent, rotateAttendanceToken, student, demoRole } = useIoTApp();

  const [scanModalEventId, setScanModalEventId] = useState<string | null>(null);
  const [enteredToken, setEnteredToken] = useState("");
  const [scanSuccess, setScanSuccess] = useState(false);
  const [scanError, setScanError] = useState("");

  const activeModalEvent = events.find((e) => e.id === scanModalEventId);

  const handleVerifyAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalEvent) return;

    if (enteredToken.trim().toUpperCase() === activeModalEvent.attendanceToken?.toUpperCase()) {
      setScanSuccess(true);
      setScanError("");
      setTimeout(() => {
        setScanSuccess(false);
        setScanModalEventId(null);
        setEnteredToken("");
      }, 2000);
    } else {
      setScanError("Invalid or expired attendance token. Check the screen for the current rotating QR.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 font-bold mb-1">
            <span>TECHNICAL TRAINING & BOOTCAMPS</span>
            <span>•</span>
            <span className="text-emerald-600">HARDWARE PRACTICALS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Workshops & Technical Events</h1>
          <p className="text-xs text-slate-500 mt-1">
            Hands-on weekend sessions with real development kits, FreeRTOS kernels, and signed dynamic QR attendance.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Dynamic QR Protection Active</span>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((evt) => (
          <div
            key={evt.id}
            className="p-6 rounded-3xl glass-card flex flex-col justify-between space-y-5 border border-slate-200/90 shadow-xs"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                  {evt.type}
                </span>
                <span className="text-slate-500">{evt.date}</span>
              </div>

              <h3 className="text-lg font-bold text-slate-900">{evt.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{evt.description}</p>

              <div className="space-y-1.5 pt-2 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{evt.startTime} - {evt.endTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{evt.venue}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-teal-600" />
                  <span>Trainer: <strong className="text-slate-800">{evt.trainer}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>Capacity: <strong className="text-emerald-700">{evt.registeredCount}/{evt.capacity} registered</strong></span>
                </div>
              </div>

              {/* Prerequisites */}
              {evt.prerequisites.length > 0 && (
                <div className="pt-2">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Prerequisites:</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {evt.prerequisites.map((p, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] text-slate-700 font-mono">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions: Register / Mark Attendance */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              {evt.isRegistered ? (
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Registered
                  </div>

                  {evt.attendanceToken && (
                    <button
                      onClick={() => setScanModalEventId(evt.id)}
                      className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Scan Dynamic QR Code</span>
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => registerForEvent(evt.id)}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition shadow-xs"
                >
                  Register for Free Seat
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Dynamic QR Scan & Check-In Modal */}
      {scanModalEventId && activeModalEvent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 border border-slate-200 p-6 rounded-3xl max-w-sm w-full space-y-4 text-xs text-center shadow-2xl">
            {scanSuccess ? (
              <div className="py-6 space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <h3 className="font-bold text-slate-900 text-base">Attendance Verified!</h3>
                <p className="text-slate-600">
                  Presence logged for {student.name} ({student.rollNumber}). Digital certificate eligibility confirmed.
                </p>
              </div>
            ) : (
              <form onSubmit={handleVerifyAttendance} className="space-y-4 text-left">
                <div className="text-center">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto mb-2 shadow-2xs">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">Dynamic Attendance Check-In</h3>
                  <p className="text-slate-500 text-xs">{activeModalEvent.title}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                  Enter the dynamic rotating code currently displayed on the lab screen:
                  <div className="text-emerald-700 font-mono font-bold mt-1">Hint: {activeModalEvent.attendanceToken}</div>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Enter Rotating Dynamic Token *</label>
                  <input
                    type="text"
                    required
                    value={enteredToken}
                    onChange={(e) => setEnteredToken(e.target.value)}
                    placeholder="e.g. IOT-SEC-9842"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono uppercase text-center text-sm font-bold focus:outline-none focus:border-emerald-500 shadow-2xs"
                  />
                </div>

                {scanError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                    {scanError}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setScanModalEventId(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-xs"
                  >
                    Confirm Attendance
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
