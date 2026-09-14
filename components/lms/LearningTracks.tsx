"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useIoTApp } from "@/lib/store";
import { LearningTrack, Module } from "@/lib/types";
import {
  BookOpen,
  Layers,
  CheckCircle2,
  Lock,
  ArrowRight,
  Code2,
  Cpu,
  Send,
  UploadCloud,
  FileCheck2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Zap,
} from "lucide-react";

export const LearningTracks: React.FC = () => {
  const { tracks, submitAssignment, submissions, student } = useIoTApp();

  const [selectedTrackId, setSelectedTrackId] = useState<string>("trk-02"); // Embedded Systems
  const [selectedModuleId, setSelectedModuleId] = useState<string>("mod-202"); // ESP32 MQTT

  // Assignment Submission State
  const [githubRepo, setGithubRepo] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [docText, setDocText] = useState("");
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const activeTrack = tracks.find((t) => t.id === selectedTrackId) || tracks[0];
  const activeModule =
    activeTrack.modules.find((m) => m.id === selectedModuleId) || activeTrack.modules[0];

  const existingSubmission = submissions.find(
    (s) => s.assignmentId === activeModule?.assignment?.id && s.studentId === student.id
  );

  const handleAssignmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubRepo.trim()) return;

    submitAssignment(activeModule.id, {
      githubRepo,
      demoUrl,
      documentationText: docText,
    });

    setSubmittedSuccess(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 mb-1">
            <span>CURRICULUM ENGINE</span>
            <span>•</span>
            <span className="text-emerald-600 font-bold">8 STRUCTURED TRACKS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">IoT Club Learning Management System</h1>
          <p className="text-xs text-slate-500 mt-1">
            Concept → Simulation → Hardware Exercise → Mini Project → Teacher Evaluation → Skill Unlocked.
          </p>
        </div>

        <Link
          href="/learn/skills"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs transition"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>View Interactive Skill Tree</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 8 Tracks Horizontal Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {tracks.map((track) => {
          const isSelected = track.id === selectedTrackId;
          return (
            <button
              key={track.id}
              onClick={() => {
                setSelectedTrackId(track.id);
                if (track.modules.length > 0) {
                  setSelectedModuleId(track.modules[0].id);
                }
              }}
              className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                isSelected
                  ? "bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500 shadow-xs text-slate-900"
                  : "bg-white border-slate-200/80 text-slate-600 hover:border-slate-300 hover:text-slate-900"
              }`}
            >
              <div className="text-[10px] font-mono text-slate-400">0{track.id.replace("trk-", "")}</div>
              <div className="font-bold text-xs mt-1 truncate">{track.title.split("–")[1] || track.title}</div>
              <div className="text-[10px] text-emerald-700 font-mono mt-1">{track.progressPercent}% Done</div>
            </button>
          );
        })}
      </div>

      {/* Selected Track Overview & Module Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar: Modules list */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {activeTrack.title} Modules
          </h3>

          <div className="space-y-2">
            {activeTrack.modules.length === 0 ? (
              <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-500">
                Advanced syllabus modules scheduled for Term 2.
              </div>
            ) : (
              activeTrack.modules.map((mod) => {
                const isSelected = mod.id === selectedModuleId;
                return (
                  <button
                    key={mod.id}
                    onClick={() => setSelectedModuleId(mod.id)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition flex items-center justify-between text-xs ${
                      isSelected
                        ? "bg-emerald-50 border-emerald-500 text-slate-900 shadow-xs"
                        : "bg-white border-slate-200/80 text-slate-600 hover:border-slate-300 hover:text-slate-900"
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-slate-900 leading-tight">{mod.title}</div>
                      <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-2">
                        <span>{mod.level}</span>
                        <span>•</span>
                        <span>{mod.estimatedHours} hrs</span>
                      </div>
                    </div>

                    {mod.isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : mod.isUnlocked ? (
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right 3 Columns: Active Module Experience */}
        <div className="lg:col-span-3 space-y-6">
          {activeModule ? (
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6">
              {/* Module Header */}
              <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-wider">
                    {activeTrack.title} • Module Overview
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{activeModule.title}</h2>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{activeModule.overview}</p>
                </div>

                <div className="px-3.5 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-center shrink-0">
                  <div className="text-[10px] text-emerald-700 font-mono">UNLOCKABLE BADGE</div>
                  <div className="text-xs font-bold text-emerald-900 mt-0.5">{activeModule.badge}</div>
                </div>
              </div>

              {/* Multi-Step Experience Flow */}
              <div className="space-y-6">
                {/* 1. Concept & Wiring */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-emerald-600" />
                    <span>Hardware Concept & Wiring Architecture</span>
                  </h3>
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-3 leading-relaxed">
                    <p>
                      ESP32 utilizes a dual-core Xtensa 32-bit LX7 microprocessor. Core 0 is conventionally dedicated to the Wi-Fi and TCP/IP networking stack, while Core 1 executes the application logic and sensor acquisition routines.
                    </p>
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 font-mono text-[11px] text-slate-700">
                      <div className="text-emerald-700 font-bold mb-1">Pinout Connection Map:</div>
                      <div>• ESP32 3.3V ─── VCC (BH1750 Ambient Light Sensor)</div>
                      <div>• ESP32 GND  ─── GND</div>
                      <div>• ESP32 GPIO21 (SDA) ─── SDA (with 4.7kΩ pull-up to 3.3V)</div>
                      <div>• ESP32 GPIO22 (SCL) ─── SCL (with 4.7kΩ pull-up to 3.3V)</div>
                      <div>• ESP32 GPIO26 ─── IN1 (Optocoupled Relay Control Module)</div>
                    </div>
                  </div>
                </div>

                {/* 2. Embedded Firmware Code Example */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-emerald-600" />
                    <span>Firmware Implementation (FreeRTOS + Mosquitto MQTT)</span>
                  </h3>
                  <pre className="text-xs font-mono text-emerald-400 bg-slate-900 p-4 rounded-2xl border border-slate-800 overflow-x-auto leading-relaxed">
{`#include <WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>

const char* ssid = "IoT_Lab_WLAN";
const char* mqtt_server = "192.168.1.100"; // Lab Mosquitto Broker
WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22); // SDA, SCL
  WiFi.begin(ssid, "secured_pass");
  client.setServer(mqtt_server, 1883);
}

