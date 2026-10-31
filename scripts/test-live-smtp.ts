import { verifySmtpConnection, sendTransactionalEmail, getSmtpConfig } from "../lib/mailer";

async function run() {
  const password = process.argv[2] || process.env.SMTP_PASS;
  const recipient = process.argv[3] || "bookings@brilloevent.com";

  console.log("--------------------------------------------------");
  console.log("Brillo Events — Namecheap Private Email SMTP Test");
  console.log("Host: mail.privateemail.com:465 (SSL)");
  console.log("Sender: bookings@brilloevent.com");
  console.log(`Target Recipient: ${recipient}`);
  console.log("--------------------------------------------------");

  if (!password) {
    console.error("❌ Error: No password provided.");
    console.log("Usage: npx tsx scripts/test-live-smtp.ts <YOUR_PRIVATE_EMAIL_PASSWORD> [RECIPIENT_EMAIL]");
    process.exit(1);
  }

  const customConfig = { pass: password };

  console.log("1. Testing SMTP Handshake...");
  const handshake = await verifySmtpConnection(customConfig);
  if (!handshake.success) {
    console.error(`❌ Handshake Failed: ${handshake.error}`);
    process.exit(1);
  }
  console.log("✅ Handshake Succeeded! Socket connected & authenticated.");

  console.log(`2. Sending Real Test Email to ${recipient}...`);
  const dispatch = await sendTransactionalEmail({
    to: recipient,
    subject: "Brillo Events — SMTP Connection Test Successful! 🎄",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 24px; border: 2px solid #D6B36A; border-radius: 12px; background: #FAF7F5;">
        <h2 style="color: #780D22; margin-top: 0;">Namecheap SMTP Ping Verified!</h2>
        <p>Your Brillo Hub email configuration is connecting cleanly to <strong>mail.privateemail.com:465</strong>.</p>
        <p>Recipient: <strong>${recipient}</strong></p>
        <p style="font-size: 11px; color: #8F620E;">Timestamp: ${new Date().toISOString()}</p>
      </div>
    `,
    customConfig,
    requireLive: true,
  });

  if (!dispatch.success) {
    console.error(`❌ Dispatch Failed: ${dispatch.error}`);
    process.exit(1);
  }

  console.log(`✅ Success! Email dispatched. Message ID: ${dispatch.messageId}`);
  console.log(`Check your inbox at https://privateemail.com for ${recipient}.`);
}

run();
