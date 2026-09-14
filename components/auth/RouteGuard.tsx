"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useIoTApp } from "@/lib/store";
import { AuthRole } from "@/lib/types";
import { Lock, ShieldAlert, ArrowRight, LogIn, LogOut, Cpu } from "lucide-react";

interface RouteGuardProps {
  children: React.ReactNode;
  requiredRoles: AuthRole[];
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ children, requiredRoles }) => {
  const pathname = usePathname();
  const { currentUser, isAuthenticated, logout } = useIoTApp();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Prevent hydration mismatch while reading localStorage
  if (!isMounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 font-mono text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span>Verifying secure college session...</span>
        </div>
      </div>
    );
  }

  // 1. Not Authenticated
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="max-w-md mx-auto my-16 px-4">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-5 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Authentication Required
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              This portal is strictly restricted to verified college members of the Internet of Things Club at Sri Shakthi Institute of Engineering and Technology.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 font-mono">
            Attempted access: <span className="font-bold text-slate-900">{pathname}</span>
          </div>

          <Link
            href={`/login?redirect=${encodeURIComponent(pathname)}`}
            className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In with College Email</span>
          </Link>

          <p className="text-[11px] text-slate-400">
            Designated accounts are routed to their assigned portals automatically upon login.
          </p>
        </div>
      </div>
    );
  }

  // 2. Authenticated but Role Not Authorized
  if (!requiredRoles.includes(currentUser.role)) {
    return (
      <div className="max-w-md mx-auto my-16 px-4">
        <div className="bg-white rounded-3xl border border-rose-200 p-8 text-center space-y-5 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto shadow-xs">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Access Restricted
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your logged-in account does not possess the required authorization for this area.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-left space-y-1">
            <div className="text-slate-500 text-[10px] uppercase font-mono">Current Session:</div>
            <div className="font-bold text-slate-900 truncate">{currentUser.name}</div>
            <div className="text-[11px] text-slate-600">{currentUser.email}</div>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-200 text-slate-700">
              Role: {currentUser.role}
            </span>
          </div>

          <div className="space-y-2 pt-1">
            <Link
              href={currentUser.portalRedirect || "/"}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2"
            >
              <span>Go to Your Designated Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={logout}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-slate-400" />
              <span>Sign In with Different ID</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authorized
  return <>{children}</>;
};
