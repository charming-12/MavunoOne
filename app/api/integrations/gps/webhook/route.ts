import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { configurations, vehicles } from "@/drizzle/schema";
import { decryptConfigValue } from "@/lib/config-crypto";

async function getGpsSecret() {
  const config = await db.query.configurations.findFirst({ where: eq(configurations.key, "GPS_CONNECTION_SECRETS") });
  if (!config || !config.isEncrypted) return null;
  try { return JSON.parse(decryptConfigValue(config.value)) as { password?: string }; } catch { return null; }
}

export async function POST(request: NextRequest) {
  try {
    const expectedToken = (await getGpsSecret())?.password;
    const suppliedToken = request.headers.get("x-mavuno-gps-token") || new URL(request.url).searchParams.get("token");
    if (!expectedToken || !suppliedToken || suppliedToken !== expectedToken) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await request.json() as Record<string, unknown>;
    const deviceId = String(body.deviceId ?? body.imei ?? body.device ?? "");
    const lat = Number(body.lat ?? body.latitude);
    const lng = Number(body.lng ?? body.lon ?? body.longitude);
    if (!deviceId || !Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) return NextResponse.json({ message: "deviceId, latitude and longitude are required" }, { status: 400 });

    const updated = await db.update(vehicles).set({ lastPositionLat: lat.toFixed(6), lastPositionLng: lng.toFixed(6), status: String(body.status ?? "moving"), lastUpdate: new Date() }).where(eq(vehicles.gpsDeviceId, deviceId)).returning({ id: vehicles.id, plateNumber: vehicles.plateNumber });
    if (!updated.length) return NextResponse.json({ message: "No vehicle is registered for this deviceId" }, { status: 404 });
    return NextResponse.json({ ok: true, vehicle: updated[0] });
  } catch (error) {
    console.error("GPS webhook error:", error);
    return NextResponse.json({ message: "GPS update failed" }, { status: 500 });
  }
}
