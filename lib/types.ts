export type UserRole =
  | "APPLICANT"
  | "STUDENT"
  | "MENTOR"
  | "PROJECT_LEAD"
  | "TEACHER"
  | "FACULTY"
  | "LAB_ADMIN"
  | "CLUB_ADMIN"
  | "SUPER_ADMIN";

export type DemoRole = "public" | "applicant" | "student" | "teacher" | "admin";

export type AuthRole = "STUDENT" | "TEACHER" | "CLUB_LEAD" | "ADMIN" | "GUEST";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
  department: string;
  rollNumber?: string;
  avatarUrl?: string;
  designation?: string;
  portalRedirect: string;
}

export interface AuthSession {
  user: AuthUser | null;
  isAuthenticated: boolean;
  token: string | null;
  expiresAt: string | null;
}

export interface ClubConfig {
  clubName: string;
  subtitle: string;
  collegeName: string;
  logoText: string;
  department: string;
  description: string;
  footerDescription?: string;
  primaryContact: string;
  email: string;
  address: string;
  githubOrg: string;
  socialLinks: {
    github: string;
    linkedin: string;
    discord: string;
    youtube?: string;
  };
}

export interface UserSkill {
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  proficiencyPercent: number;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  headline: string;
  level: number;
  levelTitle: string;
  xp: number;
  rollNumber: string;
  department: string;
  year: string;
  section: string;
  collegeEmail: string;
  personalEmail: string;
  phone: string;
  avatarUrl?: string;
  githubUrl: string;
  linkedinUrl: string;
  portfolioUrl?: string;
  bio: string;
  isPublic: boolean;
  skills: UserSkill[];
  roles: UserRole[];
  stats: {
    projects: number;
    hackathons: number;
    workshops: number;
    certificates: number;
    mentoringSessions: number;
    clubContributions: number;
  };
}

export type ApplicationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "ASSESSMENT"
  | "PRACTICAL_TASK"
  | "INTERVIEW"
  | "SELECTED"
  | "WAITLISTED"
  | "REJECTED";

export interface Application {
  id: string;
  fullName: string;
  rollNumber: string;
  department: string;
  year: string;
  section: string;
  collegeEmail: string;
  personalEmail: string;
  phone: string;
  interests: string[];
  skills: { name: string; level: "Beginner" | "Intermediate" | "Advanced" }[];
  githubUrl: string;
  linkedinUrl: string;
  portfolioUrl?: string;
  previousProjects?: string;
  whyJoin: string;
  whatToLearn: string;
  hoursPerWeek: string;
  hackathonInterest: boolean;
  researchInterest: boolean;
  status: ApplicationStatus;
  appliedDate: string;
  reviewNotes?: string;
  batch: string;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  conceptSummary: string;
  simulationNote?: string;
  circuitDiagramNote?: string;
  codeSnippet?: string;
  hardwareDemonstration?: string;
}

export interface RubricCriteria {
  name: string;
  maxScore: number;
  actualScore?: number;
  description: string;
}

export interface Assignment {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  submissionRequirements: string[];
  maxXP: number;
  badgeReward?: string;
  rubrics: RubricCriteria[];
  dueDate: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentRoll: string;
  githubRepo: string;
  demoUrl?: string;
  circuitDiagramUrl?: string;
  documentationText: string;
  submittedAt: string;
  status: "PENDING" | "EVALUATED" | "RESUBMISSION_REQUESTED";
  evaluation?: {
    evaluatedBy: string;
    evaluatedAt: string;
    scores: { [criteriaName: string]: number };
    totalScore: number;
    feedback: string;
    passed: boolean;
    xpAwarded: number;
    badgeAwarded?: string;
  };
}

export interface Module {
  id: string;
  trackId: string;
  title: string;
  overview: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  estimatedHours: number;
  badge: string;
  lessons: Lesson[];
  assignment?: Assignment;
  isUnlocked: boolean;
  isCompleted: boolean;
}

export interface LearningTrack {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  progressPercent: number;
  modulesCount: number;
  completedModulesCount: number;
  modules: Module[];
}

