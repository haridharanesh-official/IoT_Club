"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useIoTApp } from "@/lib/store";
import { ApplicationStatus } from "@/lib/types";
import {
  ShieldAlert,
  Users,
  Kanban,
  FileText,
  Boxes,
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Sliders,
  ChevronRight,
} from "lucide-react";

export const AdminPortal: React.FC = () => {
  const {
    applications,
    updateApplicationStatus,
    hardwareAssets,
    auditLogs,
    projects,
  } = useIoTApp();

  const [activeTab, setActiveTab] = useState<"recruitment" | "audit" | "members">("recruitment");
  const [applicantFilter, setApplicantFilter] = useState<string>("ALL");

  const stages: { key: ApplicationStatus; label: string }[] = [
    { key: "SUBMITTED", label: "Submitted" },
    { key: "UNDER_REVIEW", label: "Under Review" },
    { key: "ASSESSMENT", label: "Assessment" },
    { key: "PRACTICAL_TASK", label: "Practical Task" },
    { key: "INTERVIEW", label: "Interview" },
    { key: "SELECTED", label: "Selected" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 font-bold mb-1">
            <span>GOVERNANCE & CLUB ADMINISTRATION</span>
            <span>•</span>
            <span className="text-emerald-600">ADMIN CONTROL CENTER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">IoT Club Administrator Console</h1>
          <p className="text-xs text-slate-500 mt-1">
            Recruitment pipeline Kanban, asset audit history, and role-based permissions management.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/lab"
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 shadow-xs transition"
          >
            Hardware Inventory (268) →
          </Link>
        </div>
      </div>

      {/* Admin Dashboard Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: "Total Members", val: "186", color: "text-slate-900" },
          { label: "Active Students", val: "142", color: "text-emerald-700" },
          { label: "Faculty Mentors", val: "12", color: "text-teal-700" },
          { label: "Active Projects", val: "17", color: "text-indigo-700" },
          { label: "Completed Projects", val: "43", color: "text-slate-900" },
          { label: "Hardware Assets", val: "268", color: "text-amber-700" },
          { label: "Currently Issued", val: "72", color: "text-amber-600" },
          { label: "GitHub Commits", val: "1,283", color: "text-emerald-600" },
        ].map((m, i) => (
          <div key={i} className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="text-[10px] text-slate-500 font-mono">{m.label}</div>
            <div className={`text-lg font-bold font-mono mt-1 ${m.color}`}>{m.val}</div>
          </div>
        ))}
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs overflow-x-auto">
        {[
          { key: "recruitment", label: `Recruitment Kanban (${applications.length})`, icon: <Kanban className="w-3.5 h-3.5" /> },
          { key: "audit", label: `Audit Logs (${auditLogs.length})`, icon: <FileText className="w-3.5 h-3.5" /> },
          { key: "members", label: "User & Role Directory", icon: <Users className="w-3.5 h-3.5" /> },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold transition shrink-0 ${
              activeTab === t.key
                ? "bg-emerald-500 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: RECRUITMENT KANBAN */}
      {activeTab === "recruitment" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">
              Candidate Pipeline (Advance Candidates)
            </h3>
            <span className="text-xs font-mono text-slate-500">
              Move candidate stage to trigger student status & audit log
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 overflow-x-auto pb-4">
            {stages.map((stage) => {
              const stageApps = applications.filter((a) => a.status === stage.key);
              return (
                <div
                  key={stage.key}
                  className="bg-white border border-slate-200/90 rounded-2xl p-3.5 min-w-[200px] flex flex-col space-y-3 shadow-xs"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                    <span className="font-bold text-slate-900 leading-tight">{stage.label}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 font-mono text-[10px] text-emerald-800 font-bold border border-emerald-200">
                      {stageApps.length}
                    </span>
                  </div>

                  <div className="space-y-2 flex-1">
                    {stageApps.length === 0 ? (
                      <div className="text-[11px] text-slate-400 text-center py-4 italic">No candidates</div>
                    ) : (
                      stageApps.map((app) => (
                        <div
                          key={app.id}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 hover:border-emerald-300 transition shadow-2xs"
                        >
                          <div className="font-bold text-slate-900 leading-tight">{app.fullName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {app.department} • {app.rollNumber}
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {app.interests.slice(0, 2).map((it, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[9px] text-slate-700 font-mono"
                              >
                                {it}
                              </span>
                            ))}
                          </div>

                          {/* Quick Stage Mover Selector */}
                          <div className="pt-2 border-t border-slate-200">
                            <label className="text-[9px] text-slate-500 font-mono block mb-0.5">Move Stage:</label>
                            <select
                              value={app.status}
                              onChange={(e) => updateApplicationStatus(app.id, e.target.value as any)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] text-emerald-800 font-mono font-bold focus:outline-none focus:border-emerald-500"
                            >
                              <option value="SUBMITTED">Submitted</option>
                              <option value="UNDER_REVIEW">Under Review</option>
                              <option value="ASSESSMENT">Assessment</option>
                              <option value="PRACTICAL_TASK">Practical Task</option>
                              <option value="INTERVIEW">Interview</option>
                              <option value="SELECTED">Selected</option>
                              <option value="WAITLISTED">Waitlisted</option>
                              <option value="REJECTED">Rejected</option>
                            </select>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT LOGGING */}
      {activeTab === "audit" && (
        <div className="p-6 rounded-3xl glass-card space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">System Audit Trail & Security Ledger</h3>
              <p className="text-xs text-slate-500">
                Immutable chronological log of all role changes, evaluation submissions, hardware issues, and candidate movements.
              </p>
            </div>
            <span className="text-[11px] font-mono text-emerald-700 font-bold">Signed Event Stream</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-mono text-[11px] uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Actor / User</th>
                  <th className="p-3.5">Action Type</th>
                  <th className="p-3.5">Entity</th>
                  <th className="p-3.5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80">
                    <td className="p-3.5 text-slate-500 text-[11px] whitespace-nowrap">{log.timestamp}</td>
                    <td className="p-3.5 text-slate-900 font-bold font-sans">{log.user}</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600 text-[11px]">{log.entity} #{log.entityId}</td>
                    <td className="p-3.5 text-slate-700 font-sans text-xs">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MEMBERS & ROLES */}
      {activeTab === "members" && (
        <div className="p-6 rounded-3xl glass-card space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm">Member Directory & Active Roles</h3>
            <span className="text-xs font-mono text-emerald-700 font-bold">Multi-Role RBAC Active</span>
          </div>

          <div className="space-y-3">
            {[
              { name: "Hari Dharanesh SP", roll: "22IOT042", roles: ["STUDENT", "PROJECT_LEAD"], level: "Level 4 (IoT Builder)", status: "ACTIVE" },
              { name: "Faculty Mentor", roll: "FAC001", roles: ["TEACHER", "FACULTY", "CLUB_ADMIN"], level: "Faculty Director", status: "ACTIVE" },
              { name: "Divya Balaji", roll: "23EC014", roles: ["STUDENT"], level: "Level 3 (Maker)", status: "ACTIVE" },
              { name: "Rahul Menon", roll: "22ME009", roles: ["STUDENT", "PROJECT_LEAD"], level: "Level 4 (IoT Builder)", status: "ACTIVE" },
            ].map((user, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">{user.name} ({user.roll})</div>
                  <div className="text-[11px] text-slate-500">{user.level}</div>
                </div>

                <div className="flex items-center gap-2">
                  {user.roles.map((r, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-full font-mono text-[10px] bg-white text-slate-700 border border-slate-200">
                      {r}
                    </span>
                  ))}
                  <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                    {user.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
