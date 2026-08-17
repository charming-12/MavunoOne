import { NextRequest, NextResponse } from "next/server";
import { getLatestSampleDataBackup, resetSampleData } from "@/lib/backup";
import { requirePrivilegedUser } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const user = requirePrivilegedUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  const backup = await getLatestSampleDataBackup();

  return NextResponse.json({
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
  const user = requirePrivilegedUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
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
