import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { auditLogs, users } from "@/drizzle/schema";
import { hashPassword } from "@/lib/password";

const constantTimeEqual = (left: string, right: string) => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

export async function POST(request: NextRequest) {
  const configuredSecret = process.env.MAVUNO_BOOTSTRAP_SECRET;
  const providedSecret = request.headers.get("x-mavuno-bootstrap-secret") ?? "";
  if (!configuredSecret || !constantTimeEqual(providedSecret, configuredSecret)) {
    return NextResponse.json({ message: "Bootstrap is not authorized" }, { status: 401 });
  }

  const adminEmail = process.env.MAVUNO_SUPER_ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.MAVUNO_SUPER_ADMIN_PASSWORD;
  const bossEmail = process.env.MAVUNO_BOSS_EMAIL?.trim().toLowerCase();
  const bossPassword = process.env.MAVUNO_BOSS_PASSWORD;
  if (!adminEmail || !adminPassword || !bossEmail || !bossPassword) {
    return NextResponse.json({ message: "Admin and Boss credentials must be configured in Render environment variables" }, { status: 400 });
  }

  try {
    const credentials = [
      { email: adminEmail, password: adminPassword, name: "System Administrator", role: "admin" as const },
      { email: bossEmail, password: bossPassword, name: "Business Boss", role: "boss" as const },
    ];
    const emails = credentials.map((credential) => credential.email);
    const existingUsers = await db.query.users.findMany({ where: inArray(users.email, emails) });
    const changed: Array<{ email: string; role: string; action: "created" | "updated" }> = [];

    for (const credential of credentials) {
      const passwordHash = await hashPassword(credential.password);
      const existing = existingUsers.find((user) => user.email === credential.email);
      if (existing) {
        await db.update(users).set({ name: credential.name, role: credential.role, passwordHash, passwordResetToken: null, passwordResetExpires: null }).where(eq(users.id, existing.id));
        changed.push({ email: credential.email, role: credential.role, action: "updated" });
        await db.insert(auditLogs).values({ action: "bootstrap_update", tableName: "users", recordId: existing.id, newValueJson: JSON.stringify({ email: credential.email, role: credential.role }) });
      } else {
        const [created] = await db.insert(users).values({ name: credential.name, email: credential.email, passwordHash, role: credential.role }).returning({ id: users.id });
        changed.push({ email: credential.email, role: credential.role, action: "created" });
        await db.insert(auditLogs).values({ action: "bootstrap_create", tableName: "users", recordId: created.id, newValueJson: JSON.stringify({ email: credential.email, role: credential.role }) });
      }
    }

    return NextResponse.json({ success: true, message: "Initial accounts are ready. Remove or rotate MAVUNO_BOOTSTRAP_SECRET after this call.", accounts: changed });
  } catch (error) {
    console.error("Account bootstrap failed:", error);
    return NextResponse.json({ message: "Account bootstrap failed" }, { status: 500 });
  }
}
