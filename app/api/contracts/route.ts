import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateContractHtml } from "@/lib/contracts";
import { logAudit } from "@/lib/audit";
import {
  authorizeAdminRequest,
  checkRateLimit,
  validateContractPayload,
} from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const auth = authorizeAdminRequest(req, ["SUPER_ADMIN", "OPS_ADMIN"]);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
    }

    const rate = checkRateLimit(`contracts:${auth.actor}`, 25, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded. Please wait before generating more contracts." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validation = validateContractPayload(body);
    if (!validation.valid || !validation.data) {
      return NextResponse.json(
        { success: false, error: validation.error || "Invalid contract payload." },
        { status: 400 }
      );
    }

    const {
      bookingId,
      templateType,
      signedFileUrl,
      signerName,
      signerEmail,
      documentSha256,
      isSigned,
    } = validation.data;

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
      inclusions:
        "Real Beard Santa Claus, dedicated Production Assistant, holding room coordination.",
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
        status: isSigned ? "SIGNED" : "SENT",
        contentHtml: htmlContent,
        signedFileUrl,
        signerName: signerName || booking.client.primaryContact,
        signerEmail: signerEmail || booking.client.email,
        signedAt: isSigned ? new Date() : null,
        signProvider: documentSha256 ? `SHA256:${documentSha256.slice(0, 12)}` : "DOCUMENSO_FRAMEWORK",
      },
    });

    await logAudit({
      action: "CONTRACT_GENERATE",
      entityType: "Contract",
      entityId: contract.id,
      actorName: auth.actor,
      details: {
        contractNumber,
        templateType,
        isSigned,
        documentSha256,
        rbacRole: auth.role,
      },
    });

    return NextResponse.json({
      success: true,
      contract,
      documentSha256,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
