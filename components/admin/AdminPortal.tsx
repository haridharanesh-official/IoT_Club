"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useIoTApp } from "@/lib/store";
import {
  ApplicationStatus,
  Application,
  HardwareAsset,
  HardwareStatus,
  AuthUser,
  AuthRole,
  Project,
  ClubMetrics,
} from "@/lib/types";
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
  Plus,
  Trash2,
  Edit3,
  Radio,
  Lock,
  Unlock,
  Download,
  RefreshCw,
  X,
  Eye,
  ExternalLink,
  QrCode,
  AlertTriangle,
  Megaphone,
  Settings,
  UserPlus,
  Check,
  Award,
  Save,
  Cpu,
  FolderGit2,
} from "lucide-react";

export const AdminPortal: React.FC = () => {
  const {
    applications,
    updateApplicationStatus,
    addApplication,
    updateApplication,
    deleteApplication,
    hardwareAssets,
    addHardwareAsset,
    updateHardwareAsset,
    deleteHardwareAsset,
    forceAssignHardware,
    forceReturnHardware,
    hardwareRequests,
    approveHardwareRequest,
    rejectHardwareRequest,
    auditLogs,
    addManualAuditLog,
    clearAuditLogs,
    projects,
    updateProject,
    deleteProject,
    addNewProject,
    toggleProjectLock,
    authUsers,
    addUser,
    updateUser,
    deleteUser,
    changeUserRole,
    clubMetrics,
    updateClubMetrics,
    resetClubMetrics,
    systemAnnouncement,
    setSystemAnnouncement,
    labStatusBroadcast,
    setLabStatusBroadcast,
    clubConfig,
    updateClubConfig,
    resetDemoState,
    currentUser,
  } = useIoTApp();

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<
    "recruitment" | "hardware" | "members" | "projects" | "audit" | "settings"
  >("recruitment");

  // ==========================================
  // METRICS EDIT MODAL STATE
  // ==========================================
  const [metricsModalOpen, setMetricsModalOpen] = useState(false);
  const [metricsForm, setMetricsForm] = useState<ClubMetrics>({ ...clubMetrics });

  const handleSaveMetrics = (e: React.FormEvent) => {
    e.preventDefault();
    updateClubMetrics(metricsForm);
    setMetricsModalOpen(false);
  };

  const handleAutoCalcMetrics = () => {
    setMetricsForm({
      totalMembers: 140 + applications.filter((a) => a.status === "SELECTED").length,
      activeStudents: 130 + applications.filter((a) => a.status === "SELECTED").length,
      facultyMentors: 12,
      activeProjects: projects.filter((p) => p.lifecycle !== "COMPLETED" && p.lifecycle !== "ARCHIVED").length,
      completedProjects: projects.filter((p) => p.lifecycle === "COMPLETED").length,
      hardwareAssets: hardwareAssets.length,
      currentlyIssued: hardwareAssets.filter((a) => a.status === "ISSUED").length,
      gitHubCommits: projects.reduce((acc, p) => acc + (p.totalCommits || 40), 0),
    });
  };

  // ==========================================
  // RECRUITMENT TAB STATE & MODALS
  // ==========================================
  const [candidateSearch, setCandidateSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [candidateModalOpen, setCandidateModalOpen] = useState(false);
  const [isEditingCandidate, setIsEditingCandidate] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Application | null>(null);
  const [candidateDetailModal, setCandidateDetailModal] = useState<Application | null>(null);

  // Candidate Form
  const [candidateForm, setCandidateForm] = useState<Omit<Application, "id" | "appliedDate">>({
    fullName: "",
    rollNumber: "",
    department: "Information Technology",
    year: "2nd Year",
    section: "A",
    collegeEmail: "",
    personalEmail: "",
    phone: "",
    interests: ["IoT", "Embedded Systems"],
    skills: [
      { name: "C / C++", level: "Intermediate" },
      { name: "ESP32", level: "Beginner" },
    ],
    githubUrl: "https://github.com",
    linkedinUrl: "https://linkedin.com",
    whyJoin: "",
    whatToLearn: "",
    hoursPerWeek: "8-10 hrs",
    hackathonInterest: true,
    researchInterest: false,
    status: "SUBMITTED",
    batch: "2026 Batch 01",
    reviewNotes: "",
  });

  const stages: { key: ApplicationStatus; label: string }[] = [
    { key: "SUBMITTED", label: "Submitted" },
    { key: "UNDER_REVIEW", label: "Under Review" },
    { key: "ASSESSMENT", label: "Assessment" },
    { key: "PRACTICAL_TASK", label: "Practical Task" },
    { key: "INTERVIEW", label: "Interview" },
    { key: "SELECTED", label: "Selected" },
  ];

  const handleOpenAddCandidate = () => {
    setIsEditingCandidate(false);
    setSelectedCandidate(null);
    setCandidateForm({
      fullName: "",
      rollNumber: "",
      department: "Information Technology",
      year: "2nd Year",
      section: "A",
      collegeEmail: "",
      personalEmail: "",
      phone: "",
      interests: ["IoT", "Embedded Systems"],
      skills: [{ name: "C / C++", level: "Intermediate" }],
      githubUrl: "https://github.com",
      linkedinUrl: "https://linkedin.com",
      whyJoin: "",
      whatToLearn: "",
      hoursPerWeek: "8-10 hrs",
      hackathonInterest: true,
      researchInterest: false,
      status: "SUBMITTED",
      batch: "2026 Batch 01",
      reviewNotes: "",
    });
    setCandidateModalOpen(true);
  };

  const handleOpenEditCandidate = (app: Application) => {
    setIsEditingCandidate(true);
    setSelectedCandidate(app);
    setCandidateForm({
      fullName: app.fullName,
      rollNumber: app.rollNumber,
      department: app.department,
      year: app.year,
      section: app.section,
      collegeEmail: app.collegeEmail,
      personalEmail: app.personalEmail,
      phone: app.phone,
      interests: [...app.interests],
      skills: [...app.skills],
      githubUrl: app.githubUrl,
      linkedinUrl: app.linkedinUrl,
      whyJoin: app.whyJoin,
      whatToLearn: app.whatToLearn,
      hoursPerWeek: app.hoursPerWeek,
      hackathonInterest: app.hackathonInterest,
      researchInterest: app.researchInterest,
      status: app.status,
      batch: app.batch,
      reviewNotes: app.reviewNotes || "",
    });
    setCandidateModalOpen(true);
  };

  const handleSaveCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateForm.fullName || !candidateForm.rollNumber) return;

    if (isEditingCandidate && selectedCandidate) {
      updateApplication(selectedCandidate.id, candidateForm);
    } else {
      addApplication(candidateForm);
    }
    setCandidateModalOpen(false);
  };

  const handleExportCandidatesCSV = () => {
    const headers = ["ID,Name,RollNumber,Department,Year,Status,Email,Phone,AppliedDate\n"];
    const rows = applications.map(
      (a) =>
        `"${a.id}","${a.fullName}","${a.rollNumber}","${a.department}","${a.year}","${a.status}","${a.collegeEmail}","${a.phone}","${a.appliedDate}"\n`
    );
    const blob = new Blob([...headers, ...rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `IoT_Club_Candidates_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.fullName.toLowerCase().includes(candidateSearch.toLowerCase()) ||
      app.rollNumber.toLowerCase().includes(candidateSearch.toLowerCase()) ||
      app.department.toLowerCase().includes(candidateSearch.toLowerCase());
    const matchesDept = deptFilter === "ALL" || app.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  // ==========================================
  // HARDWARE TAB STATE & MODALS
  // ==========================================
  const [hardwareSearch, setHardwareSearch] = useState("");
  const [hwCategoryFilter, setHwCategoryFilter] = useState("ALL");
  const [hardwareModalOpen, setHardwareModalOpen] = useState(false);
  const [isEditingHardware, setIsEditingHardware] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<HardwareAsset | null>(null);

  const [hardwareForm, setHardwareForm] = useState<HardwareAsset>({
    assetId: "",
    name: "",
    category: "Microcontroller",
    model: "",
    serialNumber: "",
    location: "IoT Lab Shelf A1",
    condition: "GOOD",
    status: "AVAILABLE",
    qrCodeValue: "",
    specs: ["3.3V Logic", "Wi-Fi + BLE"],
  });

  // Direct Assign Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignAssetId, setAssignAssetId] = useState("");
  const [assignStudentName, setAssignStudentName] = useState("Hari Dharanesh SP");
  const [assignStudentId, setAssignStudentId] = useState("usr-std-001");
  const [assignProject, setAssignProject] = useState("CareGrid");
  const [assignDays, setAssignDays] = useState(14);

  const handleOpenAddHardware = () => {
    setIsEditingHardware(false);
    setSelectedAsset(null);
    const nextId = `HW-${Math.floor(100 + Math.random() * 900)}`;
    setHardwareForm({
      assetId: nextId,
      name: "",
      category: "Microcontroller",
      model: "",
      serialNumber: `SN-${Date.now().toString().slice(-6)}`,
      location: "IoT Lab Shelf B1",
      condition: "EXCELLENT",
      status: "AVAILABLE",
      qrCodeValue: `IOT-ASSET-${nextId}`,
      specs: ["High Performance", "Embedded Ready"],
    });
    setHardwareModalOpen(true);
  };

  const handleOpenEditHardware = (asset: HardwareAsset) => {
    setIsEditingHardware(true);
    setSelectedAsset(asset);
    setHardwareForm({ ...asset });
    setHardwareModalOpen(true);
  };

  const handleSaveHardware = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hardwareForm.name || !hardwareForm.assetId) return;

    if (isEditingHardware && selectedAsset) {
      updateHardwareAsset(selectedAsset.assetId, hardwareForm);
    } else {
      addHardwareAsset(hardwareForm);
    }
    setHardwareModalOpen(false);
  };

  const handleOpenDirectAssign = (assetId: string) => {
    setAssignAssetId(assetId);
    setAssignModalOpen(true);
  };

  const handleConfirmDirectAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignAssetId || !assignStudentName) return;
    forceAssignHardware(assignAssetId, assignStudentName, assignStudentId, assignProject, assignDays);
    setAssignModalOpen(false);
  };

  const filteredAssets = hardwareAssets.filter((a) => {
    const matchesCat = hwCategoryFilter === "ALL" || a.category === hwCategoryFilter;
    const matchesSearch =
      a.name.toLowerCase().includes(hardwareSearch.toLowerCase()) ||
      a.assetId.toLowerCase().includes(hardwareSearch.toLowerCase()) ||
      a.location.toLowerCase().includes(hardwareSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // ==========================================
  // MEMBERS & ROLES STATE & MODALS
  // ==========================================
  const [memberSearch, setMemberSearch] = useState("");
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null);

  const [userForm, setUserForm] = useState<AuthUser>({
    id: "",
    name: "",
    email: "",
    role: "STUDENT",
    department: "Information Technology",
    rollNumber: "",
    designation: "Student Member (Level 3)",
    portalRedirect: "/dashboard",
  });

  const handleOpenAddUser = () => {
    setIsEditingUser(false);
    setSelectedUser(null);
    const nextId = `usr-${Date.now().toString(36)}`;
    setUserForm({
      id: nextId,
      name: "",
      email: "",
      role: "STUDENT",
      department: "Information Technology",
      rollNumber: "",
      designation: "Student Member (Level 1)",
      portalRedirect: "/dashboard",
    });
    setUserModalOpen(true);
  };

  const handleOpenEditUser = (u: AuthUser) => {
    setIsEditingUser(true);
    setSelectedUser(u);
    setUserForm({ ...u });
    setUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.name || !userForm.email) return;

    if (isEditingUser && selectedUser) {
      updateUser(selectedUser.id, userForm);
    } else {
      addUser(userForm);
    }
    setUserModalOpen(false);
  };

  // ==========================================
  // PROJECTS TAB STATE & MODALS
  // ==========================================
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [selectedProj, setSelectedProj] = useState<Project | null>(null);

  const [projectForm, setProjectForm] = useState<Partial<Project>>({
    title: "",
    tagline: "",
    category: "Industrial IoT",
    lifecycle: "PROTOTYPE",
    leadName: "Hari Dharanesh SP",
    facultyMentor: "Dr. K. Swaminathan",
    progressPercent: 50,
    githubUrl: "https://github.com/iot-club-siet",
  });

  const handleOpenAddProject = () => {
    setIsEditingProject(false);
    setSelectedProj(null);
    setProjectForm({
      title: "",
      tagline: "",
      category: "Industrial IoT",
      lifecycle: "IDEA",
      leadName: "Hari Dharanesh SP",
      facultyMentor: "Prof. R. Soundararajan",
      progressPercent: 10,
      githubUrl: "https://github.com/iot-club-siet/new-project",
    });
    setProjectModalOpen(true);
  };

  const handleOpenEditProject = (proj: Project) => {
    setIsEditingProject(true);
    setSelectedProj(proj);
    setProjectForm({
      title: proj.title,
      tagline: proj.tagline,
      category: proj.category,
      lifecycle: proj.lifecycle,
      leadName: proj.leadName,
      facultyMentor: proj.facultyMentor,
      progressPercent: proj.progressPercent,
      githubUrl: proj.githubUrl,
    });
    setProjectModalOpen(true);
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.title) return;

    if (isEditingProject && selectedProj) {
      updateProject(selectedProj.id, projectForm);
    } else {
      addNewProject({
        title: projectForm.title || "New Project",
        tagline: projectForm.tagline || "",
        description: projectForm.tagline || "",
        category: (projectForm.category as any) || "Industrial IoT",
        lifecycle: (projectForm.lifecycle as any) || "IDEA",
        leadName: projectForm.leadName || "Hari Dharanesh SP",
        leadId: "usr-std-001",
        facultyMentor: projectForm.facultyMentor || "Dr. K. Swaminathan",
        progressPercent: projectForm.progressPercent || 20,
        githubUrl: projectForm.githubUrl || "https://github.com",
        techStack: ["ESP32", "FreeRTOS", "MQTT"],
        hardwareBOM: [{ item: "ESP32 DevKit", quantity: 2, status: "Available" }],
        tasks: [],
        featured: false,
        architectureSummary: "Modular IoT edge system.",
        members: [{ name: projectForm.leadName || "Lead", role: "Project Lead", isLead: true }],
      });
    }
    setProjectModalOpen(false);
  };

  // ==========================================
  // AUDIT LOG STATE & MODALS
  // ==========================================
  const [auditSearch, setAuditSearch] = useState("");
  const [manualAuditModalOpen, setManualAuditModalOpen] = useState(false);
  const [manualAction, setManualAction] = useState("ADMIN_INSPECTION");
  const [manualEntity, setManualEntity] = useState("LabInventory");
  const [manualDetails, setManualDetails] = useState("");

  const handleSaveManualAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualDetails) return;
    addManualAuditLog(manualAction, manualEntity, manualDetails);
    setManualDetails("");
    setManualAuditModalOpen(false);
  };

  const handleExportAuditCSV = () => {
    const headers = ["ID,Timestamp,Actor,Action,Entity,EntityId,Details\n"];
    const rows = auditLogs.map(
      (l) => `"${l.id}","${l.timestamp}","${l.user}","${l.action}","${l.entity}","${l.entityId}","${l.details.replace(/"/g, '""')}"\n`
    );
    const blob = new Blob([...headers, ...rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `IoT_Club_Audit_Ledger_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ==========================================
  // SETTINGS & BROADCAST STATE
  // ==========================================
  const [announcementForm, setAnnouncementForm] = useState({ ...systemAnnouncement });
  const [labBroadcastForm, setLabBroadcastForm] = useState({ ...labStatusBroadcast });
  const [clubMetaForm, setClubMetaForm] = useState({ ...clubConfig });
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    setSystemAnnouncement(announcementForm);
    setSaveSuccessMsg("Global Announcement published successfully!");
    setTimeout(() => setSaveSuccessMsg(""), 3000);
  };

  const handleSaveLabBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    setLabStatusBroadcast(labBroadcastForm);
    setSaveSuccessMsg("Lab Operational Status broadcasted!");
    setTimeout(() => setSaveSuccessMsg(""), 3000);
  };

  const handleSaveClubMeta = (e: React.FormEvent) => {
    e.preventDefault();
    updateClubConfig(clubMetaForm);
    setSaveSuccessMsg("Club institutional branding & contact saved!");
    setTimeout(() => setSaveSuccessMsg(""), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 font-bold mb-1">
            <span>GOVERNANCE & CLUB ADMINISTRATION</span>
            <span>•</span>
            <span className="text-emerald-600">FULL CONTROL COMMAND CENTER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <span>IoT Club Administrator Console</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono text-xs font-bold">
              SUPER_ADMIN
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Total control over recruitment Kanban, hardware inventory CRUD, RBAC user directory, project governance, and global announcements.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              setMetricsForm({ ...clubMetrics });
              setMetricsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 shadow-xs transition cursor-pointer"
            title="Edit Dashboard Statistics"
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-600" />
            <span>Edit Metrics</span>
          </button>

          <Link
            href="/lab"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Hardware Portal ({hardwareAssets.length}) →</span>
          </Link>
        </div>
      </div>

      {/* Admin Dashboard Metrics Strip (Editable!) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { key: "totalMembers", label: "Total Members", val: clubMetrics.totalMembers, color: "text-slate-900" },
          { key: "activeStudents", label: "Active Students", val: clubMetrics.activeStudents, color: "text-emerald-700" },
          { key: "facultyMentors", label: "Faculty Mentors", val: clubMetrics.facultyMentors, color: "text-teal-700" },
          { key: "activeProjects", label: "Active Projects", val: clubMetrics.activeProjects, color: "text-indigo-700" },
          { key: "completedProjects", label: "Completed Projects", val: clubMetrics.completedProjects, color: "text-slate-900" },
          { key: "hardwareAssets", label: "Hardware Assets", val: clubMetrics.hardwareAssets, color: "text-amber-700" },
          { key: "currentlyIssued", label: "Currently Issued", val: clubMetrics.currentlyIssued, color: "text-amber-600" },
          { key: "gitHubCommits", label: "GitHub Commits", val: clubMetrics.gitHubCommits.toLocaleString(), color: "text-emerald-600" },
        ].map((m) => (
          <div
            key={m.key}
            onClick={() => {
              setMetricsForm({ ...clubMetrics });
              setMetricsModalOpen(true);
            }}
            className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-sm transition cursor-pointer group"
            title="Click to edit metric value"
          >
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>{m.label}</span>
              <Edit3 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-emerald-600 transition" />
            </div>
            <div className={`text-lg font-bold font-mono mt-1 ${m.color}`}>{m.val}</div>
          </div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs overflow-x-auto">
        {[
          { key: "recruitment", label: `Recruitment Kanban (${applications.length})`, icon: <Kanban className="w-3.5 h-3.5" /> },
          { key: "hardware", label: `Hardware Control (${hardwareAssets.length})`, icon: <Boxes className="w-3.5 h-3.5" /> },
          { key: "members", label: `User & Role Directory (${authUsers.length})`, icon: <Users className="w-3.5 h-3.5" /> },
          { key: "projects", label: `Projects Governance (${projects.length})`, icon: <FolderGit2 className="w-3.5 h-3.5" /> },
          { key: "audit", label: `Audit Ledger (${auditLogs.length})`, icon: <FileText className="w-3.5 h-3.5" /> },
          { key: "settings", label: "System Broadcast & Settings", icon: <Settings className="w-3.5 h-3.5" /> },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold transition shrink-0 cursor-pointer ${
              activeTab === t.key
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: RECRUITMENT KANBAN (FULL CRUD) */}
      {/* ========================================================================= */}
      {activeTab === "recruitment" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleOpenAddCandidate}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Candidate</span>
              </button>
              <button
                onClick={handleExportCandidatesCSV}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative w-48 sm:w-60">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={candidateSearch}
                  onChange={(e) => setCandidateSearch(e.target.value)}
                  placeholder="Search name, roll no..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-none"
              >
                <option value="ALL">All Departments</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics & Communication">ECE</option>
                <option value="Computer Science & Engineering">CSE</option>
                <option value="Mechanical Engineering">Mechanical</option>
                <option value="Electrical & Electronics">EEE</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 overflow-x-auto pb-4">
            {stages.map((stage) => {
              const stageApps = filteredApplications.filter((a) => a.status === stage.key);
              return (
                <div
                  key={stage.key}
                  className="bg-white border border-slate-200/90 rounded-2xl p-3.5 min-w-[210px] flex flex-col space-y-3 shadow-xs"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                    <span className="font-bold text-slate-900 leading-tight">{stage.label}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 font-mono text-[10px] text-emerald-800 font-bold border border-emerald-200">
                      {stageApps.length}
                    </span>
                  </div>

                  <div className="space-y-2.5 flex-1">
                    {stageApps.length === 0 ? (
                      <div className="text-[11px] text-slate-400 text-center py-6 italic">No candidates</div>
                    ) : (
                      stageApps.map((app) => (
                        <div
                          key={app.id}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 hover:border-emerald-400 transition shadow-2xs group"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div>
                              <div className="font-bold text-slate-900 leading-tight">{app.fullName}</div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                {app.department} • {app.rollNumber}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleOpenEditCandidate(app)}
                                className="p-1 rounded-md text-slate-400 hover:text-emerald-700 hover:bg-slate-200 transition cursor-pointer"
                                title="Edit Candidate"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Delete applicant ${app.fullName}?`)) {
                                    deleteApplication(app.id);
                                  }
                                }}
                                className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                title="Delete Candidate"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {app.interests.slice(0, 2).map((it, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.2 rounded-md bg-white border border-slate-200 text-[9px] text-slate-700 font-mono"
                              >
                                {it}
                              </span>
                            ))}
                          </div>

                          {/* Action Buttons */}
                          <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between gap-2">
                            <button
                              onClick={() => setCandidateDetailModal(app)}
                              className="text-[10px] text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Details</span>
                            </button>

                            <select
                              value={app.status}
                              onChange={(e) => updateApplicationStatus(app.id, e.target.value as any)}
                              className="bg-white border border-slate-200 rounded-md px-1.5 py-0.5 text-[9px] text-emerald-800 font-mono font-bold focus:outline-none focus:border-emerald-500"
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

      {/* ========================================================================= */}
      {/* TAB 2: HARDWARE INVENTORY CONTROL (FULL CRUD) */}
      {/* ========================================================================= */}
      {activeTab === "hardware" && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleOpenAddHardware}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Equipment</span>
              </button>

              <div className="flex items-center gap-1 overflow-x-auto text-xs">
                {["ALL", "Microcontroller", "Single Board Computer", "Sensor", "Wireless & RF", "Testing Equipment", "Tooling"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setHwCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl font-semibold transition shrink-0 cursor-pointer ${
                      hwCategoryFilter === cat
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={hardwareSearch}
                onChange={(e) => setHardwareSearch(e.target.value)}
                placeholder="Search asset ID, name, shelf..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Pending Hardware Checkout Requests */}
          {hardwareRequests.filter((r) => r.status === "PENDING").length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-700 animate-pulse" />
                  <span>Pending Student Hardware Checkout Requests ({hardwareRequests.filter((r) => r.status === "PENDING").length})</span>
                </span>
                <span className="text-amber-800 font-mono text-[10px]">Action required by Lab Admin</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {hardwareRequests
                  .filter((r) => r.status === "PENDING")
                  .map((req) => (
                    <div key={req.id} className="p-3 bg-white rounded-xl border border-amber-200 text-xs flex items-center justify-between gap-3 shadow-2xs">
                      <div>
                        <div className="font-bold text-slate-900">
                          {req.studentName} — <span className="text-emerald-700 font-mono">#{req.assetId}</span> ({req.assetName})
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Project: <span className="font-semibold text-slate-700">{req.project}</span> • {req.durationDays} Days • Purpose: {req.purpose}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => approveHardwareRequest(req.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => rejectHardwareRequest(req.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 text-rose-700 font-bold text-[10px] transition cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Hardware Assets Table */}
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 font-mono text-[11px] uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Asset ID</th>
                    <th className="p-3.5">Equipment Name</th>
                    <th className="p-3.5">Location</th>
                    <th className="p-3.5">Condition</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Current Holder</th>
                    <th className="p-3.5 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAssets.map((asset) => (
                    <tr key={asset.assetId} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5 font-mono text-emerald-700 font-bold">
                        <Link href={`/lab/assets/${asset.assetId}`} className="hover:underline flex items-center gap-1">
                          <span>#{asset.assetId}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </Link>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{asset.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {asset.category} • {asset.model} • SN: {asset.serialNumber}
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-600 font-medium">{asset.location}</td>
                      <td className="p-3.5">
                        <span className="font-mono text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          {asset.condition}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold border ${
                            asset.status === "AVAILABLE"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : asset.status === "ISSUED"
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : asset.status === "UNDER_TESTING"
                              ? "bg-indigo-50 text-indigo-800 border-indigo-200"
                              : "bg-rose-50 text-rose-800 border-rose-200"
                          }`}
                        >
                          {asset.status}
                        </span>
                      </td>
                      <td className="p-3.5">
                        {asset.currentHolder ? (
                          <div>
                            <div className="font-bold text-slate-900">{asset.currentHolder}</div>
                            <div className="text-[10px] text-slate-500 font-mono">Until {asset.expectedReturnDate}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono">—</span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Assign or Force Return */}
                          {asset.status === "ISSUED" ? (
                            <button
                              onClick={() => forceReturnHardware(asset.assetId)}
                              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold transition cursor-pointer"
                              title="Force check-in and clear holder"
                            >
                              Force Return
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenDirectAssign(asset.assetId)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold transition cursor-pointer"
                              title="Directly assign to student"
                            >
                              Direct Assign
                            </button>
                          )}

                          {/* Edit Asset */}
                          <button
                            onClick={() => handleOpenEditHardware(asset)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                            title="Edit Equipment Details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Asset */}
                          <button
                            onClick={() => {
                              if (confirm(`Remove asset #${asset.assetId} (${asset.name}) from inventory?`)) {
                                deleteHardwareAsset(asset.assetId);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-rose-700 transition cursor-pointer"
                            title="Delete Equipment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* ========================================================================= */}
      {/* TAB 3: USER & ROLE DIRECTORY (FULL RBAC CRUD) */}
      {/* ========================================================================= */}
      {activeTab === "members" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <button
              onClick={handleOpenAddUser}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Member / User</span>
            </button>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Search name, roll, email..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {authUsers
              .filter(
                (u) =>
                  u.user.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
                  u.user.email.toLowerCase().includes(memberSearch.toLowerCase()) ||
                  (u.user.rollNumber && u.user.rollNumber.toLowerCase().includes(memberSearch.toLowerCase()))
              )
              .map((u) => (
                <div
                  key={u.user.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between gap-3 shadow-2xs hover:border-emerald-300 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <span>{u.user.name}</span>
                        {u.user.rollNumber && (
                          <span className="text-[10px] font-mono text-slate-500 font-normal">
                            ({u.user.rollNumber})
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">{u.user.email}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {u.user.department} • {u.user.designation}
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold border ${
                        u.user.role === "ADMIN"
                          ? "bg-rose-50 text-rose-800 border-rose-200"
                          : u.user.role === "TEACHER"
                          ? "bg-teal-50 text-teal-800 border-teal-200"
                          : u.user.role === "CLUB_LEAD"
                          ? "bg-indigo-50 text-indigo-800 border-indigo-200"
                          : "bg-emerald-50 text-emerald-800 border-emerald-200"
                      }`}
                    >
                      {u.user.role}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-mono">Change Role:</span>
                      <select
                        value={u.user.role}
                        onChange={(e) => changeUserRole(u.user.id, e.target.value as AuthRole)}
                        className="bg-slate-50 border border-slate-200 rounded-md px-2 py-0.5 text-[10px] font-mono font-bold text-slate-800 focus:outline-none"
                      >
                        <option value="STUDENT">STUDENT</option>
                        <option value="CLUB_LEAD">CLUB_LEAD</option>
                        <option value="TEACHER">TEACHER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditUser(u.user)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold transition cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Remove user ${u.user.name} from the portal?`)) {
                            deleteUser(u.user.id);
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold transition cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PROJECTS GOVERNANCE (FULL CRUD) */}
      {/* ========================================================================= */}
      {activeTab === "projects" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Projects Governance & Repository Lock Control</h3>
              <p className="text-xs text-slate-500">Oversee project stages, rubric locks, mentor assignments, and milestones.</p>
            </div>
            <button
              onClick={handleOpenAddProject}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Project</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((proj) => (
              <div key={proj.id} className="p-5 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-xs">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {proj.category}
                  </span>
                  <button
                    onClick={() => toggleProjectLock(proj.id)}
                    className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      proj.isLocked
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "bg-slate-100 text-slate-600 hover:text-slate-900"
                    }`}
                    title={proj.isLocked ? "Repository Locked (Click to Unlock)" : "Repository Unlocked (Click to Lock)"}
                  >
                    {proj.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-base">{proj.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{proj.tagline}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                  <div>Lead: <span className="font-semibold text-slate-900">{proj.leadName}</span></div>
                  <div>Mentor: <span className="text-slate-700">{proj.facultyMentor}</span></div>
                  <div>Stage: <span className="font-mono text-emerald-700 font-bold">{proj.lifecycle}</span> ({proj.progressPercent}%)</div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <Link
                    href="/projects"
                    className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1"
                  >
                    <span>Project Hub</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditProject(proj)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete project "${proj.title}"?`)) {
                          deleteProject(proj.id);
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] transition cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: AUDIT LOGS & SECURITY LEDGER (ENHANCED) */}
      {/* ========================================================================= */}
      {activeTab === "audit" && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">System Audit Trail & Security Ledger</h3>
              <p className="text-xs text-slate-500">
                Immutable signed stream of all administrative events, hardware movements, evaluations, and role updates.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setManualAuditModalOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Audit Entry</span>
              </button>

              <button
                onClick={handleExportAuditCSV}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => {
                  if (confirm("Purge and archive current event ledger?")) {
                    clearAuditLogs();
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition cursor-pointer"
              >
                Clear Logs
              </button>
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={auditSearch}
              onChange={(e) => setAuditSearch(e.target.value)}
              placeholder="Filter by actor, action, details..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
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
                {auditLogs
                  .filter(
                    (l) =>
                      l.user.toLowerCase().includes(auditSearch.toLowerCase()) ||
                      l.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
                      l.details.toLowerCase().includes(auditSearch.toLowerCase())
                  )
                  .map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80">
                      <td className="p-3.5 text-slate-500 text-[11px] whitespace-nowrap">{log.timestamp}</td>
                      <td className="p-3.5 text-slate-900 font-bold font-sans">{log.user}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600 text-[11px]">
                        {log.entity} #{log.entityId}
                      </td>
                      <td className="p-3.5 text-slate-700 font-sans text-xs">{log.details}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: SYSTEM BROADCAST & CLUB CONFIGURATION */}
      {/* ========================================================================= */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          {saveSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* Global Announcement Broadcaster */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">Site-Wide Live Announcement Broadcaster</h3>
              </div>
              <span className="text-xs font-mono text-emerald-700 font-bold">Renders at top of every page</span>
            </div>

            <form onSubmit={handleSaveAnnouncement} className="space-y-4 text-xs">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={announcementForm.active}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, active: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-bold text-slate-900">Announcement Active / Enabled</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-600">Banner Type:</span>
                  <select
                    value={announcementForm.type}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, type: e.target.value as any })}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono font-bold text-slate-800"
                  >
                    <option value="info">Info (Emerald)</option>
                    <option value="warning">Warning (Amber)</option>
                    <option value="alert">Alert (Rose)</option>
                    <option value="success">Success (Teal)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="font-medium text-slate-600 block mb-1">Banner Title</label>
                  <input
                    type="text"
                    value={announcementForm.title}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                    placeholder="e.g. Annual IoT Hackathon 2026"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-medium text-slate-600 block mb-1">Message</label>
                  <input
                    type="text"
                    value={announcementForm.message}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                    placeholder="e.g. Registrations open now for all departments."
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                Broadcast Announcement
              </button>
            </form>
          </div>

          {/* Lab Operational Status Manager */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">IoT Lab Operational Status Broadcast</h3>
              </div>
              <span className="text-xs font-mono text-emerald-700 font-bold">Real-time Lab State</span>
            </div>

            <form onSubmit={handleSaveLabBroadcast} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-medium text-slate-600 block mb-1">Lab Status</label>
                  <select
                    value={labBroadcastForm.status}
                    onChange={(e) => setLabBroadcastForm({ ...labBroadcastForm, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                  >
                    <option value="OPEN">OPEN (Normal Hours)</option>
                    <option value="RESTRICTED">RESTRICTED (Hackathon Prep)</option>
                    <option value="MAINTENANCE">MAINTENANCE (Asset Count)</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium text-slate-600 block mb-1">Operating Hours</label>
                  <input
                    type="text"
                    value={labBroadcastForm.operatingHours}
                    onChange={(e) => setLabBroadcastForm({ ...labBroadcastForm, operatingHours: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-600 block mb-1">Lab In-Charge</label>
                  <input
                    type="text"
                    value={labBroadcastForm.inChargeName}
                    onChange={(e) => setLabBroadcastForm({ ...labBroadcastForm, inChargeName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-600 block mb-1">Status Message for Students</label>
                <input
                  type="text"
                  value={labBroadcastForm.customMessage}
                  onChange={(e) => setLabBroadcastForm({ ...labBroadcastForm, customMessage: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                Update Lab Broadcast
              </button>
            </form>
          </div>

          {/* Club Branding & Institutional Details */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">Club Institutional Branding & Metadata</h3>
              <span className="text-xs font-mono text-emerald-700 font-bold">Institution Configuration</span>
            </div>

            <form onSubmit={handleSaveClubMeta} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-600 block mb-1">Club Name</label>
                  <input
                    type="text"
                    value={clubMetaForm.clubName}
                    onChange={(e) => setClubMetaForm({ ...clubMetaForm, clubName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-600 block mb-1">College / Institution</label>
                  <input
                    type="text"
                    value={clubMetaForm.collegeName}
                    onChange={(e) => setClubMetaForm({ ...clubMetaForm, collegeName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-600 block mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={clubMetaForm.email}
                    onChange={(e) => setClubMetaForm({ ...clubMetaForm, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-600 block mb-1">GitHub Organization</label>
                  <input
                    type="text"
                    value={clubMetaForm.githubOrg}
                    onChange={(e) => setClubMetaForm({ ...clubMetaForm, githubOrg: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-600 block mb-1">Laboratory Location & Address</label>
                <input
                  type="text"
                  value={clubMetaForm.address}
                  onChange={(e) => setClubMetaForm({ ...clubMetaForm, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                >
                  Save Institutional Config
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Reset application to default initial demo dataset?")) {
                      resetDemoState();
                      alert("Demo data has been restored to default.");
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-rose-700 font-bold text-xs transition cursor-pointer"
                >
                  Reset Demo Dataset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: EDIT CLUB METRICS */}
      {/* ========================================================================= */}
      {metricsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">Edit Club KPIs & Metrics</h3>
              </div>
              <button
                onClick={() => setMetricsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMetrics} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-600 block mb-1">Total Members</label>
                  <input
                    type="number"
                    value={metricsForm.totalMembers}
                    onChange={(e) => setMetricsForm({ ...metricsForm, totalMembers: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-600 block mb-1">Active Students</label>
                  <input
                    type="number"
                    value={metricsForm.activeStudents}
                    onChange={(e) => setMetricsForm({ ...metricsForm, activeStudents: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-600 block mb-1">Faculty Mentors</label>
                  <input
                    type="number"
                    value={metricsForm.facultyMentors}
                    onChange={(e) => setMetricsForm({ ...metricsForm, facultyMentors: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-600 block mb-1">Active Projects</label>
                  <input
                    type="number"
                    value={metricsForm.activeProjects}
                    onChange={(e) => setMetricsForm({ ...metricsForm, activeProjects: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-600 block mb-1">Completed Projects</label>
                  <input
                    type="number"
                    value={metricsForm.completedProjects}
                    onChange={(e) => setMetricsForm({ ...metricsForm, completedProjects: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-600 block mb-1">Hardware Assets</label>
                  <input
                    type="number"
                    value={metricsForm.hardwareAssets}
                    onChange={(e) => setMetricsForm({ ...metricsForm, hardwareAssets: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-600 block mb-1">Currently Issued</label>
                  <input
                    type="number"
                    value={metricsForm.currentlyIssued}
                    onChange={(e) => setMetricsForm({ ...metricsForm, currentlyIssued: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-600 block mb-1">GitHub Commits</label>
                  <input
                    type="number"
                    value={metricsForm.gitHubCommits}
                    onChange={(e) => setMetricsForm({ ...metricsForm, gitHubCommits: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleAutoCalcMetrics}
                  className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-bold"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Auto Calculate</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      resetClubMetrics();
                      setMetricsModalOpen(false);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                  >
                    Reset Defaults
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD / EDIT CANDIDATE */}
      {/* ========================================================================= */}
      {candidateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full space-y-4 shadow-xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base">
                {isEditingCandidate ? "Edit Candidate Profile" : "Add New Candidate"}
              </h3>
              <button onClick={() => setCandidateModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCandidate} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-600 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={candidateForm.fullName}
                    onChange={(e) => setCandidateForm({ ...candidateForm, fullName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    placeholder="e.g. Vikas Narayanan"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-600 block mb-1">Roll Number *</label>
                  <input
                    type="text"
                    required
                    value={candidateForm.rollNumber}
                    onChange={(e) => setCandidateForm({ ...candidateForm, rollNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                    placeholder="e.g. 24EE029"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-600 block mb-1">Department</label>
                  <select
                    value={candidateForm.department}
                    onChange={(e) => setCandidateForm({ ...candidateForm, department: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Electrical & Electronics">Electrical & Electronics</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium text-slate-600 block mb-1">Pipeline Stage</label>
                  <select
                    value={candidateForm.status}
                    onChange={(e) => setCandidateForm({ ...candidateForm, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold font-mono"
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
                <div>
                  <label className="font-medium text-slate-600 block mb-1">College Email</label>
                  <input
                    type="email"
                    value={candidateForm.collegeEmail}
                    onChange={(e) => setCandidateForm({ ...candidateForm, collegeEmail: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    placeholder="student@siet.ac.in"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-600 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={candidateForm.phone}
                    onChange={(e) => setCandidateForm({ ...candidateForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-600 block mb-1">Interests (Comma-separated)</label>
                <input
                  type="text"
                  value={candidateForm.interests.join(", ")}
                  onChange={(e) =>
                    setCandidateForm({
                      ...candidateForm,
                      interests: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  placeholder="Embedded Systems, LoRa, ESP32, Robotics"
                />
              </div>

              <div>
                <label className="font-medium text-slate-600 block mb-1">Why Join / Statement</label>
                <textarea
                  rows={2}
                  value={candidateForm.whyJoin}
                  onChange={(e) => setCandidateForm({ ...candidateForm, whyJoin: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  placeholder="Motivation to join IoT Club..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCandidateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs"
                >
                  {isEditingCandidate ? "Save Updates" : "Add Candidate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CANDIDATE REVIEW & DETAILS MODAL */}
      {/* ========================================================================= */}
      {candidateDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">{candidateDetailModal.fullName}</h3>
                <p className="text-xs text-slate-500 font-mono">
                  {candidateDetailModal.department} • {candidateDetailModal.rollNumber}
                </p>
              </div>
              <button onClick={() => setCandidateDetailModal(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <div>Email: <span className="font-semibold text-slate-900">{candidateDetailModal.collegeEmail || "—"}</span></div>
                <div>Phone: <span className="font-semibold text-slate-900">{candidateDetailModal.phone || "—"}</span></div>
                <div>Batch: <span className="font-mono text-emerald-700 font-bold">{candidateDetailModal.batch}</span></div>
                <div>Applied: <span className="text-slate-500 font-mono">{candidateDetailModal.appliedDate}</span></div>
              </div>

              <div>
                <span className="font-bold text-slate-900 block mb-1">Interests:</span>
                <div className="flex flex-wrap gap-1">
                  {candidateDetailModal.interests.map((it, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono">
                      {it}
                    </span>
                  ))}
                </div>
              </div>

              {candidateDetailModal.whyJoin && (
                <div>
                  <span className="font-bold text-slate-900 block mb-1">Statement of Purpose:</span>
                  <p className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 leading-relaxed">
                    {candidateDetailModal.whyJoin}
                  </p>
                </div>
              )}

              {/* Review Notes Editor */}
              <div className="space-y-1">
                <label className="font-bold text-slate-900 block">Evaluator / Interview Notes:</label>
                <textarea
                  rows={3}
                  defaultValue={candidateDetailModal.reviewNotes || ""}
                  id="admin-review-notes"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-emerald-500"
                  placeholder="Record assessment scores, interview evaluation remarks, or task feedback..."
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 font-mono">Move Stage:</span>
                  <select
                    value={candidateDetailModal.status}
                    onChange={(e) => {
                      updateApplicationStatus(candidateDetailModal.id, e.target.value as any);
                      setCandidateDetailModal({ ...candidateDetailModal, status: e.target.value as any });
                    }}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono font-bold text-emerald-800"
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

                <button
                  onClick={() => {
                    const notesEl = document.getElementById("admin-review-notes") as HTMLTextAreaElement;
                    if (notesEl) {
                      updateApplication(candidateDetailModal.id, { reviewNotes: notesEl.value });
                    }
                    setCandidateDetailModal(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  Save Notes & Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: ADD / EDIT HARDWARE ASSET */}
      {/* ========================================================================= */}
      {hardwareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base">
                {isEditingHardware ? `Edit Equipment #${hardwareForm.assetId}` : "Add New Hardware Asset"}
              </h3>
              <button onClick={() => setHardwareModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveHardware} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-600 block mb-1">Asset ID *</label>
                  <input
                    type="text"
                    required
                    value={hardwareForm.assetId}
                    onChange={(e) => setHardwareForm({ ...hardwareForm, assetId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                    placeholder="e.g. ESP030"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-600 block mb-1">Category</label>
                  <select
                    value={hardwareForm.category}
                    onChange={(e) => setHardwareForm({ ...hardwareForm, category: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="Microcontroller">Microcontroller</option>
                    <option value="Single Board Computer">Single Board Computer</option>
                    <option value="Sensor">Sensor</option>
                    <option value="Wireless & RF">Wireless & RF</option>
                    <option value="Actuator">Actuator</option>
                    <option value="Testing Equipment">Testing Equipment</option>
                    <option value="Tooling">Tooling</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-600 block mb-1">Equipment Name *</label>
                <input
                  type="text"
                  required
                  value={hardwareForm.name}
                  onChange={(e) => setHardwareForm({ ...hardwareForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  placeholder="e.g. ESP32-S3 DevKitC-1 N16R8"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-600 block mb-1">Model</label>
                  <input
                    type="text"
                    value={hardwareForm.model}
                    onChange={(e) => setHardwareForm({ ...hardwareForm, model: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    placeholder="e.g. ESP32-S3-WROOM-1"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-600 block mb-1">Serial Number</label>
                  <input
                    type="text"
                    value={hardwareForm.serialNumber}
                    onChange={(e) => setHardwareForm({ ...hardwareForm, serialNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-600 block mb-1">Shelf / Cabinet Location</label>
                  <input
                    type="text"
                    value={hardwareForm.location}
                    onChange={(e) => setHardwareForm({ ...hardwareForm, location: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    placeholder="e.g. IoT Lab Shelf B2"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-600 block mb-1">Condition</label>
                  <select
                    value={hardwareForm.condition}
                    onChange={(e) => setHardwareForm({ ...hardwareForm, condition: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                  >
                    <option value="EXCELLENT">EXCELLENT</option>
                    <option value="GOOD">GOOD</option>
                    <option value="FAIR">FAIR</option>
                    <option value="FAULTY">FAULTY</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium text-slate-600 block mb-1">Status</label>
                  <select
                    value={hardwareForm.status}
                    onChange={(e) => setHardwareForm({ ...hardwareForm, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-800"
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="ISSUED">ISSUED</option>
                    <option value="RESERVED">RESERVED</option>
                    <option value="UNDER_TESTING">UNDER_TESTING</option>
                    <option value="DAMAGED">DAMAGED</option>
                    <option value="UNDER_REPAIR">UNDER_REPAIR</option>
                    <option value="RETIRED">RETIRED</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium text-slate-600 block mb-1">Current Holder</label>
                  <input
                    type="text"
                    value={hardwareForm.currentHolder || ""}
                    onChange={(e) => setHardwareForm({ ...hardwareForm, currentHolder: e.target.value || undefined })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    placeholder="Leave empty if Available"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-600 block mb-1">Specs (Comma-separated)</label>
                <input
                  type="text"
                  value={hardwareForm.specs.join(", ")}
                  onChange={(e) =>
                    setHardwareForm({
                      ...hardwareForm,
                      specs: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setHardwareModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs"
                >
                  {isEditingHardware ? "Save Equipment" : "Add to Inventory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: DIRECT ASSIGN HARDWARE */}
      {/* ========================================================================= */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base">Direct Assign Asset #{assignAssetId}</h3>
              <button onClick={() => setAssignModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmDirectAssign} className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-slate-600 block mb-1">Student / Holder Name</label>
                <input
                  type="text"
                  required
                  value={assignStudentName}
                  onChange={(e) => setAssignStudentName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="font-medium text-slate-600 block mb-1">Project Allocation</label>
                <input
                  type="text"
                  required
                  value={assignProject}
                  onChange={(e) => setAssignProject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="font-medium text-slate-600 block mb-1">Duration (Days)</label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={assignDays}
                  onChange={(e) => setAssignDays(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs"
                >
                  Confirm Checkout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: ADD / EDIT USER & ROLE */}
      {/* ========================================================================= */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base">
                {isEditingUser ? "Edit User Profile" : "Register New Club Member / Staff"}
              </h3>
              <button onClick={() => setUserModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-slate-600 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="font-medium text-slate-600 block mb-1">Email ID *</label>
                <input
                  type="email"
                  required
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-600 block mb-1">Role</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                  >
                    <option value="STUDENT">STUDENT</option>
                    <option value="CLUB_LEAD">CLUB_LEAD</option>
                    <option value="TEACHER">TEACHER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium text-slate-600 block mb-1">Roll Number</label>
                  <input
                    type="text"
                    value={userForm.rollNumber || ""}
                    onChange={(e) => setUserForm({ ...userForm, rollNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-600 block mb-1">Department</label>
                <input
                  type="text"
                  value={userForm.department}
                  onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="font-medium text-slate-600 block mb-1">Designation</label>
                <input
                  type="text"
                  value={userForm.designation || ""}
                  onChange={(e) => setUserForm({ ...userForm, designation: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs"
                >
                  {isEditingUser ? "Save User" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: ADD / EDIT PROJECT */}
      {/* ========================================================================= */}
      {projectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base">
                {isEditingProject ? "Edit Project Details" : "Register New Project"}
              </h3>
              <button onClick={() => setProjectModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-slate-600 block mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  value={projectForm.title || ""}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="font-medium text-slate-600 block mb-1">Tagline</label>
                <input
                  type="text"
                  value={projectForm.tagline || ""}
                  onChange={(e) => setProjectForm({ ...projectForm, tagline: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-600 block mb-1">Category</label>
                  <select
                    value={projectForm.category}
                    onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
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
                  <label className="font-medium text-slate-600 block mb-1">Lifecycle Stage</label>
                  <select
                    value={projectForm.lifecycle}
                    onChange={(e) => setProjectForm({ ...projectForm, lifecycle: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                  >
                    <option value="IDEA">IDEA</option>
                    <option value="PROPOSAL">PROPOSAL</option>
                    <option value="REVIEW">REVIEW</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="PROTOTYPE">PROTOTYPE</option>
                    <option value="DEVELOPMENT">DEVELOPMENT</option>
                    <option value="TESTING">TESTING</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium text-slate-600 block mb-1">Project Lead</label>
                  <input
                    type="text"
                    value={projectForm.leadName || ""}
                    onChange={(e) => setProjectForm({ ...projectForm, leadName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-600 block mb-1">Faculty Mentor</label>
                  <input
                    type="text"
                    value={projectForm.facultyMentor || ""}
                    onChange={(e) => setProjectForm({ ...projectForm, facultyMentor: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setProjectModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs"
                >
                  {isEditingProject ? "Save Project" : "Register Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 8: ADD MANUAL AUDIT LOG ENTRY */}
      {/* ========================================================================= */}
      {manualAuditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base">Record Administrative Audit Entry</h3>
              <button onClick={() => setManualAuditModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveManualAudit} className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-slate-600 block mb-1">Action Name</label>
                <input
                  type="text"
                  required
                  value={manualAction}
                  onChange={(e) => setManualAction(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-medium text-slate-600 block mb-1">Entity / Category</label>
                <input
                  type="text"
                  required
                  value={manualEntity}
                  onChange={(e) => setManualEntity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-medium text-slate-600 block mb-1">Inspection / Incident Details</label>
                <textarea
                  rows={3}
                  required
                  value={manualDetails}
                  onChange={(e) => setManualDetails(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs"
                  placeholder="e.g. Physical inventory verification completed by faculty coordinator. All 268 assets accounted for."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setManualAuditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs"
                >
                  Sign & Commit Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
