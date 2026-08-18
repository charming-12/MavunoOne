import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { configurations } from "@/drizzle/schema";
import { requirePrivilegedUser } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  if (!requirePrivilegedUser(request)) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  try {
    const config = await db.query.configurations.findFirst({ where: eq(configurations.key, "SETUP_WIZARD_CONFIG") });
    if (!config) return NextResponse.json({ enabled: false, configured: false });
    const parsed = JSON.parse(config.value) as { cctv?: { enabled?: boolean; gatewayUrl?: string; streamName?: string; protocol?: string; brand?: string } };
    const cctv = parsed.cctv;
    const gatewayUrl = cctv?.gatewayUrl?.replace(/\/$/, "") || "";
    const streamName = cctv?.streamName || "camera_1";
    const configured = Boolean(cctv?.enabled && gatewayUrl);
    return NextResponse.json({
      enabled: Boolean(cctv?.enabled),
      configured,
      brand: cctv?.brand || null,
      protocol: cctv?.protocol || null,
      streamName,
      gatewayUrl: configured ? gatewayUrl : null,
      hlsUrl: configured ? `${gatewayUrl}/api/stream.m3u8?src=${encodeURIComponent(streamName)}&mp4` : null,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ enabled: false, configured: false });
  }
}
