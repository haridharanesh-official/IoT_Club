"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useIoTApp } from "@/lib/store";
import {
  Project,
  ProjectTask,
  ProjectReviewRound,
  ProjectMember,
  ProjectResourceLink,
  ProjectSubmissionFile,
  ProjectLifecycle,
} from "@/lib/types";
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
  X,
  Lock,
  Unlock,
  GitBranch,
  GitCommit,
  GitPullRequest,
  ShieldCheck,
  RefreshCw,
  Download,
  Award,
  AlertCircle,
  Check,
  Sliders,
  FileCode,
  Activity,
  CheckSquare,
  Square,
  FileCheck,
  MessageSquare,
  Send,
  HelpCircle,
} from "lucide-react";
import { GithubIcon } from "@/components/icons/SocialIcons";

export const ProjectHub: React.FC = () => {
  const {
    projects,
    addNewProject,
    addProjectTask,
    updateTaskStatus,
    addOrUpdateProjectReview,
    toggleProjectLock,
    testGitHubRepo,
    student,
    demoRole,
  } = useIoTApp();

  const [selectedProjectId, setSelectedProjectId] = useState<string>("prj-001");
  const [activeTab, setActiveTab] = useState<
    "overview" | "reviews" | "github" | "bom" | "files"
  >("overview");

  // Active project
  const activeProject =
    projects.find((p) => p.id === selectedProjectId) || projects[0] || ({} as Project);

  // Modals state
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedReviewRound, setSelectedReviewRound] = useState<"R1" | "R2" | "FINAL">("R1");
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isTestingRepo, setIsTestingRepo] = useState(false);
  const [completedActionItems, setCompletedActionItems] = useState<{ [key: string]: boolean }>({});

  // New Project Form State
  const [newTitle, setNewTitle] = useState("");
  const [newTheme, setNewTheme] = useState("MEDTECH / BIOTECH / HEALTHTECH");
  const [newTagline, setNewTagline] = useState("");
  const [newBrief, setNewBrief] = useState("");
  const [newAiDisclosure, setNewAiDisclosure] = useState("");
  const [newGithubUrl, setNewGithubUrl] = useState("");
  const [newCategory, setNewCategory] = useState<Project["category"]>("HealthTech");
  const [newLeadName, setNewLeadName] = useState(student.name);
  const [newTechStack, setNewTechStack] = useState("ESP32-S3, FreeRTOS, MQTT, Edge-AI, Python");

  // Teacher Review Form State
  const [reviewStatus, setReviewStatus] = useState<ProjectReviewRound["status"]>("APPROVED");
  const [reviewerName, setReviewerName] = useState("Dr. K. Swaminathan (Faculty Evaluator)");
  const [reviewerRole, setReviewerRole] = useState<ProjectReviewRound["reviewerRole"]>("TEACHER");
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [rubricScores, setRubricScores] = useState<{ [key: string]: number }>({
    "Problem Statement & Clinical Need": 9,
    "Hardware BOM & Circuit Feasibility": 9,
    "Git Workflow & Commit Attribution": 10,
    "System Architecture & Resiliency": 9,
  });
  const [actionItemInput, setActionItemInput] = useState("");
  const [actionItemsList, setActionItemsList] = useState<string[]>([
    "Add 100uF decoupling capacitor to ESP32 3.3V rail to prevent brownouts",
    "Commit FreeRTOS queue stress test benchmark log to GitHub repository",
  ]);

  // Task Form State
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskAssignee, setTaskAssignee] = useState(student.name);
  const [taskPriority, setTaskPriority] = useState<ProjectTask["priority"]>("MEDIUM");
  const [taskDueDate, setTaskDueDate] = useState("2026-09-25");

  // Handle Testing Repo Click
  const handleTestRepo = () => {
    setIsTestingRepo(true);
    setTimeout(() => {
      testGitHubRepo(activeProject.id);
      setIsTestingRepo(false);
    }, 1200);
  };

  // Handle New Project Submission
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created = addNewProject({
      title: newTitle.trim(),
      tagline: newTagline.trim() || `${newTitle} hardware initiative`,
      theme: newTheme.trim(),
      brief: newBrief.trim() || "Project brief and technical abstract.",
      description: newBrief.trim() || "Project overview and hardware implementation details.",
      aiToolDisclosure: newAiDisclosure.trim() || "No AI tools disclosed.",
      category: newCategory,
      lifecycle: "REVIEW",
      leadName: newLeadName.trim() || student.name,
      leadId: student.id,
      facultyMentor: "Faculty Mentor",
      progressPercent: 35,
      githubUrl: newGithubUrl.trim() || "https://github.com/iot-club-org/new-project",
      techStack: newTechStack.split(",").map((s) => s.trim()).filter(Boolean),
      architectureSummary: "Hardware endpoints connected via MQTT to central gateway broker.",
      featured: false,
      isLocked: false,
      defaultBranch: "main",
      totalCommits: 12,
      openIssues: 0,
      sourceAuditStatus: "Verified ✓",
      members: [
        {
          name: newLeadName.trim() || student.name,
          role: "Project Lead & Firmware Engineer",
          email: student.collegeEmail || "lead@siet.ac.in",
          githubHandle: student.username || "lead-dev",
          commits: 12,
          isLead: true,
        },
      ],
      hardwareBOM: [
        { item: "ESP32-S3 Dev Module", quantity: 1, status: "ISSUED" },
        { item: "Sensor Interface Board", quantity: 1, status: "ALLOCATED" },
      ],
      tasks: [],
    });

    setSelectedProjectId(created.id);
    setIsNewProjectModalOpen(false);
    setNewTitle("");
    setNewTagline("");
    setNewBrief("");
    setNewAiDisclosure("");
    setNewGithubUrl("");
  };

  // Handle Teacher Review Submission
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();

    const rubricArray = Object.entries(rubricScores).map(([criterion, score]) => ({
      criterion,
      score,
      maxScore: 10,
    }));

    const totalScore = rubricArray.reduce((sum, item) => sum + item.score, 0);
    const maxScore = rubricArray.length * 10;
    const normalizedScore = Number(((totalScore / maxScore) * 10).toFixed(1));

    const roundTitle =
      selectedReviewRound === "R1"
        ? "R1 First Review (Round 1) Evaluation"
        : selectedReviewRound === "R2"
        ? "R2 Mid-Stage / Prototype Evaluation"
        : "Final Evaluations";

    addOrUpdateProjectReview(activeProject.id, {
      id: `rev-${selectedReviewRound.toLowerCase()}-${Date.now()}`,
      roundKey: selectedReviewRound,
      roundTitle,
      status: reviewStatus,
      score: normalizedScore,
      maxScore: 10,
      reviewerName,
      reviewerRole,
      evaluatedAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      feedback:
        reviewFeedback.trim() ||
        (reviewStatus === "APPROVED"
          ? "Outstanding execution of edge hardware telemetry and clean GitHub attribution. Ready to advance."
          : "Work required on power decoupling and sensor calibration logs."),
      actionItems: actionItemsList,
      rubricScores: rubricArray,
    });

    setIsReviewModalOpen(false);
  };

  // Handle Create Task
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

  // Find reviews
  const r1Review = activeProject.reviews?.find((r) => r.roundKey === "R1");
  const r2Review = activeProject.reviews?.find((r) => r.roundKey === "R2");
  const finalReview = activeProject.reviews?.find((r) => r.roundKey === "FINAL");

  // Toggle action item
  const toggleActionItem = (item: string) => {
    setCompletedActionItems((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      {/* 1. Header & Project Action Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 font-bold mb-1">
            <span>IoT CLUB PROJECT WORKSPACE & REVIEW HUB</span>
            <span>•</span>
            <span className="text-emerald-600">{projects.length} ACTIVE PROJECTS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Engineering Projects Hub</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Explore how club projects are engineered, monitor Git contribution attribution, and conduct multi-round faculty reviews to turn student prototypes into production-grade IoT deployments.
          </p>
        </div>

        {/* Action Controls: Submit Project + Quick Nav */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsNewProjectModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Submit Project</span>
          </button>

          <Link
            href="/projects/teams"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs transition"
          >
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span>Project Teams</span>
          </Link>

          <Link
            href="/challenges"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs transition"
          >
            <span>Challenges</span>
          </Link>
        </div>
      </div>

      {/* 2. Project Selector Cards Row */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600 px-1">
          <span>Select Project to View Workspace:</span>
          <span className="font-mono text-emerald-700">{projects.length} Projects in Portal</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((proj) => {
            const isSelected = proj.id === selectedProjectId;
            return (
              <button
                key={proj.id}
                onClick={() => setSelectedProjectId(proj.id)}
                className={`p-5 rounded-3xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? "bg-white border-emerald-500 ring-2 ring-emerald-500/30 shadow-md"
                    : "bg-white/80 border-slate-200/80 text-slate-600 hover:border-emerald-300 hover:bg-white shadow-xs"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
                      {proj.category}
                    </span>
                    <span className="text-[11px] font-mono text-emerald-700 font-bold">
                      {proj.progressPercent}% Completed
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900">{proj.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">{proj.tagline}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Lead: {proj.leadName}</span>
                  <span className="font-mono text-slate-800 font-bold">
                    {proj.members?.length || 1} Members
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Detailed Workspace for Selected Project */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6">
        {/* Project Header Banner */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-black text-slate-900">{activeProject.title}</h2>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-bold">
                {activeProject.lifecycle}
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                {activeProject.category}
              </span>
            </div>
            <p className="text-xs text-emerald-700 font-medium mt-1">{activeProject.tagline}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href={activeProject.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition"
            >
              <GithubIcon className="w-4 h-4" />
              <span>Master Repository</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            <button
              onClick={() => {
                setSelectedReviewRound("R1");
                setIsReviewModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs transition shadow-xs cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-600" />
              <span>Evaluate Project</span>
            </button>

            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Sprint Task</span>
            </button>
          </div>
        </div>

        {/* Project Lifecycle Stepper */}
        <div className="overflow-x-auto pb-2">
          <div className="flex items-center gap-1 min-w-[700px]">
            {lifecycles.map((lc, idx) => {
              const isPastOrCurrent =
                lifecycles.indexOf(activeProject.lifecycle) >= idx;
              const isCurrent = activeProject.lifecycle === lc;
              return (
                <div
                  key={lc}
                  className={`flex-1 p-2 rounded-xl text-center text-[10px] font-mono border transition ${
                    isCurrent
                      ? "bg-emerald-500 text-white font-bold border-emerald-500 shadow-xs"
                      : isPastOrCurrent
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200 font-medium"
                      : "bg-slate-50 text-slate-400 border-slate-200"
                  }`}
                >
                  {lc}
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs overflow-x-auto">
          {[
            {
              key: "overview",
              label: "Overview & How It's Made",
              icon: <FileText className="w-3.5 h-3.5" />,
            },
            {
              key: "reviews",
              label: `Evaluations & Reviews (${activeProject.reviews?.length || 3})`,
              icon: <Award className="w-3.5 h-3.5" />,
            },
            {
              key: "github",
              label: `GitHub & Code Insights (${activeProject.totalCommits || 54} Commits)`,
              icon: <FolderGit2 className="w-3.5 h-3.5" />,
            },
            {
              key: "bom",
              label: `Hardware BOM & Tasks (${activeProject.hardwareBOM?.length || 0})`,
              icon: <Boxes className="w-3.5 h-3.5" />,
            },
            {
              key: "files",
              label: `Submission Documents & Links`,
              icon: <FileCheck className="w-3.5 h-3.5" />,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold transition shrink-0 cursor-pointer ${
                activeTab === tab.key
                  ? "bg-emerald-500 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: OVERVIEW & HOW IT WAS MADE */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-xs">
              {/* Problem Statement / Theme */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                  Problem Statement / Domain Theme
                </label>
                <div className="w-full bg-[#f8fafc] border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 tracking-wide">
                  {activeProject.theme || activeProject.category?.toUpperCase() || "MEDTECH / BIOTECH / HEALTHTECH"}
                </div>
              </div>

              {/* Project Brief / Abstract */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                  Project Brief & Technical Abstract
                </label>
                <div className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-xs text-slate-700 leading-relaxed min-h-[90px]">
                  {activeProject.brief || activeProject.description}
                </div>
              </div>

              {/* AI Tool Disclosure */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                  AI Tool & Copilot Disclosure
                </label>
                <div className="w-full bg-white border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-600">
                  {activeProject.aiToolDisclosure ||
                    "List any AI tools used (GitHub Copilot, ChatGPT, Claude, etc.)..."}
                </div>
              </div>

              {/* Lock Status Pill + Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>
                    {activeProject.isLocked !== false
                      ? "Project details are locked for evaluation"
                      : "Project details are unlocked for editing"}
                  </span>
                </div>

                <button
                  onClick={() => toggleProjectLock(activeProject.id)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  {activeProject.isLocked !== false ? (
                    <>
                      <Unlock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Unlock to Edit Details</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Lock Submission</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* How They Made It: Technical Architecture */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-emerald-600" />
                    <span>How It Was Made: Hardware & Embedded Telemetry Pipeline</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Sensor acquisition topology, FreeRTOS queue scheduling, and edge inference architecture.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 font-bold">
                  <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                  <span>Telemetry Active</span>
                </div>
              </div>

              {/* Data pipeline flow diagram */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white font-mono text-xs space-y-2 overflow-x-auto">
                <div className="text-emerald-400 font-bold text-[11px]">
                  Embedded Signal Flow (Offline-First Resilient Architecture):
                </div>
                <div className="text-slate-300 min-w-[650px] leading-relaxed">
                  [Sensors & Transducers] ──I2C/SPI──► [ESP32-S3 FreeRTOS Tasks]
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──TLS 1.3 MQTT──► [RPi 5 Broker & TimescaleDB]
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──WebSocket──► [Real-Time Monitoring UI]
                </div>
              </div>

              {/* Technologies / Toolchain */}
              <div>
                <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider font-mono mb-2">
                  Integrated Technologies & Toolchain
                </h4>
                <div className="flex flex-wrap gap-2">
                  {activeProject.techStack?.map((tech, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 font-mono text-emerald-800 text-[11px] font-semibold"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: FACULTY & MEMBER REVIEWS (Multi-Round Evaluation) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "reviews" && (
          <div className="space-y-6">
            {/* Header with Evaluate Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>Multi-Round Evaluation & Mentorship Reviews</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Multi-stage rubric scoring across concept validation, prototype testing, and final demo day sign-off.
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedReviewRound("R1");
                  setIsReviewModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-xs transition cursor-pointer self-start sm:self-auto"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Submit Faculty Evaluation</span>
              </button>
            </div>

            {/* Review Cards */}
            <div className="space-y-4">
              {/* Round 1 Card */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-md bg-blue-100 text-blue-800 font-black text-xs font-mono">
                      R1
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">
                        First Review (Round 1) Evaluation
                      </h4>
                      <span className="text-[11px] text-slate-500">
                        Concept validation, theme relevance, circuit feasibility & Git setup.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${
                        r1Review?.status === "APPROVED"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : r1Review?.status === "REVISIONS_REQUESTED"
                          ? "bg-rose-50 text-rose-800 border border-rose-200"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {r1Review?.status === "APPROVED"
                        ? `Approved • ${r1Review.score || 9.2}/10`
                        : r1Review?.status === "REVISIONS_REQUESTED"
                        ? "Revisions Requested"
                        : "Pending Review"}
                    </span>

                    <button
                      onClick={() => {
                        setSelectedReviewRound("R1");
                        setIsReviewModalOpen(true);
                      }}
                      className="text-xs text-emerald-700 hover:underline font-bold px-2 py-1"
                    >
                      Edit Review
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {r1Review?.feedback ||
                    "First Review has not been conducted yet. Feedback and action items will be updated here live once evaluated."}
                </p>

                {/* If evaluated, show rubric & action items */}
                {r1Review && r1Review.status !== "PENDING" && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>
                        Evaluator: <strong className="text-slate-800">{r1Review.reviewerName}</strong>
                      </span>
                      <span>Evaluated: {r1Review.evaluatedAt || "2026-09-14"}</span>
                    </div>

                    {r1Review.rubricScores && r1Review.rubricScores.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {r1Review.rubricScores.map((rubric, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-center justify-between"
                          >
                            <span className="text-slate-600 font-medium text-[11px]">
                              {rubric.criterion}
                            </span>
                            <span className="font-mono font-bold text-emerald-700 text-xs">
                              {rubric.score}/{rubric.maxScore}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {r1Review.actionItems && r1Review.actionItems.length > 0 && (
                      <div className="pt-2 space-y-1.5">
                        <span className="text-xs font-bold text-slate-800 block">
                          Student Action Checklist (Click to toggle complete):
                        </span>
                        {r1Review.actionItems.map((item, idx) => {
                          const isDone = !!completedActionItems[item];
                          return (
                            <div
                              key={idx}
                              onClick={() => toggleActionItem(item)}
                              className={`flex items-start gap-2 p-2.5 rounded-xl text-xs cursor-pointer transition ${
                                isDone
                                  ? "bg-emerald-50 text-emerald-800 line-through"
                                  : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                              }`}
                            >
                              {isDone ? (
                                <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                              )}
                              <span>{item}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Round 2 Card */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 space-y-3 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-md bg-purple-100 text-purple-800 font-black text-xs font-mono">
                      R2
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">
                        Mid-Stage Prototype & Telemetry Verification
                      </h4>
                      <span className="text-[11px] text-slate-500">
                        Firmware benchmarks, hardware bench test & sensor latency.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-700">
                      {r2Review?.status || "Pending R1 Sign-off"}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedReviewRound("R2");
                        setIsReviewModalOpen(true);
                      }}
                      className="text-xs text-emerald-700 hover:underline font-bold px-2 py-1"
                    >
                      Conduct R2
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600">
                  {r2Review?.feedback ||
                    "Mid-stage prototype demonstration scheduled following Round 1 sign-off."}
                </p>
              </div>

              {/* Final Evaluation Card */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 space-y-3 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-black text-xs font-mono">
                      FINAL
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">
                        Final Demo Day & Production Audit
                      </h4>
                      <span className="text-[11px] text-slate-500">
                        Physical hardware demo, documentation integrity, and club showcase certification.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-700">
                      {finalReview?.status || "Pending Demo Day"}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedReviewRound("FINAL");
                        setIsReviewModalOpen(true);
                      }}
                      className="text-xs text-emerald-700 hover:underline font-bold px-2 py-1"
                    >
                      Conduct Final
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600">
                  {finalReview?.feedback ||
                    "Final evaluation rubric opens during Demo Day judging and project exhibitions."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: GITHUB & CODE INSIGHTS */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "github" && (
          <div className="space-y-6">
            {/* Version Control Intelligence Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-sm shrink-0 shadow-xs">
                    &gt;_
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      GitHub & Version Control Intelligence
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Live repository telemetry, commit verification, and individual contribution attribution.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Repository Active & Linked</span>
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-slate-100 text-slate-700 border border-slate-200">
                    Team: {activeProject.members?.length || 6} Members
                  </span>
                </div>
              </div>

              {/* Official Team GitHub Repository URL */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-700 tracking-wider flex items-center gap-1.5 font-mono text-[11px]">
                    <GithubIcon className="w-3.5 h-3.5 text-slate-600" />
                    <span>OFFICIAL REPOSITORY URL</span>
                  </span>
                  <span className="text-emerald-700 text-[11px] font-mono flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>
                      Connected • ({activeProject.totalCommits || 54} Commits •{" "}
                      {activeProject.defaultBranch || "main"})
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
                  <input
                    type="text"
                    readOnly
                    value={activeProject.githubUrl}
                    className="w-full bg-transparent text-slate-800 text-xs font-mono focus:outline-none"
                  />
                  <a
                    href={activeProject.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 text-slate-500 hover:text-slate-900 transition"
                    title="Open on GitHub"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Member GitHub Handles Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
                    Member GitHub Handles & Attribution
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Tagging usernames attributes individual commit counts
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {activeProject.members?.map((member: ProjectMember, idx: number) => (
                    <div
                      key={idx}
                      className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-3 hover:border-emerald-300 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 text-xs">
                                {member.name}
                              </span>
                              {member.isLead && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200 text-[9px] font-bold">
                                  Lead
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 block">
                              {member.email || "member@siet.ac.in"}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            member.commits && member.commits > 0
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {member.commits && member.commits > 0
                            ? `${member.commits} commits`
                            : "Not Linked"}
                        </span>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 flex items-center gap-1.5">
                        <span className="text-slate-400">@</span>
                        <span>{member.githubHandle || "github-username"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Test Repository Action Button */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleTestRepo}
                  disabled={isTestingRepo}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isTestingRepo ? "animate-spin text-emerald-400" : ""}`}
                  />
                  <span>{isTestingRepo ? "Auditing Repository..." : "Sync & Audit Repository"}</span>
                </button>
              </div>
            </div>

            {/* 4 Metric Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-slate-600 font-bold">
                    TOTAL COMMITS
                  </span>
                  <GitCommit className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <div className="text-3xl font-black text-slate-900">
                    {activeProject.totalCommits || 54}
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600 mt-1">
                    <span>Branch: {activeProject.defaultBranch || "main"}</span>
                    <a
                      href={activeProject.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-700 hover:underline font-semibold"
                    >
                      View &gt;
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-slate-600 font-bold">
                    DEFAULT BRANCH
                  </span>
                  <GitBranch className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">
                    {activeProject.defaultBranch || "main"}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {activeProject.openIssues || 0} open issues
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-slate-600 font-bold">
                    ACTIVE CODERS
                  </span>
                  <Users className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <div className="text-3xl font-black text-slate-900">
                    {activeProject.members?.filter((m) => (m.commits || 0) > 0).length || 5}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">Verified repository coders</p>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-slate-600 font-bold">
                    SOURCE AUDIT
                  </span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <div className="text-xl font-black text-emerald-600 flex items-center gap-1.5">
                    <span>Verified ✓</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">Ready for Faculty Review</p>
                </div>
              </div>
            </div>

            {/* Language Breakdown + Contributor Commits */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Languages */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-slate-600" />
                    <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider font-mono">
                      REPOSITORY LANGUAGE BREAKDOWN
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-600 font-mono">
                    7 languages detected
                  </span>
                </div>

                <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100">
                  <div style={{ width: "51.8%" }} className="bg-[#3b82f6]" title="Python 51.8%" />
                  <div style={{ width: "41.0%" }} className="bg-[#eab308]" title="JavaScript 41%" />
                  <div style={{ width: "3.4%" }} className="bg-[#0284c7]" title="TypeScript 3.4%" />
                  <div style={{ width: "3.2%" }} className="bg-[#ec4899]" title="C++ 3.2%" />
                  <div style={{ width: "0.4%" }} className="bg-[#8b5cf6]" title="TeX 0.4%" />
                  <div style={{ width: "0.1%" }} className="bg-[#6366f1]" title="CSS 0.1%" />
                  <div style={{ width: "0.1%" }} className="bg-[#f97316]" title="HTML 0.1%" />
                </div>

                <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]"></span>
                      <span className="font-medium text-slate-700">Python</span>
                    </div>
                    <span className="font-mono text-slate-500 font-bold">51.8%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#eab308]"></span>
                      <span className="font-medium text-slate-700">JavaScript</span>
                    </div>
                    <span className="font-mono text-slate-500 font-bold">41%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7]"></span>
                      <span className="font-medium text-slate-700">TypeScript</span>
                    </div>
                    <span className="font-mono text-slate-500 font-bold">3.4%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#ec4899]"></span>
                      <span className="font-medium text-slate-700">C++</span>
                    </div>
                    <span className="font-mono text-slate-500 font-bold">3.2%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6]"></span>
                      <span className="font-medium text-slate-700">TeX</span>
                    </div>
                    <span className="font-mono text-slate-500 font-bold">0.4%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#6366f1]"></span>
                      <span className="font-medium text-slate-700">CSS</span>
                    </div>
                    <span className="font-mono text-slate-500 font-bold">0.1%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#f97316]"></span>
                      <span className="font-medium text-slate-700">HTML</span>
                    </div>
                    <span className="font-mono text-slate-500 font-bold">0.1%</span>
                  </div>
                </div>
              </div>

              {/* Right: Contributor Commits Leaderboard */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <GitCommit className="w-4 h-4 text-purple-600" />
                    <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider font-mono">
                      CONTRIBUTOR COMMITS
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-600 font-mono">
                    {activeProject.members?.filter((m) => (m.commits || 0) > 0).length || 5} active contributors
                  </span>
                </div>

                <div className="space-y-2.5">
                  {activeProject.members?.map((member, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/80 transition text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-emerald-500 text-white font-bold text-[11px] flex items-center justify-center shrink-0 shadow-xs">
                          {member.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <a
                            href={`https://github.com/${member.githubHandle}`}
                            target="_blank"
                            rel="noreferrer"
                            className="font-bold text-slate-900 hover:text-emerald-700 hover:underline flex items-center gap-1"
                          >
                            <span>@{member.githubHandle}</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </a>
                          <span className="text-[10px] text-slate-500 block">
                            Team Member: {member.name}
                          </span>
                        </div>
                      </div>

                      <span className="px-3 py-1 rounded-full bg-white border border-slate-200 font-mono font-bold text-slate-800 text-[11px] shadow-xs">
                        {member.commits || 0} Commits
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 4: HARDWARE BOM & SPRINT TASKS */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "bom" && (
          <div className="space-y-6">
            {/* Hardware BOM */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-emerald-600" />
                    <span>Allocated Lab Hardware Assets (BOM)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Physical microcontrollers, sensors, and peripherals borrowed from the IoT Lab inventory.
                  </p>
                </div>

                <Link
                  href="/lab"
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 font-bold text-xs transition"
                >
                  Request Lab Components →
                </Link>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 font-mono text-[11px] uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">Component / Module</th>
                      <th className="p-3.5">Qty</th>
                      <th className="p-3.5">Lab Status</th>
                      <th className="p-3.5">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeProject.hardwareBOM?.map((bom, i) => (
                      <tr key={i} className="hover:bg-slate-50/80">
                        <td className="p-3.5 font-bold text-slate-900">{bom.item}</td>
                        <td className="p-3.5 font-mono">{bom.quantity}</td>
                        <td className="p-3.5">
                          <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                            {bom.status}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <Link
                            href="/lab"
                            className="text-emerald-700 font-bold hover:underline text-[11px]"
                          >
                            Inspect in Lab
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sprint Tasks Board */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    <Kanban className="w-4 h-4 text-emerald-600" />
                    <span>Sprint Task Board ({activeProject.tasks?.length || 0})</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Engineering milestones and firmware deliverables assigned to team members.
                  </p>
                </div>

                <button
                  onClick={() => setIsTaskModalOpen(true)}
                  className="flex items-center gap-1 text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Task
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {activeProject.tasks?.map((task) => {
                  const isDone = task.status === "COMPLETED";
                  return (
                    <div
                      key={task.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 flex flex-col justify-between shadow-xs"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                              task.priority === "HIGH"
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {task.priority}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {task.dueDate}
                          </span>
                        </div>
                        <div
                          className={`font-bold text-slate-900 ${
                            isDone ? "line-through text-slate-400" : ""
                          }`}
                        >
                          {task.title}
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 leading-tight">
                          {task.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">{task.assignee}</span>
                        <button
                          onClick={() =>
                            updateTaskStatus(
                              activeProject.id,
                              task.id,
                              isDone ? "TODO" : "COMPLETED"
                            )
                          }
                          className={`px-2.5 py-0.5 rounded-lg font-mono text-[10px] font-bold transition cursor-pointer ${
                            isDone
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
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
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 5: SUBMISSION FILES & ENGINEERING LINKS */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "files" && (
          <div className="space-y-6">
            {/* Artifacts */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <span>Project Evaluation Artifacts & Submission Files</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Official engineering decks, system architecture reports, and demonstration files.
                  </p>
                </div>

                <div className="text-xs font-mono text-slate-500">
                  {activeProject.submissionFiles?.length || 4} Files Available
                </div>
              </div>

              <div className="space-y-3">
                {activeProject.submissionFiles?.map((file: ProjectSubmissionFile) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/70 transition text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-700 font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                        {file.fileType}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{file.title}</span>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span className="font-mono">{file.fileName}</span>
                          <span>•</span>
                          <span>{file.size}</span>
                          <span>•</span>
                          <span>Uploaded: {file.uploadedAt}</span>
                        </div>
                      </div>
                    </div>

                    <a
                      href={file.downloadUrl}
                      download
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 font-bold transition shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-400" />
                      <span>Download</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Links */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    <FolderGit2 className="w-4 h-4 text-emerald-600" />
                    <span>Hardware Schematics, KiCAD PCB & Live Endpoints</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Direct access to CAD STL enclosures, KiCAD schematics, and live MQTT stream dashboards.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeProject.resourceLinks?.map((link: ProjectResourceLink) => (
                  <div
                    key={link.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 flex flex-col justify-between hover:border-emerald-300 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-white border border-slate-200 text-slate-600">
                          {link.category}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-xs">{link.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        {link.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      <a
                        href={link.url}
                        target={link.url.startsWith("http") ? "_blank" : undefined}
                        rel="noreferrer"
                        className="font-mono text-emerald-700 hover:underline text-[11px] font-semibold truncate max-w-[220px]"
                      >
                        {link.url}
                      </a>
                      <a
                        href={link.url}
                        target={link.url.startsWith("http") ? "_blank" : undefined}
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[10px] hover:bg-emerald-100 transition"
                      >
                        Open Link
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: SUBMIT NEW PROJECT (Club Member Workflow) */}
      {/* ------------------------------------------------------------- */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleCreateProject}
            className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl max-w-xl w-full space-y-4 text-xs shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Submit Project to IoT Club Portal
                </h3>
                <p className="text-[11px] text-slate-500">
                  Register your team&apos;s project for R1 faculty review and live GitHub tracking.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewProjectModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Project Title *
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Smart Hydroponics Automation Grid"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Category *
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white cursor-pointer"
                >
                  <option value="HealthTech">HealthTech</option>
                  <option value="Robotics">Robotics</option>
                  <option value="AgriTech">AgriTech</option>
                  <option value="Smart Cities">Smart Cities</option>
                  <option value="Industrial IoT">Industrial IoT</option>
                  <option value="Security">Security</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Problem Statement / Theme
                </label>
                <input
                  type="text"
                  value={newTheme}
                  onChange={(e) => setNewTheme(e.target.value)}
                  placeholder="e.g. AGRI-TECH / PRECISION FARMING"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Project Brief & Technical Abstract *
              </label>
              <textarea
                rows={3}
                required
                value={newBrief}
                onChange={(e) => setNewBrief(e.target.value)}
                placeholder="Describe what the system solves, how edge devices sample data, and communication protocols used..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                AI Tool Disclosure
              </label>
              <input
                type="text"
                value={newAiDisclosure}
                onChange={(e) => setNewAiDisclosure(e.target.value)}
                placeholder="List any AI tools used (GitHub Copilot, ChatGPT, Claude, etc.)..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  GitHub Repository URL *
                </label>
                <input
                  type="url"
                  required
                  value={newGithubUrl}
                  onChange={(e) => setNewGithubUrl(e.target.value)}
                  placeholder="https://github.com/your-username/repo-name"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Team Lead Name
                </label>
                <input
                  type="text"
                  value={newLeadName}
                  onChange={(e) => setNewLeadName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Tech Stack (Comma Separated)
              </label>
              <input
                type="text"
                value={newTechStack}
                onChange={(e) => setNewTechStack(e.target.value)}
                placeholder="e.g. ESP32, FreeRTOS, MQTT, Node.js, TimescaleDB"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-mono text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsNewProjectModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-xs transition cursor-pointer"
              >
                Submit Project
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: TEACHER / EVALUATOR REVIEW MODAL */}
      {/* ------------------------------------------------------------- */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleSubmitReview}
            className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl max-w-xl w-full space-y-4 text-xs shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  {selectedReviewRound === "R1"
                    ? "R1 First Review (Round 1) Evaluation"
                    : selectedReviewRound === "R2"
                    ? "R2 Mid-Stage / Prototype Evaluation"
                    : "Final Demo Day Evaluation"}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Grading project: <strong className="text-slate-800">{activeProject.title}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Evaluation Verdict
                </label>
                <select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-semibold cursor-pointer"
                >
                  <option value="APPROVED">Approved / Passed</option>
                  <option value="REVISIONS_REQUESTED">Revisions Requested</option>
                  <option value="UNDER_EVALUATION">Under Evaluation</option>
                  <option value="PENDING">Pending Review</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Evaluator Name & Title
                </label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Rubric Criteria with Range Sliders */}
            <div className="space-y-2.5 pt-1">
              <label className="block text-slate-800 font-bold">
                Evaluation Rubrics (Score out of 10):
              </label>

              {Object.entries(rubricScores).map(([criterion, val]) => (
                <div
                  key={criterion}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{criterion}</span>
                    <span className="font-mono font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {val} / 10
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={1}
                    value={val}
                    onChange={(e) =>
                      setRubricScores({
                        ...rubricScores,
                        [criterion]: Number(e.target.value),
                      })
                    }
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              ))}
            </div>

            {/* Written Feedback */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Faculty / Judge Remarks & Assessment *
              </label>
              <textarea
                rows={3}
                required
                value={reviewFeedback}
                onChange={(e) => setReviewFeedback(e.target.value)}
                placeholder="Detail technical execution, circuit stability, commit distribution, and safety considerations..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>

            {/* Action Items for Students */}
            <div className="space-y-2">
              <label className="block text-slate-700 font-semibold">
                Action Items for Students (Checklist)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={actionItemInput}
                  onChange={(e) => setActionItemInput(e.target.value)}
                  placeholder="e.g. Calibrate sensor threshold or add decoupling capacitor..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (actionItemInput.trim()) {
                      setActionItemsList([...actionItemsList, actionItemInput.trim()]);
                      setActionItemInput("");
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition cursor-pointer"
                >
                  Add
                </button>
              </div>

              {actionItemsList.length > 0 && (
                <div className="space-y-1">
                  {actionItemsList.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-100 text-[11px] text-slate-700"
                    >
                      <span>• {item}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setActionItemsList(actionItemsList.filter((_, i) => i !== idx))
                        }
                        className="text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-xs transition cursor-pointer"
              >
                Publish Review
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 3: SPRINT TASK MODAL */}
      {/* ------------------------------------------------------------- */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleCreateTask}
            className="bg-white/95 border border-slate-200 p-6 rounded-3xl max-w-md w-full space-y-4 text-xs shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900">Create Sprint Task</h3>
              <button
                type="button"
                onClick={() => setIsTaskModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Task Title *</label>
              <input
                type="text"
                required
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="e.g. Implement FreeRTOS Queue for Sensors"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Description</label>
              <textarea
                rows={2}
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                placeholder="Details of the implementation or circuit test..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Assignee</label>
                <input
                  type="text"
                  value={taskAssignee}
                  onChange={(e) => setTaskAssignee(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1">Priority</label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white cursor-pointer"
                >
                  <option>LOW</option>
                  <option>MEDIUM</option>
                  <option>HIGH</option>
                  <option>CRITICAL</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Due Date</label>
              <input
                type="date"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsTaskModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-xs cursor-pointer"
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
