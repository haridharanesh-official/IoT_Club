"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useIoTApp } from "@/lib/store";
import { AIMentorModal } from "@/components/ai/AIMentorModal";
import type { StudentDashboardData, StudentProfile } from "@/lib/student/dashboard";
import {
  GraduationCap,
  Layers,
  Cpu,
  FolderGit2,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Zap,
  Award,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckSquare,
  Square,
  Boxes,
  Kanban,
  FileText,
  Activity,
  User,
  Sliders,
  Edit3,
  X,
  Loader2,
} from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/icons/SocialIcons";

interface StudentDashboardProps {
  initialData?: StudentDashboardData;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ initialData }) => {
  const store = useIoTApp();

  // If initialData provided, use real server data; otherwise fallback to store
  const [profile, setProfile] = useState<StudentProfile>(() => {
    if (initialData?.profile) return initialData.profile;
    return {
      userId: store.student.id,
      fullName: store.student.name,
      email: store.student.collegeEmail,
      role: "STUDENT",
      membershipStatus: "APPROVED",
      registrationId: "IOT-2026-00008",
      registerNumber: store.student.rollNumber,
      department: store.student.department,
      degreeProgramme: "B.Tech",
      yearOfStudy: 3,
      semester: 5,
      section: store.student.section,
      batch: "2024-2028",
      username: store.student.username || null,
      headline: store.student.headline || null,
      bio: store.student.bio || null,
      githubUrl: store.student.githubUrl || null,
      linkedinUrl: store.student.linkedinUrl || null,
      portfolioUrl: store.student.portfolioUrl || null,
      createdAt: new Date().toISOString(),
    };
  });

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    headline: profile.headline || "",
    bio: profile.bio || "",
    username: profile.username || "",
    githubUrl: profile.githubUrl || "",
    linkedinUrl: profile.linkedinUrl || "",
    portfolioUrl: profile.portfolioUrl || "",
  });

  const [completedActionItems, setCompletedActionItems] = useState<{ [key: string]: boolean }>({});

  const toggleActionItem = (item: string) => {
    setCompletedActionItems((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  const handleOpenEditModal = () => {
    setEditForm({
      headline: profile.headline || "",
      bio: profile.bio || "",
      username: profile.username || "",
      githubUrl: profile.githubUrl || "",
      linkedinUrl: profile.linkedinUrl || "",
      portfolioUrl: profile.portfolioUrl || "",
    });
    setEditError(null);
    setEditSuccess(null);
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setEditError(null);
    setEditSuccess(null);

    try {
      const res = await fetch("/api/student/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to update profile");
      }

      setProfile((prev) => ({
        ...prev,
        headline: json.profile.headline,
        bio: json.profile.bio,
        username: json.profile.username,
        githubUrl: json.profile.github_url,
        linkedinUrl: json.profile.linkedin_url,
        portfolioUrl: json.profile.portfolio_url,
      }));

      setEditSuccess("Profile updated successfully!");
      setTimeout(() => {
        setIsEditModalOpen(false);
      }, 1200);
    } catch (err: any) {
      setEditError(err.message || "An unexpected error occurred");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Compute initials
  const initials = profile.fullName
    ? profile.fullName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join("")
    : "ST";

  const publicProfileSlug = profile.username || profile.registerNumber || profile.registrationId || "me";

  const projects = initialData?.projects || [];
  const learningProgress = initialData?.learningProgress || [];
  const skills = initialData?.skills || [];
  const interests = initialData?.interests || [];
  const upcomingEvents = initialData?.upcomingEvents || [];
  const metrics = initialData?.metrics || {
    projectsCount: projects.length,
    coursesCount: learningProgress.length,
    certificationsCount: 0,
    eventsCount: upcomingEvents.length,
    notificationsCount: 0,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      {/* 1. Student Welcome Header & Level Progression */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white font-black text-xl flex items-center justify-center shadow-sm shrink-0">
              {initials}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-emerald-700 font-bold mb-0.5">
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>VERIFIED MEMBER</span>
                </span>
                <span>•</span>
                <span>{profile.registerNumber || profile.registrationId || "IOT-STUDENT"}</span>
                <span>•</span>
                <span>{profile.department || "IoT & Embedded"}</span>
                {profile.yearOfStudy && (
                  <>
                    <span>•</span>
                    <span>Year {profile.yearOfStudy} (Sem {profile.semester || 1})</span>
                  </>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Welcome back, {profile.fullName} 👋
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
                {profile.headline || "IoT Club Student Member • Specializing in Embedded Systems & Connected Hardware"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleOpenEditModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit Profile</span>
            </button>

            <Link
              href={`/member/${publicProfileSlug}`}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold shadow-xs transition"
            >
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>Public Portfolio</span>
            </Link>

            <button
              onClick={() => setIsAiModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Lab Mentor</span>
            </button>
          </div>
        </div>

        {/* Level Progression & Summary Stats */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-[10px] text-slate-500 font-mono uppercase font-bold">
              MEMBERSHIP REGISTRATION
            </div>
            <div className="text-base font-black text-slate-900 mt-1">
              {profile.registrationId || "ACTIVE"}
            </div>
            <div className="text-[11px] text-emerald-700 font-medium mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Verified Club Status</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-[10px] text-slate-500 font-mono uppercase font-bold">
              ACTIVE HARDWARE PROJECTS
            </div>
            <div className="text-base font-black text-slate-900 mt-1">
              {metrics.projectsCount} {metrics.projectsCount === 1 ? "Project" : "Projects"}
            </div>
            <Link
              href="/projects"
              className="text-[11px] text-emerald-700 font-bold hover:underline mt-0.5 block"
            >
              View in Project Workspace →
            </Link>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-[10px] text-slate-500 font-mono uppercase font-bold">
              LEARNING PROGRESS
            </div>
            <div className="text-base font-black text-slate-900 mt-1">
              {metrics.coursesCount} Active Tracks
            </div>
            <Link
              href="/learn"
              className="text-[11px] text-emerald-700 font-bold hover:underline mt-0.5 block"
            >
              Inspect Learning Modules →
            </Link>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-[10px] text-slate-500 font-mono uppercase font-bold">
              VERIFIED CERTIFICATIONS
            </div>
            <div className="text-base font-black text-slate-900 mt-1">
              {metrics.certificationsCount} Credentials
            </div>
            <Link
              href="/verify"
              className="text-[11px] text-emerald-700 font-bold hover:underline mt-0.5 block"
            >
              Verify Credentials →
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Skills & Interests Banner (Real Supabase Records) */}
      {(skills.length > 0 || interests.length > 0) && (
        <div className="glass-card p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">Verified Skills & Specialization Areas</h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {skills.length} Technical Skills • {interests.length} Specializations
            </span>
          </div>

          <div className="space-y-3">
            {skills.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-500 mr-1">Skills:</span>
                {skills.map((s, idx) => (
                  <span
                    key={idx}
                    className={`px-3 py-1 rounded-xl text-xs font-medium border flex items-center gap-1.5 ${
                      s.category === "HARDWARE"
                        ? "bg-amber-50 text-amber-900 border-amber-200"
                        : s.category === "PROGRAMMING"
                        ? "bg-sky-50 text-sky-900 border-sky-200"
                        : "bg-emerald-50 text-emerald-900 border-emerald-200"
                    }`}
                  >
                    <span className="font-bold">{s.skill}</span>
                    <span className="text-[10px] opacity-70 font-mono uppercase">({s.level.toLowerCase()})</span>
                  </span>
                ))}
              </div>
            )}

            {interests.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-bold text-slate-500 mr-1">Interests:</span>
                {interests.map((interest, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl text-xs font-medium bg-purple-50 text-purple-900 border border-purple-200"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Active Projects Section */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FolderGit2 className="w-4 h-4 text-emerald-600" />
              <h2 className="text-xl font-black text-slate-900">Project Initiatives</h2>
            </div>
            <p className="text-xs text-slate-500">
              Hardware builds, embedded firmware, and collaborative IoT deployments.
            </p>
          </div>

          <Link
            href="/projects"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition self-start sm:self-auto"
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>Explore All Projects</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                      {proj.role === "LEAD" ? "PROJECT LEAD" : "CONTRIBUTOR"}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-200 text-slate-700">
                      {proj.status}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{proj.title}</h3>
                  {proj.description && (
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {proj.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200/70 text-xs">
                  {proj.githubUrl ? (
                    <a
                      href={proj.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium"
                    >
                      <GithubIcon className="w-3.5 h-3.5" />
                      <span>Repository</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-mono">Internal Build</span>
                  )}
                  <Link
                    href="/projects"
                    className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1"
                  >
                    <span>View Workspace</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto font-bold">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-sm font-bold text-slate-900">No active project initiatives yet</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Connect hardware sensors, build cloud IoT telemetry dashboards, or collaborate with team members on club research projects.
              </p>
            </div>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-xs"
            >
              <span>Explore Projects Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* 4. Learning & Lab Assets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Learning Tracks */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">Active Learning Tracks</h3>
            </div>
            <Link
              href="/learn"
              className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1"
            >
              <span>Explore All Tracks</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {learningProgress.length > 0 ? (
            <div className="space-y-3">
              {learningProgress.slice(0, 3).map((lp, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase">
                        {lp.courseTitle}
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs mt-0.5">{lp.moduleTitle}</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                      {lp.status}
                    </span>
                  </div>
                  {lp.score !== null && (
                    <div className="text-[11px] text-slate-500 font-mono">
                      Module Score: <span className="font-bold text-slate-800">{lp.score}%</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-2">
              <Layers className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-xs font-bold text-slate-800">No active course enrollments</h4>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Progress through verified hands-on IoT curriculums from firmware development to cloud MQTT telemetry.
              </p>
              <Link
                href="/learn"
                className="inline-block px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition mt-2"
              >
                Browse Curriculum
              </Link>
            </div>
          )}
        </div>

        {/* Issued Lab Hardware Assets */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Boxes className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">Lab Hardware Assets</h3>
            </div>
            <Link
              href="/lab"
              className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1"
            >
              <span>Borrow Components</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-2">
            <Boxes className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-xs font-bold text-slate-800">No hardware units currently checked out</h4>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
              Request microcontrollers (ESP32, Raspberry Pi Pico), sensors, and LoRa radios from the hardware inventory.
            </p>
            <Link
              href="/lab/inventory"
              className="inline-block px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition mt-2"
            >
              Browse Lab Inventory
            </Link>
          </div>
        </div>
      </div>

      {/* 5. Upcoming Club Events */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">Upcoming Workshops & Sessions</h3>
          </div>
          <Link
            href="/events"
            className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1"
          >
            <span>View All Events</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {upcomingEvents.length > 0 ? (
          <div className="space-y-3">
            {upcomingEvents.map((evt) => (
              <div
                key={evt.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{evt.title}</h4>
                  {evt.description && <p className="text-slate-500 text-[11px] mt-0.5">{evt.description}</p>}
                  <p className="text-slate-500 text-[11px] mt-1 font-mono">
                    Venue: {evt.venue || "IoT Innovation Lab"} • Starts: {new Date(evt.startsAt).toLocaleString()}
                  </p>
                </div>

                <Link
                  href="/events"
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs self-start sm:self-auto ${
                    evt.isRegistered
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-slate-900 hover:bg-slate-800 text-white"
                  }`}
                >
                  {evt.isRegistered ? "Registered ✓" : "Register / Details"}
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
            <h4 className="text-xs font-bold text-slate-800">No upcoming workshops scheduled</h4>
            <p className="text-[11px] text-slate-500">
              New hackathons, hands-on bootcamps, and guest lectures will be posted here as they are published.
            </p>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">Edit Member Profile</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update your public portfolio links and bio. Academic records remain verified by admin.
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            {editSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{editSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Username / Portfolio Slug</label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  placeholder="e.g. hari-dharanesh"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Used for your public link: /member/{editForm.username || "username"}
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Headline</label>
                <input
                  type="text"
                  value={editForm.headline}
                  onChange={(e) => setEditForm({ ...editForm, headline: e.target.value })}
                  placeholder="e.g. Embedded Firmware Engineer | IoT Club Core"
                  maxLength={150}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Bio / About You</label>
                <textarea
                  rows={3}
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder="Brief summary of your technical interests, hardware builds, and research goals..."
                  maxLength={1000}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">GitHub URL</label>
                  <input
                    type="url"
                    value={editForm.githubUrl}
                    onChange={(e) => setEditForm({ ...editForm, githubUrl: e.target.value })}
                    placeholder="https://github.com/..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    value={editForm.linkedinUrl}
                    onChange={(e) => setEditForm({ ...editForm, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Personal Portfolio / Website</label>
                <input
                  type="url"
                  value={editForm.portfolioUrl}
                  onChange={(e) => setEditForm({ ...editForm, portfolioUrl: e.target.value })}
                  placeholder="https://yourportfolio.example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none font-mono text-[11px]"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSavingProfile}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSavingProfile && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Mentor Modal */}
      <AIMentorModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} />
    </div>
  );
};