export interface SkillNode {
  id: string;
  name: string;
  category: "Foundations" | "Hardware" | "Protocols" | "Edge & Linux" | "AI & Robotics" | "Cloud";
  status: "COMPLETED" | "AVAILABLE" | "IN_PROGRESS" | "LOCKED";
  prerequisites: string[];
  xpReward: number;
  description: string;
  icon: string;
  x: number;
  y: number;
}

export interface XPTransaction {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  category: "ASSIGNMENT" | "MINI_PROJECT" | "PROJECT" | "WORKSHOP" | "HACKATHON" | "MENTORING" | "COMMUNITY";
  timestamp: string;
}

export type HardwareStatus =
  | "AVAILABLE"
  | "RESERVED"
  | "ISSUED"
  | "PROJECT_ALLOCATED"
  | "UNDER_TESTING"
  | "DAMAGED"
  | "UNDER_REPAIR"
  | "MISSING"
  | "RETIRED";

export interface HardwareAsset {
  assetId: string;
  name: string;
  category: "Microcontroller" | "Single Board Computer" | "Sensor" | "Wireless & RF" | "Actuator" | "Testing Equipment" | "Tooling";
  model: string;
  serialNumber: string;
  location: string;
  condition: "EXCELLENT" | "GOOD" | "FAIR" | "FAULTY";
  status: HardwareStatus;
  currentHolder?: string;
  currentHolderId?: string;
  projectAllocation?: string;
  issuedDate?: string;
  expectedReturnDate?: string;
  qrCodeValue: string;
  specs: string[];
}

export interface HardwareRequest {
  id: string;
  assetId: string;
  assetName: string;
  studentId: string;
  studentName: string;
  project: string;
  purpose: string;
  durationDays: number;
  requestedAt: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "RETURNED";
  approvedBy?: string;
}

export interface LabResource {
  id: string;
  name: string;
  category: "Workbench" | "Fabrication" | "Testing" | "Computing";
  capacity: number;
  description: string;
  isAvailable: boolean;
  equipment: string[];
}

export interface LabBooking {
  id: string;
  resourceId: string;
  resourceName: string;
  userId: string;
  userName: string;
  project: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "CONFIRMED" | "CANCELLED" | "COMPLETED";
}

export type ProjectLifecycle =
  | "IDEA"
  | "PROPOSAL"
  | "REVIEW"
  | "APPROVED"
  | "RESEARCH"
  | "PROTOTYPE"
  | "DEVELOPMENT"
  | "TESTING"
  | "DEPLOYMENT"
  | "COMPLETED"
  | "ARCHIVED";

export interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assignee: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "BACKLOG" | "TODO" | "IN_PROGRESS" | "REVIEW" | "COMPLETED";
  dueDate: string;
}

export interface ProjectMember {
  name: string;
  role: string;
  email?: string;
  githubHandle?: string;
  commits?: number;
  isLead?: boolean;
  avatarUrl?: string;
}

export interface RubricScore {
  criterion: string;
  score: number;
  maxScore: number;
  feedback?: string;
}

export interface ProjectReviewRound {
  id: string;
  roundKey: "R1" | "R2" | "FINAL";
  roundTitle: string;
  status: "PENDING" | "UNDER_EVALUATION" | "APPROVED" | "REVISIONS_REQUESTED";
  score?: number;
  maxScore?: number;
  reviewerName?: string;
  reviewerRole?: "TEACHER" | "FACULTY" | "JUDGE" | "MENTOR";
  evaluatedAt?: string;
  feedback?: string;
  actionItems?: string[];
  rubricScores?: RubricScore[];
}

export interface ProjectSubmissionFile {
  id: string;
  title: string;
  fileName: string;
  fileType: "PDF" | "PPTX" | "ZIP" | "XLSX" | "MP4";
  size: string;
  uploadedAt: string;
  downloadUrl: string;
}

export interface ProjectResourceLink {
  id: string;
  title: string;
  url: string;
  category: "FIRMWARE" | "HARDWARE_PCB" | "CAD_DESIGN" | "AI_MODEL" | "LIVE_DASHBOARD" | "DOCUMENTATION";
  description: string;
}

