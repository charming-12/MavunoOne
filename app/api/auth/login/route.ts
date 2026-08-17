import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";
import { verifyPassword } from "@/lib/password";
import { createSessionToken, sessionCookieOptions } from "@/lib/session";

const SUPER_ADMIN_EMAIL = process.env.MAVUNO_SUPER_ADMIN_EMAIL ?? "admin@mavunoone.co.tz";
const SUPER_ADMIN_PASSWORD = process.env.MAVUNO_SUPER_ADMIN_PASSWORD;
const BOSS_EMAIL = process.env.MAVUNO_BOSS_EMAIL ?? "boss@mavunoone.co.tz";
const BOSS_PASSWORD = process.env.MAVUNO_BOSS_PASSWORD;

const defaultCredentials = [
  { email: SUPER_ADMIN_EMAIL, password: SUPER_ADMIN_PASSWORD, role: "admin", name: "Super Admin" },
  { email: BOSS_EMAIL, password: BOSS_PASSWORD, role: "boss", name: "Boss" },
] as const;

function authenticatedResponse(user: { id?: number; name?: string; email: string; role: string }) {
  const response = NextResponse.json({ user });
  response.cookies.set("mavunoone-user", createSessionToken(user), sessionCookieOptions());
  return response;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json({ message: "Barua pepe na neno la siri vinahitajika." }, { status: 400 });
    }

    const existingUser = await db.query.users.findFirst({ where: eq(users.email, email) });

    if (existingUser && existingUser.passwordHash) {
      const isValid = await verifyPassword(password, existingUser.passwordHash);
      if (!isValid) return NextResponse.json({ message: "Neno la siri lisilo sahihi." }, { status: 401 });
      return authenticatedResponse({ id: existingUser.id, name: existingUser.name, email: existingUser.email, role: existingUser.role });
    }

    const defaultUser = defaultCredentials.find((candidate) => candidate.password && candidate.email.toLowerCase() === email);
    if (!defaultUser) return NextResponse.json({ message: "Akaunti hii haipo. Tumia akaunti ya MavunoOne." }, { status: 401 });

    const seededUser = await db.query.users.findFirst({ where: eq(users.email, defaultUser.email) });
    if (!seededUser || !seededUser.passwordHash) {
      return NextResponse.json({ message: "Akaunti ya mtumiaji haijaanzishwa vizuri. Tafadhali seed tena database." }, { status: 401 });
    }

    const isValidDefault = await verifyPassword(password, seededUser.passwordHash);
    if (!isValidDefault) return NextResponse.json({ message: "Neno la siri lisilo sahihi." }, { status: 401 });

    return authenticatedResponse({ id: seededUser.id, name: seededUser.name, email: seededUser.email, role: seededUser.role });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "Kumetokea kosa katika kuingia." }, { status: 500 });
  }
}
