"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  DemoRole,
  UserProfile,
  Application,
  ApplicationStatus,
  LearningTrack,
  SkillNode,
  XPTransaction,
  HardwareAsset,
  HardwareRequest,
  LabResource,
  LabBooking,
  Project,
  ProjectTask,
  ProjectReviewRound,
  TeamRecruitmentPost,
  MonthlyChallenge,
  ClubEvent,
  HackathonOpportunity,
  CertificateRecord,
  TelemetryData,
  AuditLogItem,
  AppNotification,
  AssignmentSubmission,
  AuthUser,
  AuthRole,
  AuthSession,
} from "./types";
import {
  initialDemoStudent,
  initialApplications,
  initialLearningTracks,
  initialSkillNodes,
  initialXPTransactions,
  initialProjects,
  initialHardwareAssets,
  initialHardwareRequests,
  initialLabResources,
  initialLabBookings,
  initialClubEvents,
  initialHackathons,
  initialCertificates,
  initialMonthlyChallenges,
  initialTelemetry,
  initialAuditLogs,
  initialTeamRecruitments,
  initialNotifications,
} from "./mockData";

export interface StoredUserCredential {
  user: AuthUser;
  passwordHash: string;
}

export const initialAuthUsers: StoredUserCredential[] = [
  {
    user: {
      id: "usr-std-001",
      name: "Hari Dharanesh S P",
      email: "hari.23ec@siet.ac.in",
      role: "STUDENT",
      department: "Information Technology & Embedded Systems",
      rollNumber: "727723EUIT045",
      designation: "Student Member (Level 4 Builder)",
      portalRedirect: "/dashboard",
    },
    passwordHash: "student123",
  },
  {
    user: {
      id: "usr-fac-001",
      name: "Dr. K. Swaminathan",
      email: "swaminathan.faculty@siet.ac.in",
      role: "TEACHER",
      department: "Electronics & Communication Engineering",
      designation: "Faculty Coordinator & Evaluator",
      portalRedirect: "/teacher",
    },
    passwordHash: "faculty123",
  },
  {
    user: {
      id: "usr-lead-001",
      name: "Hari Dharanesh S P (Official Lead)",
      email: "lead.iotclub@siet.ac.in",
      role: "CLUB_LEAD",
      department: "IoT Technical Innovation Council",
      designation: "Club Technical Lead & Project Lead",
      portalRedirect: "/projects",
    },
    passwordHash: "clublead123",
  },
  {
    user: {
      id: "usr-adm-001",
      name: "Prof. R. Soundararajan",
      email: "admin.iot@siet.ac.in",
      role: "ADMIN",
      department: "Center for Innovation, Research & Lab Governance",
      designation: "Super Administrator & Lab In-charge",
      portalRedirect: "/admin",
    },
    passwordHash: "admin123",
  },
];

