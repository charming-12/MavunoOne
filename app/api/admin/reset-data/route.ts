import { NextRequest, NextResponse } from "next/server";
import { getLatestSampleDataBackup, resetSampleData } from "@/lib/backup";
import { requireAdminUser } from "@/lib/api-auth";

function sampleDataActionsEnabled() {
  return process.env.NODE_ENV !== "production" && process.env.MAVUNO_ALLOW_SAMPLE_RESET === "true";
}

export async function GET(request: NextRequest) {
  const user = requireAdminUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  const backup = await getLatestSampleDataBackup();

  return NextResponse.json({
    sampleDataActionsEnabled: sampleDataActionsEnabled(),
    lastBackup: backup
      ? {
          id: backup.id,
          label: backup.label,
          createdAt: backup.createdAt?.toISOString ? backup.createdAt.toISOString() : backup.createdAt,
        }
      : null,
  });
}

export async function POST(request: NextRequest) {
  const user = requireAdminUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  if (!sampleDataActionsEnabled()) {
    return NextResponse.json({ message: "Sample-data reset is disabled in production." }, { status: 403 });
  }

  try {
    const result = await resetSampleData(user.id ?? null);
    return NextResponse.json({
      message: result.message,
      backup: result.backup
        ? {
            id: result.backup.id,
            label: result.backup.label,
            createdAt: result.backup.createdAt?.toISOString ? result.backup.createdAt.toISOString() : result.backup.createdAt,
          }
        : null,
    });
  } catch (error) {
    console.error("Reset sample data failed:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to reset sample data." },
      { status: 500 }
    );
  }
}
