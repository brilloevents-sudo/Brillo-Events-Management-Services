import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get("search") || "").trim();
    const filter = searchParams.get("filter") || "ALL";

    const where: any = {};

    if (filter === "NEW") {
      where.status = { in: ["INQUIRY_RECEIVED", "NEW_INQUIRY", "TEMPORARY_HOLD", "HOLD_24H_ACTIVE"] };
    } else if (filter === "CORPORATE") {
      where.bookingType = { in: ["CORPORATE", "CORPORATE_MALL", "MALL_TOUR"] };
    } else if (filter === "PRIVATE") {
      where.bookingType = { in: ["PRIVATE", "PRIVATE_PARTY"] };
    } else if (filter === "FOLLOW_UP") {
      where.status = {
        in: [
          "QUOTE_ISSUED",
          "QUOTED",
          "CONTRACT_SENT",
          "CONTRACT_SIGNED_PENDING_DEPOSIT",
          "AWAITING_STAFF_SIGNOFF",
          "AWAITING_STAFF_APPROVAL",
        ],
      };
    } else if (filter === "REAL_BEARD") {
      where.OR = [
        { internalNotes: { contains: '"santaTier":"REAL_BEARD"' } },
        { specialRequests: { contains: "Real Beard" } },
      ];
    } else if (filter === "FAKE_BEARD") {
      where.OR = [
        { internalNotes: { contains: '"santaTier":"FAKE_BEARD"' } },
        { specialRequests: { contains: "Fake Beard" } },
      ];
    }

    if (search) {
      where.OR = [
        { eventName: { contains: search } },
        { mallOrVenue: { contains: search } },
        { city: { contains: search } },
        { bookingNumber: { contains: search } },
        { specialRequests: { contains: search } },
        { client: { companyName: { contains: search } } },
        { client: { primaryContact: { contains: search } } },
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
        contracts: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        payments: true,
      },
      orderBy: [{ pipelineStage: "asc" }, { createdAt: "desc" }],
      take: 100,
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
