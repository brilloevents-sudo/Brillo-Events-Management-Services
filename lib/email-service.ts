import prisma from "./prisma";

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
  const provider = process.env.EMAIL_PROVIDER || "mock";
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const sender = process.env.COMPANY_EMAIL || "brilloevents@gmail.com";

  if (provider === "smtp" && (!user || !pass)) {
    return {
      connected: false,
      provider: "smtp",
      senderAddress: sender,
      statusMessage: "SMTP credentials not configured. Configure EMAIL_USER and EMAIL_PASS in .env to enable live sending.",
      inboundSyncSupported: false,
    };
  }

  if (provider === "mock") {
    return {
      connected: true,
      provider: "mock",
      senderAddress: sender,
      statusMessage: "Operating in simulated Sandbox Mode (Local Outbox & Stored Inbox). All outbound emails are safely captured locally.",
      inboundSyncSupported: true,
    };
  }

  return {
    connected: false,
    provider: "disabled",
    senderAddress: sender,
    statusMessage: "Email service explicitly disabled.",
    inboundSyncSupported: false,
  };
}

export async function sendEmail(options: SendEmailOptions): Promise<{
  success: boolean;
  messageId?: string;
  deliveryStatus: string;
  error?: string;
}> {
  const status = getEmailProviderStatus();

  // Template variable interpolation
  let finalSubject = options.subject;
  let finalBodyText = options.bodyText;

  if (options.templateKey) {
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
    }
  }

  // Find or create thread
  let thread = await prisma.emailThread.findFirst({
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
  const message = await prisma.emailMessage.create({
    data: {
      threadId: thread.id,
      direction: "OUTBOUND",
      sender: process.env.COMPANY_EMAIL || "brilloevents@gmail.com",
      recipient: options.to,
      subject: finalSubject,
      bodyText: finalBodyText,
      bodyHtml: options.bodyHtml,
      deliveryStatus: status.connected ? "SENT" : "QUEUED",
      errorMessage: status.connected ? undefined : status.statusMessage,
    },
  });

  // Update thread last activity
  await prisma.emailThread.update({
    where: { id: thread.id },
    data: { lastActivityAt: new Date() },
  });

  return {
    success: true,
    messageId: message.id,
    deliveryStatus: message.deliveryStatus,
  };
}
