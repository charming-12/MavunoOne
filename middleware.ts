import { NextRequest, NextResponse } from "next/server";
import { getSessionUserFromCookieEdge, isPrivilegedEdgeRole, isStaffEdgeRole } from "@/lib/session-edge";

const SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const user = await getSessionUserFromCookieEdge(request.cookies.get("mavunoone-user")?.value);

  let response: NextResponse;
  if (pathname.startsWith("/boss")) {
    if (!user || !isPrivilegedEdgeRole(user.role)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    response = NextResponse.next();
  } else if (pathname.startsWith("/office")) {
    if (!user || !isStaffEdgeRole(user.role)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    response = NextResponse.next();
  } else {
    response = NextResponse.next();
  }

  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => response.headers.set(key, value));
  const csp = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; connect-src 'self' https:; font-src 'self' data:;";
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: ["/boss/:path*", "/office/:path*", "/shop/:path*", "/login"],
};
