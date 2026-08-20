import { NextRequest, NextResponse } from "next/server";
import { restoreLatestSampleDataBackup } from "@/lib/backup";
import { requireAdminUser } from "@/lib/api-auth";

function sampleDataActionsEnabled() {
  return process.env.NODE_ENV !== "production" && process.env.MAVUNO_ALLOW_SAMPLE_RESET === "true";
}

export async function POST(request: NextRequest) {
  const user = requireAdminUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  if (!sampleDataActionsEnabled()) {
    return NextResponse.json({ message: "Sample-data restore is disabled in production." }, { status: 403 });
  }

  try {
    const result = await restoreLatestSampleDataBackup();
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
    console.error("Restore backup failed:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to restore the latest backup." },
      { status: 500 }
    );
  }
}
