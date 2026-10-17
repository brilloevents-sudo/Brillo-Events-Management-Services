import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateStateTransition, BookingStatus, BOOKING_STATUS_CONFIG } from "@/lib/booking-state";
import { checkTalentConflict } from "@/lib/concurrency";
import { logAudit } from "@/lib/audit";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        talentAssignments: {
          include: {
            talent: {
              include: { images: true, aliases: true },
            },
          },
        },
        paAssignments: { include: { pa: true } },
        quotes: { orderBy: { version: "desc" } },
        contracts: { orderBy: { version: "desc" } },
        payments: { orderBy: { paymentDate: "desc" } },
        expenses: true,
        checklistItems: true,
        statusHistory: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, booking });
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
      status: targetStatus,
      eventDate,
      startTime,
      endTime,
      callTime,
      mallOrVenue,
      venueAddress,
      talentId,
      agreedTalentFee,
      extendHoldHours,
      extendHoldReason,
      cancellationReason,
      internalNotes,
      actor = "STAFF_USER",
    } = body;

    const existing = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        contracts: true,
        payments: true,
        talentAssignments: true,
      },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    const updates: any = {};

    // 1. Check Date / Time / Talent conflict if changing
    const newDate = eventDate ? new Date(eventDate) : existing.eventDate;
    const effectiveTalentId = talentId || existing.talentAssignments[0]?.talentId;

    if ((eventDate || startTime || endTime || talentId) && effectiveTalentId) {
      const conflict = await checkTalentConflict({
        talentId: effectiveTalentId,
        eventDate: newDate,
        startTime: startTime || existing.startTime,
        endTime: endTime || existing.endTime,
        excludeBookingId: existing.id,
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
    }

    if (eventDate) updates.eventDate = newDate;
    if (startTime !== undefined) updates.startTime = startTime;
    if (endTime !== undefined) updates.endTime = endTime;
    if (callTime !== undefined) updates.callTime = callTime;
    if (mallOrVenue !== undefined) updates.mallOrVenue = mallOrVenue;
    if (venueAddress !== undefined) updates.venueAddress = venueAddress;
    if (internalNotes !== undefined) updates.internalNotes = internalNotes;

    // 2. Extend Hold Action
    if (extendHoldHours) {
      const currentExpiry = existing.holdExpiresAt || new Date();
      const newExpiry = new Date(currentExpiry.getTime() + extendHoldHours * 60 * 60 * 1000);
      updates.holdExpiresAt = newExpiry;
      updates.isHoldExpired = false;
      updates.holdExtensionReason = extendHoldReason || "Extended by staff authorization.";

      await prisma.bookingStatusHistory.create({
        data: {
          bookingId: existing.id,
          fromStatus: existing.status,
          toStatus: existing.status,
          actor,
          reason: `Temporary hold extended by ${extendHoldHours} hours until ${newExpiry.toISOString()}. Reason: ${updates.holdExtensionReason}`,
        },
      });
    }

    // 3. Status Transition Validation
    if (targetStatus && targetStatus !== existing.status) {
      const hasSignedAgreement = existing.contracts.some((c) => c.status === "SIGNED" || c.signedFileUrl !== null);
      const hasVerifiedPayment = existing.payments.some((p) => p.status === "VERIFIED");

      const validation = validateStateTransition(
        existing.status as BookingStatus,
        targetStatus as BookingStatus,
        hasSignedAgreement,
        hasVerifiedPayment,
        true // isStaff
      );

      if (!validation.allowed) {
        return NextResponse.json({ success: false, error: validation.reason }, { status: 400 });
      }

      updates.status = targetStatus;
      const statusConfig = BOOKING_STATUS_CONFIG[targetStatus as BookingStatus];
      if (statusConfig) {
        updates.pipelineStage = statusConfig.pipelineStage;
      }

      await prisma.bookingStatusHistory.create({
        data: {
          bookingId: existing.id,
          fromStatus: existing.status,
          toStatus: targetStatus,
          actor,
          reason: cancellationReason || `Status updated to ${targetStatus}`,
        },
      });
    }

    // 4. Update talent assignment if changed
    if (talentId) {
      await prisma.talentAssignment.deleteMany({
        where: { bookingId: existing.id },
      });
      await prisma.talentAssignment.create({
        data: {
          bookingId: existing.id,
          talentId,
          agreedTalentFee: agreedTalentFee || 12000,
          callTime: callTime || existing.callTime,
          status: "CONFIRMED",
        },
      });
    }

    const updated = await prisma.booking.update({
      where: { id: params.id },
      data: updates,
      include: {
        client: true,
        talentAssignments: { include: { talent: true } },
      },
    });

    await logAudit({
      action: "BOOKING_UPDATE",
      entityType: "Booking",
      entityId: existing.id,
      actorName: actor,
      details: { updates },
    });

    return NextResponse.json({ success: true, booking: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
