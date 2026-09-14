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

  // Rubric Scores
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 font-bold mb-1">
            <span>FACULTY & TECHNICAL MENTOR PORTAL</span>
            <span>•</span>
            <span className="text-emerald-600">ACADEMIC SUPERVISION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Evaluation Center & Lab Governance</h1>
          <p className="text-xs text-slate-500 mt-1">
            Multi-criteria rubric grading, hardware borrow authorization, and batch skill analytics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/projects"
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
          >
            <span>Project Reviews & GitHub Audits →</span>
          </Link>
          <Link
            href="/teacher/analytics"
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 shadow-xs transition"
          >
            Batch Skill Analytics →
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[10px] text-slate-500 font-mono">PENDING EVALUATIONS</div>
          <div className="text-2xl font-bold text-amber-600 font-mono mt-1">
            {submissions.filter((s) => s.status === "PENDING").length} Submissions
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">ESP32 Practical Queue</div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[10px] text-slate-500 font-mono">HARDWARE REQUESTS</div>
          <div className="text-2xl font-bold text-emerald-700 font-mono mt-1">
            {pendingHardware.length} Pending
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Awaiting Mentor Approval</div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[10px] text-slate-500 font-mono">ACTIVE PROJECTS</div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">17 Teams</div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">All Milestones On Track</div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[10px] text-slate-500 font-mono">WORKSHOPS THIS SEMESTER</div>
          <div className="text-2xl font-bold text-indigo-700 font-mono mt-1">21 Sessions</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Dynamic QR Verified</div>
        </div>
      </div>

      {/* Main Grid: Evaluation Center + Hardware Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Rubric Evaluation Form */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl glass-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase">RUBRIC EVALUATION CENTER</span>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                Practical Assignment: ESP32 + MQTT Automation
              </h2>
            </div>

            {activeSub && (
              <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-right">
                <div className="text-xs font-bold text-slate-900">{activeSub.studentName}</div>
                <div className="text-[10px] font-mono text-slate-500">{activeSub.studentRoll}</div>
              </div>
            )}
          </div>

          {activeSub ? (
            <div className="space-y-6">
              {/* Submission Details Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-mono font-bold">SUBMITTED ARTIFACTS</span>
                  <span className="text-slate-400 font-mono text-[10px]">{activeSub.submittedAt}</span>
                </div>
                <div>
                  GitHub Repo:{" "}
                  <a href={activeSub.githubRepo} target="_blank" className="text-emerald-700 font-bold underline font-mono">
                    {activeSub.githubRepo}
                  </a>
                </div>
                {activeSub.demoUrl && (
                  <div>
                    Demo Video:{" "}
                    <a href={activeSub.demoUrl} target="_blank" className="text-teal-700 font-bold underline font-mono">
                      {activeSub.demoUrl}
                    </a>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 text-slate-600 italic">
                  "{activeSub.documentationText}"
                </div>
              </div>

              {/* Rubric Criteria Sliders */}
              <form onSubmit={handleEvaluate} className="space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">Grading Matrix & Rubrics</h3>
                  <div className="text-sm font-mono font-bold text-emerald-700">
                    Calculated Total: {totalScore} / 100
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Circuit Design /20 */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">Circuit Design & Wiring Safety</span>
                      <span className="font-mono text-emerald-700 font-bold">{scoreCircuit} / 20</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={20}
                      value={scoreCircuit}
                      onChange={(e) => setScoreCircuit(Number(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                    <p className="text-[10px] text-slate-500">Pull-ups, proper voltage levels, relay protection.</p>
                  </div>

                  {/* Code Quality /20 */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">Code Quality & FreeRTOS</span>
                      <span className="font-mono text-emerald-700 font-bold">{scoreCode} / 20</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={20}
                      value={scoreCode}
                      onChange={(e) => setScoreCode(Number(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                    <p className="text-[10px] text-slate-500">Task separation, non-blocking delay, naming.</p>
                  </div>

                  {/* MQTT Implementation /25 */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">MQTT Implementation & Topics</span>
                      <span className="font-mono text-emerald-700 font-bold">{scoreMqtt} / 25</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={25}
                      value={scoreMqtt}
                      onChange={(e) => setScoreMqtt(Number(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                    <p className="text-[10px] text-slate-500">Structured JSON, retain flags, LWT setup.</p>
                  </div>

                  {/* Error Handling /15 */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">Error Handling & Reconnect</span>
                      <span className="font-mono text-emerald-700 font-bold">{scoreError} / 15</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={15}
                      value={scoreError}
                      onChange={(e) => setScoreError(Number(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                    <p className="text-[10px] text-slate-500">Reconnection loop when Wi-Fi drops.</p>
                  </div>

                  {/* Documentation /10 */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">Documentation & README</span>
                      <span className="font-mono text-emerald-700 font-bold">{scoreDocs} / 10</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      value={scoreDocs}
                      onChange={(e) => setScoreDocs(Number(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                    <p className="text-[10px] text-slate-500">Pinout table, dependencies, instructions.</p>
                  </div>

                  {/* Live Demo /10 */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">Working Video Demonstration</span>
                      <span className="font-mono text-emerald-700 font-bold">{scoreDemo} / 10</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      value={scoreDemo}
                      onChange={(e) => setScoreDemo(Number(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                    <p className="text-[10px] text-slate-500">Sensor reaction & live broker terminal.</p>
                  </div>
                </div>

                {/* Feedback Comment */}
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Faculty Feedback & Mentor Advice</label>
                  <textarea
                    rows={2}
                    value={evaluationFeedback}
                    onChange={(e) => setEvaluationFeedback(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                {/* Status Options */}
                <div className="flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-800 font-medium">
                    <input
                      type="radio"
                      checked={evalPassed}
                      onChange={() => setEvalPassed(true)}
                      className="text-emerald-600"
                    />
                    <span>Pass & Award ESP32 Badge (+100 XP)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-800 font-medium">
                    <input
                      type="radio"
                      checked={!evalPassed}
                      onChange={() => setEvalPassed(false)}
                      className="text-amber-600"
                    />
                    <span>Request Revisions</span>
                  </label>
                </div>

                {evalSuccessMessage && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium">
                    {evalSuccessMessage}
                  </div>
                )}

                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Final Evaluation & Award XP</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs">No pending submissions.</div>
          )}
        </div>

        {/* Right 1 Column: Hardware Approvals Queue */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl glass-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">Hardware Approval Queue</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 font-mono text-[10px] text-amber-800 font-bold">
                {pendingHardware.length} Pending
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-tight">
              Authorize student checkout requests for lab microcontrollers and RF equipment.
            </p>

            <div className="space-y-3">
              {pendingHardware.length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
                  All hardware checkout requests processed.
                </div>
              ) : (
                pendingHardware.map((req) => (
                  <div key={req.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-emerald-700 font-bold">#{req.assetId}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{req.durationDays} Days</span>
                    </div>

                    <div className="font-bold text-slate-900">{req.assetName}</div>
                    <div className="text-slate-600">
                      Requested by: <span className="text-slate-900 font-semibold">{req.studentName}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Project: <span className="text-slate-800 font-medium">{req.project}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 italic">"{req.purpose}"</div>

                    <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                      <button
                        onClick={() => approveHardwareRequest(req.id)}
                        className="flex-1 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px] shadow-xs transition"
                      >
                        Approve Issue
                      </button>
                      <button
                        onClick={() => rejectHardwareRequest(req.id)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] transition"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Dynamic Workshop Attendance QR Generator */}
          <div className="p-6 rounded-3xl glass-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">Dynamic QR Attendance</h3>
              </div>
              <span className="text-[10px] text-emerald-700 font-mono font-bold">Auto-Rotating</span>
            </div>

            <p className="text-xs text-slate-500 leading-tight">
              Short-lived signed tokens prevent student screenshot sharing during workshops.
            </p>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
              <div className="text-xs text-slate-900 font-bold">{events[0].title}</div>

              <div className="p-3 bg-white rounded-2xl mx-auto w-fit shadow-xs border border-slate-200">
                <div className="w-28 h-28 border-4 border-slate-900 flex flex-col items-center justify-center text-slate-900 font-mono text-center p-1 rounded-xl">
                  <div className="text-[8px] font-bold">WORKSHOP QR</div>
                  <div className="text-xs font-black my-0.5">{events[0].attendanceToken}</div>
                  <div className="text-[7px] text-slate-500">Expires in 60s</div>
                </div>
              </div>

              <button
                onClick={() => rotateAttendanceToken(events[0].id)}
                className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold transition shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                <span>Rotate Dynamic Token Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
