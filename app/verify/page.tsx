"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useIoTApp } from "@/lib/store";
import { defaultClubConfig } from "@/lib/clubConfig";
import {
  FileCheck2,
  Search,
  CheckCircle2,
  ShieldCheck,
  QrCode,
  ArrowRight,
  ExternalLink,
  Award,
  Clock,
} from "lucide-react";

export default function VerifyCertificatePage() {
  const { certificates } = useIoTApp();
  const [searchId, setSearchId] = useState("IOT-2026-ESP32-0042");
  const [searchedRecord, setSearchedRecord] = useState(certificates[0]);
  const [hasSearched, setHasSearched] = useState(true);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = certificates.find(
      (c) => c.certificateId.toLowerCase() === searchId.trim().toLowerCase()
    );
    setSearchedRecord(found || null as any);
    setHasSearched(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-iot-emerald/10 border border-iot-emerald/30 flex items-center justify-center text-iot-emerald mx-auto mb-2">
          <FileCheck2 className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Certificate Verification Service</h1>
        <p className="text-xs text-slate-400">
          Public, read-only cryptographic registry verifying completed learning tracks, practical hardware assessments, and club awards.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            required
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Enter Certificate ID (e.g. IOT-2026-ESP32-0042)..."
            className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-iot-cyan"
          />
        </div>
        <button
          type="submit"
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-iot-cyan hover:bg-cyan-400 text-slate-950 font-bold text-xs transition"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Verify</span>
        </button>
      </form>

      {/* Verification Result Card (Section 35) */}
      {hasSearched && searchedRecord ? (
        <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-[#11192e] to-[#0c1626] border border-slate-700 space-y-6 shadow-2xl relative overflow-hidden">
          {/* Top Stamp */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="text-[10px] font-mono text-iot-cyan uppercase tracking-wider">
                {defaultClubConfig.clubName} • CERTIFICATION REGISTRY
              </div>
              <h2 className="text-xl font-bold text-white mt-1">{searchedRecord.trackOrTopic}</h2>
              <div className="text-xs text-slate-300 font-mono mt-0.5">{searchedRecord.level}</div>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-xs font-mono font-bold shrink-0">
              <CheckCircle2 className="w-4 h-4" />
              <span>OFFICIALLY VERIFIED & VALID</span>
            </div>
          </div>

          {/* Certificate Body */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase">Awarded To</span>
                <div className="text-lg font-extrabold text-white mt-0.5">{searchedRecord.studentName}</div>
                <div className="text-xs text-slate-400 font-mono">Roll: {searchedRecord.studentRoll}</div>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase">Certificate Identifier</span>
                <div className="text-sm font-mono font-bold text-iot-cyan mt-0.5">{searchedRecord.certificateId}</div>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase">Performance Evaluation</span>
                <div className="text-sm font-semibold text-emerald-400 mt-0.5">{searchedRecord.gradeOrScore}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase">Date of Issue</span>
                <div className="text-sm font-mono text-slate-200 mt-0.5">{searchedRecord.issueDate}</div>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase">Issuing Authority</span>
                <div className="text-sm font-semibold text-slate-200 mt-0.5">{searchedRecord.issuerTitle}</div>
                <div className="text-[11px] text-slate-400">{defaultClubConfig.collegeName}</div>
              </div>

              {/* Digital QR Stamp */}
              <div className="pt-2">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg text-slate-950 shrink-0">
                    <QrCode className="w-8 h-8" />
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 leading-tight">
                    Permanent Read-Only Verification Link: <br />
                    <code className="text-iot-emerald">{searchedRecord.qrUrl}</code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : hasSearched && !searchedRecord ? (
        <div className="p-8 rounded-2xl bg-dark-card border border-dark-border text-center space-y-2 text-xs">
          <div className="text-rose-400 font-semibold text-sm">No Certificate Found</div>
          <p className="text-slate-400">
            No matching verified credential was found for ID <code className="text-white font-mono">{searchId}</code>.
            Please verify the certificate code on your document.
          </p>
        </div>
      ) : null}
    </div>
  );
}
