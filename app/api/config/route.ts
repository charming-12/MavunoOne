import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { configurations } from "@/drizzle/schema";
import { requirePrivilegedUser } from "@/lib/api-auth";
import { encryptConfigValue, isEncryptedConfigValue } from "@/lib/config-crypto";

function unauthorized() {
  return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
}

export async function GET(request: NextRequest) {
  if (!requirePrivilegedUser(request)) return unauthorized();
  try {
    const configs = await db.query.configurations.findMany();
    const safeConfigs = configs.map((config) => config.isEncrypted || isEncryptedConfigValue(config.value)
      ? { ...config, value: "[configured]" }
      : config);
    return NextResponse.json(safeConfigs, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch configurations:", error);
    return NextResponse.json({ message: "Failed to fetch configurations" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!requirePrivilegedUser(request)) return unauthorized();
  try {
    const body = await request.json();
    const { key, value, description, isEncrypted } = body;
    if (!key || value === undefined || value === null) {
      return NextResponse.json({ message: "Key and value are required" }, { status: 400 });
    }

    const encrypted = Boolean(isEncrypted);
    const storedValue = encrypted ? encryptConfigValue(String(value)) : String(value);
    const existing = await db.query.configurations.findFirst({ where: eq(configurations.key, key) });
    const result = existing
      ? await db.update(configurations).set({ value: storedValue, description: description || existing.description, isEncrypted: encrypted, updatedAt: new Date() }).where(eq(configurations.key, key)).returning()
      : await db.insert(configurations).values({ key: String(key), value: storedValue, description: description || null, isEncrypted: encrypted }).returning();

    return NextResponse.json({ message: existing ? "Configuration updated" : "Configuration created", config: { ...result[0], value: encrypted ? "[configured]" : result[0].value } }, { status: 200 });
  } catch (error) {
    console.error("Failed to save configuration:", error);
    return NextResponse.json({ message: "Failed to save configuration" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!requirePrivilegedUser(request)) return unauthorized();
  try {
    const key = new URL(request.url).searchParams.get("key");
    if (!key) return NextResponse.json({ message: "Key is required" }, { status: 400 });
    await db.delete(configurations).where(eq(configurations.key, key));
    return NextResponse.json({ message: "Configuration deleted" }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete configuration:", error);
    return NextResponse.json({ message: "Failed to delete configuration" }, { status: 500 });
  }
}
