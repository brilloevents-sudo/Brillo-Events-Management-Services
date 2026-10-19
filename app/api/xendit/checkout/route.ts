import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { createXenditInvoice, XENDIT_PH_CHANNELS } from "@/lib/xendit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      bookingId,
      bookingNumber,
      amount,
      payerEmail,
      payerName,
      payerPhone,
      mallOrVenue,
      eventDate,
      preferredChannel = "GCASH",
      paymentOption = "DEPOSIT_50",
      secretKey,
    } = body;

    if (!amount || !bookingNumber) {
      return NextResponse.json(
        { success: false, error: "Booking reference and amount are required." },
        { status: 400 }
      );
    }

    const externalId = `XEN-${bookingNumber}-${Date.now().toString().slice(-5)}`;
    const originUrl = req.headers.get("origin") || "https://brilloevent.com";

    const invoice = await createXenditInvoice({
      externalId,
      bookingId: bookingId || "pending",
      bookingNumber,
      amount: Number(amount),
      payerEmail: payerEmail || "corporate@client.com",
      payerName: payerName || "Corporate Representative",
      payerPhone: payerPhone || "09278872343",
      mallOrVenue: mallOrVenue || "Corporate Venue",
      eventDate: eventDate || new Date().toISOString(),
      preferredChannel,
      paymentOption,
      secretKey,
      originUrl,
    });

    await logAudit({
      action: "XENDIT_INVOICE_CREATED",
      entityType: "Payment",
      entityId: invoice.invoiceId,
      actorName: payerName || "PUBLIC_CLIENT",
      details: {
        bookingNumber,
        amount,
        preferredChannel,
        paymentOption,
        invoiceUrl: invoice.invoiceUrl,
        isLiveXenditApi: invoice.isLiveXenditApi,
      },
    });

    return NextResponse.json({
      success: true,
      invoice,
      channels: XENDIT_PH_CHANNELS,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to initialize Xendit checkout" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      bookingId,
      bookingNumber,
      invoiceId,
      externalId,
      amount,
      channelCode = "GCASH",
      paymentOption = "DEPOSIT_50",
      payerReference,
    } = body;

    const channelObj =
      XENDIT_PH_CHANNELS.find((c) => c.code === channelCode) || XENDIT_PH_CHANNELS[0];
    const refNumber =
      payerReference ||
      `XENDIT-${channelCode}-${Math.floor(100000 + Math.random() * 900000)}`;

    // Locate booking in Prisma if running with SQLite DB
    let booking = null;
    if (bookingId && bookingId !== "static-booking") {
      booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    }
    if (!booking && bookingNumber) {
      booking = await prisma.booking.findFirst({ where: { bookingNumber } });
    }

    let createdPayment = null;
    if (booking) {
      createdPayment = await prisma.payment.create({
        data: {
          bookingId: booking.id,
          paymentType: paymentOption === "FULL_100" ? "FULL_PAYMENT" : "DOWNPAYMENT",
          amount: Number(amount),
          paymentMethod: `XENDIT_${channelCode}`,
          referenceNumber: refNumber,
          paymentDate: new Date(),
          status: "VERIFIED",
          verifiedAt: new Date(),
          verificationNotes: `Auto-verified via Xendit PH Gateway (${channelObj.name} -> ${channelObj.settlementBankName} ${channelObj.settlementAccountNumber}). Invoice: ${invoiceId || externalId}`,
        },
      });

      const allVerified = await prisma.payment.findMany({
        where: { bookingId: booking.id, status: "VERIFIED" },
      });
      const totalVerified = allVerified.reduce((sum, p) => sum + Number(p.amount), 0);
      const contractTotal = Number(booking.totalContractAmount);
      const newBalance = Math.max(0, contractTotal - totalVerified);

      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: "SECURED_UNASSIGNED",
          depositPaid: totalVerified,
          balanceDue: newBalance,
        },
      });

      await prisma.bookingStatusHistory.create({
        data: {
          bookingId: booking.id,
          fromStatus: booking.status,
          toStatus: "SECURED_UNASSIGNED",
          actor: "XENDIT_GATEWAY_WEBHOOK",
          reason: `Automatic Xendit ${channelObj.shortLabel} payment of ₱${Number(
            amount
          ).toLocaleString()} settled (Ref: ${refNumber}).`,
        },
      });
    }

    await logAudit({
      action: "XENDIT_PAYMENT_SETTLED",
      entityType: "Payment",
      entityId: createdPayment?.id || invoiceId || "xendit-settlement",
      actorName: "XENDIT_AUTO_GATEWAY",
      details: {
        bookingNumber,
        channelCode,
        amount,
        referenceNumber: refNumber,
        settlementBank: channelObj.settlementBankName,
        settlementAccount: channelObj.settlementAccountNumber,
      },
    });

    return NextResponse.json({
      success: true,
      status: "PAID",
      referenceNumber: refNumber,
      settledAt: new Date().toISOString(),
      channel: channelObj,
      payment: createdPayment,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to settle Xendit payment" },
      { status: 500 }
    );
  }
}
