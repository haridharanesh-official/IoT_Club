"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useIoTApp } from "@/lib/store";
import { HardwareAsset, HardwareStatus, LabResource } from "@/lib/types";
import {
  Cpu,
  Layers,
  Radio,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  ArrowRight,
  Plus,
  Send,
  Boxes,
  RotateCcw,
  Search,
  ExternalLink,
} from "lucide-react";

export const LabPortal: React.FC = () => {
  const {
    hardwareAssets,
    requestHardware,
    returnHardware,
    labResources,
    labBookings,
    bookLabResource,
    student,
    telemetry,
  } = useIoTApp();

  const [activeTab, setActiveTab] = useState<"inventory" | "booking" | "myhardware" | "live">("inventory");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Borrow Modal State
  const [selectedAssetForRequest, setSelectedAssetForRequest] = useState<HardwareAsset | null>(null);
  const [requestProject, setRequestProject] = useState("CareGrid");
  const [requestPurpose, setRequestPurpose] = useState("");
  const [requestDuration, setRequestDuration] = useState(14);
  const [requestSuccess, setRequestSuccess] = useState(false);

  // Booking Form State
  const [selectedResourceId, setSelectedResourceId] = useState<string>("res-01");
  const [bookingDate, setBookingDate] = useState("2026-09-14");
  const [bookingStart, setBookingStart] = useState("14:00");
  const [bookingEnd, setBookingEnd] = useState("16:00");
  const [bookingProject, setBookingProject] = useState("CareGrid");
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // QR Preview Modal
  const [qrModalAsset, setQrModalAsset] = useState<HardwareAsset | null>(null);

  const filteredAssets = hardwareAssets.filter((a) => {
    const matchesCategory = filterCategory === "ALL" || a.category === filterCategory;
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.assetId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const myIssuedAssets = hardwareAssets.filter((a) => a.currentHolderId === student.id);

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetForRequest) return;

    requestHardware(selectedAssetForRequest.assetId, requestProject, requestPurpose, requestDuration);
    setRequestSuccess(true);
    setTimeout(() => {
      setRequestSuccess(false);
      setSelectedAssetForRequest(null);
    }, 1500);
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError("");
    setBookingSuccess(false);

    const success = bookLabResource(selectedResourceId, bookingDate, bookingStart, bookingEnd, bookingProject);
    if (!success) {
      setBookingError("Conflict: This workstation is already booked during this time slot. Please select a different time.");
    } else {
      setBookingSuccess(true);
      setTimeout(() => setBookingSuccess(false), 2000);
    }
  };

  const getStatusBadge = (status: HardwareStatus) => {
    switch (status) {
      case "AVAILABLE":
        return <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-emerald-950/60 text-emerald-400 border border-emerald-800">AVAILABLE</span>;
      case "ISSUED":
        return <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-amber-950/60 text-amber-400 border border-amber-800">ISSUED</span>;
      case "RESERVED":
        return <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-cyan-950/60 text-cyan-400 border border-cyan-800">RESERVED</span>;
      case "UNDER_TESTING":
        return <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-purple-950/60 text-purple-400 border border-purple-800">TESTING</span>;
      case "DAMAGED":
      case "UNDER_REPAIR":
        return <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-red-950/60 text-red-400 border border-red-800">{status}</span>;
      default:
        return <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-800 text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-dark-border pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-iot-cyan mb-1">
            <span>PHYSICAL COMPUTING INFRASTRUCTURE</span>
            <span>•</span>
            <span className="text-emerald-400">268 REGISTERED ASSETS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">IoT Laboratory Management Portal</h1>
          <p className="text-xs text-slate-400 mt-1">
            Component tracking, QR checkouts, workstation scheduling, and real-time environmental telemetry.
          </p>
        </div>

        <Link
          href="/lab/live"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-cyan-800/40 text-cyan-300 hover:bg-slate-800 text-xs font-mono transition"
        >
          <Radio className="w-3.5 h-3.5 text-iot-cyan animate-pulse" />
          <span>Open Fullscreen Telemetry Stream ({telemetry.temperatureC}°C)</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-dark-border pb-2 text-xs">
        {[
          { key: "inventory", label: `Hardware Inventory (${hardwareAssets.length})`, icon: <Boxes className="w-3.5 h-3.5" /> },
          { key: "myhardware", label: `In My Possession (${myIssuedAssets.length})`, icon: <Cpu className="w-3.5 h-3.5" /> },
          { key: "booking", label: "Workstation Booking", icon: <Calendar className="w-3.5 h-3.5" /> },
          { key: "live", label: "Live Telemetry Preview", icon: <Radio className="w-3.5 h-3.5" /> },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium transition ${
              activeTab === t.key
                ? "bg-slate-800 text-white border border-slate-700"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: HARDWARE INVENTORY (Section 23 & 24) */}
      {activeTab === "inventory" && (
        <div className="space-y-4">
          {/* Filter and Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1">
              {["ALL", "Microcontroller", "Single Board Computer", "Sensor", "Wireless & RF", "Testing Equipment", "Tooling"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition shrink-0 ${
                    filterCategory === cat
                      ? "bg-iot-cyan text-slate-950 font-bold"
                      : "bg-dark-card border border-dark-border text-slate-400 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search asset ID or name..."
                className="w-full bg-dark-card border border-dark-border rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-iot-cyan"
              />
            </div>
          </div>

          {/* Asset Table */}
          <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 text-slate-400 font-mono text-[11px] uppercase border-b border-dark-border">
                  <tr>
                    <th className="p-3.5">Asset ID</th>
                    <th className="p-3.5">Equipment Name</th>
                    <th className="p-3.5">Location</th>
                    <th className="p-3.5">Condition</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Current Holder</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {filteredAssets.map((asset) => (
                    <tr key={asset.assetId} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-mono text-iot-cyan font-bold">
                        <Link href={`/lab/assets/${asset.assetId}`} className="hover:underline flex items-center gap-1">
                          <span>#{asset.assetId}</span>
                          <ExternalLink className="w-3 h-3 text-slate-500" />
                        </Link>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-white">{asset.name}</div>
                        <div className="text-[11px] text-slate-400">{asset.category} • {asset.model}</div>
                      </td>
                      <td className="p-3.5 text-slate-300">{asset.location}</td>
                      <td className="p-3.5">
                        <span className="font-mono text-[11px] text-emerald-400">{asset.condition}</span>
                      </td>
                      <td className="p-3.5">{getStatusBadge(asset.status)}</td>
                      <td className="p-3.5">
                        {asset.currentHolder ? (
                          <div className="text-white">
                            <div>{asset.currentHolder}</div>
                            <div className="text-[10px] text-slate-500 font-mono">Until {asset.expectedReturnDate}</div>
                          </div>
                        ) : (
                          <span className="text-slate-600 font-mono">—</span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setQrModalAsset(asset)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                            title="Inspect QR Code"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>

                          {asset.status === "AVAILABLE" ? (
                            <button
                              onClick={() => setSelectedAssetForRequest(asset)}
                              className="px-2.5 py-1 rounded-lg bg-iot-emerald hover:bg-emerald-400 text-slate-950 font-semibold text-[11px] transition"
                            >
                              Borrow
                            </button>
                          ) : asset.currentHolderId === student.id ? (
                            <button
                              onClick={() => returnHardware(asset.assetId)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-[11px] transition"
                            >
                              Return
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-500 italic">In Use</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MY ISSUED HARDWARE */}
      {activeTab === "myhardware" && (
        <div className="space-y-4">
          <h3 className="font-semibold text-white text-sm">Components Currently in Your Possession ({myIssuedAssets.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myIssuedAssets.map((asset) => (
              <div key={asset.assetId} className="p-5 rounded-2xl bg-dark-card border border-dark-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-emerald-400 font-bold">#{asset.assetId}</span>
                  {getStatusBadge(asset.status)}
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">{asset.name}</h4>
                  <p className="text-xs text-slate-400">{asset.category} • Location: {asset.location}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                  <div>Project Allocation: <span className="text-white font-medium">{asset.projectAllocation}</span></div>
                  <div>Issued Date: <span className="text-slate-400 font-mono">{asset.issuedDate}</span></div>
                  <div>Expected Return: <span className="text-amber-400 font-mono font-semibold">{asset.expectedReturnDate}</span></div>
                </div>
                <button
                  onClick={() => returnHardware(asset.assetId)}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                >
                  Return Component to Lab Inventory
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: WORKSTATION SCHEDULER (Section 27) */}
      {activeTab === "booking" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Reservation Form */}
          <div className="p-6 rounded-2xl bg-dark-card border border-dark-border space-y-4 text-xs">
            <h3 className="font-bold text-white text-sm">Reserve Laboratory Workstation</h3>
            <p className="text-slate-400">Reserve specialized test benches to avoid bench crowding and tool conflicts.</p>

            <form onSubmit={handleBookingSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Select Workstation / Resource *</label>
                <select
                  value={selectedResourceId}
                  onChange={(e) => setSelectedResourceId(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white"
                >
                  {labResources.map((res) => (
                    <option key={res.id} value={res.id}>
                      {res.name} (Cap: {res.capacity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={bookingStart}
                    onChange={(e) => setBookingStart(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={bookingEnd}
                    onChange={(e) => setBookingEnd(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Project / Purpose</label>
                <input
                  type="text"
                  value={bookingProject}
                  onChange={(e) => setBookingProject(e.target.value)}
                  placeholder="e.g. CareGrid Enclosure Assembly"
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white"
                />
              </div>

              {bookingError && (
                <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-800 text-red-300 text-xs">
                  {bookingError}
                </div>
              )}

              {bookingSuccess && (
                <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs">
                  Workstation reserved successfully! Added to schedule.
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-iot-cyan hover:bg-cyan-400 text-slate-950 font-bold transition shadow-md"
              >
                Confirm Bench Reservation
              </button>
            </form>
          </div>

          {/* Active Lab Bookings Feed */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-semibold text-white text-sm">Confirmed Lab Schedule</h3>
            <div className="space-y-2.5">
              {labBookings.map((bk) => (
                <div
                  key={bk.id}
                  className="p-4 rounded-xl bg-dark-card border border-dark-border flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-white text-sm">{bk.resourceName}</div>
                    <div className="text-slate-400">
                      Booked by: <span className="text-slate-200">{bk.userName}</span> ({bk.project})
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-iot-cyan font-bold">{bk.date}</div>
                    <div className="text-slate-400">{bk.startTime} - {bk.endTime}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LIVE TELEMETRY PREVIEW */}
      {activeTab === "live" && (
        <div className="p-6 rounded-2xl bg-dark-card border border-dark-border space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-dark-border">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-iot-emerald animate-ping" />
                <h3 className="font-bold text-white text-base">Live Lab Environmental Telemetry</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Topic: iotclub/lab/sensors/telemetry • Updated every 4s
              </p>
            </div>
            <Link
              href="/lab/live"
              className="text-xs text-iot-cyan hover:underline flex items-center gap-1"
            >
              <span>Full Dashboard View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[10px] text-slate-500 font-mono">TEMPERATURE</div>
              <div className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">{telemetry.temperatureC}°C</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[10px] text-slate-500 font-mono">HUMIDITY</div>
              <div className="text-2xl font-extrabold text-cyan-400 mt-1 font-mono">{telemetry.humidityPercent}%</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[10px] text-slate-500 font-mono">AIR QUALITY</div>
              <div className="text-2xl font-extrabold text-purple-400 mt-1 font-mono">{telemetry.airQualityAqi} AQI</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[10px] text-slate-500 font-mono">POWER CONSUMPTION</div>
              <div className="text-2xl font-extrabold text-amber-400 mt-1 font-mono">{telemetry.powerConsumptionKw} kW</div>
            </div>
          </div>
        </div>
      )}

      {/* Borrow Request Modal */}
      {selectedAssetForRequest && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
          <div className="bg-dark-card border border-dark-border p-6 rounded-2xl max-w-md w-full space-y-4 text-xs">
            {requestSuccess ? (
              <div className="text-center py-6 space-y-2">
                <CheckCircle2 className="w-12 h-12 text-iot-emerald mx-auto animate-bounce" />
                <h3 className="font-bold text-white text-base">Request Submitted!</h3>
                <p className="text-slate-300">
                  Asset #{selectedAssetForRequest.assetId} has been temporarily reserved pending faculty mentor approval.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRequestSubmit} className="space-y-4">
                <div>
                  <span className="text-[10px] font-mono text-iot-cyan uppercase">HARDWARE BORROW REQUEST</span>
                  <h3 className="font-bold text-base text-white mt-0.5">{selectedAssetForRequest.name}</h3>
                  <div className="text-[11px] text-slate-400 font-mono">Asset ID: #{selectedAssetForRequest.assetId}</div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Project Name *</label>
                  <input
                    type="text"
                    required
                    value={requestProject}
                    onChange={(e) => setRequestProject(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Duration (Days)</label>
                  <select
                    value={requestDuration}
                    onChange={(e) => setRequestDuration(Number(e.target.value))}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white"
                  >
                    <option value={7}>7 Days</option>
                    <option value={14}>14 Days</option>
                    <option value={21}>21 Days</option>
                    <option value={30}>30 Days</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Purpose & Test Plan *</label>
                  <textarea
                    rows={2}
                    required
                    value={requestPurpose}
                    onChange={(e) => setRequestPurpose(e.target.value)}
                    placeholder="Describe which sensors or circuits will be connected..."
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedAssetForRequest(null)}
                    className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-iot-emerald hover:bg-emerald-400 text-slate-950 font-bold"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* QR Code Modal (Section 25) */}
      {qrModalAsset && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
          <div className="bg-dark-card border border-dark-border p-6 rounded-2xl max-w-sm w-full space-y-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-iot-cyan/20 border border-iot-cyan/40 flex items-center justify-center text-iot-cyan mx-auto">
              <QrCode className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-white text-base">{qrModalAsset.name}</h3>
              <p className="text-xs font-mono text-iot-cyan">ID: #{qrModalAsset.assetId}</p>
            </div>

            {/* Generated QR Graphic */}
            <div className="p-4 bg-white rounded-xl mx-auto w-fit shadow-md">
              <div className="w-36 h-36 border-4 border-slate-950 flex flex-col items-center justify-center text-slate-950 font-mono text-center p-2">
                <div className="text-[10px] font-bold">IOT LAB ASSET</div>
                <div className="text-xs font-extrabold my-1">{qrModalAsset.assetId}</div>
                <div className="text-[9px] text-slate-600">Scan for Issue/Return</div>
              </div>
            </div>

            <p className="text-slate-400 text-[11px] leading-tight">
              Resolves directly to: <br />
              <code className="text-iot-emerald">{qrModalAsset.qrCodeValue}</code>
            </p>

            <button
              onClick={() => setQrModalAsset(null)}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              Close QR View
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
