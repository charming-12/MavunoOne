import { NextResponse } from "next/server";
import { getTaxSettings } from "@/lib/tax";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await getTaxSettings();
  return NextResponse.json(settings, { headers: { "Cache-Control": "no-store" } });
}
