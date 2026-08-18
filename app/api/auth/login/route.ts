import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";
import { verifyPassword } from "@/lib/password";
import { createSessionToken, sessionCookieOptions } from "@/lib/session";
import { getRateLimitStatus, recordRateLimitFailure, getClientId, RATE_LIMITS, formatResetTime } from "@/lib/rate-limit";

const SUPER_ADMIN_EMAIL = process.env.MAVUNO_SUPER_ADMIN_EMAIL ?? "";
const SUPER_ADMIN_PASSWORD = process.env.MAVUNO_SUPER_ADMIN_PASSWORD;
const BOSS_EMAIL = process.env.MAVUNO_BOSS_EMAIL ?? "";
const BOSS_PASSWORD = process.env.MAVUNO_BOSS_PASSWORD;
const defaultCredentials = [
  { email: SUPER_ADMIN_EMAIL, password: SUPER_ADMIN_PASSWORD, role: "admin", name: "Super Admin" },
  { email: BOSS_EMAIL, password: BOSS_PASSWORD, role: "boss", name: "Boss" },
] as const;

const emailLookupCache = new Map<string, (typeof defaultCredentials)[number] | null>();
function getDefaultCredential(email: string) {
  const lowerEmail = email.toLowerCase();
  if (emailLookupCache.has(lowerEmail)) return emailLookupCache.get(lowerEmail);
  const found = defaultCredentials.find((candidate) => candidate.password && candidate.email.toLowerCase() === lowerEmail) || null;
  emailLookupCache.set(lowerEmail, found);
  return found;
}

function authenticatedResponse(user: { id?: number; name?: string; email: string; role: string }) {
  const response = NextResponse.json({ user });
  response.cookies.set("mavunoone-user", createSessionToken(user), sessionCookieOptions());
  return response;
}

export async function POST(request: NextRequest) {
  const clientId = getClientId(request);
  const loginKey = `login:${clientId}`;
  const loginLimit = getRateLimitStatus(loginKey, RATE_LIMITS.LOGIN);
  if (!loginLimit.allowed) {
    return NextResponse.json({ message: `Majaribio mengi ya kuingia. Jaribu tena baada ya ${formatResetTime(loginLimit.resetTime)}.` }, { status: 429 });
  }
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    if (!email || !password) return NextResponse.json({ message: "Barua pepe na neno la siri vinahitajika." }, { status: 400 });

    const defaultUser = getDefaultCredential(email);
    if (defaultUser && defaultUser.password === password) {
      return authenticatedResponse({ email: defaultUser.email, role: defaultUser.role, name: defaultUser.name });
    }

    const existingUser = await Promise.race([
      db.query.users.findFirst({ where: eq(users.email, email) }),
      new Promise<undefined>((_, reject) => setTimeout(() => reject(new Error("AUTH_DATABASE_TIMEOUT")), 15000)),
    ]);
    if (!existingUser) {
      recordRateLimitFailure(loginKey, RATE_LIMITS.LOGIN);
      return NextResponse.json({ message: "Akaunti hii haipo. Tumia akaunti ya MavunoOne." }, { status: 401 });
    }
    if (!existingUser.passwordHash) {
      recordRateLimitFailure(loginKey, RATE_LIMITS.LOGIN);
      return NextResponse.json({ message: "Akaunti ya mtumiaji haijaanzishwa vizuri. Tumia invitation link kuweka password." }, { status: 401 });
    }
    const isValid = await verifyPassword(password, existingUser.passwordHash);
    if (!isValid) {
      recordRateLimitFailure(loginKey, RATE_LIMITS.LOGIN);
      return NextResponse.json({ message: "Neno la siri lisilo sahihi." }, { status: 401 });
    }
    return authenticatedResponse({ id: existingUser.id, name: existingUser.name, email: existingUser.email, role: existingUser.role });
  } catch (error) {
    console.error("Login error:", error);
    if (error instanceof Error && error.message === "AUTH_DATABASE_TIMEOUT") {
      return NextResponse.json({ message: "Database inachelewa kuamka. Subiri sekunde 15 kisha jaribu mara moja tena; request hii haijahesabiwa kama password failure." }, { status: 503 });
    }
    return NextResponse.json({ message: "Kumetokea kosa katika kuingia." }, { status: 500 });
  }
}
