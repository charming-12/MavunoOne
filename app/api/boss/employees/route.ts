import { NextRequest, NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";
import { getAuthenticatedUser } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const actor = getAuthenticatedUser(request);
  if (!actor || actor.role !== "boss") return NextResponse.json({ message: "Boss access required" }, { status: 403 });
  const records = await db.query.users.findMany({ orderBy: [desc(users.createdAt)], limit: 500 });
  return NextResponse.json({ users: records.map((user) => ({ id: user.id, name: user.name, email: user.email, phone: user.phone, jobTitle: user.jobTitle, role: user.role, createdAt: user.createdAt })) });
}