void loop() {
  if (!client.connected()) reconnectMQTT();
  client.loop();

  // Read lux from BH1750 and publish telemetry
  float lux = readAmbientLux();
  char payload[64];
  snprintf(payload, sizeof(payload), "{\\"lux\\": %.1f, \\"node\\": \\"ESP024\\"}", lux);
  client.publish("iotclub/telemetry/ESP024", payload, true); // Retain=true
  delay(5000);
}`}
                  </pre>
                </div>

                {/* 3. Practical Assignment & Rubrics */}
                {activeModule.assignment && (
                  <div className="pt-6 border-t border-slate-200 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono text-amber-700 uppercase font-bold">PRACTICAL ASSIGNMENT</span>
                        <h3 className="text-base font-bold text-slate-900 mt-0.5">{activeModule.assignment.title}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-mono font-medium">
                          Reward: +{activeModule.assignment.maxXP} XP
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {activeModule.assignment.description}
                    </p>

                    {/* Rubric Matrix Preview */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <h4 className="font-semibold text-slate-900 text-xs">Faculty Evaluation Rubric (Total: 100 Marks)</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {activeModule.assignment.rubrics.map((r, i) => (
                          <div key={i} className="p-3 rounded-xl bg-white border border-slate-200 text-xs shadow-xs">
                            <div className="flex items-center justify-between font-semibold text-slate-900 mb-1">
                              <span>{r.name}</span>
                              <span className="text-emerald-700 font-mono">/{r.maxScore}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-tight">{r.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Submission Form / Status */}
                    {existingSubmission ? (
                      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-emerald-900 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Submission Received
                          </span>
                          <span className="font-mono text-[10px] text-slate-500">{existingSubmission.submittedAt}</span>
                        </div>
                        <p className="text-slate-700">
                          Repository: <a href={existingSubmission.githubRepo} target="_blank" className="text-emerald-700 underline font-mono">{existingSubmission.githubRepo}</a>
                        </p>
                        <div className="text-slate-600">Status: <span className="font-bold text-amber-700">{existingSubmission.status}</span></div>

                        {existingSubmission.evaluation && (
                          <div className="mt-3 p-3 rounded-xl bg-white border border-emerald-200 text-slate-800">
                            <div className="font-bold text-emerald-700">Score: {existingSubmission.evaluation.totalScore}/100</div>
                            <p className="text-slate-600 mt-1 italic">"{existingSubmission.evaluation.feedback}"</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <form onSubmit={handleAssignmentSubmit} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-xs">
                        <h4 className="font-bold text-slate-900 text-sm">Submit Practical Assignment</h4>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-slate-700 font-medium mb-1">GitHub Repository URL *</label>
                            <input
                              type="url"
                              required
                              value={githubRepo}
                              onChange={(e) => setGithubRepo(e.target.value)}
                              placeholder="https://github.com/username/esp32-mqtt-light-control"
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-700 font-medium mb-1">Demo Video Link (Loom / YouTube / Drive)</label>
                            <input
                              type="url"
                              value={demoUrl}
                              onChange={(e) => setDemoUrl(e.target.value)}
                              placeholder="https://youtube.com/watch?v=..."
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-700 font-medium mb-1">Implementation Notes & Pinout Summary</label>
                            <textarea
                              rows={3}
                              value={docText}
                              onChange={(e) => setDocText(e.target.value)}
                              placeholder="Describe your FreeRTOS tasks, MQTT topics used, and error handling..."
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition shadow-xs"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit for Faculty Evaluation</span>
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center text-slate-500 text-xs">
              Select a learning module to begin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
