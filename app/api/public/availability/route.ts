import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { evaluateSantaAvailabilityForDate } from "@/lib/santa-availability";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || "";
    const location = searchParams.get("location") || searchParams.get("city") || "";

    const talents = await prisma.talent.findMany({
      where: {
        approvedForPublicDisplay: true,
        status: "ACTIVE",
      },
      include: {
        images: {
          where: { approvedForClient: true },
          orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }],
        },
        assignments: {
          where: {
            status: { notIn: ["CANCELLED", "DECLINED", "REASSIGNED"] },
          },
          include: {
            booking: {
              select: {
                eventDate: true,
                startTime: true,
                endTime: true,
                durationHours: true,
                status: true,
                mallOrVenue: true,
                city: true,
              },
            },
          },
        },
      },
      orderBy: { displayName: "asc" },
    });

    const evaluation = evaluateSantaAvailabilityForDate(talents, date, location);

    return NextResponse.json({
      success: true,
      date: evaluation.summary.date,
      location: evaluation.summary.locationQuery,
      summary: evaluation.summary,
      santas: evaluation.santas,
    });
  } catch (error: any) {
    console.error("Failed to evaluate public Santa availability:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Availability check failed" },
      { status: 500 }
    );
  }
}
