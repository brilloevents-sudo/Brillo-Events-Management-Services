import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateContractHtml } from "@/lib/contracts";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      bookingId,
      templateType = "WITH_DP", // WITH_DP, NO_DP, SM_CUSTOM
      signedFileUrl,
      signerName,
      signerEmail,
      isSigned = false,
      actor = "STAFF_USER",
    } = body;

    if (!bookingId) {
      return NextResponse.json({ success: false, error: "Booking ID is required." }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        client: true,
        talentAssignments: { include: { talent: true } },
        contracts: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    const assignedTalent = booking.talentAssignments[0]?.talent;
    const nextVersion = (booking.contracts.length || 0) + 1;
    const contractNumber = `CTR-${booking.bookingNumber}-V${nextVersion}`;

    const totalAmt = Number(booking.totalContractAmount) || 18000;
    const withDP = templateType === "WITH_DP";
    const depAmt = withDP ? Math.round(totalAmt * 0.5) : 0;
    const balAmt = totalAmt - depAmt;

    const htmlContent = generateContractHtml({
      companyName: "Brillo Events Management Service",
      clientName: booking.client.companyName || booking.client.primaryContact,
      venueName: booking.mallOrVenue,
      eventDate: booking.eventDate.toDateString(),
      callTime: booking.callTime || "13:00",
      startTime: booking.startTime || "14:00",
      endTime: booking.endTime || "18:00",
      talentName: assignedTalent?.displayName || "To be confirmed",
      talentType: assignedTalent?.talentType || "Real Beard",
      totalAmount: totalAmt,
      depositAmount: depAmt,
      balanceAmount: balAmt,
      inclusions: "Real Beard Santa Claus, dedicated Production Assistant, holding room coordination.",
      withDP,
    });

    const contract = await prisma.contract.create({
      data: {
        contractNumber,
        bookingId: booking.id,
        clientId: booking.clientId,
        templateType,
        title: `Service Agreement — ${booking.mallOrVenue}`,
        version: nextVersion,
        status: isSigned || signedFileUrl ? "SIGNED" : "SENT",
        contentHtml: htmlContent,
        signedFileUrl: signedFileUrl || null,
        signerName: signerName || booking.client.primaryContact,
        signerEmail: signerEmail || booking.client.email,
        signedAt: isSigned || signedFileUrl ? new Date() : null,
        signProvider: "MANUAL",
      },
    });

    await logAudit({
      action: "CONTRACT_GENERATE",
      entityType: "Contract",
      entityId: contract.id,
      actorName: actor,
      details: { contractNumber, templateType, isSigned: Boolean(isSigned || signedFileUrl) },
    });

    return NextResponse.json({ success: true, contract });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
