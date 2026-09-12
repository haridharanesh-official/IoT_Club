"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useIoTApp } from "@/lib/store";
import { Project, ProjectTask, ProjectLifecycle } from "@/lib/types";
import {
  FolderGit2,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  Layers,
  Cpu,
  Sparkles,
  ExternalLink,
  Kanban,
  FileText,
  Boxes,
} from "lucide-react";
import { GithubIcon } from "@/components/icons/SocialIcons";

export const ProjectHub: React.FC = () => {
  const { projects, addProjectTask, updateTaskStatus, student } = useIoTApp();

  const [selectedProjectId, setSelectedProjectId] = useState<string>("prj-001"); // CareGrid
  const [activeTab, setActiveTab] = useState<"overview" | "architecture" | "team" | "tasks" | "hardware">("overview");

  // New Task Form Modal
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskAssignee, setTaskAssignee] = useState(student.name);
  const [taskPriority, setTaskPriority] = useState<ProjectTask["priority"]>("MEDIUM");
  const [taskDueDate, setTaskDueDate] = useState("2026-09-25");

  const activeProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    addProjectTask(activeProject.id, {
      title: taskTitle.trim(),
      description: taskDesc.trim(),
      assignee: taskAssignee,
      priority: taskPriority,
      status: "TODO",
      dueDate: taskDueDate,
    });

    setTaskTitle("");
    setTaskDesc("");
    setIsTaskModalOpen(false);
  };

  const lifecycles: ProjectLifecycle[] = [
    "IDEA",
    "PROPOSAL",
    "REVIEW",
    "APPROVED",
    "RESEARCH",
    "PROTOTYPE",
    "DEVELOPMENT",
    "TESTING",
    "DEPLOYMENT",
    "COMPLETED",
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-dark-border pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-iot-cyan mb-1">
            <span>PROJECT REPOSITORY & WORKSPACE</span>
            <span>•</span>
            <span className="text-emerald-400">17 CLUB PROJECTS ACTIVE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Hardware Projects Hub</h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete lifecycle tracking preventing valuable university engineering projects from disappearing after graduation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/projects/teams"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-iot-violet/20 hover:bg-violet-900/40 text-violet-300 border border-violet-700/50 text-xs font-semibold transition"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Team Formation Board</span>
          </Link>
          <Link
            href="/challenges"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <span>Monthly Challenges</span>
          </Link>
        </div>
      </div>

      {/* Project Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {projects.map((proj) => {
          const isSelected = proj.id === selectedProjectId;
          return (
            <button
              key={proj.id}
              onClick={() => setSelectedProjectId(proj.id)}
              className={`p-5 rounded-2xl border text-left transition flex flex-col justify-between ${
                isSelected
                  ? "bg-slate-800/90 border-iot-cyan ring-1 ring-iot-cyan text-white shadow-xl"
                  : "bg-dark-card border-dark-border text-slate-400 hover:border-slate-700"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 border border-slate-700 text-iot-cyan">
                    {proj.category}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">{proj.progressPercent}%</span>
                </div>
                <h3 className="font-bold text-base text-white">{proj.title}</h3>
                <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">{proj.tagline}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
                <span>Lead: {proj.leadName}</span>
                <span className="font-mono text-white">{proj.members.length} Members</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Detailed Workspace for Selected Project (Section 18) */}
      <div className="p-6 sm:p-8 rounded-2xl bg-dark-card border border-dark-border space-y-6">
        {/* Project Header & Lifecycle */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-dark-border">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-extrabold text-white">{activeProject.title}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-iot-emerald/20 text-emerald-400 border border-iot-emerald/40 text-xs font-mono">
                {activeProject.lifecycle}
              </span>
            </div>
            <p className="text-xs text-iot-cyan font-medium mt-1">{activeProject.tagline}</p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={activeProject.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition"
            >
              <GithubIcon className="w-4 h-4" />
              <span>Repository</span>
            </a>
            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-iot-cyan hover:bg-cyan-400 text-slate-950 font-bold text-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Sprint Task</span>
            </button>
          </div>
        </div>

        {/* Lifecycle Stepper Strip */}
        <div className="overflow-x-auto pb-2">
          <div className="flex items-center gap-1 min-w-[700px]">
            {lifecycles.map((lc, idx) => {
              const isPastOrCurrent =
                lifecycles.indexOf(activeProject.lifecycle) >= idx;
              const isCurrent = activeProject.lifecycle === lc;
              return (
                <div
                  key={lc}
                  className={`flex-1 p-2 rounded text-center text-[10px] font-mono border transition ${
                    isCurrent
                      ? "bg-iot-cyan text-slate-950 font-bold border-iot-cyan"
                      : isPastOrCurrent
                      ? "bg-slate-800 text-emerald-300 border-slate-700"
                      : "bg-slate-900/40 text-slate-600 border-slate-800"
                  }`}
                >
                  {lc}
                </div>
              );
            })}
          </div>
        </div>

        {/* Workspace Tabs (Section 18) */}
        <div className="flex items-center gap-2 border-b border-dark-border pb-2 text-xs">
          {[
            { key: "overview", label: "Overview & Problem", icon: <FileText className="w-3.5 h-3.5" /> },
            { key: "architecture", label: "System Architecture", icon: <Layers className="w-3.5 h-3.5" /> },
            { key: "tasks", label: `Sprint Tasks (${activeProject.tasks.length})`, icon: <Kanban className="w-3.5 h-3.5" /> },
            { key: "hardware", label: "Hardware BOM", icon: <Boxes className="w-3.5 h-3.5" /> },
            { key: "team", label: `Team (${activeProject.members.length})`, icon: <Users className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition ${
                activeTab === tab.key
                  ? "bg-slate-800 text-white border border-slate-700"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
            <div>
              <h3 className="font-semibold text-white text-sm mb-1">Problem Statement & Vision</h3>
              <p>{activeProject.description}</p>
            </div>
            <div className="pt-3 border-t border-dark-border">
              <h4 className="font-semibold text-white mb-2">Technologies & Toolchain</h4>
              <div className="flex flex-wrap gap-1.5">
                {activeProject.techStack.map((tech, i) => (
                  <span key={i} className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 font-mono text-iot-cyan text-[11px]">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Architecture */}
        {activeTab === "architecture" && (
          <div className="space-y-4 text-xs">
            <h3 className="font-semibold text-white text-sm">Hardware & Telemetry Architecture</h3>
            <p className="text-slate-300 leading-relaxed">{activeProject.architectureSummary}</p>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 space-y-2">
              <div className="text-iot-cyan font-bold">Data Flow Pipeline:</div>
              <div>ESP32-S3 Wearable (MAX30102 + DS18B20) ──[MQTT TLS 1.3]──► Mosquitto on RPi 5 ──► TimescaleDB ──► Web Dashboard</div>
              <div className="text-slate-500 pt-1">• Keep-Alive Interval: 10 seconds | QoS 1 Guaranteed Delivery</div>
            </div>
          </div>
        )}

        {/* Tab 3: Tasks (Section 19) */}
        {activeTab === "tasks" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white text-sm">Sprint Task Board</h3>
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="text-xs text-iot-cyan hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Task
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {activeProject.tasks.map((task) => {
                const isDone = task.status === "COMPLETED";
                return (
                  <div key={task.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded font-mono ${
                            task.priority === "HIGH" ? "bg-rose-950/60 text-rose-300 border border-rose-800" : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {task.priority}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{task.dueDate}</span>
                      </div>
                      <div className={`font-semibold text-white ${isDone ? "line-through text-slate-500" : ""}`}>{task.title}</div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-tight">{task.description}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">{task.assignee}</span>
                      <button
                        onClick={() =>
                          updateTaskStatus(
                            activeProject.id,
                            task.id,
                            isDone ? "TODO" : "COMPLETED"
                          )
                        }
                        className={`px-2 py-0.5 rounded font-mono text-[10px] transition ${
                          isDone ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                        }`}
                      >
                        {task.status}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: Hardware BOM */}
        {activeTab === "hardware" && (
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-sm">Allocated Lab Hardware Assets (BOM)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 text-slate-400 font-mono text-[11px] uppercase">
                  <tr>
                    <th className="p-3">Component / Module</th>
                    <th className="p-3">Qty</th>
                    <th className="p-3">Lab Status</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {activeProject.hardwareBOM.map((bom, i) => (
                    <tr key={i} className="hover:bg-slate-900/40">
                      <td className="p-3 font-semibold text-white">{bom.item}</td>
                      <td className="p-3 font-mono">{bom.quantity}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-emerald-950/40 text-emerald-400 border border-emerald-800">
                          {bom.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <Link href="/lab" className="text-iot-cyan hover:underline text-[11px]">
                          Inspect in Lab
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Team */}
        {activeTab === "team" && (
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-sm">Project Roster ({activeProject.members.length} Engineers)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {activeProject.members.map((member, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                  <div className="font-bold text-white">{member.name}</div>
                  <div className="text-iot-cyan text-[11px]">{member.role}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Task Creation Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreateTask} className="bg-dark-card border border-dark-border p-6 rounded-2xl max-w-md w-full space-y-4 text-xs">
            <h3 className="font-bold text-base text-white">Create Sprint Task</h3>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Task Title *</label>
              <input
                type="text"
                required
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="e.g. Implement FreeRTOS Queue for Sensors"
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Description</label>
              <textarea
                rows={2}
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                placeholder="Details of the implementation or circuit test..."
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Assignee</label>
                <input
                  type="text"
                  value={taskAssignee}
                  onChange={(e) => setTaskAssignee(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Priority</label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as any)}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white"
                >
                  <option>LOW</option>
                  <option>MEDIUM</option>
                  <option>HIGH</option>
                  <option>CRITICAL</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Due Date</label>
              <input
                type="date"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsTaskModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-iot-cyan hover:bg-cyan-400 text-slate-950 font-bold"
              >
                Save Task
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
