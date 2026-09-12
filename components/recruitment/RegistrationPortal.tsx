"use client";

import React, { useState } from "react";
import { useIoTApp } from "@/lib/store";
import { ApplicationStatus } from "@/lib/types";
import {
  UserCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  Send,
  Plus,
  Trash2,
  Sparkles,
  ShieldCheck,
  Layers,
  Cpu,
  Code2,
} from "lucide-react";

export const RegistrationPortal: React.FC = () => {
  const { applications, submitApplication } = useIoTApp();

  // Wizard state: 1 to 6
  const [step, setStep] = useState<number>(1);
  const [submittedAppId, setSubmittedAppId] = useState<string | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [department, setDepartment] = useState("Electronics & Communication");
  const [year, setYear] = useState("1st Year");
  const [section, setSection] = useState("A");
  const [collegeEmail, setCollegeEmail] = useState("");
  const [personalEmail, setPersonalEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [interests, setInterests] = useState<string[]>(["IoT", "Embedded Systems"]);
  const [skills, setSkills] = useState<{ name: string; level: "Beginner" | "Intermediate" | "Advanced" }[]>([
    { name: "C Programming", level: "Intermediate" },
    { name: "Basic Electronics", level: "Beginner" },
  ]);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState<"Beginner" | "Intermediate" | "Advanced">("Beginner");

  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [previousProjects, setPreviousProjects] = useState("");

  const [whyJoin, setWhyJoin] = useState("");
  const [whatToLearn, setWhatToLearn] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState("10-12 hrs");
  const [hackathonInterest, setHackathonInterest] = useState(true);
  const [researchInterest, setResearchInterest] = useState(false);

  const [validationError, setValidationError] = useState("");

  // Selectable interest cards (Section 8)
  const interestOptions = [
    "IoT",
    "Embedded Systems",
    "Robotics",
    "AI",
    "AIoT",
    "Computer Vision",
    "Cybersecurity",
    "Electronics",
    "Cloud",
    "Automation",
    "Raspberry Pi",
    "ESP32",
    "Drone",
    "Research",
  ];

  const toggleInterest = (item: string) => {
    setInterests((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]));
  };

  const addSkill = () => {
    if (!newSkillName.trim()) return;
    setSkills((prev) => [...prev, { name: newSkillName.trim(), level: newSkillLevel }]);
    setNewSkillName("");
  };

  const removeSkill = (index: number) => {
    setSkills((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !rollNumber.trim() || !collegeEmail.trim()) {
      setValidationError("Please fill all required personal information fields.");
      setStep(1);
      return;
    }

    const newId = submitApplication({
      fullName,
      rollNumber,
      department,
      year,
      section,
      collegeEmail,
      personalEmail,
      phone,
      interests,
      skills,
      githubUrl,
      linkedinUrl,
      portfolioUrl,
      previousProjects,
      whyJoin,
      whatToLearn,
      hoursPerWeek,
      hackathonInterest,
      researchInterest,
    });

    setSubmittedAppId(newId);
  };

  // Check if we want to display the status tracker for an existing application
  const activeApp = submittedAppId
    ? applications.find((a) => a.id === submittedAppId)
    : applications[0]; // defaults to demo applicant

  const stages: { key: ApplicationStatus; label: string; desc: string }[] = [
    { key: "SUBMITTED", label: "Application Submitted", desc: "Form & portfolio received" },
    { key: "UNDER_REVIEW", label: "Initial Review", desc: "Screening by faculty & leads" },
    { key: "ASSESSMENT", label: "Technical Assessment", desc: "MCQ & logic quiz" },
    { key: "PRACTICAL_TASK", label: "Practical Round", desc: "Hands-on breadboard exercise" },
    { key: "INTERVIEW", label: "Technical Interview", desc: "Panel discussion with mentors" },
    { key: "SELECTED", label: "Final Selection", desc: "Account activation & onboarding" },
  ];

  const getStageIndex = (status: ApplicationStatus) => {
    switch (status) {
      case "SUBMITTED":
        return 0;
      case "UNDER_REVIEW":
        return 1;
      case "ASSESSMENT":
        return 2;
      case "PRACTICAL_TASK":
        return 3;
      case "INTERVIEW":
        return 4;
      case "SELECTED":
        return 5;
      case "WAITLISTED":
        return 4;
      case "REJECTED":
        return 1;
      default:
        return 0;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-dark-border pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-iot-cyan mb-1">
            <span>RECRUITMENT BATCH 2026-01</span>
            <span>•</span>
            <span className="text-emerald-400">REGISTRATION OPEN</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">IoT Club Recruitment Portal</h1>
          <p className="text-xs text-slate-400 mt-1">
            Submit your candidate application or track your recruitment pipeline status.
          </p>
        </div>

        {/* View toggle if already submitted or testing tracker */}
        <div className="flex items-center gap-2">
          {submittedAppId ? (
            <button
              onClick={() => {
                setSubmittedAppId(null);
                setStep(1);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700"
            >
              + Submit Another Application
            </button>
          ) : (
            <button
              onClick={() => setSubmittedAppId(applications[0].id)}
              className="px-3 py-1.5 rounded-lg bg-dark-card hover:bg-slate-800 text-iot-cyan text-xs font-medium border border-dark-border"
            >
              Preview Live Status Tracker
            </button>
          )}
        </div>
      </div>

      {/* VIEW A: RECRUITMENT STATUS TRACKER (Section 9) */}
      {submittedAppId && activeApp ? (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-dark-card border border-dark-border space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-dark-border">
              <div>
                <span className="text-xs font-mono text-slate-400">APPLICATION ID: {activeApp.id}</span>
                <h2 className="text-lg font-bold text-white">{activeApp.fullName} ({activeApp.rollNumber})</h2>
                <div className="text-xs text-slate-300">
                  {activeApp.department} • {activeApp.year} (Sec {activeApp.section})
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 font-mono text-xs text-iot-cyan">
                Current Status: <span className="font-bold text-white">{activeApp.status}</span>
              </div>
            </div>

            {/* Pipeline Stepper */}
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                Recruitment Selection Stages
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                {stages.map((stg, idx) => {
                  const currentIdx = getStageIndex(activeApp.status);
                  const isCompleted = idx < currentIdx;
                  const isCurrent = idx === currentIdx;

                  return (
                    <div
                      key={stg.key}
                      className={`p-3.5 rounded-xl border text-xs transition flex flex-col justify-between ${
                        isCurrent
                          ? "bg-slate-800/90 border-iot-cyan text-white ring-1 ring-iot-cyan"
                          : isCompleted
                          ? "bg-emerald-950/20 border-emerald-800/40 text-slate-300"
                          : "bg-slate-900/40 border-slate-800 text-slate-500"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-[10px] text-slate-400">STAGE 0{idx + 1}</span>
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-iot-emerald" />
                          ) : isCurrent ? (
                            <span className="w-2.5 h-2.5 rounded-full bg-iot-cyan animate-ping" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-slate-600" />
                          )}
                        </div>
                        <div className="font-semibold text-white leading-tight mb-1">{stg.label}</div>
                        <p className="text-[11px] text-slate-400 leading-tight">{stg.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Application Summary Box */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-3">
              <h4 className="font-semibold text-slate-200">Candidate Submission Summary</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-300">
                <div>
                  <span className="text-slate-500">Selected Interests:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {activeApp.interests.map((it, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">
                        {it}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Technical Skills:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {activeApp.skills.map((sk, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-iot-cyan font-mono">
                        {sk.name} ({sk.level})
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {activeApp.whyJoin && (
                <div className="pt-2 border-t border-slate-800 text-slate-400">
                  <span className="text-slate-500 block mb-1">Why do you want to join?</span>
                  <p className="italic text-slate-300">"{activeApp.whyJoin}"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* VIEW B: 6-STEP APPLICATION WIZARD (Section 8) */
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 sm:p-8 space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between text-xs pb-4 border-b border-dark-border">
            <span className="font-semibold text-white">
              Step {step} of 6:{" "}
              {step === 1 && "Personal Details"}
              {step === 2 && "Technical Interests"}
              {step === 3 && "Skills & Proficiency"}
              {step === 4 && "Student Profiles & Portfolios"}
              {step === 5 && "Application Questionnaire"}
              {step === 6 && "Review & Submit"}
            </span>
            <span className="text-slate-400 font-mono">{Math.round((step / 6) * 100)}% Complete</span>
          </div>

          {/* Wizard Step 1: Personal Details */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-white text-sm">Step 1 — Personal & Academic Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Aravind Kumar"
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-iot-cyan"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Roll Number *</label>
                  <input
                    type="text"
                    required
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="e.g. 24EC018"
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-iot-cyan"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-iot-cyan"
                  >
                    <option>Electronics & Communication</option>
                    <option>Computer Science & Engineering</option>
                    <option>Information Technology</option>
                    <option>Electrical & Electronics</option>
                    <option>Mechanical Engineering</option>
                    <option>Mechatronics</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Year</label>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-iot-cyan"
                    >
                      <option>1st Year</option>
                      <option>2nd Year</option>
                      <option>3rd Year</option>
                      <option>4th Year</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Section</label>
                    <input
                      type="text"
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                      placeholder="A"
                      className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-iot-cyan"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">College Email *</label>
                  <input
                    type="email"
                    required
                    value={collegeEmail}
                    onChange={(e) => setCollegeEmail(e.target.value)}
                    placeholder="student@college.edu"
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-iot-cyan"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-iot-cyan"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Wizard Step 2: Technical Interests */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-white text-sm">Step 2 — Technical Interests</h3>
                <p className="text-xs text-slate-400">Select the domains and hardware topics you are eager to build with:</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {interestOptions.map((item) => {
                  const isSelected = interests.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleInterest(item)}
                      className={`p-3 rounded-xl border text-xs font-medium text-left transition flex items-center justify-between ${
                        isSelected
                          ? "bg-iot-emerald/10 border-iot-emerald text-emerald-300 shadow-sm"
                          : "bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <span>{item}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-iot-emerald" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Wizard Step 3: Skills */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-white text-sm">Step 3 — Existing Technical Skills</h3>
                <p className="text-xs text-slate-400">Add any programming languages, microcontrollers, or tools you have worked with:</p>
              </div>

              {/* Add skill input */}
              <div className="flex flex-col sm:flex-row gap-2 bg-slate-900/60 p-3 rounded-xl border border-dark-border">
                <input
                  type="text"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="e.g. Python, ESP32, KiCAD, MQTT..."
                  className="flex-1 bg-dark-bg border border-dark-border rounded-lg px-3 py-1.5 text-xs text-white"
                />
                <select
                  value={newSkillLevel}
                  onChange={(e) => setNewSkillLevel(e.target.value as any)}
                  className="bg-dark-bg border border-dark-border rounded-lg px-3 py-1.5 text-xs text-white"
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
                <button
                  type="button"
                  onClick={addSkill}
                  className="flex items-center justify-center gap-1 px-4 py-1.5 rounded-lg bg-iot-cyan hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>

              {/* Skills list */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {skills.map((sk, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{sk.name}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-[10px] text-iot-cyan font-mono">
                        {sk.level}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSkill(idx)}
                      className="p-1 text-slate-500 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Wizard Step 4: Profiles & Portfolios */}
          {step === 4 && (
            <div className="space-y-4 text-xs">
              <div>
                <h3 className="font-semibold text-white text-sm">Step 4 — Student Profiles & Prior Work</h3>
                <p className="text-slate-400">Share your GitHub, portfolio, or past projects (optional):</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">GitHub Profile URL</label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username"
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-iot-cyan"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">LinkedIn Profile</label>
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-iot-cyan"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Prior Projects (Brief description or links)</label>
                  <textarea
                    rows={3}
                    value={previousProjects}
                    onChange={(e) => setPreviousProjects(e.target.value)}
                    placeholder="Mention any hardware, school science projects, coding projects, or competitions..."
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-iot-cyan"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Wizard Step 5: Application Questions */}
          {step === 5 && (
            <div className="space-y-4 text-xs">
              <div>
                <h3 className="font-semibold text-white text-sm">Step 5 — Application Questionnaire</h3>
                <p className="text-slate-400">Help the technical review panel understand your goals:</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Why do you want to join the IoT Club? *</label>
                  <textarea
                    rows={3}
                    required
                    value={whyJoin}
                    onChange={(e) => setWhyJoin(e.target.value)}
                    placeholder="Describe your motivation to build physical hardware and learn..."
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-iot-cyan"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">What technologies do you want to master?</label>
                  <input
                    type="text"
                    value={whatToLearn}
                    onChange={(e) => setWhatToLearn(e.target.value)}
                    placeholder="e.g. FreeRTOS, ESP32 Wi-Fi, LoRa, Robotics SLAM"
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-iot-cyan"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Hours can you contribute each week?</label>
                    <select
                      value={hoursPerWeek}
                      onChange={(e) => setHoursPerWeek(e.target.value)}
                      className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-iot-cyan"
                    >
                      <option>6-8 hrs/week</option>
                      <option>10-12 hrs/week</option>
                      <option>15+ hrs/week</option>
                    </select>
                  </div>
                  <div className="space-y-2 pt-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hackathonInterest}
                        onChange={(e) => setHackathonInterest(e.target.checked)}
                        className="rounded bg-dark-bg border-dark-border text-iot-emerald focus:ring-0"
                      />
                      <span className="text-slate-300">Interested in hackathons & competitions</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={researchInterest}
                        onChange={(e) => setResearchInterest(e.target.checked)}
                        className="rounded bg-dark-bg border-dark-border text-iot-cyan focus:ring-0"
                      />
                      <span className="text-slate-300">Interested in research & paper publication</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Wizard Step 6: Review & Submit */}
          {step === 6 && (
            <div className="space-y-4 text-xs">
              <h3 className="font-semibold text-white text-sm">Step 6 — Final Review & Verification</h3>
              <p className="text-slate-400">Please review your submission details before submitting into Batch 2026-01:</p>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div>Name: <span className="text-white font-medium">{fullName || "(Empty)"}</span></div>
                  <div>Roll Number: <span className="text-white font-medium">{rollNumber || "(Empty)"}</span></div>
                  <div>Department: <span className="text-white">{department}</span></div>
                  <div>Email: <span className="text-white">{collegeEmail}</span></div>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <span className="text-slate-500 block mb-1">Interests Selected:</span>
                  <div className="flex flex-wrap gap-1">
                    {interests.map((it, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-emerald-400 font-mono">
                        {it}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <span className="text-slate-500 block mb-1">Skills Listed ({skills.length}):</span>
                  <div className="flex flex-wrap gap-1">
                    {skills.map((sk, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-cyan-400 font-mono">
                        {sk.name} ({sk.level})
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {validationError && (
                <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-800 text-red-300 text-xs">
                  {validationError}
                </div>
              )}
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-dark-border">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            ) : (
              <div />
            )}

            {step < 6 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 1 && (!fullName.trim() || !rollNumber.trim() || !collegeEmail.trim())) {
                    setValidationError("Please complete all required personal fields.");
                    return;
                  }
                  setValidationError("");
                  setStep(step + 1);
                }}
                className="flex items-center gap-1 px-5 py-2 rounded-lg bg-iot-cyan hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-lg bg-iot-emerald hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Application</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
