import { Resend } from "resend";

import { sendSms } from "./sms";

let resend: Resend | null = null;

function getResendClient() {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

const ADMIN_EMAIL = "josiahmarco93@gmail.com";
const APP_NAME = "MavunoOne";

export async function sendErrorNotification(
  errorMessage: string,
  stackTrace?: string,
  route?: string,
  userId?: number
) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("⚠️ RESEND_API_KEY not configured - error notification skipped");
      return;
    }

    const emailBody = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body { font-family: Arial, sans-serif; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background-color: #d32f2f; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
      .section { margin: 15px 0; padding: 15px; background-color: #f5f5f5; border-radius: 8px; }
      .label { font-weight: bold; color: #d32f2f; }
      .code { background-color: #fff; padding: 10px; border-left: 3px solid #d32f2f; font-family: monospace; overflow-x: auto; }
      .footer { font-size: 12px; color: #999; margin-top: 20px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2>🚨 ${APP_NAME} - Critical Error Alert</h2>
      </div>

      <div class="section">
        <p class="label">Error Message:</p>
        <p>${escapeHtml(errorMessage)}</p>
      </div>

      ${
        route
          ? `
      <div class="section">
        <p class="label">Route/Page:</p>
        <p>${escapeHtml(route)}</p>
      </div>
      `
          : ""
      }

      ${
        userId
          ? `
      <div class="section">
        <p class="label">User ID:</p>
        <p>${userId}</p>
      </div>
      `
          : ""
      }

      <div class="section">
        <p class="label">Timestamp:</p>
        <p>${new Date().toISOString()}</p>
      </div>

      ${
        stackTrace
          ? `
      <div class="section">
        <p class="label">Stack Trace:</p>
        <div class="code">${escapeHtml(stackTrace)}</div>
      </div>
      `
          : ""
      }

      <div class="footer">
        <p>This is an automated error notification from ${APP_NAME}.</p>
      </div>
    </div>
  </body>
</html>
    `;

    const client = getResendClient();
    if (!client) {
      console.warn("⚠️ Resend client not initialized - error notification skipped");
      return;
    }

    const result = await client.emails.send({
      from: `${APP_NAME} <noreply@resend.dev>`,
      to: ADMIN_EMAIL,
      subject: `🚨 ${APP_NAME} - Critical Error Detected`,
      html: emailBody,
    });

    if (result.error) {
      console.error("❌ Resend error notification failed:", result.error);
      return result;
    }

    console.log("✅ Error notification email sent:", result.data?.id ?? "unknown");
    return result;
  } catch (error) {
    console.error("❌ Failed to send error notification email:", error);
  }
}

export async function sendPasswordResetEmail(
  userEmail: string,
  resetLink: string,
  userName?: string
) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("⚠️ RESEND_API_KEY not configured - reset email skipped");
      return;
    }

    const emailBody = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body { font-family: Arial, sans-serif; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background-color: #2e7d32; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center; }
      .button { display: inline-block; background-color: #2e7d32; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 20px 0; }
      .section { margin: 15px 0; padding: 15px; background-color: #f5f5f5; border-radius: 8px; }
      .warning { color: #ff6f00; font-size: 12px; margin-top: 20px; }
      .footer { font-size: 12px; color: #999; margin-top: 20px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2>🔐 Password Reset Request</h2>
      </div>

      <p>Habari, ${escapeHtml(userName || "User")}!</p>

      <p>Umechukuliwa haba ya kuweka tena neno lako la siri. Bofya kitufe kwa chini kuanza mchakato wa kurudi neno lako:</p>

      <center>
        <a href="${escapeHtml(resetLink)}" class="button">Weka Tena Neno Lako</a>
      </center>

      <div class="section">
        <p><strong>Kiwango cha Usalama:</strong></p>
        <ul>
          <li>Kiunga hiki kitaishia baada ya dakika 15</li>
          <li>Ikiwa wewe hauliataka kubadilisha neno lako, puuza ujumbe huu</li>
          <li>Usiweze nakala ya kiunga hiki kwa mtu mwingine</li>
        </ul>
      </div>

      <p class="warning">⚠️ Ikiwa hamjachukuwa hatua hii, tafadhali wasiliana na msaada wetu mara moja.</p>

      <div class="footer">
        <p>© 2024 ${APP_NAME} - All Rights Reserved</p>
      </div>
    </div>
  </body>
</html>
    `;

    const client = getResendClient();
    if (!client) {
      console.warn("⚠️ Resend client not initialized - password reset email skipped");
      return;
    }

    const result = await client.emails.send({
      from: `${APP_NAME} <noreply@resend.dev>`,
      to: userEmail,
      subject: `🔐 ${APP_NAME} - Weka Tena Neno Lako`,
      html: emailBody,
    });

    if (result.error) {
      console.error("❌ Resend password reset email failed:", result.error);
      return result;
    }

    console.log("✅ Password reset email sent:", result.data?.id ?? "unknown");
    return result;
  } catch (error) {
    console.error("❌ Failed to send password reset email:", error);
  }
}

export async function sendSMSNotification(phoneNumber: string, message: string) {
  const result = await sendSms({ phone: phoneNumber, message, senderID: process.env.NEXTSMS_SENDER_ID });
  if (result.success) {
    console.log("SMS notification sent:", result.messageID);
  } else {
    console.error("Failed to send SMS notification:", result.error);
  }
  return result;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

export async function sendStaffInvitationEmail(
  userEmail: string,
  setupLink: string,
  userName: string,
  roleLabel: string,
) {
  try {
    const client = getResendClient();
    if (!client) {
      console.warn("Resend client not initialized - staff invitation email skipped");
      return { sent: false, reason: "email_not_configured" };
    }

    const emailBody = `
<!DOCTYPE html>
<html>
  <head><meta charset="utf-8" /><style>
    body { font-family: Arial, sans-serif; color: #183a32; background: #f5f8f6; }
    .container { max-width: 600px; margin: 0 auto; padding: 28px 20px; }
    .card { background: white; border-radius: 18px; padding: 28px; box-shadow: 0 8px 30px rgba(16,45,38,.08); }
    .header { background: #071a18; color: white; padding: 20px; border-radius: 14px; }
    .button { display: inline-block; background: #eab308; color: #102b25; padding: 13px 22px; border-radius: 10px; text-decoration: none; font-weight: 700; margin: 18px 0; }
    .note { background: #f0fdf4; border-radius: 10px; padding: 14px; font-size: 13px; line-height: 1.6; }
    .footer { color: #64748b; font-size: 12px; margin-top: 22px; }
  </style></head>
  <body><div class="container"><div class="card">
    <div class="header"><h2>Karibu Ipuli Milling and Animal Enterprise</h2></div>
    <p>Habari ${escapeHtml(userName)},</p>
    <p>Account yako ya <strong>${escapeHtml(roleLabel)}</strong> imeundwa. Ili kuanza kutumia mfumo, bofya kitufe hapa chini na uweke password yako mwenyewe.</p>
    <p style="text-align:center"><a class="button" href="${escapeHtml(setupLink)}">Weka password yako</a></p>
    <div class="note"><strong>Usalama:</strong> Kiungo hiki ni cha matumizi ya mara moja na kitaisha baada ya saa 24. Hakuna password iliyotumwa kwenye email hii. Usimpe mtu mwingine kiungo hiki.</div>
    <p class="footer">© ${new Date().getFullYear()} Ipuli Milling and Animal Enterprise · Tabora, Tanzania</p>
  </div></div></body>
</html>`;

    const result = await client.emails.send({
      from: `${APP_NAME} <noreply@resend.dev>`,
      to: userEmail,
      subject: `${APP_NAME} — Weka password ya account yako`,
      html: emailBody,
    });
    if (result.error) {
      console.error("Staff invitation email failed:", result.error);
      return { sent: false, reason: "email_send_failed" };
    }
    return { sent: true, id: result.data?.id ?? null };
  } catch (error) {
    console.error("Staff invitation email error:", error);
    return { sent: false, reason: "email_send_failed" };
  }
}
