import { NextRequest, NextResponse } from "next/server";
import { getSessionTokenFromHeader, refreshSessionToken, sessionCookieOptions, verifySessionToken } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const token = getSessionTokenFromHeader(request.headers.get("cookie"));
  const user = verifySessionToken(token);
  if (!user || !token) {
    const response = NextResponse.json({ authenticated: false }, { status: 401 });
    response.cookies.set("mavunoone-user", "", { ...sessionCookieOptions(0), expires: new Date(0) });
    return response;
  }
  const refreshedToken = refreshSessionToken(token);
  const response = NextResponse.json({ authenticated: true, user }, { headers: { "Cache-Control": "no-store" } });
  if (refreshedToken) response.cookies.set("mavunoone-user", refreshedToken, sessionCookieOptions());
  return response;
}
