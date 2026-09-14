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
    setSearchedRecord(found || (null as any));
    setHasSearched(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-slate-800">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto mb-2 shadow-xs">
          <FileCheck2 className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Certificate Verification Service</h1>
        <p className="text-xs text-slate-500">
          Public, read-only registry verifying completed learning tracks, practical hardware assessments, and club awards.
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
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 font-mono focus:outline-none focus:border-emerald-500 shadow-xs"
          />
        </div>
        <button
          type="submit"
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition shadow-xs"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Verify</span>
        </button>
      </form>

      {/* Verification Result Card */}
      {hasSearched && searchedRecord ? (
        <div className="p-8 rounded-3xl glass-card space-y-6 shadow-md relative overflow-hidden border border-slate-200/90 bg-white">
          {/* Top Stamp */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-wider">
                {defaultClubConfig.clubName} • CERTIFICATION REGISTRY
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-1">{searchedRecord.trackOrTopic}</h2>
              <div className="text-xs text-slate-500 font-mono mt-0.5">{searchedRecord.level}</div>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>OFFICIALLY VERIFIED & VALID</span>
            </div>
          </div>

          {/* Certificate Body */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase">Awarded To</span>
                <div className="text-lg font-extrabold text-slate-900 mt-0.5">{searchedRecord.studentName}</div>
                <div className="text-xs text-slate-500 font-mono">Roll: {searchedRecord.studentRoll}</div>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase">Certificate Identifier</span>
                <div className="text-sm font-mono font-bold text-emerald-700 mt-0.5">{searchedRecord.certificateId}</div>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase">Performance Evaluation</span>
                <div className="text-sm font-bold text-emerald-700 mt-0.5">{searchedRecord.gradeOrScore}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase">Date of Issue</span>
                <div className="text-sm font-mono text-slate-800 mt-0.5">{searchedRecord.issueDate}</div>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase">Issuing Authority</span>
                <div className="text-sm font-bold text-slate-900 mt-0.5">{searchedRecord.issuerTitle}</div>
                <div className="text-[11px] text-slate-500">{defaultClubConfig.collegeName}</div>
              </div>

              {/* Digital QR Stamp */}
              <div className="pt-2">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <div className="p-2 bg-white rounded-xl text-slate-900 shrink-0 border border-slate-200 shadow-2xs">
                    <QrCode className="w-8 h-8" />
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 leading-tight">
                    Permanent Read-Only Verification Link: <br />
                    <code className="text-emerald-700 font-bold">{searchedRecord.qrUrl}</code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : hasSearched && !searchedRecord ? (
        <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-2 text-xs shadow-xs">
          <div className="text-rose-600 font-bold text-sm">No Certificate Found</div>
          <p className="text-slate-500">
            No matching verified credential was found for ID <code className="text-slate-900 font-mono font-bold">{searchId}</code>.
            Please check the certificate code on your document.
          </p>
        </div>
      ) : null}
    </div>
  );
}
