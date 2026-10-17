import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { BOOKING_STATUS_CONFIG, BookingStatus } from "@/lib/booking-state";

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { secureToken: params.token },
      include: {
        client: {
          select: { companyName: true, primaryContact: true },
        },
        talentAssignments: {
          include: {
            talent: {
              select: {
                displayName: true,
                talentType: true,
                bio: true,
                images: {
                  where: { approvedForClient: true },
                  select: { publicUrl: true, caption: true, isPrimary: true },
                },
              },
            },
          },
        },
        contracts: {
          where: { status: { in: ["SENT", "SIGNED"] } },
          select: { id: true, title: true, status: true, documentFileUrl: true, signedFileUrl: true },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            paymentType: true,
            paymentDate: true,
            status: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired tracking link." },
        { status: 404 }
      );
    }

    const assignedTalent = booking.talentAssignments[0]?.talent;
    const statusMeta = BOOKING_STATUS_CONFIG[booking.status as BookingStatus] || {
      label: booking.status,
      description: "Booking in progress.",
    };

    return NextResponse.json({
      success: true,
      booking: {
        bookingNumber: booking.bookingNumber,
        eventName: booking.eventName,
        eventDate: booking.eventDate,
        startTime: booking.startTime,
        endTime: booking.endTime,
        durationHours: booking.durationHours,
        mallOrVenue: booking.mallOrVenue,
        status: booking.status,
        statusLabel: statusMeta.label,
        statusDescription: statusMeta.description,
        isHoldActive: booking.status === "TEMPORARY_HOLD" && !booking.isHoldExpired,
        holdExpiresAt: booking.holdExpiresAt,
        totalContractAmount: booking.totalContractAmount,
        depositRequired: booking.depositRequired,
        depositPaid: booking.depositPaid,
        balanceDue: booking.balanceDue,
        client: booking.client,
        assignedTalent: assignedTalent
          ? {
              displayName: assignedTalent.displayName,
              talentType: assignedTalent.talentType,
              bio: assignedTalent.bio,
              photos: assignedTalent.images,
            }
          : null,
        contract: booking.contracts[0] || null,
        payments: booking.payments,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
