"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useIoTApp } from "@/lib/store";
import {
  Cpu,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ArrowLeft,
  Calendar,
  Layers,
  MapPin,
  ShieldCheck,
  Send,
  X,
} from "lucide-react";

export default function AssetDetailPage() {
  const params = useParams();
  const assetId = (params?.assetId as string) || "ESP024";
  const { hardwareAssets, requestHardware, returnHardware, student } = useIoTApp();

  const asset = hardwareAssets.find(
    (a) => a.assetId.toLowerCase() === assetId.toLowerCase()
  ) || hardwareAssets[0];

  const [reportIssueOpen, setReportIssueOpen] = useState(false);
  const [issueText, setIssueText] = useState("");
  const [issueReported, setIssueReported] = useState(false);

  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [project, setProject] = useState("CareGrid");
  const [purpose, setPurpose] = useState("");
  const [duration, setDuration] = useState(14);
  const [requestedSuccess, setRequestedSuccess] = useState(false);

  const handleReportIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueText.trim()) return;
    setIssueReported(true);
  };

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault();
    requestHardware(asset.assetId, project, purpose, duration);
    setRequestedSuccess(true);
    setTimeout(() => {
      setRequestedSuccess(false);
      setRequestModalOpen(false);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      {/* Back Link */}
      <Link
        href="/lab"
        className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 transition font-medium"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Lab Inventory</span>
      </Link>

      {/* Asset Hero Card */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card space-y-6 shadow-xs border border-slate-200/90 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-emerald-700 font-bold">ASSET ID: #{asset.assetId}</span>
              <span>•</span>
              <span className="text-xs text-slate-500 font-mono">{asset.category}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{asset.name}</h1>
            <p className="text-xs text-slate-500 mt-1 font-mono">Model: {asset.model} • SN: {asset.serialNumber}</p>
          </div>

          <div>
            <span
              className={`px-3 py-1.5 rounded-full font-mono text-xs font-bold border ${
                asset.status === "AVAILABLE"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : asset.status === "ISSUED"
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : "bg-teal-50 text-teal-800 border-teal-200"
              }`}
            >
              STATUS: {asset.status}
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Storage & Location
              </div>
              <div className="flex items-center gap-2 text-slate-900 text-sm font-bold">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>{asset.location}</span>
              </div>
              <div className="text-slate-600">
                Physical Condition: <span className="text-emerald-700 font-mono font-bold">{asset.condition}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Current Holder & Allocation
              </div>
              {asset.currentHolder ? (
                <div className="space-y-1">
                  <div className="text-slate-900 font-bold text-sm">{asset.currentHolder}</div>
                  <div className="text-slate-600">Allocated to project: <span className="text-emerald-700 font-semibold">{asset.projectAllocation}</span></div>
                  <div className="text-amber-700 font-mono text-[11px] font-bold">Due return date: {asset.expectedReturnDate}</div>
                </div>
              ) : (
                <div className="text-slate-500 italic">No active holder. Component is in storage bin.</div>
              )}
            </div>
          </div>

          {/* Specifications Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Technical Specifications & Peripherals
            </div>
            <ul className="space-y-1.5 text-slate-700">
              {asset.specs.map((spec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>{spec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center gap-3">
          {asset.status === "AVAILABLE" ? (
            <button
              onClick={() => setRequestModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition"
            >
              Request Hardware Borrow
            </button>
          ) : asset.currentHolderId === student.id ? (
            <button
              onClick={() => returnHardware(asset.assetId)}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition"
            >
              Return Asset to Inventory
            </button>
          ) : (
            <div className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-mono font-medium">
              Currently issued to {asset.currentHolder}
            </div>
          )}

          <button
            onClick={() => setReportIssueOpen(!reportIssueOpen)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold transition"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Report Damage / Issue</span>
          </button>
        </div>

        {/* Issue Report Form */}
        {reportIssueOpen && (
          <div className="pt-4 border-t border-slate-200">
            {issueReported ? (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
                Issue report logged for #{asset.assetId}. Lab administrator has been notified.
              </div>
            ) : (
              <form onSubmit={handleReportIssue} className="space-y-3 text-xs">
                <label className="block text-slate-700 font-medium">
                  Describe Fault (e.g. Broken header pin, bootloader flash failure, overheating):
                </label>
                <textarea
                  rows={2}
                  required
                  value={issueText}
                  onChange={(e) => setIssueText(e.target.value)}
                  placeholder="Details of the malfunction..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs"
                >
                  Submit Fault Ticket
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Borrow Request Modal */}
      {requestModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 border border-slate-200 p-6 rounded-3xl max-w-md w-full space-y-4 text-xs shadow-2xl">
            {requestedSuccess ? (
              <div className="text-center py-6 space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <h3 className="font-bold text-slate-900 text-base">Request Registered!</h3>
                <p className="text-slate-600">
                  Faculty mentor has received your checkout request for #{asset.assetId}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRequest} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-slate-900">Borrow #{asset.assetId}</h3>
                  <button
                    type="button"
                    onClick={() => setRequestModalOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Project Name *</label>
                  <input
                    type="text"
                    required
                    value={project}
                    onChange={(e) => setProject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Duration</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  >
                    <option value={7}>7 Days</option>
                    <option value={14}>14 Days</option>
                    <option value={21}>21 Days</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Purpose *</label>
                  <textarea
                    rows={2}
                    required
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="Describe usage..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setRequestModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-xs"
                  >
                    Confirm Request
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
