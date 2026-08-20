import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { eq, inArray, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { auditLogs, configurations, dailyClosures, dataBackups, errorLogs, machineJobs, notifications, passwordResetTokens, publicContent, sales, users } from "@/drizzle/schema";
import { requireAdminUser } from "@/lib/api-auth";
import { sendStaffInvitationEmail } from "@/server/utils/email";
import { isValidEmail, normalizeEmail, normalizePhone, normalizeText } from "@/lib/input";

const provisionableRoles = ["manager", "cashier", "storekeeper", "machine_operator"] as const;
type Role = (typeof provisionableRoles)[number];
const protectedRoles = new Set(["boss", "admin", "owner"]);
const seededMockEmails = new Set(["manager@mavunoone.co.tz", "cashier@mavunoone.co.tz", "store@mavunoone.co.tz", "operator@mavunoone.co.tz", "customer1@example.com", "customer2@example.com"]);

export async function GET(request: NextRequest) {
  const actor = requireAdminUser(request);
  if (!actor) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const records = await db.query.users.findMany({ orderBy: (table, { desc }) => desc(table.createdAt), limit: 500 });
  return NextResponse.json({ users: records.map((user) => ({ id: user.id, name: user.name, email: user.email, phone: user.phone, jobTitle: user.jobTitle, role: user.role, isActive: user.isActive, createdAt: user.createdAt })) });
}

export async function DELETE(request: NextRequest) {
  const actor = requireAdminUser(request);
  if (!actor || !["admin", "owner"].includes(actor.role)) return NextResponse.json({ message: "Only Admin or Owner can remove staff access" }, { status: 403 });
  try {
    const body = await request.json() as { ids?: unknown; permanent?: boolean };
    const ids = Array.isArray(body.ids) ? [...new Set(body.ids.map((value) => Number(value)).filter((value) => Number.isInteger(value) && value > 0))] : [];
    if (ids.length === 0 || ids.length > 500) return NextResponse.json({ message: "Chagua account moja au zaidi kwa usahihi." }, { status: 400 });
    const selected = await db.query.users.findMany({ where: inArray(users.id, ids) });
    const protectedUsers = selected.filter((user) => protectedRoles.has(user.role) || user.id === actor.id);
    if (protectedUsers.length > 0) return NextResponse.json({ message: "Boss, Admin wa msingi, Owner na account yako mwenyewe hawawezi kuondolewa.", protected: protectedUsers.map((user) => ({ id: user.id, name: user.name, role: user.role })) }, { status: 403 });
    if (body.permanent) {
      const inactive = selected.filter((user) => !protectedRoles.has(user.role) && user.id !== actor.id && !user.isActive);
      if (inactive.length === 0) return NextResponse.json({ message: "Chagua account iliyo Access removed kwa permanent deletion.", deletedCount: 0 }, { status: 400 });
      const blocked: Array<{ name: string; reasons: string[] }> = [];
      for (const user of inactive) {
        const reasons: string[] = [];
        const [salesRef, jobsRef, closuresRef, notificationsRef, auditRef, errorsRef, contentRef, configRef, backupRef] = await Promise.all([
          db.query.sales.findFirst({ where: eq(sales.cashierId, user.id), columns: { id: true } }),
          db.query.machineJobs.findFirst({ where: eq(machineJobs.operatorId, user.id), columns: { id: true } }),
          db.query.dailyClosures.findFirst({ where: eq(dailyClosures.cashierId, user.id), columns: { id: true } }),
          db.query.notifications.findFirst({ where: eq(notifications.userId, user.id), columns: { id: true } }),
          db.query.auditLogs.findFirst({ where: eq(auditLogs.userId, user.id), columns: { id: true } }),
          db.query.errorLogs.findFirst({ where: eq(errorLogs.userId, user.id), columns: { id: true } }),
          db.query.publicContent.findFirst({ where: or(eq(publicContent.createdBy, user.id), eq(publicContent.reviewedBy, user.id), eq(publicContent.publishedBy, user.id)), columns: { id: true } }),
          db.query.configurations.findFirst({ where: eq(configurations.updatedBy, user.id), columns: { id: true } }),
          db.query.dataBackups.findFirst({ where: eq(dataBackups.createdBy, user.id), columns: { id: true } }),
        ]);
        if (salesRef) reasons.push("sales");
        if (jobsRef) reasons.push("milling jobs");
        if (closuresRef) reasons.push("daily closures");
        if (notificationsRef) reasons.push("notifications");
        if (auditRef) reasons.push("audit logs");
        if (errorsRef) reasons.push("technical logs");
        if (contentRef) reasons.push("public content");
        if (configRef) reasons.push("settings");
        if (backupRef) reasons.push("backups");
        if (reasons.length) blocked.push({ name: user.name, reasons });
      }
      if (blocked.length) return NextResponse.json({ message: "Baadhi ya accounts zina history ya mfumo na haziwezi kufutwa kabisa. Zitabaki Access removed kwa audit.", blocked }, { status: 409 });
      await db.transaction(async (tx) => {
        for (const user of inactive) {
          await tx.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, user.id));
          await tx.delete(users).where(eq(users.id, user.id));
          await tx.insert(auditLogs).values({ userId: actor.id ?? null, action: "permanent_delete", tableName: "users", recordId: user.id, newValueJson: JSON.stringify({ name: user.name, email: user.email, role: user.role, reason: "admin_permanent_cleanup" }) });
        }
      });
      return NextResponse.json({ message: `${inactive.length} account(s) zimefutwa kabisa.`, deletedCount: inactive.length });
    }
    const removable = selected.filter((user) => !protectedRoles.has(user.role) && user.id !== actor.id && user.isActive);
    if (removable.length === 0) return NextResponse.json({ message: "Hakuna account active inayoweza kuondolewa kwenye chaguo hilo.", removedCount: 0 });
    await db.transaction(async (tx) => {
      for (const user of removable) {
        await tx.update(users).set({ isActive: false, passwordHash: null, passwordResetToken: null, passwordResetExpires: null }).where(eq(users.id, user.id));
        await tx.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, user.id));
        await tx.insert(auditLogs).values({ userId: actor.id ?? null, action: "deactivate", tableName: "users", recordId: user.id, oldValueJson: JSON.stringify({ name: user.name, email: user.email, role: user.role, isActive: true }), newValueJson: JSON.stringify({ isActive: false, reason: "admin_account_removal" }) });
      }
    });
    return NextResponse.json({ message: `${removable.length} account(s) zimeondolewa kwenye access. Business records zimehifadhiwa kwa audit.`, removedCount: removable.length });
  } catch (error) {
    console.error("Staff removal failed:", error);
    return NextResponse.json({ message: "Staff account(s) could not be removed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const actor = requireAdminUser(request);
  if (!actor || !["admin", "owner"].includes(actor.role)) return NextResponse.json({ message: "Only Admin or Owner can provision staff accounts" }, { status: 403 });
  try {
    const body = await request.json() as { action?: string; name?: string; email?: string; phone?: string; jobTitle?: string; role?: string };
    if (body.action === "remove-seeded-mock-accounts") {
      const candidates = await db.query.users.findMany();
      const removable = candidates.filter((user) => seededMockEmails.has(user.email.toLowerCase()) && !protectedRoles.has(user.role) && user.id !== actor.id && user.isActive);
      await db.transaction(async (tx) => {
        for (const user of removable) {
          await tx.update(users).set({ isActive: false, passwordHash: null, passwordResetToken: null, passwordResetExpires: null }).where(eq(users.id, user.id));
          await tx.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, user.id));
          await tx.insert(auditLogs).values({ userId: actor.id ?? null, action: "deactivate", tableName: "users", recordId: user.id, oldValueJson: JSON.stringify({ email: user.email, role: user.role, isActive: true }), newValueJson: JSON.stringify({ isActive: false, reason: "seeded_mock_cleanup" }) });
        }
      });
      return NextResponse.json({ message: `${removable.length} seeded mock account(s) removed. Boss and Admin accounts were preserved.`, removedCount: removable.length });
    }
    const name = normalizeText(body.name, 160);
    const jobTitle = normalizeText(body.jobTitle, 120) || null;
    const email = normalizeEmail(body.email);
    const phone = normalizePhone(body.phone);
    const role = body.role as Role;
    if (name.length < 2 || !isValidEmail(email) || phone.length < 7 || !provisionableRoles.includes(role)) return NextResponse.json({ message: "Jina, email halali, namba ya simu halisi na staff role vinahitajika." }, { status: 400 });
    const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (existing?.isActive) return NextResponse.json({ message: "Account yenye email hii tayari ipo na iko active." }, { status: 409 });
    if (existing && !existing.isActive) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await db.transaction(async (tx) => {
        await tx.update(users).set({ name, phone, jobTitle, role, isActive: true, passwordHash: null, passwordResetToken: null, passwordResetExpires: null }).where(eq(users.id, existing.id));
        await tx.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, existing.id));
        await tx.insert(passwordResetTokens).values({ userId: existing.id, token: tokenHash, expiresAt });
        await tx.insert(auditLogs).values({ userId: actor.id ?? null, action: "reactivate", tableName: "users", recordId: existing.id, oldValueJson: JSON.stringify({ isActive: false }), newValueJson: JSON.stringify({ name, email, phone, role, invitation: true }) });
      });
      const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
      const setupUrl = `${origin}/reset-password?token=${rawToken}`;
      const roleLabel = ({ manager: "Manager", cashier: "Cashier", storekeeper: "Storekeeper", machine_operator: "Machine Operator" } as Record<string, string>)[role] ?? role;
      const emailResult = await sendStaffInvitationEmail(email, setupUrl, name, roleLabel);
      return NextResponse.json({ reactivated: true, setupUrl, emailSent: emailResult.sent, emailReason: emailResult.sent ? null : emailResult.reason, expiresAt }, { status: 200 });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const [created] = await db.transaction(async (tx) => {
      const [newUser] = await tx.insert(users).values({ name, email, phone: phone || null, jobTitle, role, passwordHash: null, isActive: true }).returning({ id: users.id, name: users.name, email: users.email, phone: users.phone, jobTitle: users.jobTitle, role: users.role, createdAt: users.createdAt });
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
