import { NextRequest, NextResponse } from "next/server";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { errorLogs, notifications, users } from "@/drizzle/schema";
import { sendErrorNotification } from "@/server/utils/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { errorMessage, stackTrace, route, userId } = body;

    if (!errorMessage) {
      return NextResponse.json(
        { message: "Error message is required" },
        { status: 400 }
      );
    }

    // Save error log to database
    const errorLog = await db
      .insert(errorLogs)
      .values({
        errorMessage,
        stackTrace: stackTrace || null,
        route: route || null,
        userId: userId || null,
        severity: "error",
        isResolved: false,
      })
      .returning();

    const adminRecipients = await db.select({ id: users.id }).from(users).where(inArray(users.role, ["admin", "owner"]));
    if (adminRecipients.length > 0) {
      await db.insert(notifications).values(adminRecipients.map((recipient) => ({
        type: "technical_error",
        title: `Technical issue: ${route || "system"}`,
        message: `${errorMessage}${route ? ` | Route: ${route}` : ""}. Fungua Technical Issues Center kwa troubleshooting.`,
        userId: recipient.id,
        isRead: false,
      })));
    }

    // Send email notification to admin
    if (process.env.RESEND_API_KEY) {
      await sendErrorNotification(errorMessage, stackTrace, route, userId);

      // Update email sent timestamp
      if (errorLog.length > 0) {
        await db
          .update(errorLogs)
          .set({ emailSentAt: new Date() })
          .where(eq(errorLogs.id, errorLog[0].id));
      }
    }

    return NextResponse.json(
      { message: "Error logged successfully", logId: errorLog[0]?.id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to log error:", error);
    return NextResponse.json(
      { message: "Failed to log error" },
      { status: 500 }
    );
  }
}
