import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const talentId = searchParams.get("talentId");
    const bookingId = searchParams.get("bookingId");

    const where: any = {};
    if (talentId) where.talentId = talentId;
    if (bookingId) where.bookingId = bookingId;

    const entries = await prisma.talentLedgerEntry.findMany({
      where,
      include: {
        talent: {
          select: { id: true, canonicalId: true, displayName: true },
        },
        booking: {
          select: { id: true, bookingNumber: true, eventName: true, mallOrVenue: true },
        },
        approvedBy: {
          select: { id: true, name: true },
        },
      },
      orderBy: { entryDate: "desc" },
    });

    // Summary calculation
    let totalAdvances = 0;
    let totalDeductions = 0;
    let totalPayouts = 0;

    entries.forEach((e) => {
      const amt = Number(e.amount);
      if (e.entryType === "ADVANCE") totalAdvances += amt;
      else if (e.entryType === "DEDUCTION") totalDeductions += amt;
      else if (e.entryType === "PAYOUT") totalPayouts += amt;
    });

    const netPaluwalOutstanding = totalAdvances - totalDeductions;

    return NextResponse.json({
      success: true,
      count: entries.length,
      summary: {
        totalAdvances,
        totalDeductions,
        netPaluwalOutstanding,
        totalPayouts,
      },
      entries,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      talentId,
      bookingId,
      entryType, // ADVANCE, DEDUCTION, FEE_EARNED, PAYOUT, ADJUSTMENT
      amount,
      reason,
      entryDate,
      proofFileUrl,
      approvedById,
      actor = "FINANCE_USER",
    } = body;

    if (!talentId || !entryType || !amount || !reason) {
      return NextResponse.json(
        { success: false, error: "Talent, entry type, amount, and reason are required." },
        { status: 400 }
      );
    }

    const entry = await prisma.talentLedgerEntry.create({
      data: {
        talentId,
        bookingId: bookingId || null,
        entryType,
        amount: Number(amount),
        reason,
        entryDate: entryDate ? new Date(entryDate) : new Date(),
        proofFileUrl,
        approvedById: approvedById || null,
        status: "APPROVED",
      },
      include: { talent: true },
    });

    await logAudit({
      action: "PALUWAL_ENTRY_CREATE",
      entityType: "TalentLedgerEntry",
      entityId: entry.id,
      actorName: actor,
      details: { talentId, entryType, amount, reason },
    });

    return NextResponse.json({ success: true, entry });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
