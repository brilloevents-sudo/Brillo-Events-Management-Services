import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth-server";

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Please sign in at /login to view your bookings." },
        { status: 401 }
      );
    }

    const emailLower = session.email.toLowerCase();

    // Find all Client records matching the authenticated customer's email
    const allClients = await prisma.client.findMany();
    const matchingClientIds = allClients
      .filter((c) => String(c.email || "").trim().toLowerCase() === emailLower)
      .map((c) => c.id);

    const rawBookings =
      matchingClientIds.length > 0
        ? await prisma.booking.findMany({
            where: { clientId: { in: matchingClientIds } },
            include: {
              client: true,
              talentAssignments: {
                include: {
                  talent: {
                    include: { images: true },
                  },
                },
              },
              contracts: { orderBy: { version: "desc" }, take: 1 },
              payments: { orderBy: { paymentDate: "desc" } },
            },
            orderBy: { createdAt: "desc" },
          })
        : [];

    // Strict Customer Boundary Sanitization:
    // Never expose internalNotes, totalDirectCost, projectedGrossProfit, agreedTalentFee, or talent private phone/address
    const bookings = rawBookings.map((b) => {
      const assignedTalent = b.talentAssignments?.[0]?.talent;
      const contractAmt = Number(b.totalContractAmount || 0);
      const dpPaid = Number(b.depositPaid || 0);
      const dpRequired = Number(b.depositRequired || Math.round(contractAmt * 0.5));
      const balanceDue = Math.max(0, contractAmt - dpPaid);

      return {
        id: b.id,
        bookingNumber: b.bookingNumber,
        secureToken: b.secureToken,
        bookingType: b.bookingType,
        eventName: b.eventName,
        eventDate: b.eventDate,
        startTime: b.startTime,
        endTime: b.endTime,
        durationHours: Number(b.durationHours || 3),
        mallOrVenue: b.mallOrVenue,
        city: b.city,
        status: b.status,
        totalContractAmount: contractAmt,
        depositRequired: dpRequired,
        depositPaid: dpPaid,
        balanceDue,
        specialRequests: b.specialRequests,
        assignedSanta: assignedTalent
          ? {
              displayName: assignedTalent.displayName,
              talentType: assignedTalent.talentType,
              photoUrl:
                assignedTalent.images?.find((img) => img.isPrimary)?.publicUrl ||
                assignedTalent.images?.[0]?.publicUrl ||
                "/talents/Bob/bob_photo_1.png",
            }
          : null,
        latestContract: b.contracts?.[0]
          ? {
              contractNumber: b.contracts[0].contractNumber,
              status: b.contracts[0].status,
            }
          : null,
        statusPortalUrl: `/request-status?token=${encodeURIComponent(
          b.secureToken
        )}&booking=${encodeURIComponent(
          b.bookingNumber
        )}&amount=${contractAmt}&venue=${encodeURIComponent(b.mallOrVenue)}`,
      };
    });

    return NextResponse.json({
      success: true,
      customer: {
        name: session.name,
        email: session.email,
      },
      count: bookings.length,
      bookings,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load customer bookings." },
      { status: 500 }
    );
  }
}
