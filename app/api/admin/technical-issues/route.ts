import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { errorLogs } from "@/drizzle/schema";
import { requireAdminUser } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const user = requireAdminUser(request);
  if (!user) return NextResponse.json({ message: "Admin access required" }, { status: 403 });
  const rows = await db.select().from(errorLogs).orderBy(desc(errorLogs.createdAt)).limit(200);
  return NextResponse.json({ issues: rows, unresolved: rows.filter((row) => !row.isResolved).length });
}

export async function PATCH(request: NextRequest) {
  const user = requireAdminUser(request);
  if (!user) return NextResponse.json({ message: "Admin access required" }, { status: 403 });
  try {
    const body = await request.json() as { id?: number };
    if (!body.id) return NextResponse.json({ message: "Issue id is required" }, { status: 400 });
    const [updated] = await db.update(errorLogs).set({ isResolved: true }).where(eq(errorLogs.id, body.id)).returning();
    if (!updated) return NextResponse.json({ message: "Issue not found" }, { status: 404 });
    return NextResponse.json({ issue: updated });
  } catch {
    return NextResponse.json({ message: "Failed to resolve issue" }, { status: 500 });
  }
}
