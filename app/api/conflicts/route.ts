import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { authorizeAdminRequest } from "@/lib/security";

export async function GET(req: NextRequest) {
  try {
    const auth = authorizeAdminRequest(req, ["CREATOR"]);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
    }
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status") || "PENDING_REVIEW";

    const where: any = {};
    if (status !== "ALL") where.status = status;
    if (category) where.category = category;

    const conflicts = await prisma.dataConflict.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, count: conflicts.length, conflicts });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = authorizeAdminRequest(req, ["CREATOR"]);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
    }
    const body = await req.json();
    const { conflictId, status = "RESOLVED", resolvedResolution } = body;
    const actor = auth.actor;

    if (!conflictId) {
      return NextResponse.json({ success: false, error: "Conflict ID required" }, { status: 400 });
    }

    const updated = await prisma.dataConflict.update({
      where: { id: conflictId },
      data: {
        status,
        resolvedResolution,
        resolvedBy: actor,
        resolvedAt: new Date(),
      },
    });

    await logAudit({
      action: "DATA_CONFLICT_RESOLVE",
      entityType: "DataConflict",
      entityId: conflictId,
      actorName: actor,
      details: { status, resolvedResolution },
    });

    return NextResponse.json({ success: true, conflict: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
