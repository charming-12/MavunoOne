import { NextRequest } from "next/server";
import { getSessionUserFromCookie, isPrivilegedRole } from "@/lib/session";

export function getAuthenticatedUser(request: NextRequest) {
  return getSessionUserFromCookie(request.cookies.get("mavunoone-user")?.value);
}

export function requirePrivilegedUser(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  return user && isPrivilegedRole(user.role) ? user : null;
}
