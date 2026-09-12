"use client";

import React from "react";
import Link from "next/link";
import { useIoTApp } from "@/lib/store";
import {
  Radio,
  Thermometer,
  Droplets,
  Wind,
  Zap,
  Users,
  Cpu,
  ArrowLeft,
  Activity,
  Terminal,
  ShieldCheck,
  Clock,
  Layers,
} from "lucide-react";

export default function LiveLabPage() {
  const { telemetry } = useIoTApp();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/lab"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Lab Portal</span>
        </Link>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-iot-emerald animate-ping" />
          <span className="text-slate-300">MQTT Ingestion Active (RPi Gateway)</span>
        </div>
      </div>

      {/* Header */}
      <div className="border-b border-dark-border pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-iot-cyan mb-1">
            <span>EDGE TELEMETRY BROKER</span>
            <span>•</span>
            <span className="text-emerald-400">BROKER: MOSQUITTO 2.0.18</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Live IoT Lab Telemetry Center</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time environmental sensor feeds, workbench power consumption, and active ESP32 edge nodes.
          </p>
        </div>

        <div className="text-right font-mono text-xs text-slate-400">
          <div>Last Ingestion: <span className="text-white font-bold">{new Date(telemetry.lastUpdated).toLocaleTimeString()}</span></div>
          <div className="text-emerald-400 text-[10px]">Simulated MQTT Telemetry (Section 43)</div>
        </div>
      </div>

      {/* Metrics Cards Grid (Section 41) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Temperature */}
        <div className="p-4 rounded-2xl bg-dark-card border border-dark-border space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Temperature</span>
            <Thermometer className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
            {telemetry.temperatureC}°C
          </div>
          <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
            <Activity className="w-3 h-3" /> Nominal (Lab Target 24-28°C)
          </div>
        </div>

        {/* Humidity */}
        <div className="p-4 rounded-2xl bg-dark-card border border-dark-border space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Rel. Humidity</span>
            <Droplets className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-cyan-400 font-mono tracking-tight">
            {telemetry.humidityPercent}%
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            ESD Safe Band
          </div>
        </div>

        {/* Air Quality AQI */}
        <div className="p-4 rounded-2xl bg-dark-card border border-dark-border space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Air Quality</span>
            <Wind className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-3xl font-extrabold text-violet-400 font-mono tracking-tight">
            {telemetry.airQualityAqi} <span className="text-xs font-normal text-slate-400">AQI</span>
          </div>
          <div className="text-[10px] text-emerald-400 font-mono">
            PMS5003 Good Quality
          </div>
        </div>

        {/* Power Usage */}
        <div className="p-4 rounded-2xl bg-dark-card border border-dark-border space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Lab Power</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 font-mono tracking-tight">
            {telemetry.powerConsumptionKw} <span className="text-xs font-normal text-slate-400">kW</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            ACS712 Current Sensor
          </div>
        </div>

        {/* Occupancy */}
        <div className="p-4 rounded-2xl bg-dark-card border border-dark-border space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Occupancy</span>
            <Users className="w-4 h-4 text-iot-emerald" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
            {telemetry.occupancyCount} <span className="text-xs font-normal text-slate-400">Students</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            PIR & Dynamic Scan
          </div>
        </div>

        {/* Edge Nodes */}
        <div className="p-4 rounded-2xl bg-dark-card border border-dark-border space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>ESP32 Nodes</span>
            <Cpu className="w-4 h-4 text-iot-cyan" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">
            {telemetry.nodesOnline} <span className="text-xs text-slate-500 font-normal">/ {telemetry.nodesTotal}</span>
          </div>
          <div className="text-[10px] text-emerald-400 font-mono">
            Mesh Heartbeats OK
          </div>
        </div>
      </div>

      {/* Visual Telemetry Chart History (Section 41) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temperature Trend SVG Chart */}
        <div className="p-6 rounded-2xl bg-dark-card border border-dark-border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm">Temperature Fluctuation (°C)</h3>
            <span className="text-[11px] font-mono text-slate-400">DHT22 Ambient Probe</span>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-6 pb-2 px-2 bg-slate-900/60 rounded-xl border border-slate-800">
            {telemetry.deviceHistory.map((pt, i) => {
              const heightPercent = Math.min(100, Math.max(20, (pt.temp - 25) * 20));
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[10px] font-mono text-emerald-400">{pt.temp}°</span>
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-emerald-600 to-cyan-400 transition-all duration-500"
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-[9px] font-mono text-slate-500">{pt.time}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Power Usage Trend SVG Chart */}
        <div className="p-6 rounded-2xl bg-dark-card border border-dark-border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm">Power Consumption Demand (kW)</h3>
            <span className="text-[11px] font-mono text-slate-400">Main Distribution Panel</span>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-6 pb-2 px-2 bg-slate-900/60 rounded-xl border border-slate-800">
            {telemetry.deviceHistory.map((pt, i) => {
              const heightPercent = Math.min(100, Math.max(20, pt.power * 45));
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[10px] font-mono text-amber-400">{pt.power} kW</span>
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-amber-600 to-yellow-400 transition-all duration-500"
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-[9px] font-mono text-slate-500">{pt.time}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Live MQTT Raw Ingestion Stream (Section 42 & 43) */}
      <div className="p-6 rounded-2xl bg-dark-card border border-dark-border space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-iot-cyan" />
            <h3 className="font-bold text-white text-sm">Real-Time MQTT Message Stream (Raspberry Pi Gateway)</h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Topic: <code className="text-iot-emerald">iotclub/lab/sensors/telemetry</code>
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 space-y-1.5 overflow-x-auto">
          <div className="text-slate-500 text-[11px]">// Live deserialized payload from Mosquitto edge broker:</div>
          <div className="text-emerald-400">
            {JSON.stringify(
              {
                broker: "rpi5-gateway.local:1883",
                qos: 1,
                retain: true,
                timestamp: telemetry.lastUpdated,
                metrics: {
                  temperature_c: telemetry.temperatureC,
                  humidity_rh: telemetry.humidityPercent,
                  air_quality_aqi: telemetry.airQualityAqi,
                  power_kw: telemetry.powerConsumptionKw,
                  occupancy: telemetry.occupancyCount,
                  mesh_nodes_online: telemetry.nodesOnline,
                  active_benches: `${telemetry.benchesActive}/${telemetry.benchesTotal}`,
                },
              },
              null,
              2
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>Architectural Rule: Frontend connects via secure WebSockets / Ingestion API; Mosquitto credentials are never exposed to browser.</span>
          <span className="text-emerald-400 font-mono">TLS 1.3 Active</span>
        </div>
      </div>
    </div>
  );
}
