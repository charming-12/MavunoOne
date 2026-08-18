import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { auditLogs, passwordResetTokens, users } from "@/drizzle/schema";
import { requireAdminUser } from "@/lib/api-auth";

const roles = ["boss", "owner", "manager", "cashier", "storekeeper", "machine_operator", "customer", "admin"] as const;
type Role = (typeof roles)[number];

export async function GET(request: NextRequest) {
  const actor = requireAdminUser(request);
  if (!actor) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const records = await db.query.users.findMany({ orderBy: (table, { desc }) => desc(table.createdAt), limit: 500 });
  return NextResponse.json({ users: records.map((user) => ({ id: user.id, name: user.name, email: user.email, phone: user.phone, jobTitle: user.jobTitle, role: user.role, createdAt: user.createdAt })) });
}

export async function POST(request: NextRequest) {
  const actor = requireAdminUser(request);
  if (!actor || !["admin", "owner"].includes(actor.role)) return NextResponse.json({ message: "Only Admin or Owner can provision staff accounts" }, { status: 403 });
  try {
    const body = await request.json() as { name?: string; email?: string; phone?: string; jobTitle?: string; role?: string };
    const name = String(body.name ?? "").trim();
    const jobTitle = String(body.jobTitle ?? "").trim() || null;
    const email = String(body.email ?? "").trim().toLowerCase();
    const role = body.role as Role;
    if (!name || !email || !email.includes("@") || !roles.includes(role)) return NextResponse.json({ message: "Name, valid email and approved role are required" }, { status: 400 });
    if (role === "admin" && actor.role !== "owner") return NextResponse.json({ message: "Only Owner can create another Admin" }, { status: 403 });
    const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (existing) return NextResponse.json({ message: "A user with this email already exists" }, { status: 409 });

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const [created] = await db.transaction(async (tx) => {
      const [newUser] = await tx.insert(users).values({ name, email, phone: body.phone?.trim() || null, jobTitle, role, passwordHash: null }).returning({ id: users.id, name: users.name, email: users.email, phone: users.phone, jobTitle: users.jobTitle, role: users.role, createdAt: users.createdAt });
      await tx.insert(passwordResetTokens).values({ userId: newUser.id, token: tokenHash, expiresAt });
      await tx.insert(auditLogs).values({ userId: actor.id ?? null, action: "create", tableName: "users", recordId: newUser.id, newValueJson: JSON.stringify({ name, email, jobTitle, role, invitation: true }) });
      return [newUser];
    });
    const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    return NextResponse.json({ user: created, setupUrl: `${origin}/reset-password?token=${rawToken}`, expiresAt }, { status: 201 });
  } catch (error) {
    console.error("Staff provisioning failed:", error);
    return NextResponse.json({ message: "Staff account could not be created" }, { status: 500 });
  }
}
