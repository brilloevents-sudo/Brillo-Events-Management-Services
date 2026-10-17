import { NextRequest, NextResponse } from "next/server";
import { releaseExpiredHolds } from "@/lib/concurrency";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Optional bearer auth if CRON_SECRET is configured
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await releaseExpiredHolds();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      releasedCount: result.releasedCount,
      releasedBookingNumbers: result.releasedBookingNumbers,
    });
  } catch (error: any) {
    console.error("Failed to release expired holds:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
