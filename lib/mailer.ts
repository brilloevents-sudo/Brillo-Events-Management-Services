import nodemailer from "nodemailer";

/**
 * Namecheap Private Email SMTP Transporter Configuration
 * Default Settings:
 * Host: mail.privateemail.com
 * Port: 465 (SSL) or 587 (TLS)
 * Sender: bookings@brilloevent.com
 * Reply-To: info@brilloevent.com
 */

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
  replyTo: string;
}

export function getSmtpConfig(): SmtpConfig {
  return {
    host: process.env.SMTP_HOST || "mail.privateemail.com",
    port: Number(process.env.SMTP_PORT) || 465,
    secure: process.env.SMTP_SECURE !== "false", // true for 465, false for 587
    user: process.env.SMTP_USER || process.env.EMAIL_USER || "bookings@brilloevent.com",
    pass: process.env.SMTP_PASS || process.env.EMAIL_PASS || "",
    fromName: process.env.SMTP_FROM_NAME || "Brillo Events Management Services",
    fromEmail: process.env.SMTP_FROM_EMAIL || "bookings@brilloevent.com",
    replyTo: process.env.SMTP_REPLY_TO || "info@brilloevent.com",
  };
}

export function createSmtpTransporter(customConfig?: Partial<SmtpConfig>) {
  const config = { ...getSmtpConfig(), ...customConfig };
  
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    tls: {
      rejectUnauthorized: false, // Prevents self-signed cert issues on shared cPanel hosts
    },
  });
}

/**
 * Universal Mailer Dispatcher
 */
export async function sendTransactionalEmail(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content?: any;
    path?: string;
  }>;
  customConfig?: Partial<SmtpConfig>;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const config = { ...getSmtpConfig(), ...options.customConfig };

    // If password is not configured yet, log safely to local outbox
    if (!config.pass) {
      console.warn(
        `[Mailer] SMTP_PASS not set. Simulating delivery to ${options.to} (Subject: ${options.subject})`
      );
      return {
        success: true,
        messageId: `sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      };
    }

    const transporter = createSmtpTransporter(config);
    const info = await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to: options.to,
      replyTo: options.replyTo || config.replyTo,
      subject: options.subject,
      text: options.text || options.subject,
      html: options.html,
      attachments: options.attachments,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: any) {
    console.error("[Mailer Error]:", error);
    return {
      success: false,
      error: error.message || "Failed to send email via SMTP transporter.",
    };
  }
}
