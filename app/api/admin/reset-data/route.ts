import { NextRequest, NextResponse } from "next/server";
import { getLatestSampleDataBackup, resetSampleData } from "@/lib/backup";

function getAuthenticatedUser(request: NextRequest) {
  const cookie = request.cookies.get("mavunoone-user");
  if (!cookie?.value) return null;

  try {
    return JSON.parse(cookie.value) as { role?: string; id?: number };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  if (!user || !["admin", "boss", "owner"].includes((user.role ?? "").toLowerCase())) {
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
  const user = getAuthenticatedUser(request);
  if (!user || !["admin", "boss", "owner"].includes((user.role ?? "").toLowerCase())) {
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
