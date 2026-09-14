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
  const [hoursPerWeek, setHoursPerWeek] = useState("8-10 hrs");
  const [hackathonInterest, setHackathonInterest] = useState(true);
  const [researchInterest, setResearchInterest] = useState(false);

  const [validationError, setValidationError] = useState("");

  const interestOptions = [
    "IoT",
    "Embedded Systems",
    "Robotics",
    "AI",
    "AIoT",
    "Sensors & Actuators",
    "Wireless & LoRa",
    "Electronics",
    "Cloud IoT",
    "Automation",
    "Raspberry Pi",
    "ESP32",
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

  const activeApp = submittedAppId
    ? applications.find((a) => a.id === submittedAppId)
    : applications[0];

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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8 text-slate-800">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 mb-1">
            <span>RECRUITMENT BATCH 2026-01</span>
            <span>•</span>
            <span className="text-emerald-600 font-bold">REGISTRATION OPEN</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">IoT Club Registration Portal</h1>
          <p className="text-xs text-slate-500 mt-1">
            Submit your candidate application or track your recruitment pipeline status.
          </p>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-2">
          {submittedAppId ? (
            <button
              onClick={() => {
                setSubmittedAppId(null);
                setStep(1);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 shadow-xs"
            >
              + Submit Another Application
            </button>
          ) : (
            <button
              onClick={() => setSubmittedAppId(applications[0].id)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200/80 transition"
            >
              Preview Live Status Tracker
            </button>
          )}
        </div>
      </div>

      {/* VIEW A: RECRUITMENT STATUS TRACKER */}
      {submittedAppId && activeApp ? (
        <div className="space-y-6">
          <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <span className="text-xs font-mono text-slate-500">APPLICATION ID: {activeApp.id}</span>
                <h2 className="text-lg font-bold text-slate-900">{activeApp.fullName} ({activeApp.rollNumber})</h2>
                <div className="text-xs text-slate-600">
                  {activeApp.department} • {activeApp.year} (Sec {activeApp.section})
                </div>
              </div>
              <div className="px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800">
                Current Status: <span className="font-bold text-emerald-900">{activeApp.status}</span>
              </div>
            </div>

            {/* Pipeline Stepper */}
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
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
                      className={`p-3.5 rounded-2xl border text-xs transition flex flex-col justify-between ${
                        isCurrent
                          ? "bg-emerald-50/90 border-emerald-500 text-slate-900 ring-1 ring-emerald-500 shadow-xs"
                          : isCompleted
                          ? "bg-emerald-50/50 border-emerald-200 text-slate-700"
                          : "bg-slate-50 border-slate-200/60 text-slate-400"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-[10px] text-slate-400">STAGE 0{idx + 1}</span>
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : isCurrent ? (
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>
                        <div className="font-bold text-slate-900 leading-tight mb-1">{stg.label}</div>
                        <p className="text-[11px] text-slate-500 leading-tight">{stg.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Application Summary Box */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-3">
              <h4 className="font-bold text-slate-900">Candidate Submission Summary</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-700">
                <div>
                  <span className="text-slate-500">Selected Interests:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {activeApp.interests.map((it, i) => (
                      <span key={i} className="px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-[10px] text-slate-700 font-medium">
                        {it}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Technical Skills:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {activeApp.skills.map((sk, i) => (
                      <span key={i} className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-800 font-medium">
                        {sk.name} ({sk.level})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* VIEW B: 6-STEP APPLICATION WIZARD */
        <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between text-xs pb-4 border-b border-slate-200">
            <span className="font-bold text-slate-900">
              Step {step} of 6:{" "}
              {step === 1 && "Personal Details"}
              {step === 2 && "Technical Interests"}
              {step === 3 && "Skills & Proficiency"}
              {step === 4 && "Student Profiles & Portfolios"}
              {step === 5 && "Application Questionnaire"}
              {step === 6 && "Review & Submit"}
            </span>
            <span className="text-emerald-700 font-semibold font-mono">{Math.round((step / 6) * 100)}% Complete</span>
          </div>

          {/* Wizard Step 1: Personal Details */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Step 1 — Personal & Academic Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Aravind Kumar"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Roll / Register Number *</label>
                  <input
                    type="text"
                    required
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="e.g. 714023106001"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
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
                    <label className="block text-slate-700 font-medium mb-1">Year</label>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                    >
                      <option>1st Year</option>
                      <option>2nd Year</option>
                      <option>3rd Year</option>
                      <option>4th Year</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Section</label>
                    <input
                      type="text"
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                      placeholder="A"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">College Email *</label>
                  <input
                    type="email"
                    required
                    value={collegeEmail}
                    onChange={(e) => setCollegeEmail(e.target.value)}
                    placeholder="student@srishakthi.ac.in"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Wizard Step 2: Technical Interests */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Step 2 — Technical Interests</h3>
                <p className="text-xs text-slate-500">Select the domains you are most eager to build with:</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {interestOptions.map((item) => {
                  const isSelected = interests.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleInterest(item)}
                      className={`p-3 rounded-2xl border text-xs font-medium text-left transition flex items-center justify-between ${
                        isSelected
                          ? "bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span>{item}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
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
                <h3 className="font-bold text-slate-900 text-sm">Step 3 — Existing Technical Skills</h3>
                <p className="text-xs text-slate-500">Add any languages or microcontrollers you have touched (beginners welcome):</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <input
                  type="text"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="e.g. Python, ESP32, C, KiCAD..."
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900"
                />
                <select
                  value={newSkillLevel}
                  onChange={(e) => setNewSkillLevel(e.target.value as any)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900"
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs transition"
                >
                  <Plus className="w-3.5 h-3.5 inline mr-1" /> Add
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {skills.map((sk, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 text-xs shadow-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">{sk.name}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-[10px] text-emerald-800 font-medium">
                        {sk.level}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSkill(idx)}
                      className="p-1 text-slate-400 hover:text-red-500 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Wizard Step 4: Profiles */}
          {step === 4 && (
            <div className="space-y-4 text-xs">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Step 4 — Student Profiles (Optional)</h3>
                <p className="text-slate-500">Share your GitHub or portfolio if you have one:</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">GitHub Profile URL</label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-emerald-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">LinkedIn Profile</label>
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-emerald-500 transition"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Wizard Step 5: Motivation */}
          {step === 5 && (
            <div className="space-y-4 text-xs">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Step 5 — Motivation & Commitment</h3>
                <p className="text-slate-500">Tell us a bit about your goals:</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Why do you want to join the IoT Club? *</label>
                  <textarea
                    rows={3}
                    required
                    value={whyJoin}
                    onChange={(e) => setWhyJoin(e.target.value)}
                    placeholder="Describe your motivation to build physical hardware..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-emerald-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Hours you can contribute per week?</label>
                  <select
                    value={hoursPerWeek}
                    onChange={(e) => setHoursPerWeek(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-emerald-500 transition"
                  >
                    <option>6-8 hrs/week</option>
                    <option>8-10 hrs/week</option>
                    <option>12+ hrs/week</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Wizard Step 6: Review & Submit */}
          {step === 6 && (
            <div className="space-y-4 text-xs">
              <h3 className="font-bold text-slate-900 text-sm">Step 6 — Final Review</h3>
              <p className="text-slate-500">Please verify your details before submitting:</p>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>Name: <span className="font-bold text-slate-900">{fullName}</span></div>
                  <div>Roll: <span className="font-bold text-slate-900">{rollNumber}</span></div>
                  <div>Dept: <span className="text-slate-800">{department}</span></div>
                  <div>Email: <span className="text-slate-800">{collegeEmail}</span></div>
                </div>
              </div>

              {validationError && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                  {validationError}
                </div>
              )}
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 transition"
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
                    setValidationError("Please fill all required personal fields.");
                    return;
                  }
                  setValidationError("");
                  setStep(step + 1);
                }}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs shadow-xs transition"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
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
