import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateStateTransition, BookingStatus, BOOKING_STATUS_CONFIG } from "@/lib/booking-state";
import { evaluateDualGateSignoff } from "@/lib/booking-state-machine";
import { checkTalentConflict } from "@/lib/concurrency";
import { logAudit } from "@/lib/audit";
import { authorizeAdminRequest } from "@/lib/security";

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
    const auth = authorizeAdminRequest(req, ["SUPER_ADMIN", "OPS_ADMIN", "FINANCE_ADMIN"]);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
    }

    const body = await req.json();
    const {
      status: targetStatus,
      eventName,
      companyName,
      primaryContact,
      email,
      phone,
      city,
      bookingType,
      durationHours,
      isProvincial,
      isHoliday,
      eventDate,
      startTime,
      endTime,
      callTime,
      mallOrVenue,
      venueAddress,
      talentId,
      agreedTalentFee,
      totalContractAmount,
      depositPaid,
      balanceDue,
      extendHoldHours,
      extendHoldReason,
      cancellationReason,
      internalNotes,
      specialRequests,
      venueNotes,
      isCalendarDirectEdit = false,
      forceDualGateOverride = false,
      actor = auth.actor,
    } = body;

    const existing = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        contracts: true,
        payments: true,
        talentAssignments: true,
      },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    const updates: any = {};

    // 1. Check Date / Time / Talent conflict
    const rawNewDate = eventDate ? new Date(eventDate) : existing.eventDate;
    const newDate = eventDate
      ? new Date(Date.UTC(rawNewDate.getFullYear(), rawNewDate.getMonth(), rawNewDate.getDate(), 12, 0, 0))
      : existing.eventDate;
    const effectiveTalentId = talentId !== undefined ? talentId : existing.talentAssignments[0]?.talentId;
    let hasScheduleOverlap = false;

    if (effectiveTalentId) {
      const conflict = await checkTalentConflict({
        talentId: effectiveTalentId,
        eventDate: newDate,
        startTime: startTime || existing.startTime,
        endTime: endTime || existing.endTime,
        excludeBookingId: existing.id,
      });

      hasScheduleOverlap = conflict.hasConflict;

      if (conflict.hasConflict && !isCalendarDirectEdit && (eventDate || startTime || endTime || talentId)) {
        return NextResponse.json(
          {
            success: false,
            error: `Schedule Conflict: Santa is already assigned to ${conflict.conflictingBooking?.eventName} at ${conflict.conflictingBooking?.mallOrVenue} (${conflict.conflictingBooking?.bookingNumber}).`,
          },
          { status: 409 }
        );
      }
    }

    if (eventName !== undefined) updates.eventName = eventName;
    if (eventDate) updates.eventDate = newDate;
    if (startTime !== undefined) updates.startTime = startTime;
    if (endTime !== undefined) updates.endTime = endTime;
    if (callTime !== undefined) updates.callTime = callTime;
    if (durationHours !== undefined) updates.durationHours = Number(durationHours);
    if (bookingType !== undefined) updates.bookingType = bookingType;
    if (city !== undefined) updates.city = city;
    if (isProvincial !== undefined) updates.isProvincial = Boolean(isProvincial);
    if (isHoliday !== undefined) updates.isHoliday = Boolean(isHoliday);
    if (mallOrVenue !== undefined) updates.mallOrVenue = mallOrVenue;
    if (venueAddress !== undefined) updates.venueAddress = venueAddress;
    if (internalNotes !== undefined) updates.internalNotes = internalNotes;
    if (specialRequests !== undefined) updates.specialRequests = specialRequests;
    if (venueNotes !== undefined) updates.venueNotes = venueNotes;
    if (totalContractAmount !== undefined) updates.totalContractAmount = Number(totalContractAmount);
    if (depositPaid !== undefined) updates.depositPaid = Number(depositPaid);
    if (balanceDue !== undefined) updates.balanceDue = Number(balanceDue);

    if ((companyName || primaryContact || email || phone) && existing.clientId) {
      const clientUpdates: any = {};
      if (companyName !== undefined) clientUpdates.companyName = companyName;
      if (primaryContact !== undefined) clientUpdates.primaryContact = primaryContact;
      if (email !== undefined) clientUpdates.email = email;
      if (phone !== undefined) clientUpdates.phone = phone;
      await prisma.client.update({
        where: { id: existing.clientId },
        data: clientUpdates,
      });
    }

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

    // 3. Deterministic Status Transition & Dual-Gate Signoff Validation
    if (targetStatus && targetStatus !== existing.status) {
      const hasSignedAgreement = existing.contracts.some(
        (c) => c.status === "SIGNED" || c.signedFileUrl !== null
      );
      const hasInstitutionalWaiver = existing.contracts.some(
        (c) => c.templateType === "NO_DP" || c.templateType === "SM_CUSTOM"
      );
      const verifiedDepositPaid = existing.payments
        .filter((p) => p.status === "VERIFIED")
        .reduce((s, p) => s + Number(p.amount), 0);
      const hasVerifiedPayment = verifiedDepositPaid > 0;

      // Enforce Dual-Gate Approval when locking booking from AWAITING_STAFF_APPROVAL (unless direct calendar edit)
      if (
        !isCalendarDirectEdit &&
        (targetStatus === "SECURED_UNASSIGNED" || targetStatus === "READY_FOR_DEPLOYMENT") &&
        !(forceDualGateOverride && auth.role === "SUPER_ADMIN")
      ) {
        const dualGate = evaluateDualGateSignoff({
          hasSignedContract: hasSignedAgreement,
          hasInstitutionalWaiver,
          totalContractAmount: Number(existing.totalContractAmount || 18000),
          verifiedDepositPaid,
          hasAssignedTalent: Boolean(effectiveTalentId),
          hasScheduleOverlap,
        });

        if (!dualGate.canLockRoster) {
          return NextResponse.json(
            {
              success: false,
              dualGateFailed: true,
              blockingReasons: dualGate.blockingReasons,
              error: dualGate.blockingReasons.join(" | "),
            },
            { status: 400 }
          );
        }
      }

      if (!isCalendarDirectEdit) {
        const validation = validateStateTransition(
          existing.status as BookingStatus,
          targetStatus as BookingStatus,
          hasSignedAgreement || (forceDualGateOverride && auth.role === "SUPER_ADMIN"),
          hasVerifiedPayment || hasInstitutionalWaiver || (forceDualGateOverride && auth.role === "SUPER_ADMIN"),
          true
        );

        if (!validation.allowed) {
          return NextResponse.json({ success: false, error: validation.reason }, { status: 400 });
        }
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
          reason:
            cancellationReason ||
            `Calendar / Staff Update (${auth.role}) -> ${targetStatus}`,
        },
      });
    }

    // 4. Update talent assignment if changed
    if (talentId !== undefined) {
      await prisma.talentAssignment.deleteMany({
        where: { bookingId: existing.id },
      });
      if (talentId) {
        await prisma.talentAssignment.create({
          data: {
            bookingId: existing.id,
            talentId,
            agreedTalentFee: Number(agreedTalentFee || 12000),
            callTime: callTime || existing.callTime,
            status: "CONFIRMED",
          },
        });
      }
    } else if (agreedTalentFee !== undefined && existing.talentAssignments[0]) {
      await prisma.talentAssignment.update({
        where: { id: existing.talentAssignments[0].id },
        data: { agreedTalentFee: Number(agreedTalentFee) },
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
      details: { updates, rbacRole: auth.role },
    });

    return NextResponse.json({ success: true, booking: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = authorizeAdminRequest(req, ["SUPER_ADMIN", "OPS_ADMIN"]);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
    }

    await prisma.talentAssignment.deleteMany({ where: { bookingId: params.id } });
    await prisma.bookingStatusHistory.deleteMany({ where: { bookingId: params.id } });
    await prisma.booking.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
