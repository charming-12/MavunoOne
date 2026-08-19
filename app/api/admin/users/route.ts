import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { auditLogs, passwordResetTokens, users } from "@/drizzle/schema";
import { requireAdminUser } from "@/lib/api-auth";
import { sendStaffInvitationEmail } from "@/server/utils/email";
import { isValidEmail, normalizeEmail, normalizePhone, normalizeText } from "@/lib/input";

const provisionableRoles = ["manager", "cashier", "storekeeper", "machine_operator"] as const;
type Role = (typeof provisionableRoles)[number];
const seededMockEmails = new Set(["manager@mavunoone.co.tz", "cashier@mavunoone.co.tz", "store@mavunoone.co.tz", "operator@mavunoone.co.tz", "customer1@example.com", "customer2@example.com"]);

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
    const body = await request.json() as { action?: string; name?: string; email?: string; phone?: string; jobTitle?: string; role?: string };
    if (body.action === "remove-seeded-mock-accounts") {
      const candidates = await db.query.users.findMany();
      const removable = candidates.filter((user) => seededMockEmails.has(user.email.toLowerCase()) && !["boss", "admin", "owner"].includes(user.role));
      await db.transaction(async (tx) => {
        for (const user of removable) {
          await tx.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, user.id));
          await tx.delete(users).where(eq(users.id, user.id));
        }
      });
      return NextResponse.json({ message: `${removable.length} seeded mock account(s) removed. Boss and Admin accounts were preserved.`, removedCount: removable.length });
    }
    const name = normalizeText(body.name, 160);
    const jobTitle = normalizeText(body.jobTitle, 120) || null;
    const email = normalizeEmail(body.email);
    const phone = normalizePhone(body.phone);
    const role = body.role as Role;
    if (name.length < 2 || !isValidEmail(email) || !provisionableRoles.includes(role)) return NextResponse.json({ message: "Name, valid email and staff role are required" }, { status: 400 });
    const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (existing) return NextResponse.json({ message: "A user with this email already exists" }, { status: 409 });

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const [created] = await db.transaction(async (tx) => {
      const [newUser] = await tx.insert(users).values({ name, email, phone: phone || null, jobTitle, role, passwordHash: null }).returning({ id: users.id, name: users.name, email: users.email, phone: users.phone, jobTitle: users.jobTitle, role: users.role, createdAt: users.createdAt });
      await tx.insert(passwordResetTokens).values({ userId: newUser.id, token: tokenHash, expiresAt });
      await tx.insert(auditLogs).values({ userId: actor.id ?? null, action: "create", tableName: "users", recordId: newUser.id, newValueJson: JSON.stringify({ name, email, jobTitle, role, invitation: true }) });
      return [newUser];
    });
    const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    const setupUrl = `${origin}/reset-password?token=${rawToken}`;
    const roleLabel = ({ admin: "Admin", boss: "Boss", manager: "Manager", cashier: "Cashier", storekeeper: "Storekeeper", machine_operator: "Machine Operator", customer: "Customer" } as Record<string, string>)[role] ?? role;
    const emailResult = await sendStaffInvitationEmail(email, setupUrl, name, roleLabel);
    return NextResponse.json({ user: created, setupUrl, emailSent: emailResult.sent, emailReason: emailResult.sent ? null : emailResult.reason, expiresAt }, { status: 201 });
  } catch (error) {
    console.error("Staff provisioning failed:", error);
    return NextResponse.json({ message: "Staff account could not be created" }, { status: 500 });
  }
}