export interface LanguageStat {
  name: string;
  percentage: number;
  color: string;
}

export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  lifecycle: ProjectLifecycle;
  leadName: string;
  leadId: string;
  members: ProjectMember[];
  facultyMentor: string;
  techStack: string[];
  progressPercent: number;
  githubUrl: string;
  hardwareBOM: { item: string; quantity: number; status: string }[];
  tasks: ProjectTask[];
  featured: boolean;
  category: "HealthTech" | "Robotics" | "AgriTech" | "Smart Cities" | "Industrial IoT" | "Security";
  architectureSummary: string;
  theme?: string;
  brief?: string;
  aiToolDisclosure?: string;
  isLocked?: boolean;
  defaultBranch?: string;
  totalCommits?: number;
  openIssues?: number;
  sourceAuditStatus?: "Verified ✓" | "In Review" | "Pending Audit";
  languageBreakdown?: LanguageStat[];
  reviews?: ProjectReviewRound[];
  submissionFiles?: ProjectSubmissionFile[];
  resourceLinks?: ProjectResourceLink[];
}

export interface TeamRecruitmentPost {
  id: string;
  projectId: string;
  projectTitle: string;
  leadName: string;
  openRoles: string[];
  description: string;
  applicantsCount: number;
  createdAt: string;
}

export interface MonthlyChallenge {
  id: string;
  month: string;
  title: string;
  tagline: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  requirements: string[];
  xpReward: number;
  badgeReward: string;
  deadline: string;
  participantsCount: number;
  isRegistered?: boolean;
}

export interface ClubEvent {
  id: string;
  title: string;
  type: "Workshop" | "Bootcamp" | "Tech Talk" | "Hackathon Prep";
  description: string;
  trainer: string;
  venue: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  registeredCount: number;
  prerequisites: string[];
  isRegistered?: boolean;
  attendanceToken?: string;
  tokenExpiresAt?: string;
}

export interface HackathonOpportunity {
  id: string;
  title: string;
  organizer: string;
  category: "Hackathons" | "Robotics" | "IoT Competitions" | "AI & Vision" | "Cybersecurity" | "Research";
  deadline: string;
  prizePool: string;
  mode: "Online" | "In-Person" | "Hybrid";
  teamStatus: "INTERESTED" | "LOOKING_FOR_TEAM" | "TEAM_CREATED" | "REGISTERED" | "PARTICIPATING" | "SUBMITTED" | "FINALIST" | "WINNER";
  teamName?: string;
  teamMembers?: string[];
  description: string;
}

export interface CertificateRecord {
  certificateId: string;
  studentName: string;
  studentRoll: string;
  trackOrTopic: string;
  level: string;
  issueDate: string;
  issuerTitle: string;
  qrUrl: string;
  isValid: boolean;
  gradeOrScore?: string;
}

export interface TelemetryData {
  temperatureC: number;
  humidityPercent: number;
  airQualityAqi: number;
  powerConsumptionKw: number;
  occupancyCount: number;
  nodesOnline: number;
  nodesTotal: number;
  lastUpdated: string;
  benchesActive: number;
  benchesTotal: number;
  deviceHistory: { time: string; temp: number; power: number }[];
}

export interface AuditLogItem {
  id: string;
  user: string;
  action: string;
  entity: string;
  entityId: string;
  timestamp: string;
  details: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: "RECRUITMENT" | "LEARNING" | "ASSIGNMENT" | "HARDWARE" | "LAB" | "WORKSHOP" | "SYSTEM";
  timestamp: string;
  read: boolean;
}

export interface ClubMetrics {
  totalMembers: number;
  activeStudents: number;
  facultyMentors: number;
  activeProjects: number;
  completedProjects: number;
  hardwareAssets: number;
  currentlyIssued: number;
  gitHubCommits: number;
}

export interface SystemAnnouncement {
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "alert";
  active: boolean;
  updatedAt: string;
}

export interface LabStatusBroadcast {
  status: "OPEN" | "RESTRICTED" | "MAINTENANCE" | "CLOSED";
  customMessage: string;
  operatingHours: string;
  inChargeName: string;
}

