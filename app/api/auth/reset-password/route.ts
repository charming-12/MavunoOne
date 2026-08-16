import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, passwordResetTokens } from "@/drizzle/schema";
import { hashPassword } from "@/lib/password";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword, confirmPassword } = body;

    if (!token || !newPassword) {
      return NextResponse.json(
        { message: "Token na neno mpya vinahitajika" },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { message: "Maneno yasiyofanana" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { message: "Neno lazima liwe na angalau herufi 8" },
        { status: 400 }
      );
    }

    // Hash the token to find in database
    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find valid reset token
    const resetToken = await db.query.passwordResetTokens.findFirst({
      where: and(
        eq(passwordResetTokens.token, tokenHash),
        isNull(passwordResetTokens.usedAt)
      ),
    });

    if (!resetToken) {
      return NextResponse.json(
        { message: "Token haipo au umechamiwa" },
        { status: 404 }
      );
    }

    // Check expiration
    if (new Date() > resetToken.expiresAt) {
      return NextResponse.json(
        { message: "Token imeishia muda" },
        { status: 401 }
      );
    }

    // Get user
    const user = await db.query.users.findFirst({
      where: eq(users.id, resetToken.userId),
    });

    if (!user) {
      return NextResponse.json(
        { message: "Mtumiaji haipo" },
        { status: 404 }
      );
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update user password
    await db
      .update(users)
      .set({
        passwordHash: newPasswordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
      })
      .where(eq(users.id, user.id));

    // Mark token as used
    await db
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.id, resetToken.id));

    return NextResponse.json(
      { message: "Neno lako limebadilishwa kwa mafanikio. Ingia na neno jipya." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { message: "Hitilafu katika kuubadilisha neno" },
      { status: 500 }
    );
  }
}
