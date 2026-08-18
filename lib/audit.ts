import { db } from "@/lib/db";
import { auditLogs } from "@/drizzle/schema";

type AuditInput = {
  userId?: number | null;
  action: string;
  tableName: string;
  recordId?: number | null;
  oldValue?: unknown;
  newValue?: unknown;
};

export async function recordAuditLog(input: AuditInput) {
  try {
    await db.insert(auditLogs).values({
      userId: input.userId ?? null,
      action: input.action,
      tableName: input.tableName,
      recordId: input.recordId ?? null,
      oldValueJson: input.oldValue === undefined ? null : JSON.stringify(input.oldValue),
      newValueJson: input.newValue === undefined ? null : JSON.stringify(input.newValue),
    });
  } catch (error) {
    console.error("Audit log write failed:", error);
  }
}
