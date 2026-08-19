import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { configurations } from "@/drizzle/schema";
import { requireAdminUser } from "@/lib/api-auth";
import { encryptConfigValue, isEncryptedConfigValue } from "@/lib/config-crypto";

function unauthorized() {
  return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
}

const configKeySchema = z.string().trim().min(1).max(100).regex(/^[A-Za-z0-9_.:-]+$/);
const configWriteSchema = z.object({
  key: configKeySchema,
  value: z.union([z.string().max(10000), z.number(), z.boolean()]),
  description: z.string().trim().max(500).optional().nullable(),
  isEncrypted: z.boolean().optional().default(false),
});

export async function GET(request: NextRequest) {
  if (!requireAdminUser(request)) return unauthorized();
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
  if (!requireAdminUser(request)) return unauthorized();
  try {
    const body = configWriteSchema.parse(await request.json());
    const { key, value, description, isEncrypted } = body;

    const encrypted = Boolean(isEncrypted);
    const storedValue = encrypted ? encryptConfigValue(String(value)) : String(value);
    const existing = await db.query.configurations.findFirst({ where: eq(configurations.key, key) });
    const result = existing
      ? await db.update(configurations).set({ value: storedValue, description: description || existing.description, isEncrypted: encrypted, updatedAt: new Date() }).where(eq(configurations.key, key)).returning()
      : await db.insert(configurations).values({ key: String(key), value: storedValue, description: description || null, isEncrypted: encrypted }).returning();

    return NextResponse.json({ message: existing ? "Configuration updated" : "Configuration created", config: { ...result[0], value: encrypted ? "[configured]" : result[0].value } }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ message: "Configuration input is invalid." }, { status: 400 });
    console.error("Failed to save configuration:", error);
    return NextResponse.json({ message: "Failed to save configuration" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!requireAdminUser(request)) return unauthorized();
  try {
    const rawKey = new URL(request.url).searchParams.get("key");
    const parsedKey = configKeySchema.safeParse(rawKey);
    if (!parsedKey.success) return NextResponse.json({ message: "Key is invalid" }, { status: 400 });
    const key = parsedKey.data;
    await db.delete(configurations).where(eq(configurations.key, key));
    return NextResponse.json({ message: "Configuration deleted" }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete configuration:", error);
    return NextResponse.json({ message: "Failed to delete configuration" }, { status: 500 });
  }
}
