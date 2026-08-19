import { NextRequest, NextResponse } from "next/server";
import { getSessionPayloadEdge, isStaffEdgeRole, refreshSessionTokenEdge } from "@/lib/session-edge";

const SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "geolocation=(self), camera=(self), microphone=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-site",
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("mavunoone-user")?.value;
  const sessionPayload = await getSessionPayloadEdge(sessionCookie);
  const user = sessionPayload ? { id: sessionPayload.id, name: sessionPayload.name, email: sessionPayload.email, role: sessionPayload.role } : null;

  let response: NextResponse;
  if (pathname.startsWith("/boss")) {
    if (!user || user.role !== "boss") {
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

  if (sessionPayload && user) {
    const refreshedToken = await refreshSessionTokenEdge(sessionPayload);
    response.cookies.set("mavunoone-user", refreshedToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
  }
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => response.headers.set(key, value));
  if (process.env.NODE_ENV === "production") response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  const csp = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; connect-src 'self' https:; font-src 'self' data:;";
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: ["/boss/:path*", "/office/:path*", "/shop/:path*", "/login"],
};
