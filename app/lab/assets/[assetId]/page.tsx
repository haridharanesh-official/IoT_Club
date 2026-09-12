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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Link */}
      <Link
        href="/lab"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Lab Inventory</span>
      </Link>

      {/* Asset Hero Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-dark-card border border-dark-border space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-dark-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-iot-cyan font-bold">ASSET ID: #{asset.assetId}</span>
              <span>•</span>
              <span className="text-xs text-slate-400 font-mono">{asset.category}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{asset.name}</h1>
            <p className="text-xs text-slate-300 mt-1 font-mono">Model: {asset.model} • SN: {asset.serialNumber}</p>
          </div>

          <div>
            <span
              className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold border ${
                asset.status === "AVAILABLE"
                  ? "bg-emerald-950/60 text-emerald-400 border-emerald-800"
                  : asset.status === "ISSUED"
                  ? "bg-amber-950/60 text-amber-400 border-amber-800"
                  : "bg-cyan-950/60 text-cyan-400 border-cyan-800"
              }`}
            >
              STATUS: {asset.status}
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Storage & Location
              </div>
              <div className="flex items-center gap-2 text-white text-sm font-semibold">
                <MapPin className="w-4 h-4 text-iot-emerald" />
                <span>{asset.location}</span>
              </div>
              <div className="text-slate-400">
                Physical Condition: <span className="text-emerald-400 font-mono font-bold">{asset.condition}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Current Holder & Allocation
              </div>
              {asset.currentHolder ? (
                <div className="space-y-1">
                  <div className="text-white font-bold text-sm">{asset.currentHolder}</div>
                  <div className="text-slate-400">Allocated to project: <span className="text-iot-cyan">{asset.projectAllocation}</span></div>
                  <div className="text-amber-400 font-mono text-[11px]">Due return date: {asset.expectedReturnDate}</div>
                </div>
              ) : (
                <div className="text-slate-400 italic">No active holder. Component is in storage bin.</div>
              )}
            </div>
          </div>

          {/* Specifications Box */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Technical Specifications & Peripherals
            </div>
            <ul className="space-y-1.5 text-slate-300">
              {asset.specs.map((spec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-iot-cyan">•</span>
                  <span>{spec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Buttons (Section 25) */}
        <div className="pt-6 border-t border-dark-border flex flex-wrap items-center gap-3">
          {asset.status === "AVAILABLE" ? (
            <button
              onClick={() => setRequestModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-iot-emerald hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition"
            >
              Request Hardware Borrow
            </button>
          ) : asset.currentHolderId === student.id ? (
            <button
              onClick={() => returnHardware(asset.assetId)}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition"
            >
              Return Asset to Inventory
            </button>
          ) : (
            <div className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 text-xs font-mono">
              Currently issued to {asset.currentHolder}
            </div>
          )}

          <button
            onClick={() => setReportIssueOpen(!reportIssueOpen)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Report Damage / Issue</span>
          </button>
        </div>

        {/* Issue Report Form */}
        {reportIssueOpen && (
          <div className="pt-4 border-t border-dark-border">
            {issueReported ? (
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-xs text-emerald-300">
                Issue report logged for #{asset.assetId}. Lab administrator has been notified.
              </div>
            ) : (
              <form onSubmit={handleReportIssue} className="space-y-3 text-xs">
                <label className="block text-slate-300 font-medium">
                  Describe Fault (e.g. Broken header pin, bootloader flash failure, overheating):
                </label>
                <textarea
                  rows={2}
                  required
                  value={issueText}
                  onChange={(e) => setIssueText(e.target.value)}
                  placeholder="Details of the malfunction..."
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
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
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
          <div className="bg-dark-card border border-dark-border p-6 rounded-2xl max-w-md w-full space-y-4 text-xs">
            {requestedSuccess ? (
              <div className="text-center py-6 space-y-2">
                <CheckCircle2 className="w-12 h-12 text-iot-emerald mx-auto animate-bounce" />
                <h3 className="font-bold text-white text-base">Request Registered!</h3>
                <p className="text-slate-300">
                  Faculty mentor has received your checkout request for #{asset.assetId}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRequest} className="space-y-4">
                <h3 className="font-bold text-base text-white">Borrow #{asset.assetId}</h3>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Project Name *</label>
                  <input
                    type="text"
                    required
                    value={project}
                    onChange={(e) => setProject(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Duration</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white"
                  >
                    <option value={7}>7 Days</option>
                    <option value={14}>14 Days</option>
                    <option value={21}>21 Days</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Purpose *</label>
                  <textarea
                    rows={2}
                    required
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="Describe usage..."
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setRequestModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-iot-emerald hover:bg-emerald-400 text-slate-950 font-bold"
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
