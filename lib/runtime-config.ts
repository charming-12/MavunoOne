import { db } from "@/lib/db";

export const REQUIRED_RUNTIME_KEYS = [
  "LIPA_NUMBER",
  "LIPA_API_KEY",
  "CCTV_IP",
  "CCTV_USERNAME",
  "CCTV_PASSWORD",
  "NEXTSMS_USERNAME",
  "NEXTSMS_PASSWORD",
  "NEXTSMS_TOKEN",
  "RESEND_API_KEY",
] as const;

export type RuntimeConfigKey = (typeof REQUIRED_RUNTIME_KEYS)[number];

export async function getConfigValue(key: string): Promise<string | null> {
  const normalizedKey = key.trim();

  if (!normalizedKey) return null;

  try {
    const config = await db.query.configurations.findFirst({
      where: (table, { eq }) => eq(table.key, normalizedKey),
    });

    if (config?.value) {
      return config.value;
    }
  } catch (error) {
    console.warn(`Config lookup failed for ${normalizedKey}:`, error);
  }

  return process.env[normalizedKey] ?? null;
}

export async function getRuntimeSettings(): Promise<Record<string, string>> {
  const values: Record<string, string> = {};

  for (const key of REQUIRED_RUNTIME_KEYS) {
    const value = await getConfigValue(key);
    if (value) values[key] = value;
  }

  return values;
}

export async function isRuntimeReady(): Promise<{ ready: boolean; missing: string[] }> {
  const missing: string[] = [];

  for (const key of REQUIRED_RUNTIME_KEYS) {
    const value = await getConfigValue(key);
    if (!value || value.trim() === "") {
      missing.push(key);
    }
  }

  return { ready: missing.length === 0, missing };
}

export async function getAdminAccessSettings(): Promise<Record<string, string>> {
  const result: Record<string, string> = {};

  for (const key of [
    "MAVUNO_SUPER_ADMIN_EMAIL",
    "MAVUNO_SUPER_ADMIN_PASSWORD",
    "MAVUNO_BOSS_EMAIL",
    "MAVUNO_BOSS_PASSWORD",
  ]) {
    const value = await getConfigValue(key);
    if (value) result[key] = value;
  }

  return result;
}
