import { createHmac, timingSafeEqual } from "node:crypto";

export type SessionUser = {
  id?: number;
  name?: string;
  email: string;
  role: string;
  jobTitle?: string | null;
};

export const SESSION_ABSOLUTE_TIMEOUT_SECONDS = 60 * 60 * 8;
export const SESSION_IDLE_TIMEOUT_SECONDS = 30 * 60;

type SessionPayload = SessionUser & {
  iat: number;
  exp: number;
  lastActivity: number;
};

function getSessionSecret() {
  const secret = process.env.MAVUNO_SESSION_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("MAVUNO_SESSION_SECRET or NEXTAUTH_SECRET must be configured in production");
  }
  return secret ?? "mavunoone-development-only-secret";
}

function encode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

export function createSessionToken(user: SessionUser, maxAgeSeconds = SESSION_ABSOLUTE_TIMEOUT_SECONDS, lastActivity = Math.floor(Date.now() / 1000)) {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = { ...user, iat: now, exp: now + maxAgeSeconds, lastActivity };
  const encodedPayload = encode(JSON.stringify(payload));
  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifySessionToken(token: string | undefined): SessionUser | null {
  if (!token) return null;

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  const expected = Buffer.from(sign(encodedPayload));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;

  try {
    const payload = JSON.parse(decode(encodedPayload)) as SessionPayload;
    const now = Math.floor(Date.now() / 1000);
    const lastActivity = payload.lastActivity ?? payload.iat;
    if (!payload.email || !payload.role || payload.exp <= now || now - lastActivity > SESSION_IDLE_TIMEOUT_SECONDS) return null;
    return { id: payload.id, name: payload.name, email: payload.email, role: payload.role, jobTitle: payload.jobTitle ?? null };
  } catch {
    return null;
  }
}

export function getSessionUserFromCookie(cookieValue: string | undefined) {
  return verifySessionToken(cookieValue);
}

export function getSessionUserFromHeader(cookieHeader: string | null) {
  const match = cookieHeader?.match(/(?:^|;\s*)mavunoone-user=([^;]+)/);
  return getSessionUserFromCookie(match?.[1] ? decodeURIComponent(match[1]) : undefined);
}

export function sessionCookieOptions(maxAge = SESSION_ABSOLUTE_TIMEOUT_SECONDS) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export function clearSessionCookieOptions() {
  return { ...sessionCookieOptions(0), expires: new Date(0) };
}

export function isPrivilegedRole(role: string | undefined) {
  return role === "admin" || role === "boss" || role === "owner";
}

export function isStaffRole(role: string | undefined) {
  return isPrivilegedRole(role) || ["manager", "cashier", "storekeeper", "machine_operator"].includes(role ?? "");
}

export function refreshSessionToken(token: string | undefined) {
  if (!token) return null;
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;
  const expected = Buffer.from(sign(encodedPayload));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;
  try {
    const payload = JSON.parse(decode(encodedPayload)) as SessionPayload;
    const now = Math.floor(Date.now() / 1000);
    const lastActivity = payload.lastActivity ?? payload.iat;
    if (!payload.email || !payload.role || payload.exp <= now || now - lastActivity > SESSION_IDLE_TIMEOUT_SECONDS) return null;
    const refreshedPayload: SessionPayload = { ...payload, iat: payload.iat, exp: payload.exp, lastActivity: now };
    const refreshedEncoded = encode(JSON.stringify(refreshedPayload));
    return `${refreshedEncoded}.${sign(refreshedEncoded)}`;
  } catch {
    return null;
  }
}

export function getSessionTokenFromHeader(cookieHeader: string | null) {
  const match = cookieHeader?.match(/(?:^|;\s*)mavunoone-user=([^;]+)/);
  return match?.[1] ? decodeURIComponent(match[1]) : undefined;
}
