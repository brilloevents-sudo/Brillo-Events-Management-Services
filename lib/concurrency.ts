import prisma from "./prisma";

export interface TimeSlot {
  talentId: string;
  eventDate: Date;
  startTime?: string | null;
  endTime?: string | null;
  excludeBookingId?: string;
}

export async function checkTalentConflict(slot: TimeSlot): Promise<{
  hasConflict: boolean;
  conflictingBooking?: {
    id: string;
    bookingNumber: string;
    eventName: string;
    mallOrVenue: string;
    status: string;
  };
}> {
  // Normalize date to start of day UTC
  const startOfDay = new Date(slot.eventDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(slot.eventDate);
  endOfDay.setHours(23, 59, 59, 999);

  // Find assignments for this talent on that day
  const conflictingAssignment = await prisma.talentAssignment.findFirst({
    where: {
      talentId: slot.talentId,
      booking: {
        id: slot.excludeBookingId ? { not: slot.excludeBookingId } : undefined,
        eventDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          notIn: ["CANCELLED", "EXPIRED", "CLOSED"],
        },
      },
    },
    include: {
      booking: true,
    },
  });

  if (conflictingAssignment && conflictingAssignment.booking) {
    const b = conflictingAssignment.booking;
    return {
      hasConflict: true,
      conflictingBooking: {
        id: b.id,
        bookingNumber: b.bookingNumber,
        eventName: b.eventName,
        mallOrVenue: b.mallOrVenue,
        status: b.status,
      },
    };
  }

  return { hasConflict: false };
}

export async function releaseExpiredHolds(): Promise<{
  releasedCount: number;
  releasedBookingNumbers: string[];
}> {
  const now = new Date();

  // Find active holds that have passed expiration
  const expiredBookings = await prisma.booking.findMany({
    where: {
      status: "TEMPORARY_HOLD",
      holdExpiresAt: {
        lt: now,
      },
      isHoldExpired: false,
    },
    select: {
      id: true,
      bookingNumber: true,
    },
  });

  if (expiredBookings.length === 0) {
    return { releasedCount: 0, releasedBookingNumbers: [] };
  }

  const ids = expiredBookings.map((b) => b.id);
  const bookingNumbers = expiredBookings.map((b) => b.bookingNumber);

  await prisma.$transaction([
    prisma.booking.updateMany({
      where: { id: { in: ids } },
      data: {
        status: "EXPIRED",
        isHoldExpired: true,
      },
    }),
    ...expiredBookings.map((b) =>
      prisma.bookingStatusHistory.create({
        data: {
          bookingId: b.id,
          fromStatus: "TEMPORARY_HOLD",
          toStatus: "EXPIRED",
          actor: "SYSTEM_HOLD_WATCHER",
          reason: "24-hour temporary hold period expired without confirmed reservation payment.",
        },
      })
    ),
  ]);

  return {
    releasedCount: ids.length,
    releasedBookingNumbers: bookingNumbers,
  };
}
