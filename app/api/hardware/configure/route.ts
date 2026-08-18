import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { configurations } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { requireAdminUser } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  if (!requireAdminUser(request)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { deviceId, type, config } = body;

    // Store hardware configuration
    const configKey = `HARDWARE_${type.toUpperCase()}_${deviceId}`;
    const configValue = JSON.stringify(config);

    // Try to update existing config
    const existing = await db
      .select()
      .from(configurations)
      .where(eq(configurations.key, configKey))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(configurations)
        .set({ value: configValue, updatedAt: new Date() })
        .where(eq(configurations.key, configKey));
    } else {
      await db.insert(configurations).values({
        key: configKey,
        value: configValue,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Maalim umesanidiwa kwa mafanikio",
      deviceId,
    });
  } catch (error) {
    console.error("Hardware configuration error:", error);
    return NextResponse.json(
      { error: "Kubahatisha maalim kumefeli" },
      { status: 500 }
    );
  }
}
