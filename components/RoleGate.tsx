"use client";

import { readStoredUser } from "@/lib/auth";

export function RoleGate({
  allowedRoles,
  children,
  fallback,
}: {
  allowedRoles: Array<string>;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const currentUser = readStoredUser();
  const canAccess = Boolean(currentUser?.role && allowedRoles.includes(currentUser.role));

  if (!canAccess) {
    return <>{fallback ?? null}</>;
  }

  return <>{children}</>;
}
