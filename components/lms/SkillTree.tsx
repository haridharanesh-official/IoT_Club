"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useIoTApp } from "@/lib/store";
import { SkillNode } from "@/lib/types";
import {
  CheckCircle2,
  Lock,
  Sparkles,
  Zap,
  ArrowRight,
  Info,
  ChevronRight,
  Layers,
  Cpu,
  Radio,
  Eye,
  Activity,
  Terminal,
  Cloud,
} from "lucide-react";

export const SkillTree: React.FC = () => {
  const { skills, student } = useIoTApp();
  const [selectedNodeId, setSelectedNodeId] = useState<string>("sk-06"); // FreeRTOS default

  const selectedNode = skills.find((s) => s.id === selectedNodeId) || skills[0];

  const getStatusColor = (status: SkillNode["status"]) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-50/80 border-emerald-300 text-emerald-900 shadow-xs";
      case "IN_PROGRESS":
        return "bg-teal-50/90 border-teal-400 text-teal-900 shadow-xs ring-1 ring-teal-400";
      case "AVAILABLE":
        return "bg-indigo-50/80 border-indigo-200 text-indigo-900 hover:border-indigo-300 shadow-xs";
      case "LOCKED":
        return "bg-slate-50 border-slate-200 text-slate-400 opacity-75";
    }
  };

  const getStatusBadge = (status: SkillNode["status"]) => {
    switch (status) {
      case "COMPLETED":
        return <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">Completed</span>;
      case "IN_PROGRESS":
        return <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-mono font-bold animate-pulse">In Progress</span>;
      case "AVAILABLE":
        return <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-mono font-bold">Available</span>;
      case "LOCKED":
        return <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-mono flex items-center gap-1"><Lock className="w-2.5 h-2.5" /> Locked</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 font-bold mb-1">
            <span>SKILL PREREQUISITE GRAPH</span>
            <span>•</span>
            <span className="text-emerald-600">LEVEL 4 BUILDER MAP</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Visual Technical Skill Tree</h1>
          <p className="text-xs text-slate-500 mt-1">
            Interactive progression dependency graph. Advanced modules remain locked until prerequisites are verified.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 text-emerald-700 font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Completed
            </span>
            <span className="flex items-center gap-1 text-teal-700 font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-teal-500" /> Active
            </span>
            <span className="flex items-center gap-1 text-slate-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-slate-300" /> Locked
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Visual Graph Canvas */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl glass-card relative min-h-[500px] flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <div className="text-xs text-slate-500 flex items-center justify-between">
              <span>Skill Hierarchy Pipeline (Foundations → Protocols → RTOS → Edge AI)</span>
              <span className="font-mono text-[11px] text-slate-400">Click node to inspect prerequisites</span>
            </div>

            {/* Tree Flow Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {skills.map((node) => {
                const isSelected = node.id === selectedNodeId;
                return (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`p-4 rounded-2xl border text-left transition relative flex flex-col justify-between ${getStatusColor(
                      node.status
                    )} ${isSelected ? "ring-2 ring-emerald-600 scale-[1.02]" : "hover:scale-[1.01]"}`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                          {node.category}
                        </span>
                        {getStatusBadge(node.status)}
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 mb-1 leading-tight">{node.name}</h4>
                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-tight">{node.description}</p>
                    </div>

                    <div className="mt-4 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-amber-700 font-bold">+{node.xpReward} XP</span>
                      <span className="text-slate-500">
                        {node.prerequisites.length === 0
                          ? "Foundational"
                          : `${node.prerequisites.length} Prereqs`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 text-xs text-slate-500 font-mono flex items-center justify-between">
            <span>Verified Mastery: 5 Nodes Unlocked</span>
            <span className="text-emerald-700 font-bold">Target: Edge AI & Computer Vision</span>
          </div>
        </div>

        {/* Node Detail Inspector Drawer */}
        <div className="p-6 rounded-3xl glass-card space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase">NODE INSPECTOR</span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">{selectedNode.name}</h3>
            </div>
            {getStatusBadge(selectedNode.status)}
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <span className="text-slate-500 font-bold block mb-1">Domain Description:</span>
              <p className="text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                {selectedNode.description}
              </p>
            </div>

            <div>
              <span className="text-slate-500 font-bold block mb-1">Prerequisites Checklist:</span>
              {selectedNode.prerequisites.length === 0 ? (
                <div className="text-emerald-800 font-mono text-[11px] p-3 rounded-2xl bg-emerald-50 border border-emerald-200 font-bold">
                  ✓ None (Foundational Skill)
                </div>
              ) : (
                <div className="space-y-1.5">
                  {selectedNode.prerequisites.map((pId) => {
                    const prereqNode = skills.find((s) => s.id === pId);
                    const isMet = prereqNode?.status === "COMPLETED";
                    return (
                      <div
                        key={pId}
                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between font-mono ${
                          isMet
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                            : "bg-rose-50 border-rose-200 text-rose-700"
                        }`}
                      >
                        <span className="font-semibold">{prereqNode?.name || pId}</span>
                        <span className="font-bold">{isMet ? "✓ MET" : "✕ LOCKED"}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-[10px] text-slate-500 font-mono">REWARD UPON VERIFICATION</div>
              <div className="text-sm font-bold text-amber-700 font-mono">+{selectedNode.xpReward} XP</div>
              <div className="text-[11px] text-slate-500">Awarded automatically upon rubric evaluation pass.</div>
            </div>

            <div className="pt-4">
              <Link
                href="/learn"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition shadow-xs"
              >
                <span>Launch Related Curriculum Module</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