interface IoTAppContextType {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  loginWithCollegeEmail: (
    email: string,
    password: string
  ) => { success: boolean; error?: string; redirectUrl?: string; user?: AuthUser };
  registerStudent: (data: {
    email: string;
    password: string;
    name: string;
    rollNumber: string;
    department: string;
  }) => { success: boolean; error?: string; redirectUrl?: string };
  logout: () => void;
  demoRole: DemoRole;
  setDemoRole: (role: DemoRole) => void;
  student: UserProfile;
  updateStudentProfile: (updates: Partial<UserProfile>) => void;
  applications: Application[];
  submitApplication: (appData: Omit<Application, "id" | "appliedDate" | "status" | "batch">) => string;
  updateApplicationStatus: (appId: string, status: ApplicationStatus, notes?: string) => void;
  tracks: LearningTrack[];
  submitAssignment: (moduleId: string, data: { githubRepo: string; demoUrl: string; documentationText: string }) => void;
  evaluateSubmission: (
    submissionId: string,
    studentId: string,
    scores: { [criteria: string]: number },
    feedback: string,
    passed: boolean
  ) => void;
  submissions: AssignmentSubmission[];
  skills: SkillNode[];
  xpTransactions: XPTransaction[];
  projects: Project[];
  addNewProject: (project: Omit<Project, "id">) => Project;
  addProjectTask: (projectId: string, task: Omit<ProjectTask, "id" | "projectId">) => void;
  updateTaskStatus: (projectId: string, taskId: string, status: ProjectTask["status"]) => void;
  addOrUpdateProjectReview: (projectId: string, review: ProjectReviewRound) => void;
  toggleProjectLock: (projectId: string) => void;
  testGitHubRepo: (projectId: string) => void;
  teamRecruitments: TeamRecruitmentPost[];
  applyToTeam: (postId: string, studentName: string, role: string) => void;
  hardwareAssets: HardwareAsset[];
  hardwareRequests: HardwareRequest[];
  requestHardware: (assetId: string, project: string, purpose: string, durationDays: number) => void;
  approveHardwareRequest: (requestId: string) => void;
  rejectHardwareRequest: (requestId: string) => void;
  returnHardware: (assetId: string) => void;
  labResources: LabResource[];
  labBookings: LabBooking[];
  bookLabResource: (resourceId: string, date: string, startTime: string, endTime: string, project: string) => boolean;
  events: ClubEvent[];
  registerForEvent: (eventId: string) => void;
  rotateAttendanceToken: (eventId: string) => string;
  hackathons: HackathonOpportunity[];
  updateHackathonStatus: (id: string, status: HackathonOpportunity["teamStatus"]) => void;
  certificates: CertificateRecord[];
  monthlyChallenges: MonthlyChallenge[];
  registerForChallenge: (challengeId: string) => void;
  telemetry: TelemetryData;
  auditLogs: AuditLogItem[];
  notifications: AppNotification[];
  markNotificationAsRead: (id: string) => void;
  resetDemoState: () => void;
}

const IoTAppContext = createContext<IoTAppContextType | undefined>(undefined);

