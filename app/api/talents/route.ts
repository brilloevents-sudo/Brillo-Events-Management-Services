import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { authorizeAdminRequest } from "@/lib/security";

export async function GET(req: NextRequest) {
  try {
    const auth = authorizeAdminRequest(req, ["CREATOR", "ADMIN"]);
    const { searchParams } = new URL(req.url);
    const publicOnly = searchParams.get("publicOnly") === "true" || !auth.authorized;
    const status = searchParams.get("status");

    const where: any = {};
    if (publicOnly) {
      where.approvedForPublicDisplay = true;
      where.status = "ACTIVE";
    } else if (status) {
      where.status = status;
    }

    const talents = await prisma.talent.findMany({
      where,
      include: {
        images: true,
        aliases: true,
        assignments: auth.authorized
          ? {
              include: {
                booking: {
                  select: {
                    id: true,
                    bookingNumber: true,
                    eventName: true,
                    eventDate: true,
                    mallOrVenue: true,
                    status: true,
                  },
                },
              },
            }
          : false,
      },
      orderBy: { displayName: "asc" },
    });

    const sanitizedTalents = auth.authorized
      ? talents.map((t) =>
          auth.role === "CREATOR"
            ? t
            : { ...t, baseTalentFee: 0 }
        )
      : talents.map((t) => ({
          ...t,
          baseTalentFee: 0,
          phone: "",
          assignments: [],
        }));

    return NextResponse.json({
      success: true,
      count: sanitizedTalents.length,
      talents: sanitizedTalents,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = authorizeAdminRequest(req, ["CREATOR", "ADMIN"]);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
    }
    const body = await req.json();
    const {
      sourceName,
      displayName,
      talentType = "REAL_BEARD",
      age,
      height,
      nationality,
      phone,
      baseTalentFee = 12000,
      metroManilaRate = 18000,
      provincialRate = 23400,
      holidayRate = 21000,
      bio,
      approvedForPublicDisplay = false,
    } = body;

    if (!displayName) {
      return NextResponse.json({ success: false, error: "Display name is required" }, { status: 400 });
    }

    const count = await prisma.talent.count();
    const canonicalId = `TAL-${displayName.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8)}-${count + 1}`;

    const talent = await prisma.talent.create({
      data: {
        canonicalId,
        sourceName: sourceName || displayName,
        displayName,
        talentType,
        status: "ACTIVE",
        age: age ? parseInt(age, 10) : null,
        height,
        nationality,
        phone,
        baseTalentFee,
        metroManilaRate,
        provincialRate,
        holidayRate,
        bio,
        approvedForPublicDisplay,
      },
    });

    await logAudit({
      action: "TALENT_CREATE",
      entityType: "Talent",
      entityId: talent.id,
      details: { canonicalId, displayName },
    });

    return NextResponse.json({ success: true, talent });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
