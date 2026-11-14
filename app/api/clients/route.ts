import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authorizeAdminRequest } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = authorizeAdminRequest(request, ["CREATOR", "ADMIN"]);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
    }
    const clients = await prisma.client.findMany({
      include: {
        bookings: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, clients });
  } catch (error: any) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients", details: error.message },
      { status: 500 }
    );
  }
}
