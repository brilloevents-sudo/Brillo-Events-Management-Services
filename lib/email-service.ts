import prisma from "./prisma";
import { sendTransactionalEmail, getSmtpConfig } from "./mailer";

export interface SendEmailOptions {
  to: string;
  subject: string;
  bodyText: string;
  bodyHtml?: string;
  templateKey?: string;
  templateVariables?: Record<string, string>;
  bookingId?: string;
  clientId?: string;
  idempotencyKey?: string;
}

export interface EmailProviderStatus {
  connected: boolean;
  provider: string;
  senderAddress: string;
  statusMessage: string;
  inboundSyncSupported: boolean;
}

export function getEmailProviderStatus(): EmailProviderStatus {
  const config = getSmtpConfig();
  if (config.pass) {
    return {
      connected: true,
      provider: "smtp",
      senderAddress: config.fromEmail,
      statusMessage: "Connected to Namecheap Private Email (mail.privateemail.com:465).",
      inboundSyncSupported: false,
    };
  }

  return {
    connected: true,
    provider: "mock",
    senderAddress: config.fromEmail,
    statusMessage: "Operating in simulated Sandbox Mode (Local Outbox). Configure Private Email password to dispatch live emails.",
    inboundSyncSupported: true,
  };
}

export async function sendEmail(options: SendEmailOptions): Promise<{
  success: boolean;
  messageId?: string;
  deliveryStatus: string;
  error?: string;
}> {
  const smtpConfig = getSmtpConfig();

  // Template variable interpolation
  let finalSubject = options.subject;
  let finalBodyText = options.bodyText;
  let finalHtml = options.bodyHtml || `<div style="font-family: Arial, sans-serif; padding: 20px;">${options.bodyText.replace(/\n/g, "<br/>")}</div>`;

  if (options.templateKey) {
    try {
      const template = await prisma.emailTemplate.findUnique({
        where: { triggerKey: options.templateKey },
      });
      if (template) {
        finalSubject = template.subject;
        finalBodyText = template.bodyTemplate;
        if (options.templateVariables) {
          for (const [key, val] of Object.entries(options.templateVariables)) {
            const regex = new RegExp(`{{${key}}}`, "g");
            finalSubject = finalSubject.replace(regex, val);
            finalBodyText = finalBodyText.replace(regex, val);
          }
        }
        finalHtml = `<div style="font-family: Arial, sans-serif; padding: 20px;">${finalBodyText.replace(/\n/g, "<br/>")}</div>`;
      }
    } catch {}
  }

  // 1. Dispatch through real Namecheap SMTP Transporter
  const dispatchRes = await sendTransactionalEmail({
    to: options.to,
    subject: finalSubject,
    text: finalBodyText,
    html: finalHtml,
  });

  // 2. Find or create thread
  let thread: any = null;
  try {
    thread = await prisma.emailThread.findFirst({
      where: {
        bookingId: options.bookingId || undefined,
        clientId: options.clientId || undefined,
      },
    });

    if (!thread) {
      thread = await prisma.emailThread.create({
        data: {
          subject: finalSubject,
          clientId: options.clientId,
          bookingId: options.bookingId,
          lastActivityAt: new Date(),
        },
      });
    }

    // Record outbound message in outbox
    await prisma.emailMessage.create({
      data: {
        threadId: thread.id,
        direction: "OUTBOUND",
        sender: smtpConfig.fromEmail,
        recipient: options.to,
        subject: finalSubject,
        bodyText: finalBodyText,
        bodyHtml: finalHtml,
        deliveryStatus: dispatchRes.success ? (dispatchRes.isSimulated ? "SIMULATED" : "SENT") : "FAILED",
        errorMessage: dispatchRes.error,
      },
    });

    await prisma.emailThread.update({
      where: { id: thread.id },
      data: { lastActivityAt: new Date() },
    });
  } catch (err) {
    console.warn("[EmailService DB Log Error]:", err);
  }

  return {
    success: dispatchRes.success,
    messageId: dispatchRes.messageId,
    deliveryStatus: dispatchRes.success ? (dispatchRes.isSimulated ? "SIMULATED" : "SENT") : "FAILED",
    error: dispatchRes.error,
  };
}
