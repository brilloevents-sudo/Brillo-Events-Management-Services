import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ensureSeedUsers, hashPassword } from "@/lib/auth-server";
import { normalizeAppRole } from "@/lib/auth-shared";
import { authorizeAdminRequest } from "@/lib/security";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    await ensureSeedUsers();
    const auth = authorizeAdminRequest(req, ["CREATOR"]);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      users: users.map((u) => ({
        ...u,
        role: normalizeAppRole(u.role),
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureSeedUsers();
    const auth = authorizeAdminRequest(req, ["CREATOR"]);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
    }

    const body = await req.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const role = normalizeAppRole(body.role);

    if (!name || !email || !email.includes("@") || password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: "Name, valid email, and password (min 6 characters) are required.",
        },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "A user with that email already exists." },
        { status: 409 }
      );
    }

    const created = await prisma.user.create({
      data: {
        name,
        email,
        role,
        passwordHash: hashPassword(password),
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    await logAudit({
      action: "USER_CREATE",
      entityType: "User",
      entityId: created.id,
      actorName: auth.actor,
      details: { email, role },
    });

    return NextResponse.json({ success: true, user: created });
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
    const userId = String(body.id || "");
    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID required." }, { status: 400 });
    }

    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) {
      return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
    }

    // Prevent Creator from locking out their own master account
    if (
      target.email.toLowerCase() === "creator@brilloevent.com" &&
      body.isActive === false
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Primary Master Creator account cannot be deactivated.",
        },
        { status: 400 }
      );
    }

    const updates: any = {};
    if (body.name) updates.name = String(body.name).trim();
    if (body.role) updates.role = normalizeAppRole(body.role);
    if (typeof body.isActive === "boolean") updates.isActive = body.isActive;
    if (body.newPassword && String(body.newPassword).length >= 6) {
      updates.passwordHash = hashPassword(String(body.newPassword));
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updates,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    await logAudit({
      action: "USER_UPDATE",
      entityType: "User",
      entityId: updated.id,
      actorName: auth.actor,
      details: { email: updated.email, role: updated.role, isActive: updated.isActive },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
