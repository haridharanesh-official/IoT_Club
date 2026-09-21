"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useIoTApp } from "@/lib/store";
import {
  Cpu,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  GraduationCap,
  Sparkles,
  ShieldAlert,
  Eye,
  EyeOff,
  UserCheck,
  Building,
} from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");

  const { loginWithCollegeEmail, registerStudent, currentUser } = useIoTApp();

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Register form state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regRoll, setRegRoll] = useState("");
  const [regDept, setRegDept] = useState("Information Technology & Embedded IoT");
  const [regPassword, setRegPassword] = useState("");
  const [regError, setRegError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoading(true);

    setTimeout(() => {
      const res = loginWithCollegeEmail(email, password);
      setIsLoading(false);

      if (!res.success) {
        setLoginError(res.error || "Authentication failed.");
      } else {
        const dest = redirectParam || res.redirectUrl || "/";
        router.push(dest);
      }
    }, 400);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    setIsLoading(true);

    setTimeout(() => {
      const res = registerStudent({
        email: regEmail,
        password: regPassword,
        name: regName,
        rollNumber: regRoll,
        department: regDept,
      });
      setIsLoading(false);

      if (!res.success) {
        setRegError(res.error || "Registration failed.");
      } else {
        router.push(res.redirectUrl || "/dashboard");
      }
    }, 400);
  };

  // Quick Preset Helper for testing
  const selectPreset = (pEmail: string, pPass: string) => {
    setEmail(pEmail);
    setPassword(pPass);
    setLoginError("");
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-xl w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
            <Cpu className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Sri Shakthi IoT Club Portal
          </h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Designated institutional access for students, faculty mentors, club leads, and lab administrators.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-100 bg-slate-50/70 p-1.5 gap-1 text-xs font-bold">
            <button
              onClick={() => {
                setActiveTab("login");
                setLoginError("");
              }}
              className={`flex-1 py-2.5 rounded-xl transition cursor-pointer ${
                activeTab === "login"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Sign In with College Email
            </button>

            <button
              onClick={() => {
                setActiveTab("register");
                setRegError("");
              }}
              className={`flex-1 py-2.5 rounded-xl transition cursor-pointer ${
                activeTab === "register"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              New Student Registration
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* ----------------- TAB 1: LOGIN ----------------- */}
            {activeTab === "login" && (
              <form onSubmit={handleLogin} className="space-y-4 text-xs">
                {loginError && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Official College Email ID *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.name@siet.ac.in"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Use your official college email domain (@siet.ac.in)
                  </span>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Security Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-10 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{isLoading ? "Authenticating..." : "Sign In & Enter Portal"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Quick Presets for Role Evaluation */}
                <div className="pt-4 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>Quick Fill for Testing Portals:</span>
                    <span className="font-mono text-[10px] text-emerald-700">One-click presets</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => selectPreset("hari.23ec@siet.ac.in", "student123")}
                      className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-left transition cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Student</span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">hari.23ec@siet.ac.in</div>
                      <div className="text-[9px] text-emerald-700 font-mono mt-0.5">➔ /dashboard</div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        selectPreset("swaminathan.faculty@siet.ac.in", "faculty123")
                      }
                      className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-left transition cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span>Faculty Evaluator</span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        swaminathan.faculty@siet.ac.in
                      </div>
                      <div className="text-[9px] text-emerald-700 font-mono mt-0.5">➔ /teacher</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => selectPreset("lead.iotclub@siet.ac.in", "clublead123")}
                      className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-left transition cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <Cpu className="w-3.5 h-3.5 text-purple-600" />
                        <span>Club Lead</span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">lead.iotclub@siet.ac.in</div>
                      <div className="text-[9px] text-emerald-700 font-mono mt-0.5">➔ /projects</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => selectPreset("admin.iot@siet.ac.in", "admin123")}
                      className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-left transition cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                        <span>Super Admin</span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">admin.iot@siet.ac.in</div>
                      <div className="text-[9px] text-emerald-700 font-mono mt-0.5">➔ /admin</div>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* ----------------- TAB 2: REGISTER ----------------- */}
            {activeTab === "register" && (
              <form onSubmit={handleRegister} className="space-y-4 text-xs">
                {regError && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{regError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar S"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="yourname@gmail.com or @siet.ac.in"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Roll Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={regRoll}
                      onChange={(e) => setRegRoll(e.target.value)}
                      placeholder="e.g. 727723EUIT099 (Optional for 1st Year)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Department *</label>
                  <select
                    value={regDept}
                    onChange={(e) => setRegDept(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white cursor-pointer"
                  >
                    <option value="Information Technology & Embedded IoT">
                      Information Technology (IT)
                    </option>
                    <option value="Electronics & Communication Engineering">
                      Electronics & Communication (ECE)
                    </option>
                    <option value="Computer Science & Engineering">
                      Computer Science (CSE)
                    </option>
                    <option value="Artificial Intelligence & Data Science">
                      Artificial Intelligence & Data Science (AI & DS)
                    </option>
                    <option value="Mechanical & Robotics Automation">
                      Mechanical & Robotics Automation
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Create Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{isLoading ? "Creating Account..." : "Register & Open Student Portal"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Back to Public Home */}
        <div className="text-center">
          <Link
            href="/"
            className="text-xs text-slate-500 hover:text-emerald-700 font-medium inline-flex items-center gap-1 transition"
          >
            <span>← Back to Public Website</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
