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
        return "bg-emerald-950/40 border-iot-emerald text-emerald-300 shadow-emerald-950/30";
      case "IN_PROGRESS":
        return "bg-cyan-950/40 border-iot-cyan text-cyan-300 shadow-cyan-950/30 ring-1 ring-iot-cyan";
      case "AVAILABLE":
        return "bg-violet-950/30 border-violet-500/60 text-violet-300 hover:border-violet-400";
      case "LOCKED":
        return "bg-slate-900/40 border-slate-800 text-slate-500 opacity-70";
    }
  };

  const getStatusBadge = (status: SkillNode["status"]) => {
    switch (status) {
      case "COMPLETED":
        return <span className="px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-400 text-[10px] font-mono">Completed</span>;
      case "IN_PROGRESS":
        return <span className="px-2 py-0.5 rounded bg-cyan-900/60 text-cyan-400 text-[10px] font-mono animate-pulse">In Progress</span>;
      case "AVAILABLE":
        return <span className="px-2 py-0.5 rounded bg-violet-900/60 text-violet-400 text-[10px] font-mono">Available</span>;
      case "LOCKED":
        return <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-500 text-[10px] font-mono flex items-center gap-1"><Lock className="w-2.5 h-2.5" /> Locked</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-dark-border pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-iot-cyan mb-1">
            <span>SKILL PREREQUISITE GRAPH</span>
            <span>•</span>
            <span className="text-emerald-400">LEVEL 4 BUILDER MAP</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Visual Technical Skill Tree</h1>
          <p className="text-xs text-slate-400 mt-1">
            Interactive progression dependency graph. Advanced modules remain locked until prerequisites are verified.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-iot-emerald" /> Completed
            </span>
            <span className="flex items-center gap-1 text-cyan-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-iot-cyan" /> Active
            </span>
            <span className="flex items-center gap-1 text-slate-500 font-mono">
              <span className="w-2 h-2 rounded-full bg-slate-600" /> Locked
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Visual Graph Canvas (2 Columns) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-dark-card border border-dark-border relative min-h-[500px] flex flex-col justify-between">
          <div className="space-y-6">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>Skill Hierarchy Pipeline (Foundations → Protocols → RTOS → Edge AI)</span>
              <span className="font-mono text-[11px] text-slate-500">Click node to inspect prerequisites</span>
            </div>

            {/* Tree Flow Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {skills.map((node) => {
                const isSelected = node.id === selectedNodeId;
                return (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`p-4 rounded-xl border text-left transition relative flex flex-col justify-between ${getStatusColor(
                      node.status
                    )} ${isSelected ? "ring-2 ring-white scale-[1.02]" : "hover:scale-[1.01]"}`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                          {node.category}
                        </span>
                        {getStatusBadge(node.status)}
                      </div>
                      <h4 className="font-bold text-sm text-white mb-1 leading-tight">{node.name}</h4>
                      <p className="text-[11px] text-slate-300 line-clamp-2 leading-tight">{node.description}</p>
                    </div>

                    <div className="mt-4 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-amber-400 font-semibold">+{node.xpReward} XP</span>
                      <span className="text-slate-400">
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

          <div className="mt-6 pt-4 border-t border-dark-border text-xs text-slate-500 font-mono flex items-center justify-between">
            <span>Verified Mastery: 5 Nodes Unlocked</span>
            <span>Current Target: Edge AI & Computer Vision</span>
          </div>
        </div>

        {/* Node Detail Inspector Drawer */}
        <div className="p-6 rounded-2xl bg-dark-card border border-dark-border space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-dark-border">
            <div>
              <span className="text-[10px] font-mono text-iot-cyan uppercase">NODE INSPECTOR</span>
              <h3 className="text-lg font-bold text-white mt-0.5">{selectedNode.name}</h3>
            </div>
            {getStatusBadge(selectedNode.status)}
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <span className="text-slate-400 font-medium block mb-1">Domain Description:</span>
              <p className="text-slate-200 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                {selectedNode.description}
              </p>
            </div>

            <div>
              <span className="text-slate-400 font-medium block mb-1">Prerequisites Checklist:</span>
              {selectedNode.prerequisites.length === 0 ? (
                <div className="text-emerald-400 font-mono text-[11px] p-2.5 rounded bg-emerald-950/20 border border-emerald-900/40">
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
                        className={`p-2.5 rounded-lg border text-xs flex items-center justify-between font-mono ${
                          isMet
                            ? "bg-emerald-950/20 border-emerald-800/40 text-emerald-300"
                            : "bg-red-950/20 border-red-800/40 text-red-300"
                        }`}
                      >
                        <span className="font-semibold">{prereqNode?.name || pId}</span>
                        <span>{isMet ? "✓ MET" : "✕ LOCKED"}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-500 font-mono">REWARD UPON VERIFICATION</div>
              <div className="text-sm font-bold text-amber-400 font-mono">+{selectedNode.xpReward} XP</div>
              <div className="text-[11px] text-slate-400">Awarded automatically upon rubric evaluation pass.</div>
            </div>

            <div className="pt-4">
              <Link
                href="/learn"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-iot-cyan hover:bg-cyan-400 text-slate-950 font-bold text-xs transition"
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
