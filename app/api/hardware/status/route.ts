import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { configurations } from "@/drizzle/schema";
import { requirePrivilegedUser } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  if (!requirePrivilegedUser(request)) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  try {
    const config = await db.query.configurations.findFirst({ where: eq(configurations.key, "SETUP_WIZARD_CONFIG") });
    if (!config) return NextResponse.json({ printer: { enabled: false, model: null, connectionType: null, status: "not_configured" } });
    const parsed = JSON.parse(config.value) as { thermalPrinter?: { enabled?: boolean; model?: string; connectionType?: string; ipAddress?: string; port?: string; paperWidth?: string; autoCut?: boolean } };
    const printer = parsed.thermalPrinter;
    return NextResponse.json({ printer: { enabled: Boolean(printer?.enabled), model: printer?.model || null, connectionType: printer?.connectionType || null, ipAddress: printer?.ipAddress || null, port: printer?.port || null, paperWidth: printer?.paperWidth || null, autoCut: printer?.autoCut ?? null, status: printer?.enabled ? "configured_needs_test" : "not_configured" } }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ printer: { enabled: false, model: null, connectionType: null, status: "unknown" } });
  }
}
