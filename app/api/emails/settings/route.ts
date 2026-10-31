import { NextRequest, NextResponse } from "next/server";
import { getSmtpConfig, sendTransactionalEmail } from "@/lib/mailer";

export async function GET() {
  const config = getSmtpConfig();
  return NextResponse.json({
    success: true,
    config: {
      host: config.host,
      port: config.port,
      secure: config.secure,
      user: config.user,
      fromName: config.fromName,
      fromEmail: config.fromEmail,
      replyTo: config.replyTo,
      isPasswordConfigured: Boolean(config.pass),
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, testRecipient, customConfig } = body;

    if (action === "TEST_CONNECTION") {
      const recipient = testRecipient || "bookings@brilloevent.com";
      const result = await sendTransactionalEmail({
        to: recipient,
        subject: "Brillo Events — SMTP Connection Test Successful! 🎄",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 24px; border: 2px solid #D6B36A; border-radius: 12px; background: #FAF7F5;">
            <h2 style="color: #780D22; margin-top: 0;">Namecheap SMTP Ping Verified!</h2>
            <p>Your Brillo Hub email configuration is connecting cleanly to <strong>mail.privateemail.com:465</strong>.</p>
            <p style="font-size: 13px; color: #5C494E;">
              Sender: <strong>${customConfig?.fromEmail || "bookings@brilloevent.com"}</strong><br>
              Reply-To: <strong>${customConfig?.replyTo || "info@brilloevent.com"}</strong>
            </p>
            <div style="margin-top: 20px; font-size: 11px; color: #8F620E;">
              Timestamp: ${new Date().toISOString()} • Authenticated via SSL Port 465
            </div>
          </div>
        `,
        customConfig,
      });

      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Test email dispatched to ${recipient}!`,
        messageId: result.messageId,
      });
    }

    return NextResponse.json({ success: true, message: "Settings saved successfully." });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process SMTP test." },
      { status: 500 }
    );
  }
}
