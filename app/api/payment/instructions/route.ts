import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { configurations } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const config = await db.query.configurations.findFirst({ where: eq(configurations.key, "SETUP_WIZARD_CONFIG") });
    if (!config) return NextResponse.json({ enabled: false, provider: null, merchantNumber: null });
    const parsed = JSON.parse(config.value) as { payment?: { enabled?: boolean; provider?: string; merchantNumber?: string } };
    return NextResponse.json({
      enabled: Boolean(parsed.payment?.enabled && parsed.payment?.merchantNumber),
      provider: parsed.payment?.provider ?? null,
      merchantNumber: parsed.payment?.merchantNumber ?? null,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ enabled: false, provider: null, merchantNumber: null }, { status: 200 });
  }
}
