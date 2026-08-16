import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { configurations } from "@/drizzle/schema";

// GET all configurations
export async function GET() {
  try {
    const configs = await db.query.configurations.findMany();
    return NextResponse.json(configs, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch configurations:", error);
    return NextResponse.json(
      { message: "Failed to fetch configurations" },
      { status: 500 }
    );
  }
}

// POST save configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value, description, isEncrypted } = body;

    if (!key || !value) {
      return NextResponse.json(
        { message: "Key and value are required" },
        { status: 400 }
      );
    }

    // Check if key already exists
    const existing = await db.query.configurations.findFirst({
      where: eq(configurations.key, key),
    });

    let result;
    if (existing) {
      // Update existing
      result = await db
        .update(configurations)
        .set({
          value,
          description: description || existing.description,
          isEncrypted: isEncrypted || false,
          updatedAt: new Date(),
        })
        .where(eq(configurations.key, key))
        .returning();
    } else {
      // Insert new
      result = await db
        .insert(configurations)
        .values({
          key,
          value,
          description: description || null,
          isEncrypted: isEncrypted || false,
        })
        .returning();
    }

    return NextResponse.json(
      {
        message: existing ? "Configuration updated" : "Configuration created",
        config: result[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to save configuration:", error);
    return NextResponse.json(
      { message: "Failed to save configuration" },
      { status: 500 }
    );
  }
}

// DELETE configuration
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json({ message: "Key is required" }, { status: 400 });
    }

    await db.delete(configurations).where(eq(configurations.key, key));

    return NextResponse.json(
      { message: "Configuration deleted" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete configuration:", error);
    return NextResponse.json(
      { message: "Failed to delete configuration" },
      { status: 500 }
    );
  }
}
