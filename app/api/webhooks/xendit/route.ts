import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

/**
 * Official Xendit Webhook Receiver (/api/webhooks/xendit)
 * Handles Xendit Invoices v2, Payment Requests, eWallets (GCash/Maya), and Direct Debit (BPI/UnionBank) callbacks.
 */
export async function POST(req: NextRequest) {
  try {
    const callbackToken = req.headers.get("x-callback-token");
    const expectedToken = process.env.XENDIT_WEBHOOK_TOKEN;

    if (expectedToken && callbackToken !== expectedToken) {
      return NextResponse.json(
        { success: false, error: "Invalid Xendit callback verification token" },
        { status: 401 }
      );
    }

    const payload = await req.json();
    const status = (payload.status || payload.data?.status || "").toUpperCase();
    const externalId: string = payload.external_id || payload.data?.reference_id || "";
    const paidAmount = Number(payload.paid_amount || payload.amount || payload.data?.amount || 0);
    const paymentChannel =
      payload.payment_channel ||
      payload.payment_method ||
      payload.data?.channel_code ||
      "GCASH";
    const xenditId = payload.id || payload.data?.id || `xen_${Date.now()}`;

    // Extract bookingNumber from externalId pattern: XEN-B2026-XXXX-12345 or BRILLO-B2026-XXXX
    const match = externalId.match(/(B\d{4}-\d+)/i);
    const bookingNumber = match ? match[1] : payload.booking_number;

    if (status === "PAID" || status === "SETTLED" || status === "SUCCEEDED") {
      let booking = null;
      if (bookingNumber) {
        booking = await prisma.booking.findFirst({
          where: { bookingNumber },
        });
      }

      if (booking) {
        const payment = await prisma.payment.create({
          data: {
            bookingId: booking.id,
            paymentType:
              paidAmount >= Number(booking.totalContractAmount)
                ? "FULL_PAYMENT"
                : "DOWNPAYMENT",
            amount: paidAmount,
            paymentMethod: `XENDIT_${paymentChannel}`,
            referenceNumber: xenditId,
            paymentDate: new Date(),
            status: "VERIFIED",
            verifiedAt: new Date(),
            verificationNotes: `Verified automatically by Xendit Webhook (${paymentChannel}). External ID: ${externalId}`,
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

        await logAudit({
          action: "XENDIT_WEBHOOK_PAID",
          entityType: "Payment",
          entityId: payment.id,
          actorName: "XENDIT_WEBHOOK",
          details: {
            bookingNumber: booking.bookingNumber,
            xenditId,
            externalId,
            paidAmount,
            paymentChannel,
          },
        });
      }
    }

    return NextResponse.json({
      received: true,
      sdk: "xendit-php / xendit-node webhook receiver",
      status,
      externalId,
    });
  } catch (error: any) {
    return NextResponse.json(
      { received: false, error: error.message },
      { status: 500 }
    );
  }
}
