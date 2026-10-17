import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get("bookingId");
    const status = searchParams.get("status");

    const where: any = {};
    if (bookingId) where.bookingId = bookingId;
    if (status) where.status = status;

    const payments = await prisma.payment.findMany({
      where,
      include: {
        booking: {
          include: { client: true },
        },
        verifiedBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { paymentDate: "desc" },
    });

    return NextResponse.json({ success: true, count: payments.length, payments });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      bookingId,
      amount,
      paymentType = "DOWNPAYMENT",
      paymentMethod = "BANK_TRANSFER",
      referenceNumber,
      paymentDate,
      proofFileUrl,
      notes,
    } = body;

    if (!bookingId || !amount) {
      return NextResponse.json(
        { success: false, error: "Booking ID and amount are required." },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    // Creating a payment record leaves it as PENDING_VERIFICATION (uploading proof is NOT verification)
    const payment = await prisma.payment.create({
      data: {
        bookingId,
        paymentType,
        amount: Number(amount),
        paymentMethod,
        referenceNumber,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        proofFileUrl,
        status: "PENDING_VERIFICATION",
        verificationNotes: notes,
      },
    });

    await logAudit({
      action: "PAYMENT_RECORD",
      entityType: "Payment",
      entityId: payment.id,
      details: { bookingId, amount, paymentMethod, referenceNumber },
    });

    return NextResponse.json({ success: true, payment });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      paymentId,
      status: targetStatus, // VERIFIED or REJECTED
      verificationNotes,
      verifiedByUserId,
      actor = "STAFF_USER",
    } = body;

    if (!paymentId || !targetStatus) {
      return NextResponse.json(
        { success: false, error: "Payment ID and target status are required." },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { booking: true },
    });

    if (!payment) {
      return NextResponse.json({ success: false, error: "Payment not found" }, { status: 404 });
    }

    const updated = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: targetStatus,
        verifiedById: verifiedByUserId,
        verifiedAt: targetStatus === "VERIFIED" ? new Date() : null,
        verificationNotes,
      },
    });

    // If verified, update booking depositPaid and balanceDue
    if (targetStatus === "VERIFIED") {
      const allVerified = await prisma.payment.findMany({
        where: { bookingId: payment.bookingId, status: "VERIFIED" },
      });
      const totalVerified = allVerified.reduce((sum, p) => sum + Number(p.amount), 0);

      const contractTotal = Number(payment.booking.totalContractAmount);
      const newBalance = Math.max(0, contractTotal - totalVerified);

      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: {
          depositPaid: totalVerified,
          balanceDue: newBalance,
        },
      });

      await prisma.bookingStatusHistory.create({
        data: {
          bookingId: payment.bookingId,
          fromStatus: payment.booking.status,
          toStatus: payment.booking.status,
          actor,
          reason: `Payment of ₱${Number(payment.amount).toLocaleString()} verified by ${actor}. Total verified received: ₱${totalVerified.toLocaleString()}.`,
        },
      });
    }

    await logAudit({
      action: targetStatus === "VERIFIED" ? "PAYMENT_VERIFY" : "PAYMENT_REJECT",
      entityType: "Payment",
      entityId: payment.id,
      actorName: actor,
      details: { targetStatus, verificationNotes },
    });

    return NextResponse.json({ success: true, payment: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
