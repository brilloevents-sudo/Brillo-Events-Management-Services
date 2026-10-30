import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  createSessionToken,
  ensureSeedUsers,
  hashPassword,
  verifyPassword,
} from "@/lib/auth-server";
import {
  normalizeAppRole,
  SESSION_COOKIE_NAME,
  SessionUser,
} from "@/lib/auth-shared";
import { checkRateLimit } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    await ensureSeedUsers();

    const body = await req.json();
    const mode = String(body.mode || "ACCOUNT").toUpperCase();
    const email = String(body.email || "").trim().toLowerCase();

    const rl = checkRateLimit(`login:${email || "anon"}`, 15, 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many sign-in attempts. Please wait a minute and try again.",
        },
        { status: 429 }
      );
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    let sessionUser: SessionUser | null = null;

    if (mode === "BOOKING_REF") {
      const bookingRef = String(body.bookingReference || "").trim();
      if (!bookingRef) {
        return NextResponse.json(
          {
            success: false,
            error: "Please enter your Booking Reference # (e.g. BR-2026-Q001).",
          },
          { status: 400 }
        );
      }

      const matchedBooking = await prisma.booking.findFirst({
        where: {
          OR: [
            { bookingNumber: bookingRef },
            { bookingNumber: bookingRef.toUpperCase() },
            { secureToken: bookingRef },
          ],
        },
        include: { client: true },
      });

      if (
        !matchedBooking ||
        String(matchedBooking.client?.email || "").trim().toLowerCase() !== email
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "No matching booking was found for that Email and Booking Reference #.",
          },
          { status: 401 }
        );
      }

      sessionUser = {
        id: matchedBooking.client.id,
        name:
          matchedBooking.client.primaryContact ||
          matchedBooking.client.companyName ||
          "Valued Client",
        email,
        role: "CLIENT",
        bookingRef: matchedBooking.bookingNumber,
      };
    } else if (mode === "CLIENT_REGISTER") {
      const password = String(body.password || "");
      const name = String(body.name || "").trim() || email.split("@")[0];
      if (password.length < 6) {
        return NextResponse.json(
          {
            success: false,
            error: "Password must be at least 6 characters long.",
          },
          { status: 400 }
        );
      }

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json(
          {
            success: false,
            error:
              "An account with this email already exists. Please use Sign In instead.",
          },
          { status: 409 }
        );
      }

      const created = await prisma.user.create({
        data: {
          email,
          name,
          role: "CLIENT",
          passwordHash: hashPassword(password),
          isActive: true,
        },
      });

      sessionUser = {
        id: created.id,
        name: created.name,
        email: created.email,
        role: "CLIENT",
      };
    } else {
      // Standard Email + Password Account Login (CREATOR, ADMIN, or CLIENT)
      const password = String(body.password || "");
      if (!password) {
        return NextResponse.json(
          { success: false, error: "Please enter your password." },
          { status: 400 }
        );
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !verifyPassword(password, user.passwordHash)) {
        return NextResponse.json(
          { success: false, error: "Invalid email address or password." },
          { status: 401 }
        );
      }

      if (!user.isActive) {
        return NextResponse.json(
          {
            success: false,
            error:
              "This account has been suspended by the Master Creator. Contact Brillo administration.",
          },
          { status: 403 }
        );
      }

      sessionUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: normalizeAppRole(user.role),
      };
    }

    const token = createSessionToken(sessionUser);
    const redirectTo = sessionUser.role === "CLIENT" ? "/portal" : "/admin";

    const res = NextResponse.json({
      success: true,
      authenticated: true,
      user: sessionUser,
      redirectTo,
    });

    res.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Authentication failed." },
      { status: 500 }
    );
  }
}
