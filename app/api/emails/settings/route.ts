import { NextRequest, NextResponse } from "next/server";
import { getSmtpConfig, sendTransactionalEmail, verifySmtpConnection } from "@/lib/mailer";

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
    const { action, testRecipient, customConfig, password } = body;

    const effectiveConfig = {
      ...customConfig,
      ...(password ? { pass: password } : {}),
    };

    if (action === "TEST_CONNECTION") {
      const recipient = testRecipient || "bookings@brilloevent.com";

      // 1. First verify socket handshake
      const verifyRes = await verifySmtpConnection(effectiveConfig);
      if (!verifyRes.success) {
        return NextResponse.json(
          {
            success: false,
            error: `Namecheap SMTP Handshake Failed: ${verifyRes.error}. Please double-check your Private Email password.`,
          },
          { status: 400 }
        );
      }

      // 2. Dispatch real test email to recipient
      const result = await sendTransactionalEmail({
        to: recipient,
        subject: "Brillo Events — SMTP Connection Test Successful! 🎄",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 24px; border: 2px solid #D6B36A; border-radius: 12px; background: #FAF7F5; max-width: 600px; margin: 0 auto;">
            <div style="background: #780D22; padding: 18px; border-radius: 8px; text-align: center; color: #FFF8F0; margin-bottom: 20px;">
              <h2 style="margin: 0; font-size: 20px; letter-spacing: 1px;">BRILLO EVENTS</h2>
              <div style="font-size: 11px; color: #D6B36A; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px;">Private Email SMTP Transporter Verified</div>
            </div>
            <p style="font-size: 14px; color: #211619;">Hello Brillo Operations,</p>
            <p style="font-size: 14px; color: #211619;">This email confirms that your <strong>Namecheap Private Email Transporter</strong> is active, authenticated, and ready to send transactional event messages.</p>
            <div style="background: #FFF; padding: 16px; border: 1px solid #E8DFE0; border-radius: 8px; font-size: 12px; line-height: 1.6; color: #5C494E;">
              <strong>Host:</strong> ${effectiveConfig?.host || "mail.privateemail.com"}:465 (SSL Encrypted)<br>
              <strong>Sender:</strong> ${effectiveConfig?.fromEmail || "bookings@brilloevent.com"}<br>
              <strong>Reply-To:</strong> ${effectiveConfig?.replyTo || "info@brilloevent.com"}<br>
              <strong>Delivery Target:</strong> ${recipient}<br>
              <strong>Handshake Timestamp:</strong> ${new Date().toISOString()}
            </div>
            <p style="font-size: 13px; color: #780D22; font-weight: bold; margin-top: 20px;">
              Automated Sequences: Intake Acknowledgment, Proposal Delivery, Payment Receipts, and Call Sheets are now live.
            </p>
            <div style="margin-top: 20px; font-size: 10px; color: #9A8A8C; text-align: center; border-top: 1px solid #E8DFE0; pt: 12px;">
              © Brillo Events Management Services • Authorized SMTP Gateway
            </div>
          </div>
        `,
        customConfig: effectiveConfig,
        requireLive: true,
      });

      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Real test email successfully delivered to ${recipient}! Check your Private Email inbox now.`,
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
