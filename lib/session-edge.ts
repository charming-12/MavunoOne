type EdgeSessionPayload = {
  id?: number;
  name?: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
  lastActivity?: number;
};

const ABSOLUTE_TIMEOUT_SECONDS = 60 * 60 * 8;
const IDLE_TIMEOUT_SECONDS = 30 * 60;

function getSecret() {
  return process.env.MAVUNO_SESSION_SECRET ?? process.env.NEXTAUTH_SECRET ?? "mavunoone-development-only-secret";
}

function base64UrlToBytes(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(base64);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function base64UrlToText(value: string) {
  return new TextDecoder().decode(base64UrlToBytes(value));
}

function textToBase64Url(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function sign(value: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(getSecret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  let binary = "";
  new Uint8Array(signature).forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function verifySignature(payload: string, signature: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(getSecret()), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
  return crypto.subtle.verify("HMAC", key, base64UrlToBytes(signature), new TextEncoder().encode(payload));
}

export async function getSessionPayloadEdge(token: string | undefined) {
  if (!token) return null;
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;
  try {
    if (!(await verifySignature(encodedPayload, signature))) return null;
    const payload = JSON.parse(base64UrlToText(encodedPayload)) as EdgeSessionPayload;
    const now = Math.floor(Date.now() / 1000);
    const lastActivity = payload.lastActivity ?? payload.iat;
    if (!payload.email || !payload.role || payload.exp <= now || now - lastActivity > IDLE_TIMEOUT_SECONDS) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function refreshSessionTokenEdge(payload: EdgeSessionPayload) {
  const now = Math.floor(Date.now() / 1000);
  const refreshed = { ...payload, lastActivity: now, exp: Math.min(payload.iat + ABSOLUTE_TIMEOUT_SECONDS, now + IDLE_TIMEOUT_SECONDS + 60) };
  const encodedPayload = textToBase64Url(JSON.stringify(refreshed));
  return `${encodedPayload}.${await sign(encodedPayload)}`;
}

export async function getSessionUserFromCookieEdge(token: string | undefined) {
  const payload = await getSessionPayloadEdge(token);
  if (!payload) return null;
  return { id: payload.id, name: payload.name, email: payload.email, role: payload.role };
}

export function isPrivilegedEdgeRole(role: string | undefined) {
  return role === "admin" || role === "boss" || role === "owner";
}

export function isStaffEdgeRole(role: string | undefined) {
  return isPrivilegedEdgeRole(role) || ["manager", "cashier", "storekeeper", "machine_operator"].includes(role ?? "");
}
