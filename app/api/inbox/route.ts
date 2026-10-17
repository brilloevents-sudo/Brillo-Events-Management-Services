import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getEmailProviderStatus, sendEmail } from "@/lib/email-service";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const threadId = searchParams.get("threadId");
    const status = searchParams.get("status") || "ACTIVE";

    const providerStatus = getEmailProviderStatus();

    if (threadId) {
      const thread = await prisma.emailThread.findUnique({
        where: { id: threadId },
        include: {
          client: true,
          booking: true,
          messages: { orderBy: { sentAt: "asc" } },
        },
      });

      return NextResponse.json({ success: true, thread, providerStatus });
    }

    const threads = await prisma.emailThread.findMany({
      where: { status },
      include: {
        client: true,
        booking: true,
        messages: { orderBy: { sentAt: "desc" }, take: 1 },
      },
      orderBy: { lastActivityAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      count: threads.length,
      threads,
      providerStatus,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      to,
      subject,
      bodyText,
      threadId,
      bookingId,
      clientId,
      actor = "STAFF_USER",
    } = body;

    if (!to || !subject || !bodyText) {
      return NextResponse.json(
        { success: false, error: "Recipient, subject, and message body are required." },
        { status: 400 }
      );
    }

    const result = await sendEmail({
      to,
      subject,
      bodyText,
      bookingId,
      clientId,
    });

    await logAudit({
      action: "EMAIL_SEND",
      entityType: "EmailMessage",
      actorName: actor,
      details: { to, subject, deliveryStatus: result.deliveryStatus },
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
