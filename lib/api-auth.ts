import { NextRequest } from "next/server";
import { getSessionUserFromCookie, isPrivilegedRole } from "@/lib/session";

export function getAuthenticatedUser(request: NextRequest) {
  return getSessionUserFromCookie(request.cookies.get("mavunoone-user")?.value);
}

export function requirePrivilegedUser(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  return user && isPrivilegedRole(user.role) ? user : null;
}

export function requireAdminUser(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  return user && ["admin", "owner"].includes(user.role) ? user : null;
}

export function requireAnalyticsUser(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  return user && ["admin", "owner", "manager"].includes(user.role) ? user : null;
}
