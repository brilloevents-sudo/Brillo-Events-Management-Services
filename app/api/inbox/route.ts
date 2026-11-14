import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getEmailProviderStatus, sendEmail } from "@/lib/email-service";
import { logAudit } from "@/lib/audit";
import { authorizeAdminRequest } from "@/lib/security";

export async function GET(req: NextRequest) {
  try {
    const auth = authorizeAdminRequest(req, ["CREATOR", "ADMIN"]);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
    }
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

      const isBooked = (status?: string) =>
        ["BOOKED", "SECURED", "CONFIRMED", "SECURED_CONFIRMED", "CONTRACT_SIGNED", "CONTRACT_SIGNED_PAID", "READY_FOR_DEPLOYMENT"].includes(
          (status || "").toUpperCase()
        );

      const enrichedThread = thread
        ? {
            ...thread,
            bookingStatus: isBooked(thread.booking?.status) ? "BOOKED" : "QUOTATION_REQUEST",
          }
        : null;

      return NextResponse.json({ success: true, thread: enrichedThread, providerStatus });
    }

    let threads = await prisma.emailThread.findMany({
      where: { status },
      include: {
        client: true,
        booking: true,
        messages: { orderBy: { sentAt: "desc" }, take: 1 },
      },
      orderBy: { lastActivityAt: "desc" },
    });

    if (threads.length === 0) {
      // Seed default threads from bookings
      const bookings = await prisma.booking.findMany({
        take: 3,
        include: { client: true },
        orderBy: { createdAt: "desc" },
      });

      for (const b of bookings) {
        if (b.client) {
          const t = await prisma.emailThread.create({
            data: {
              subject: `${b.eventName || b.mallOrVenue || "Santa Booking"} (${b.bookingNumber})`,
              bookingId: b.id,
              clientId: b.client.id,
              lastActivityAt: new Date(),
            },
          });

          await prisma.emailMessage.create({
            data: {
              threadId: t.id,
              direction: "INBOUND",
              sender: b.client.email,
              recipient: "bookings@brilloevent.com",
              subject: t.subject,
              bodyText: `Inquiry request for ${b.mallOrVenue || "event"} on ${b.eventDate.toDateString()}.`,
              deliveryStatus: "RECEIVED",
            },
          });

          await prisma.emailMessage.create({
            data: {
              threadId: t.id,
              direction: "OUTBOUND",
              sender: "bookings@brilloevent.com",
              recipient: b.client.email,
              subject: `Your Event Proposal — ${b.bookingNumber}`,
              bodyText: `Dear ${b.client.primaryContact || "Valued Client"},\n\nWe are delighted to share your tailored proposal for ${b.mallOrVenue}. Total Contract: ₱${Number(b.totalContractAmount || 0).toLocaleString()}.\n\nWarm regards,\nBrillo Events Management`,
              deliveryStatus: "DELIVERED",
            },
          });
        }
      }

      threads = await prisma.emailThread.findMany({
        where: { status },
        include: {
          client: true,
          booking: true,
          messages: { orderBy: { sentAt: "desc" }, take: 1 },
        },
        orderBy: { lastActivityAt: "desc" },
      });
    }

    const isBooked = (bStatus?: string) =>
      ["BOOKED", "SECURED", "CONFIRMED", "SECURED_CONFIRMED", "CONTRACT_SIGNED", "CONTRACT_SIGNED_PAID", "READY_FOR_DEPLOYMENT"].includes(
        (bStatus || "").toUpperCase()
      );

    const enrichedThreads = threads.map((t) => ({
      ...t,
      bookingStatus: isBooked(t.booking?.status) ? "BOOKED" : "QUOTATION_REQUEST",
    }));

    return NextResponse.json({
      success: true,
      count: enrichedThreads.length,
      threads: enrichedThreads,
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
