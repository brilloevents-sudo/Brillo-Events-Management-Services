import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const talent = await prisma.talent.findUnique({
      where: { id: params.id },
      include: {
        images: true,
        aliases: true,
        assignments: {
          include: {
            booking: {
              include: { client: true, payments: true, contracts: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        ledgerEntries: {
          orderBy: { entryDate: "desc" },
        },
      },
    });

    if (!talent) {
      return NextResponse.json({ success: false, error: "Talent not found" }, { status: 404 });
    }

    // Calculate Net Paluwal Balance
    let totalAdvances = 0;
    let totalDeductions = 0;
    let totalPayouts = 0;

    talent.ledgerEntries.forEach((entry) => {
      const amt = Number(entry.amount);
      if (entry.entryType === "ADVANCE") totalAdvances += amt;
      else if (entry.entryType === "DEDUCTION") totalDeductions += amt;
      else if (entry.entryType === "PAYOUT") totalPayouts += amt;
    });

    const netAdvanceBalance = totalAdvances - totalDeductions;

    return NextResponse.json({
      success: true,
      talent: {
        ...talent,
        financeSummary: {
          totalAdvances,
          totalDeductions,
          netAdvanceBalance,
          totalPayouts,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const {
      displayName,
      talentType,
      status,
      age,
      height,
      nationality,
      phone,
      bio,
      baseTalentFee,
      metroManilaRate,
      provincialRate,
      holidayRate,
      specialRateNote,
      approvedForPublicDisplay,
      actor = "STAFF_USER",
    } = body;

    const existing = await prisma.talent.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Talent not found" }, { status: 404 });
    }

    const updates: any = {};
    if (displayName !== undefined) updates.displayName = displayName;
    if (talentType !== undefined) updates.talentType = talentType;
    if (status !== undefined) updates.status = status;
    if (age !== undefined) updates.age = age ? parseInt(age, 10) : null;
    if (height !== undefined) updates.height = height;
    if (nationality !== undefined) updates.nationality = nationality;
    if (phone !== undefined) updates.phone = phone;
    if (bio !== undefined) updates.bio = bio;
    if (baseTalentFee !== undefined) updates.baseTalentFee = baseTalentFee;
    if (metroManilaRate !== undefined) updates.metroManilaRate = metroManilaRate;
    if (provincialRate !== undefined) updates.provincialRate = provincialRate;
    if (holidayRate !== undefined) updates.holidayRate = holidayRate;
    if (specialRateNote !== undefined) updates.specialRateNote = specialRateNote;
    if (approvedForPublicDisplay !== undefined) {
      updates.approvedForPublicDisplay = approvedForPublicDisplay;
    }

    const updated = await prisma.talent.update({
      where: { id: params.id },
      data: updates,
      include: { images: true, aliases: true },
    });

    await logAudit({
      action: "TALENT_UPDATE",
      entityType: "Talent",
      entityId: existing.id,
      actorName: actor,
      details: { updates },
    });

    return NextResponse.json({ success: true, talent: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
