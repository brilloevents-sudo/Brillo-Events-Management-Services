import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkTalentConflict } from "@/lib/concurrency";
import { logAudit } from "@/lib/audit";
import { getTargetGuidance } from "@/lib/costing";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const talentId = searchParams.get("talentId");
    const status = searchParams.get("status");
    const pipelineStage = searchParams.get("pipelineStage");
    const mallOrVenue = searchParams.get("mallOrVenue");
    const search = searchParams.get("search");

    const where: any = {};

    if (status) where.status = status;
    if (pipelineStage) where.pipelineStage = parseInt(pipelineStage, 10);
    if (mallOrVenue) where.mallOrVenue = { contains: mallOrVenue };
    if (talentId) {
      where.talentAssignments = {
        some: { talentId },
      };
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
        paAssignments: { include: { pa: true } },
        payments: true,
        quotes: { orderBy: { version: "desc" }, take: 1 },
        contracts: { orderBy: { version: "desc" }, take: 1 },
      },
      orderBy: { eventDate: "asc" },
    });

    return NextResponse.json({ success: true, count: bookings.length, bookings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      companyName,
      primaryContact,
      email,
      phone,
      bookingType = "CORPORATE",
      eventName,
      eventDate,
      startTime = "14:00",
      endTime = "18:00",
      callTime = "13:00",
      durationHours = 4.0,
      mallOrVenue,
      venueAddress,
      city,
      province,
      isProvincial = false,
      isHoliday = false,
      talentId,
      agreedTalentFee,
      quotedAmount,
      createHold = false,
      internalNotes,
    } = body;

    if (!eventName || !eventDate || !mallOrVenue) {
      return NextResponse.json(
        { success: false, error: "Event name, event date, and mall/venue are required." },
        { status: 400 }
      );
    }

    const parsedEventDate = new Date(eventDate);

    // 1. Concurrency Check if talent selected
    if (talentId) {
      const conflict = await checkTalentConflict({
        talentId,
        eventDate: parsedEventDate,
        startTime,
        endTime,
      });

      if (conflict.hasConflict) {
        return NextResponse.json(
          {
            success: false,
            error: `Schedule Conflict: Selected talent is already booked or on hold for ${conflict.conflictingBooking?.eventName} at ${conflict.conflictingBooking?.mallOrVenue} (${conflict.conflictingBooking?.bookingNumber}).`,
          },
          { status: 409 }
        );
      }
    }

    // 2. Find or create Client
    let client = await prisma.client.findFirst({
      where: { email: email || "unknown@client.local" },
    });

    if (!client) {
      client = await prisma.client.create({
        data: {
          companyName: companyName || "Private Client",
          primaryContact: primaryContact || "Client Contact",
          email: email || `lead-${Date.now()}@brilloevents.com`,
          phone: phone || "N/A",
          city,
          province,
          clientType: bookingType === "CORPORATE" ? "CORPORATE" : "PRIVATE",
        },
      });
    }

    // 3. Guidance calculation
    const guidance = getTargetGuidance(isProvincial, isHoliday);
    const finalQuoteAmount = quotedAmount || guidance.targetEstimate;
    const finalDeposit = Math.round(finalQuoteAmount * 0.5);

    // 4. Hold expiration if requested
    let holdExpiresAt: Date | null = null;
    let initialStatus = "INQUIRY_RECEIVED";
    if (createHold) {
      initialStatus = "TEMPORARY_HOLD";
      holdExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    }

    const bookingCount = await prisma.booking.count();
    const bookingNumber = `BR-2026-${String(bookingCount + 1).padStart(3, "0")}`;
    const secureToken = `req_${Math.random().toString(36).substring(2, 12)}`;

    const booking = await prisma.booking.create({
      data: {
        bookingNumber,
        secureToken,
        clientId: client.id,
        bookingType,
        eventName,
        eventDate: parsedEventDate,
        startTime,
        endTime,
        callTime,
        durationHours,
        mallOrVenue,
        venueAddress,
        city,
        province,
        isProvincial,
        isHoliday,
        status: initialStatus,
        pipelineStage: 1,
        holdCreatedAt: createHold ? new Date() : null,
        holdExpiresAt,
        totalContractAmount: finalQuoteAmount,
        depositRequired: finalDeposit,
        balanceDue: finalQuoteAmount,
        internalNotes,
      },
    });

    // Link talent assignment if selected
    if (talentId) {
      await prisma.talentAssignment.create({
        data: {
          bookingId: booking.id,
          talentId,
          agreedTalentFee: agreedTalentFee || 12000,
          callTime,
          status: createHold ? "PENDING" : "CONFIRMED",
        },
      });
    }

    // Log status history
    await prisma.bookingStatusHistory.create({
      data: {
        bookingId: booking.id,
        fromStatus: "NONE",
        toStatus: initialStatus,
        actor: "STAFF_USER",
        reason: createHold ? "Created with 24-hour temporary hold." : "Inquiry intake created.",
      },
    });

    await logAudit({
      action: "BOOKING_CREATE",
      entityType: "Booking",
      entityId: booking.id,
      details: { bookingNumber, mallOrVenue, initialStatus, talentId },
    });

    return NextResponse.json({ success: true, booking });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
