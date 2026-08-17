import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, passwordResetTokens } from "@/drizzle/schema";
import { sendPasswordResetEmail, sendSMSNotification } from "@/server/utils/email";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, phone, method } = body;

    if (!email && !phone) {
      return NextResponse.json(
        { message: "Email au simu inahitajika" },
        { status: 400 }
      );
    }

    // Find user
    let user;
    if (email) {
      user = await db.query.users.findFirst({
        where: eq(users.email, email),
      });
    } else if (phone) {
      user = await db.query.users.findFirst({
        where: eq(users.phone, phone),
      });
    }

    if (!user) {
      return NextResponse.json(
        { message: "Kama akaunti ipo, maelekezo ya kurejesha neno yatatumwa." },
        { status: 200 }
      );
    }

    // Generate secure token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Save token to database
    await db.insert(passwordResetTokens).values({
      userId: user.id,
      token: tokenHash,
      expiresAt,
    });

    // Generate reset link
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

    // Send via email
    if (method === "email" || !method) {
      await sendPasswordResetEmail(user.email, resetLink, user.name);
      return NextResponse.json(
        { message: "Kiunga cha kuubadilisha neno limechelewakwa kwa barua pepe", method: "email" },
        { status: 200 }
      );
    }

    // Send via SMS
    if (method === "sms" && user.phone) {
      const otp = resetToken.substring(0, 6).toUpperCase();
      const smsMessage = `MavunoOne: Nambari yako ya kuubadilisha neno: ${otp}. Itaishia baada ya dakika 15.`;
      await sendSMSNotification(user.phone, smsMessage);
      return NextResponse.json(
        { message: "OTP imetumwa kwenye simu yako", method: "sms" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: "Njia ya kupata neno haijasadiki" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Password recovery error:", error);
    return NextResponse.json(
      { message: "Hitilafu katika kuanza upunguzi wa neno" },
      { status: 500 }
    );
  }
}