export function IoTAppProvider({ children }: { children: React.ReactNode }) {
  const [authUsers, setAuthUsers] = useState<StoredUserCredential[]>(initialAuthUsers);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [demoRole, setDemoRoleState] = useState<DemoRole>("public");
  const [student, setStudent] = useState<UserProfile>(initialDemoStudent);
  const [applications, setApplications] = useState<Application[]>(initialApplications);

  // Initialize session from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("iot_auth_user");
        if (saved) {
          const parsed = JSON.parse(saved) as AuthUser;
          setCurrentUser(parsed);
          if (parsed.role === "STUDENT") setDemoRoleState("student");
          else if (parsed.role === "TEACHER") setDemoRoleState("teacher");
          else if (parsed.role === "ADMIN") setDemoRoleState("admin");
          else if (parsed.role === "CLUB_LEAD") setDemoRoleState("student");
        } else {
          setDemoRoleState("public");
        }
      } catch (err) {
        console.error("Auth session load error:", err);
      }
    }
  }, []);

  // Login with College Email
  const loginWithCollegeEmail = useCallback(
    (email: string, password: string) => {
      const cleanEmail = email.trim().toLowerCase();
      const matched = authUsers.find(
        (u) => u.user.email.toLowerCase() === cleanEmail && u.passwordHash === password
      );

      if (!matched) {
        return {
          success: false,
          error: "Invalid College Email ID or password. Please verify your credentials.",
        };
      }

      setCurrentUser(matched.user);
      if (typeof window !== "undefined") {
        localStorage.setItem("iot_auth_user", JSON.stringify(matched.user));
      }

      // Sync role
      if (matched.user.role === "STUDENT") setDemoRoleState("student");
      else if (matched.user.role === "TEACHER") setDemoRoleState("teacher");
      else if (matched.user.role === "ADMIN") setDemoRoleState("admin");
      else if (matched.user.role === "CLUB_LEAD") setDemoRoleState("student");

      const logItem: AuditLogItem = {
        id: `log-${Date.now()}`,
        user: matched.user.name,
        action: "USER_AUTHENTICATED",
        entity: "AuthSession",
        entityId: matched.user.id,
        timestamp: new Date().toLocaleString(),
        details: `Signed in as ${matched.user.role} (${matched.user.email})`,
      };
      setAuditLogs((prev) => [logItem, ...prev]);

      return {
        success: true,
        redirectUrl: matched.user.portalRedirect,
        user: matched.user,
      };
    },
    [authUsers]
  );

  // Register Student with College Email
  const registerStudent = useCallback(
    (data: {
      email: string;
      password: string;
      name: string;
      rollNumber: string;
      department: string;
    }) => {
      const cleanEmail = data.email.trim().toLowerCase();
      if (!cleanEmail.includes("@") || (!cleanEmail.endsWith(".siet.ac.in") && !cleanEmail.endsWith("@siet.ac.in"))) {
        return {
          success: false,
          error: "Please use your official Sri Shakthi Institute of Engineering and Technology email (@siet.ac.in).",
        };
      }

      const existing = authUsers.find((u) => u.user.email.toLowerCase() === cleanEmail);
      if (existing) {
        return {
          success: false,
          error: "An account with this college email already exists. Please sign in.",
        };
      }

      const newAuthUser: AuthUser = {
        id: `usr-std-${Date.now().toString(36)}`,
        name: data.name.trim(),
        email: cleanEmail,
        role: "STUDENT",
        department: data.department.trim() || "Information Technology",
        rollNumber: data.rollNumber.trim(),
        designation: "Student Member (Level 1 Novice)",
        portalRedirect: "/dashboard",
      };

      const newCredential: StoredUserCredential = {
        user: newAuthUser,
        passwordHash: data.password,
      };

      setAuthUsers((prev) => [...prev, newCredential]);
      setCurrentUser(newAuthUser);
      setDemoRoleState("student");

      if (typeof window !== "undefined") {
        localStorage.setItem("iot_auth_user", JSON.stringify(newAuthUser));
      }

      const logItem: AuditLogItem = {
        id: `log-${Date.now()}`,
        user: newAuthUser.name,
        action: "STUDENT_REGISTERED",
        entity: "AuthUser",
        entityId: newAuthUser.id,
        timestamp: new Date().toLocaleString(),
        details: `Registered new student account with college email ${newAuthUser.email}`,
      };
      setAuditLogs((prev) => [logItem, ...prev]);

      return {
        success: true,
        redirectUrl: "/dashboard",
      };
    },
    [authUsers]
  );

  // Logout
  const logout = useCallback(() => {
    setCurrentUser(null);
    setDemoRoleState("public");
    if (typeof window !== "undefined") {
      localStorage.removeItem("iot_auth_user");
    }
  }, []);
  const [tracks, setTracks] = useState<LearningTrack[]>(initialLearningTracks);
  const [skills, setSkills] = useState<SkillNode[]>(initialSkillNodes);
  const [xpTransactions, setXpTransactions] = useState<XPTransaction[]>(initialXPTransactions);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [teamRecruitments, setTeamRecruitments] = useState<TeamRecruitmentPost[]>(initialTeamRecruitments);
  const [hardwareAssets, setHardwareAssets] = useState<HardwareAsset[]>(initialHardwareAssets);
  const [hardwareRequests, setHardwareRequests] = useState<HardwareRequest[]>(initialHardwareRequests);
  const [labResources] = useState<LabResource[]>(initialLabResources);
  const [labBookings, setLabBookings] = useState<LabBooking[]>(initialLabBookings);
  const [events, setEvents] = useState<ClubEvent[]>(initialClubEvents);
  const [hackathons, setHackathons] = useState<HackathonOpportunity[]>(initialHackathons);
  const [certificates, setCertificates] = useState<CertificateRecord[]>(initialCertificates);
  const [monthlyChallenges, setMonthlyChallenges] = useState<MonthlyChallenge[]>(initialMonthlyChallenges);
  const [telemetry, setTelemetry] = useState<TelemetryData>(initialTelemetry);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(initialAuditLogs);
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([
    {
      id: "sub-01",
      assignmentId: "asg-202",
      studentId: "std-001",
      studentName: "Hari Dharanesh SP",
      studentRoll: "22IOT042",
      githubRepo: "https://github.com/hari-iot/esp32-mqtt-light-control",
      demoUrl: "https://youtube.com/watch?v=demo-esp32-mqtt",
      circuitDiagramUrl: "https://iotclub.org/schematics/esp32_bh1750_relay.png",
      documentationText: "Implemented dual-core FreeRTOS tasks: Core 0 handles Wi-Fi stack & Mosquitto client with QoS 1, Core 1 handles I2C light sampling from BH1750 (0x23) and relay switching with hysteresis.",
      submittedAt: "2026-09-12 11:20",
      status: "PENDING",
    },
  ]);

  // Load safe demo role preference from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedRole = localStorage.getItem("iot_demo_role") as DemoRole | null;
      if (savedRole) {
        setDemoRoleState(savedRole);
      }
    }
  }, []);

  const setDemoRole = useCallback((role: DemoRole) => {
    setDemoRoleState(role);
    if (typeof window !== "undefined") {
      localStorage.setItem("iot_demo_role", role);
    }
  }, []);

  // Live IoT Telemetry Simulator (ticks every 4 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry((prev) => {
        const deltaTemp = (Math.random() - 0.5) * 0.4;
        const deltaHumid = Math.round((Math.random() - 0.5) * 2);
        const deltaPower = (Math.random() - 0.5) * 0.08;
        const newTemp = +(prev.temperatureC + deltaTemp).toFixed(1);
        const newHumid = Math.max(30, Math.min(90, prev.humidityPercent + deltaHumid));
        const newPower = +(Math.max(1.2, prev.powerConsumptionKw + deltaPower)).toFixed(2);
        const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        const updatedHistory = [...prev.deviceHistory.slice(1), { time: nowTime, temp: newTemp, power: newPower }];

        return {
          ...prev,
          temperatureC: newTemp,
          humidityPercent: newHumid,
          powerConsumptionKw: newPower,
          lastUpdated: new Date().toISOString(),
          deviceHistory: updatedHistory,
        };
      });
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  // Recalculate Student Total XP from Transactions
  useEffect(() => {
    const totalXP = xpTransactions
      .filter((t) => t.userId === student.id)
      .reduce((sum, t) => sum + t.amount, 0);

    setStudent((prev) => ({
      ...prev,
      xp: totalXP,
    }));
  }, [xpTransactions, student.id]);

  // Update Student Profile
  const updateStudentProfile = useCallback((updates: Partial<UserProfile>) => {
    setStudent((prev) => ({ ...prev, ...updates }));
  }, []);

  // Submit Application Action
  const submitApplication = useCallback(
    (appData: Omit<Application, "id" | "appliedDate" | "status" | "batch">) => {
      const newId = `APP-2026-00${applications.length + 1}`;
      const newApp: Application = {
        ...appData,
        id: newId,
        appliedDate: new Date().toISOString().split("T")[0],
        status: "SUBMITTED",
        batch: "2026 Batch 01",
      };

      setApplications((prev) => [newApp, ...prev]);

      // Add audit log
      const logItem: AuditLogItem = {
        id: `log-${Date.now()}`,
        user: appData.fullName,
        action: "APPLICATION_SUBMITTED",
        entity: "Application",
        entityId: newId,
        timestamp: new Date().toLocaleString(),
        details: `Application submitted for 2026 Batch 01 by ${appData.fullName} (${appData.rollNumber})`,
      };
      setAuditLogs((prev) => [logItem, ...prev]);

      return newId;
    },
    [applications.length]
  );

  // Update Application Kanban Status
  const updateApplicationStatus = useCallback((appId: string, status: ApplicationStatus, notes?: string) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, status, reviewNotes: notes || app.reviewNotes } : app))
    );

    const logItem: AuditLogItem = {
      id: `log-${Date.now()}`,
      user: "Admin / Evaluator",
      action: "RECRUITMENT_STATUS_UPDATED",
      entity: "Application",
      entityId: appId,
      timestamp: new Date().toLocaleString(),
      details: `Application ${appId} moved to stage ${status}`,
    };
    setAuditLogs((prev) => [logItem, ...prev]);
  }, []);

  // Submit Assignment
  const submitAssignment = useCallback(
    (moduleId: string, data: { githubRepo: string; demoUrl: string; documentationText: string }) => {
      const newSub: AssignmentSubmission = {
        id: `sub-${Date.now()}`,
        assignmentId: "asg-202",
        studentId: student.id,
        studentName: student.name,
        studentRoll: student.rollNumber,
        githubRepo: data.githubRepo,
        demoUrl: data.demoUrl,
        documentationText: data.documentationText,
        submittedAt: new Date().toLocaleString(),
        status: "PENDING",
      };

      setSubmissions((prev) => [newSub, ...prev]);

      const logItem: AuditLogItem = {
        id: `log-${Date.now()}`,
        user: student.name,
        action: "ASSIGNMENT_SUBMITTED",
        entity: "AssignmentSubmission",
        entityId: newSub.id,
        timestamp: new Date().toLocaleString(),
        details: `Submitted assignment for Module ${moduleId}`,
      };
      setAuditLogs((prev) => [logItem, ...prev]);
    },
    [student]
  );

  // Teacher / Mentor Evaluates Assignment
  const evaluateSubmission = useCallback(
    (assignmentId: string, studentId: string, scores: { [criteria: string]: number }, feedback: string, passed: boolean) => {
      const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
      const xpToAward = passed ? 100 : 20;

      setSubmissions((prev) =>
        prev.map((sub) => {
          if (sub.assignmentId === assignmentId && sub.studentId === studentId) {
            return {
              ...sub,
              status: "EVALUATED",
              evaluation: {
                evaluatedBy: "Faculty Mentor",
                evaluatedAt: new Date().toLocaleString(),
                scores,
                totalScore,
                feedback,
                passed,
                xpAwarded: xpToAward,
                badgeAwarded: passed ? "ESP32 Developer" : undefined,
              },
            };
          }
          return sub;
        })
      );

      // Add XP transaction
      const newXP: XPTransaction = {
        id: `xp-${Date.now()}`,
        userId: studentId,
        amount: xpToAward,
        reason: `Evaluated ESP32 Practical Assignment (${totalScore}/100)`,
        category: "ASSIGNMENT",
        timestamp: new Date().toISOString().split("T")[0],
      };
      setXpTransactions((prev) => [newXP, ...prev]);

      // Add notification for student
      const notif: AppNotification = {
        id: `notif-${Date.now()}`,
        title: "Assignment Evaluated",
        message: `Your ESP32 practical was scored ${totalScore}/100. ${passed ? "Passed! +100 XP awarded." : "Please review feedback."}`,
        type: "ASSIGNMENT",
        timestamp: "Just now",
        read: false,
      };
      setNotifications((prev) => [notif, ...prev]);

      // Add audit log
      const logItem: AuditLogItem = {
        id: `log-${Date.now()}`,
        user: "Faculty Mentor",
        action: "SUBMISSION_EVALUATED",
        entity: "AssignmentSubmission",
        entityId: assignmentId,
        timestamp: new Date().toLocaleString(),
        details: `Scored ${totalScore}/100. Status: ${passed ? "PASSED" : "NEEDS_IMPROVEMENT"}`,
      };
      setAuditLogs((prev) => [logItem, ...prev]);
    },
    []
  );

  // Add Project Task
  const addProjectTask = useCallback((projectId: string, task: Omit<ProjectTask, "id" | "projectId">) => {
    const newTask: ProjectTask = {
      ...task,
      id: `tsk-${Date.now()}`,
      projectId,
    };
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, tasks: [newTask, ...p.tasks] } : p))
    );
  }, []);

  // Update Project Task Status
  const updateTaskStatus = useCallback((projectId: string, taskId: string, status: ProjectTask["status"]) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            tasks: p.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
          };
        }
        return p;
      })
    );
  }, []);

  // Add New Project
  const addNewProject = useCallback(
    (projectData: Omit<Project, "id">) => {
      const newId = `prj-${Date.now().toString(36)}`;
      const newProject: Project = {
        ...projectData,
        id: newId,
        tasks: projectData.tasks || [],
        reviews: projectData.reviews || [
          {
            id: `rev-r1-${Date.now()}`,
            roundKey: "R1",
            roundTitle: "R1 First Review (Round 1) Evaluation",
            status: "PENDING",
            feedback: "First Review has not been conducted yet. Feedback and action items will be updated here live once evaluated.",
            actionItems: [],
            rubricScores: [
              { criterion: "Problem Statement & Theme Relevance", score: 0, maxScore: 10 },
              { criterion: "Hardware BOM & Circuit Feasibility", score: 0, maxScore: 10 },
              { criterion: "Git Workflow & Commit Attribution", score: 0, maxScore: 10 },
              { criterion: "System Architecture & Documentation", score: 0, maxScore: 10 },
            ],
          },
          {
            id: `rev-r2-${Date.now()}`,
            roundKey: "R2",
            roundTitle: "R2 Mid-Stage / Prototype Evaluation",
            status: "PENDING",
            feedback: "Mid-stage prototype demonstration scheduled following Round 1 sign-off.",
            actionItems: [],
          },
          {
            id: `rev-final-${Date.now()}`,
            roundKey: "FINAL",
            roundTitle: "Final Evaluations",
            status: "PENDING",
            feedback: "Final evaluation rubric opens during Demo Day judging.",
            actionItems: [],
          },
        ],
        submissionFiles: projectData.submissionFiles || [],
        resourceLinks: projectData.resourceLinks || [],
        defaultBranch: projectData.defaultBranch || "main",
        totalCommits: projectData.totalCommits || 1,
        openIssues: projectData.openIssues || 0,
        sourceAuditStatus: projectData.sourceAuditStatus || "Verified ✓",
        languageBreakdown: projectData.languageBreakdown || [
          { name: "C++", percentage: 65, color: "#ec4899" },
          { name: "Python", percentage: 35, color: "#3b82f6" },
        ],
      };

      setProjects((prev) => [newProject, ...prev]);

      const logItem: AuditLogItem = {
        id: `log-${Date.now()}`,
        user: student.name,
        action: "PROJECT_REGISTERED",
        entity: "Project",
        entityId: newId,
        timestamp: new Date().toLocaleString(),
        details: `Submitted new project "${newProject.title}" under ${newProject.category}.`,
      };
      setAuditLogs((prev) => [logItem, ...prev]);

      const notif: AppNotification = {
        id: `notif-${Date.now()}`,
        title: "Project Added to Portal",
        message: `Your project "${newProject.title}" has been registered and is pending R1 evaluation.`,
        type: "SYSTEM",
        timestamp: "Just now",
        read: false,
      };
      setNotifications((prev) => [notif, ...prev]);

      return newProject;
    },
    [student.name]
  );

  // Add or Update Project Review
  const addOrUpdateProjectReview = useCallback((projectId: string, review: ProjectReviewRound) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const currentReviews = p.reviews ? [...p.reviews] : [];
        const idx = currentReviews.findIndex((r) => r.roundKey === review.roundKey);
        if (idx >= 0) {
          currentReviews[idx] = { ...currentReviews[idx], ...review };
        } else {
          currentReviews.push(review);
        }
        return { ...p, reviews: currentReviews };
      })
    );

    const logItem: AuditLogItem = {
      id: `log-${Date.now()}`,
      user: review.reviewerName || "Faculty Evaluator",
      action: "PROJECT_REVIEWED",
      entity: "ProjectReview",
      entityId: projectId,
      timestamp: new Date().toLocaleString(),
      details: `${review.roundTitle}: Status updated to ${review.status}. Score: ${review.score || 0}/${review.maxScore || 10}`,
    };
    setAuditLogs((prev) => [logItem, ...prev]);

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: `Review Published: ${review.roundTitle}`,
      message: `Evaluation submitted with status: ${review.status}. Feedback and action items have been updated.`,
      type: "LEARNING",
      timestamp: "Just now",
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  }, []);

  // Toggle Project Lock
  const toggleProjectLock = useCallback((projectId: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, isLocked: !p.isLocked } : p))
    );
  }, []);

  // Test / Re-sync GitHub Repository
  const testGitHubRepo = useCallback((projectId: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          sourceAuditStatus: "Verified ✓",
          totalCommits: (p.totalCommits || 54) + 1,
        };
      })
    );
  }, []);

  // Apply to Open Team Position
  const applyToTeam = useCallback((postId: string, studentName: string, role: string) => {
    setTeamRecruitments((prev) =>
      prev.map((post) => (post.id === postId ? { ...post, applicantsCount: post.applicantsCount + 1 } : post))
    );
    const logItem: AuditLogItem = {
      id: `log-${Date.now()}`,
      user: studentName,
      action: "TEAM_APPLICATION_SUBMITTED",
      entity: "TeamRecruitmentPost",
      entityId: postId,
      timestamp: new Date().toLocaleString(),
      details: `${studentName} applied for ${role}`,
    };
    setAuditLogs((prev) => [logItem, ...prev]);
  }, []);

  // Hardware Request Action
  const requestHardware = useCallback(
    (assetId: string, project: string, purpose: string, durationDays: number) => {
      const asset = hardwareAssets.find((a) => a.assetId === assetId);
      const newReq: HardwareRequest = {
        id: `req-${Date.now()}`,
        assetId,
        assetName: asset?.name || assetId,
        studentId: student.id,
        studentName: student.name,
        project,
        purpose,
        durationDays,
        requestedAt: new Date().toISOString().split("T")[0],
        status: "PENDING",
      };

      setHardwareRequests((prev) => [newReq, ...prev]);

      // Set asset to RESERVED
      setHardwareAssets((prev) =>
        prev.map((a) => (a.assetId === assetId ? { ...a, status: "RESERVED" } : a))
      );

      const logItem: AuditLogItem = {
        id: `log-${Date.now()}`,
        user: student.name,
        action: "HARDWARE_REQUESTED",
        entity: "HardwareAsset",
        entityId: assetId,
        timestamp: new Date().toLocaleString(),
        details: `Requested ${asset?.name} for project ${project} (${durationDays} days)`,
      };
      setAuditLogs((prev) => [logItem, ...prev]);
    },
    [hardwareAssets, student]
  );

  // Approve Hardware Request
  const approveHardwareRequest = useCallback((requestId: string) => {
    const req = hardwareRequests.find((r) => r.id === requestId);
    if (!req) return;

    setHardwareRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: "APPROVED", approvedBy: "Faculty Mentor" } : r))
    );

    setHardwareAssets((prev) =>
      prev.map((a) => {
        if (a.assetId === req.assetId) {
          const returnDate = new Date();
          returnDate.setDate(returnDate.getDate() + req.durationDays);
          return {
            ...a,
            status: "ISSUED",
            currentHolder: req.studentName,
            currentHolderId: req.studentId,
            projectAllocation: req.project,
            issuedDate: new Date().toISOString().split("T")[0],
            expectedReturnDate: returnDate.toISOString().split("T")[0],
          };
        }
        return a;
      })
    );

    const logItem: AuditLogItem = {
      id: `log-${Date.now()}`,
      user: "Faculty Mentor",
      action: "HARDWARE_ISSUED",
      entity: "HardwareAsset",
      entityId: req.assetId,
      timestamp: new Date().toLocaleString(),
      details: `Approved checkout of ${req.assetName} to ${req.studentName}`,
    };
    setAuditLogs((prev) => [logItem, ...prev]);
  }, [hardwareRequests]);

  // Reject Hardware Request
  const rejectHardwareRequest = useCallback((requestId: string) => {
    const req = hardwareRequests.find((r) => r.id === requestId);
    if (!req) return;

    setHardwareRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: "REJECTED" } : r))
    );

    setHardwareAssets((prev) =>
      prev.map((a) => (a.assetId === req.assetId ? { ...a, status: "AVAILABLE" } : a))
    );
  }, [hardwareRequests]);

  // Return Hardware
  const returnHardware = useCallback((assetId: string) => {
    setHardwareAssets((prev) =>
      prev.map((a) => {
        if (a.assetId === assetId) {
          return {
            ...a,
            status: "AVAILABLE",
            currentHolder: undefined,
            currentHolderId: undefined,
            projectAllocation: undefined,
            issuedDate: undefined,
            expectedReturnDate: undefined,
          };
        }
        return a;
      })
    );

    const logItem: AuditLogItem = {
      id: `log-${Date.now()}`,
      user: "Lab Admin",
      action: "HARDWARE_RETURNED",
      entity: "HardwareAsset",
      entityId: assetId,
      timestamp: new Date().toLocaleString(),
      details: `Asset ${assetId} returned to inventory and inspected. Condition: GOOD.`,
    };
    setAuditLogs((prev) => [logItem, ...prev]);
  }, []);

  // Book Lab Resource
  const bookLabResource = useCallback(
    (resourceId: string, date: string, startTime: string, endTime: string, project: string) => {
      const resource = labResources.find((r) => r.id === resourceId);
      // Check for overlap on same resource and date
      const overlap = labBookings.some(
        (b) =>
          b.resourceId === resourceId &&
          b.date === date &&
          b.status === "CONFIRMED" &&
          ((startTime >= b.startTime && startTime < b.endTime) || (endTime > b.startTime && endTime <= b.endTime))
      );

      if (overlap) {
        return false;
      }

      const newBooking: LabBooking = {
        id: `bk-${Date.now()}`,
        resourceId,
        resourceName: resource?.name || resourceId,
        userId: student.id,
        userName: student.name,
        project,
        date,
        startTime,
        endTime,
        status: "CONFIRMED",
      };

      setLabBookings((prev) => [newBooking, ...prev]);

      const logItem: AuditLogItem = {
        id: `log-${Date.now()}`,
        user: student.name,
        action: "LAB_WORKSTATION_BOOKED",
        entity: "LabBooking",
        entityId: newBooking.id,
        timestamp: new Date().toLocaleString(),
        details: `Reserved ${resource?.name} on ${date} (${startTime} - ${endTime}) for ${project}`,
      };
      setAuditLogs((prev) => [logItem, ...prev]);

      return true;
    },
    [labBookings, labResources, student]
  );

  // Register for Event
  const registerForEvent = useCallback((eventId: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, isRegistered: true, registeredCount: e.registeredCount + 1 } : e))
    );
  }, []);

  // Rotate Workshop Attendance Token
  const rotateAttendanceToken = useCallback((eventId: string) => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newToken = `IOT-QR-${randomSuffix}`;

    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? {
              ...e,
              attendanceToken: newToken,
              tokenExpiresAt: new Date(Date.now() + 60000).toISOString(),
            }
          : e
      )
    );

    return newToken;
  }, []);

  // Update Hackathon Status
  const updateHackathonStatus = useCallback((id: string, status: HackathonOpportunity["teamStatus"]) => {
    setHackathons((prev) => prev.map((h) => (h.id === id ? { ...h, teamStatus: status } : h)));
  }, []);

  // Register for Monthly Challenge
  const registerForChallenge = useCallback((challengeId: string) => {
    setMonthlyChallenges((prev) =>
      prev.map((ch) =>
        ch.id === challengeId ? { ...ch, isRegistered: true, participantsCount: ch.participantsCount + 1 } : ch
      )
    );
  }, []);

  // Mark Notification As Read
  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  // Reset Demo State (per Section 63)
  const resetDemoState = useCallback(() => {
    setDemoRoleState("student");
    setStudent(initialDemoStudent);
    setApplications(initialApplications);
    setTracks(initialLearningTracks);
    setSkills(initialSkillNodes);
    setXpTransactions(initialXPTransactions);
    setProjects(initialProjects);
    setTeamRecruitments(initialTeamRecruitments);
    setHardwareAssets(initialHardwareAssets);
    setHardwareRequests(initialHardwareRequests);
    setLabBookings(initialLabBookings);
    setEvents(initialClubEvents);
    setHackathons(initialHackathons);
    setCertificates(initialCertificates);
    setMonthlyChallenges(initialMonthlyChallenges);
    setTelemetry(initialTelemetry);
    setAuditLogs(initialAuditLogs);
    setNotifications(initialNotifications);

    if (typeof window !== "undefined") {
      localStorage.removeItem("iot_demo_role");
    }
  }, []);

  return (
    <IoTAppContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        loginWithCollegeEmail,
        registerStudent,
        logout,
        demoRole,
        setDemoRole,
        student,
        updateStudentProfile,
        applications,
        submitApplication,
        updateApplicationStatus,
        tracks,
        submitAssignment,
        evaluateSubmission,
        submissions,
        skills,
        xpTransactions,
        projects,
        addNewProject,
        addProjectTask,
        updateTaskStatus,
        addOrUpdateProjectReview,
        toggleProjectLock,
        testGitHubRepo,
        teamRecruitments,
        applyToTeam,
        hardwareAssets,
        hardwareRequests,
        requestHardware,
        approveHardwareRequest,
        rejectHardwareRequest,
        returnHardware,
        labResources,
        labBookings,
        bookLabResource,
        events,
        registerForEvent,
        rotateAttendanceToken,
        hackathons,
        updateHackathonStatus,
        certificates,
        monthlyChallenges,
        registerForChallenge,
        telemetry,
        auditLogs,
        notifications,
        markNotificationAsRead,
        resetDemoState,
      }}
    >
      {children}
    </IoTAppContext.Provider>
  );
}

export function useIoTApp() {
  const context = useContext(IoTAppContext);
  if (!context) {
    throw new Error("useIoTApp must be used within an IoTAppProvider");
  }
  return context;
}
