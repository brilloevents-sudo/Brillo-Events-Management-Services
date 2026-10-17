import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const filter = searchParams.get("filter") || "ALL";

    // Query bookings that are in the lead/inquiry stages
    const where: any = {};

    if (filter === "NEW") {
      where.status = "INQUIRY_RECEIVED";
    } else if (filter === "CORPORATE") {
      where.bookingType = "CORPORATE_MALL";
    } else if (filter === "PRIVATE") {
      where.bookingType = "PRIVATE_PARTY";
    } else if (filter === "FOLLOW_UP") {
      where.status = { in: ["QUOTED", "UNDER_CLIENT_REVIEW"] };
    }

    if (search) {
      where.OR = [
        { eventName: { contains: search } },
        { mallOrVenue: { contains: search } },
        { locationCity: { contains: search } },
        { bookingNumber: { contains: search } },
      ];
    }

    const leads = await prisma.booking.findMany({
      where,
      include: {
        client: true,
        talentAssignments: {
          include: { talent: true },
        },
        quotes: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ success: true, leads });
  } catch (error: any) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads", details: error.message },
      { status: 500 }
    );
  }
}
