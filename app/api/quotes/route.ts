import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { calculateCosting } from "@/lib/costing";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      bookingId,
      clientQuotedAmount,
      internalTalentFee = 12000,
      internalPaFee = 1500,
      transportAllowance = 0,
      wardrobeAllowance = 0,
      otherDirectCosts = 0,
      discountAmount = 0,
      discountReason,
      depositPercentage = 50,
      scopeInclusions = "Professional Real-Beard Santa Appearance, dedicated Production Assistant, photo ops, gift distribution.",
      termsAndConditions = "Valid for 7 days. 50% reservation downpayment required to secure master calendar.",
    } = body;

    if (!bookingId || !clientQuotedAmount) {
      return NextResponse.json(
        { success: false, error: "Booking ID and quoted amount are required." },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { client: true, quotes: true },
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    const calculation = calculateCosting({
      clientQuotedAmount: Number(clientQuotedAmount),
      internalTalentFee: Number(internalTalentFee),
      internalPaFee: Number(internalPaFee),
      transportAllowance: Number(transportAllowance),
      wardrobeAllowance: Number(wardrobeAllowance),
      otherDirectCosts: Number(otherDirectCosts),
      discountAmount: Number(discountAmount),
      depositPercentage: Number(depositPercentage),
    });

    const nextVersion = (booking.quotes.length || 0) + 1;
    const quoteNumber = `QT-${booking.bookingNumber}-V${nextVersion}`;

    const quote = await prisma.quote.create({
      data: {
        quoteNumber,
        bookingId: booking.id,
        clientId: booking.clientId,
        version: nextVersion,
        status: "APPROVED",
        clientQuotedAmount: calculation.clientQuotedAmount,
        internalTalentFee: calculation.internalTalentFee,
        internalPaFee: calculation.internalPaFee,
        transportAllowance: calculation.transportAllowance,
        wardrobeAllowance: calculation.wardrobeAllowance,
        otherDirectCosts: calculation.otherDirectCosts,
        discountAmount: calculation.discountAmount,
        discountReason,
        totalDirectCost: calculation.totalDirectCost,
        grossProfit: calculation.grossProfit,
        grossMarginPercent: calculation.grossMarginPercent,
        depositPercentage: Number(depositPercentage),
        depositAmount: calculation.depositAmount,
        balanceAmount: calculation.balanceAmount,
        scopeInclusions,
        termsAndConditions,
      },
    });

    // Update booking financials
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        totalContractAmount: calculation.clientQuotedAmount,
        depositRequired: calculation.depositAmount,
        balanceDue: calculation.balanceAmount,
        totalDirectCost: calculation.totalDirectCost,
        projectedGrossProfit: calculation.grossProfit,
      },
    });

    await logAudit({
      action: "QUOTE_CREATE",
      entityType: "Quote",
      entityId: quote.id,
      details: { quoteNumber, clientQuotedAmount, grossProfit: calculation.grossProfit },
    });

    return NextResponse.json({ success: true, quote, calculation });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
