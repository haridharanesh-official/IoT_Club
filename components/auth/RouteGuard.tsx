"use client";

import React from "react";

interface RouteGuardProps {
  children: React.ReactNode;
  requiredRoles?: any[];
}

/**
 * Legacy RouteGuard wrapper.
 * In accordance with Phase 08 architecture, all AUTHORIZATION authority has been
 * transferred to server-side destination resolution (resolveUserDestination)
 * and Server Component guards. Mock client-side state no longer possesses
 * authorization authority.
 */
export const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  return <>{children}</>;
};

