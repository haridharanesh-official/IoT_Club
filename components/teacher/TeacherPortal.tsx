"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useIoTApp } from "@/lib/store";
import {
  Sparkles,
  CheckCircle2,
  Clock,
  Cpu,
  Layers,
  Award,
  AlertTriangle,
  Sliders,
  Send,
  ArrowRight,
  QrCode,
  RotateCcw,
  Check,
  X,
  FileCheck2,
} from "lucide-react";

export const TeacherPortal: React.FC = () => {
  const {
    submissions,
    evaluateSubmission,
    hardwareRequests,
    approveHardwareRequest,
    rejectHardwareRequest,
    events,
    rotateAttendanceToken,
  } = useIoTApp();

  const [selectedSubId, setSelectedSubId] = useState<string>(submissions[0]?.id || "");
  const [evaluationFeedback, setEvaluationFeedback] = useState("Solid FreeRTOS task pinning. Good use of Last Will Testament flag.");
  const [evalPassed, setEvalPassed] = useState(true);
  const [evalSuccessMessage, setEvalSuccessMessage] = useState("");

  // Rubric Scores (Section 29)
  const [scoreCircuit, setScoreCircuit] = useState(19); // /20
  const [scoreCode, setScoreCode] = useState(18); // /20
  const [scoreMqtt, setScoreMqtt] = useState(24); // /25
  const [scoreError, setScoreError] = useState(14); // /15
  const [scoreDocs, setScoreDocs] = useState(10); // /10
  const [scoreDemo, setScoreDemo] = useState(9); // /10

  const totalScore = scoreCircuit + scoreCode + scoreMqtt + scoreError + scoreDocs + scoreDemo;

  const activeSub = submissions.find((s) => s.id === selectedSubId) || submissions[0];

  const handleEvaluate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSub) return;

    evaluateSubmission(
      activeSub.assignmentId,
      activeSub.studentId,
      {
        "Circuit Design": scoreCircuit,
        "Code Quality": scoreCode,
        "MQTT Implementation": scoreMqtt,
        "Error Handling": scoreError,
        "Documentation": scoreDocs,
        "Demonstration": scoreDemo,
      },
      evaluationFeedback,
      evalPassed
    );

    setEvalSuccessMessage(`Evaluation saved! Score: ${totalScore}/100. Student notified.`);
    setTimeout(() => setEvalSuccessMessage(""), 3000);
  };

  const pendingHardware = hardwareRequests.filter((r) => r.status === "PENDING");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-dark-border pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-iot-cyan mb-1">
            <span>FACULTY & TECHNICAL MENTOR PORTAL</span>
            <span>•</span>
            <span className="text-emerald-400">ACADEMIC SUPERVISION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Evaluation Center & Lab Governance</h1>
          <p className="text-xs text-slate-400 mt-1">
            Multi-criteria rubric grading, hardware borrow authorization, and batch skill analytics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/teacher/analytics"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            Batch Skill Analytics →
          </Link>
        </div>
      </div>

      {/* Metrics Row (Section 28) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-dark-card border border-dark-border">
          <div className="text-[10px] text-slate-400 font-mono">PENDING EVALUATIONS</div>
          <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
            {submissions.filter((s) => s.status === "PENDING").length} Submissions
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">ESP32 Practical Queue</div>
        </div>

        <div className="p-4 rounded-xl bg-dark-card border border-dark-border">
          <div className="text-[10px] text-slate-400 font-mono">HARDWARE REQUESTS</div>
          <div className="text-2xl font-bold text-iot-cyan font-mono mt-1">
            {pendingHardware.length} Pending
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Awaiting Mentor Approval</div>
        </div>

        <div className="p-4 rounded-xl bg-dark-card border border-dark-border">
          <div className="text-[10px] text-slate-400 font-mono">ACTIVE PROJECTS</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">17 Teams</div>
          <div className="text-[10px] text-emerald-400 mt-0.5">All Milestones On Track</div>
        </div>

        <div className="p-4 rounded-xl bg-dark-card border border-dark-border">
          <div className="text-[10px] text-slate-400 font-mono">WORKSHOPS THIS SEMESTER</div>
          <div className="text-2xl font-bold text-iot-violet font-mono mt-1">21 Sessions</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Dynamic QR Verified</div>
        </div>
      </div>

      {/* Main Grid: Evaluation Center + Hardware Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Rubric Evaluation Form (Section 29) */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-2xl bg-dark-card border border-dark-border space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-dark-border">
            <div>
              <span className="text-[10px] font-mono text-iot-cyan uppercase">RUBRIC EVALUATION CENTER</span>
              <h2 className="text-xl font-bold text-white mt-0.5">
                Practical Assignment: ESP32 + MQTT Automation
              </h2>
            </div>

            {activeSub && (
              <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-right">
                <div className="text-xs font-bold text-white">{activeSub.studentName}</div>
                <div className="text-[10px] font-mono text-slate-400">{activeSub.studentRoll}</div>
              </div>
            )}
          </div>

          {activeSub ? (
            <div className="space-y-6">
              {/* Submission Details Box */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-mono">SUBMITTED ARTIFACTS</span>
                  <span className="text-slate-500 font-mono text-[10px]">{activeSub.submittedAt}</span>
                </div>
                <div>
                  GitHub Repo:{" "}
                  <a href={activeSub.githubRepo} target="_blank" className="text-iot-cyan underline font-mono">
                    {activeSub.githubRepo}
                  </a>
                </div>
                {activeSub.demoUrl && (
                  <div>
                    Demo Video:{" "}
                    <a href={activeSub.demoUrl} target="_blank" className="text-emerald-400 underline font-mono">
                      {activeSub.demoUrl}
                    </a>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-800 text-slate-300 italic">
                  "{activeSub.documentationText}"
                </div>
              </div>

              {/* Rubric Criteria Sliders (Section 29) */}
              <form onSubmit={handleEvaluate} className="space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm">Grading Matrix & Rubrics</h3>
                  <div className="text-sm font-mono font-bold text-amber-400">
                    Calculated Total: {totalScore} / 100
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Circuit Design /20 */}
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">Circuit Design & Wiring Safety</span>
                      <span className="font-mono text-iot-cyan font-bold">{scoreCircuit} / 20</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={20}
                      value={scoreCircuit}
                      onChange={(e) => setScoreCircuit(Number(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                    <p className="text-[10px] text-slate-400">Pull-ups, proper voltage levels, relay protection.</p>
                  </div>

                  {/* Code Quality /20 */}
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">Code Quality & FreeRTOS</span>
                      <span className="font-mono text-iot-cyan font-bold">{scoreCode} / 20</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={20}
                      value={scoreCode}
                      onChange={(e) => setScoreCode(Number(e.target.value))}
                      className="w-full accent-cyan-500"
                    />
                    <p className="text-[10px] text-slate-400">Task separation, non-blocking delay, naming.</p>
                  </div>

                  {/* MQTT Implementation /25 */}
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">MQTT Implementation & Topics</span>
                      <span className="font-mono text-iot-cyan font-bold">{scoreMqtt} / 25</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={25}
                      value={scoreMqtt}
                      onChange={(e) => setScoreMqtt(Number(e.target.value))}
                      className="w-full accent-purple-500"
                    />
                    <p className="text-[10px] text-slate-400">Structured JSON, retain flags, LWT setup.</p>
                  </div>

                  {/* Error Handling /15 */}
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">Error Handling & Reconnect</span>
                      <span className="font-mono text-iot-cyan font-bold">{scoreError} / 15</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={15}
                      value={scoreError}
                      onChange={(e) => setScoreError(Number(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                    <p className="text-[10px] text-slate-400">Reconnection loop when Wi-Fi drops.</p>
                  </div>

                  {/* Documentation /10 */}
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">Documentation & README</span>
                      <span className="font-mono text-iot-cyan font-bold">{scoreDocs} / 10</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      value={scoreDocs}
                      onChange={(e) => setScoreDocs(Number(e.target.value))}
                      className="w-full accent-blue-500"
                    />
                    <p className="text-[10px] text-slate-400">Pinout table, dependencies, instructions.</p>
                  </div>

                  {/* Live Demo /10 */}
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">Working Video Demonstration</span>
                      <span className="font-mono text-iot-cyan font-bold">{scoreDemo} / 10</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      value={scoreDemo}
                      onChange={(e) => setScoreDemo(Number(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                    <p className="text-[10px] text-slate-400">Sensor reaction & live broker terminal.</p>
                  </div>
                </div>

                {/* Feedback Comment */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Faculty Feedback & Mentor Advice</label>
                  <textarea
                    rows={2}
                    value={evaluationFeedback}
                    onChange={(e) => setEvaluationFeedback(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white"
                  />
                </div>

                {/* Status Options */}
                <div className="flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                    <input
                      type="radio"
                      checked={evalPassed}
                      onChange={() => setEvalPassed(true)}
                      className="text-iot-emerald"
                    />
                    <span>Pass & Award ESP32 Badge (+100 XP)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                    <input
                      type="radio"
                      checked={!evalPassed}
                      onChange={() => setEvalPassed(false)}
                      className="text-amber-500"
                    />
                    <span>Request Revisions</span>
                  </label>
                </div>

                {evalSuccessMessage && (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 font-medium">
                    {evalSuccessMessage}
                  </div>
                )}

                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-iot-emerald hover:bg-emerald-400 text-slate-950 font-bold transition shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Final Evaluation & Award XP</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">No pending submissions.</div>
          )}
        </div>

        {/* Right 1 Column: Hardware Approvals Queue (Section 26 & 28) */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-dark-card border border-dark-border space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-sm">Hardware Approval Queue</h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-800 font-mono text-[10px] text-amber-300">
                {pendingHardware.length} Pending
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-tight">
              Authorize student checkout requests for lab microcontrollers and RF equipment.
            </p>

            <div className="space-y-3">
              {pendingHardware.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-500 text-center">
                  All hardware checkout requests processed.
                </div>
              ) : (
                pendingHardware.map((req) => (
                  <div key={req.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-iot-cyan font-bold">#{req.assetId}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{req.durationDays} Days</span>
                    </div>

                    <div className="font-bold text-white">{req.assetName}</div>
                    <div className="text-slate-300">
                      Requested by: <span className="text-white font-medium">{req.studentName}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Project: <span className="text-slate-200">{req.project}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 italic">"{req.purpose}"</div>

                    <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                      <button
                        onClick={() => approveHardwareRequest(req.id)}
                        className="flex-1 py-1.5 rounded-lg bg-iot-emerald hover:bg-emerald-400 text-slate-950 font-bold text-[11px] transition"
                      >
                        Approve Issue
                      </button>
                      <button
                        onClick={() => rejectHardwareRequest(req.id)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-[11px] transition"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Dynamic Workshop Attendance QR Generator (Section 33) */}
          <div className="p-6 rounded-2xl bg-dark-card border border-dark-border space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-iot-cyan" />
                <h3 className="font-bold text-white text-sm">Dynamic QR Attendance</h3>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">Auto-Rotating</span>
            </div>

            <p className="text-xs text-slate-400 leading-tight">
              Short-lived signed tokens prevent student screenshot sharing during workshops.
            </p>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-3">
              <div className="text-xs text-white font-semibold">{events[0].title}</div>

              <div className="p-3 bg-white rounded-xl mx-auto w-fit shadow-md">
                <div className="w-28 h-28 border-4 border-slate-950 flex flex-col items-center justify-center text-slate-950 font-mono text-center p-1">
                  <div className="text-[8px] font-bold">WORKSHOP QR</div>
                  <div className="text-xs font-black my-0.5">{events[0].attendanceToken}</div>
                  <div className="text-[7px] text-slate-600">Expires in 60s</div>
                </div>
              </div>

              <button
                onClick={() => rotateAttendanceToken(events[0].id)}
                className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Rotate Dynamic Token Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
