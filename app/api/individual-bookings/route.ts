import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkTalentConflict } from "@/lib/concurrency";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const talentId = searchParams.get("talentId");
    const client = searchParams.get("client");
    const venue = searchParams.get("venue");
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const search = searchParams.get("search");

    const where: any = {};

    if (talentId) {
      where.talentAssignments = {
        some: { talentId },
      };
    }
    if (status) where.status = status;
    if (venue) where.mallOrVenue = { contains: venue };
    if (client) {
      where.client = {
        companyName: { contains: client },
      };
    }
    if (startDate || endDate) {
      where.eventDate = {};
      if (startDate) where.eventDate.gte = new Date(startDate);
      if (endDate) where.eventDate.lte = new Date(endDate);
    }
    if (search) {
      where.OR = [
        { bookingNumber: { contains: search } },
        { eventName: { contains: search } },
        { mallOrVenue: { contains: search } },
        { client: { companyName: { contains: search } } },
        { client: { primaryContact: { contains: search } } },
      ];
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        client: true,
        talentAssignments: {
          include: {
            talent: {
              include: { images: true },
            },
          },
        },
        payments: true,
        contracts: { take: 1, orderBy: { version: "desc" } },
        quotes: { take: 1, orderBy: { version: "desc" } },
        ledgerEntries: true,
      },
      orderBy: { eventDate: "desc" },
    });

    // Transform into talent-centric records answering "Who booked this Santa?"
    const formatted = bookings.map((b) => {
      const primaryAssignment = b.talentAssignments[0];
      const talent = primaryAssignment?.talent;
      const verifiedPayments = b.payments
        .filter((p) => p.status === "VERIFIED")
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const hasSignedContract = b.contracts.some(
        (c) => c.status === "SIGNED" || c.signedFileUrl !== null
      );

      return {
        bookingId: b.id,
        bookingNumber: b.bookingNumber,
        secureToken: b.secureToken,
        eventName: b.eventName,
        eventDate: b.eventDate,
        startTime: b.startTime,
        endTime: b.endTime,
        durationHours: b.durationHours,
        callTime: b.callTime,
        venue: b.mallOrVenue,
        venueAddress: b.venueAddress,
        isProvincial: b.isProvincial,
        isHoliday: b.isHoliday,
        status: b.status,
        pipelineStage: b.pipelineStage,
        // The core question: "Who booked this Santa?"
        bookedBy: {
          clientId: b.client.id,
          companyName: b.client.companyName || "Direct Private Client",
          clientType: b.client.clientType,
          primaryContact: b.client.primaryContact,
          email: b.client.email,
          phone: b.client.phone,
        },
        // Talent specifics
        talent: talent
          ? {
              id: talent.id,
              canonicalId: talent.canonicalId,
              displayName: talent.displayName,
              talentType: talent.talentType,
              photoUrl: talent.images[0]?.publicUrl || "/talents/placeholder.jpg",
              agreedTalentFee: primaryAssignment.agreedTalentFee,
              assignmentStatus: primaryAssignment.status,
            }
          : null,
        financials: {
          clientQuotedAmount: b.totalContractAmount,
          depositRequired: b.depositRequired,
          depositPaid: b.depositPaid,
          verifiedCashReceived: verifiedPayments,
          balanceOutstanding: b.balanceDue,
          agreedTalentFee: primaryAssignment?.agreedTalentFee || 0,
        },
        contract: b.contracts[0]
          ? {
              id: b.contracts[0].id,
              title: b.contracts[0].title,
              status: b.contracts[0].status,
              isSigned: hasSignedContract,
            }
          : null,
        provenance: {
          isHistoricalImport: b.isHistoricalImport,
          sourceSheet: b.sourceSheet,
          sourceRowIndex: b.sourceRowIndex,
          internalNotes: b.internalNotes,
        },
      };
    });

    return NextResponse.json({ success: true, count: formatted.length, records: formatted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      talentId,
      companyName,
      contactPerson,
      email,
      phone,
      venueName,
      eventDate,
      startTime = "14:00",
      endTime = "18:00",
      callTime = "13:00",
      customTalentFee,
      clientAmount = 18000,
      notes,
    } = body;

    if (!talentId || !venueName || !eventDate) {
      return NextResponse.json(
        { success: false, error: "Talent, venue, and date are required." },
        { status: 400 }
      );
    }

    const parsedDate = new Date(eventDate);

    // Conflict Check
    const conflict = await checkTalentConflict({
      talentId,
      eventDate: parsedDate,
      startTime,
      endTime,
    });

    if (conflict.hasConflict) {
      return NextResponse.json(
        {
          success: false,
          error: `Schedule Conflict: Santa is already assigned to ${conflict.conflictingBooking?.eventName} at ${conflict.conflictingBooking?.mallOrVenue} (${conflict.conflictingBooking?.bookingNumber}).`,
        },
        { status: 409 }
      );
    }

    // Client
    let client = await prisma.client.findFirst({
      where: { companyName: companyName || "Individual Client" },
    });

    if (!client) {
      client = await prisma.client.create({
        data: {
          companyName: companyName || "Individual Client",
          primaryContact: contactPerson || "Point Person",
          email: email || "direct@client.local",
          phone: phone || "N/A",
          clientType: "CORPORATE",
        },
      });
    }

    const count = await prisma.booking.count();
    const bookingNumber = `BR-INDIV-${String(count + 1).padStart(3, "0")}`;
    const secureToken = `req_indiv_${Math.random().toString(36).substring(2, 10)}`;

    const talent = await prisma.talent.findUnique({ where: { id: talentId } });
    const effectiveTF = customTalentFee || talent?.baseTalentFee || 12000;

    const booking = await prisma.booking.create({
      data: {
        bookingNumber,
        secureToken,
        clientId: client.id,
        bookingType: "CORPORATE",
        eventName: `${venueName} Santa Appearance`,
        eventDate: parsedDate,
        startTime,
        endTime,
        callTime,
        mallOrVenue: venueName,
        status: "SECURED_UNASSIGNED",
        pipelineStage: 2,
        totalContractAmount: clientAmount,
        depositRequired: Math.round(clientAmount * 0.5),
        balanceDue: clientAmount,
        internalNotes: notes,
      },
    });

    await prisma.talentAssignment.create({
      data: {
        bookingId: booking.id,
        talentId,
        agreedTalentFee: effectiveTF,
        callTime,
        status: "CONFIRMED",
        notes: `Individual booking with negotiated fee: ₱${effectiveTF.toLocaleString()}`,
      },
    });

    await prisma.bookingStatusHistory.create({
      data: {
        bookingId: booking.id,
        fromStatus: "NONE",
        toStatus: "SECURED_UNASSIGNED",
        actor: "STAFF_USER",
        reason: `Individual Santa booking created for ${talent?.displayName} at ${venueName}.`,
      },
    });

    await logAudit({
      action: "INDIVIDUAL_BOOKING_CREATE",
      entityType: "Booking",
      entityId: booking.id,
      details: { talentId, venueName, effectiveTF, clientAmount },
    });

    return NextResponse.json({ success: true, booking });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
