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
  TeamRecruitmentPost,
  MonthlyChallenge,
  ClubEvent,
  HackathonOpportunity,
  CertificateRecord,
  TelemetryData,
  AuditLogItem,
  AppNotification,
  AssignmentSubmission,
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
  initialTeamRecruitments,
  initialTelemetry,
  initialAuditLogs,
  initialNotifications,
} from "./mockData";

interface IoTAppContextType {
  demoRole: DemoRole;
  setDemoRole: (role: DemoRole) => void;
  student: UserProfile;
  applications: Application[];
  submitApplication: (appData: Omit<Application, "id" | "appliedDate" | "status" | "batch">) => string;
  updateApplicationStatus: (appId: string, status: ApplicationStatus, notes?: string) => void;
  tracks: LearningTrack[];
  submitAssignment: (moduleId: string, submission: { githubRepo: string; demoUrl: string; documentationText: string }) => void;
  evaluateSubmission: (
    assignmentId: string,
    studentId: string,
    scores: { [criteria: string]: number },
    feedback: string,
    passed: boolean
  ) => void;
  submissions: AssignmentSubmission[];
  skills: SkillNode[];
  xpTransactions: XPTransaction[];
  projects: Project[];
  addProjectTask: (projectId: string, task: Omit<ProjectTask, "id" | "projectId">) => void;
  updateTaskStatus: (projectId: string, taskId: string, status: ProjectTask["status"]) => void;
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
  const [demoRole, setDemoRoleState] = useState<DemoRole>("student");
  const [student, setStudent] = useState<UserProfile>(initialDemoStudent);
  const [applications, setApplications] = useState<Application[]>(initialApplications);
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
        demoRole,
        setDemoRole,
        student,
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
        addProjectTask,
        updateTaskStatus,
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
