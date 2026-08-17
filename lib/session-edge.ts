type EdgeSessionPayload = {
  id?: number;
  name?: string;
  email: string;
  role: string;
  exp: number;
};

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

async function verifySignature(payload: string, signature: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  return crypto.subtle.verify(
    "HMAC",
    key,
    base64UrlToBytes(signature),
    new TextEncoder().encode(payload),
  );
}

export async function getSessionUserFromCookieEdge(token: string | undefined) {
  if (!token) return null;
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  try {
    if (!(await verifySignature(encodedPayload, signature))) return null;
    const payload = JSON.parse(base64UrlToText(encodedPayload)) as EdgeSessionPayload;
    if (!payload.email || !payload.role || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return { id: payload.id, name: payload.name, email: payload.email, role: payload.role };
  } catch {
    return null;
  }
}

export function isPrivilegedEdgeRole(role: string | undefined) {
  return role === "admin" || role === "boss" || role === "owner";
}

export function isStaffEdgeRole(role: string | undefined) {
  return isPrivilegedEdgeRole(role) || ["manager", "cashier", "storekeeper", "machine_operator"].includes(role ?? "");
}
