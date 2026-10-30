import crypto from "crypto";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import {
  AppRole,
  normalizeAppRole,
  SESSION_COOKIE_NAME,
  SessionUser,
} from "@/lib/auth-shared";

const AUTH_SECRET =
  process.env.BRILLO_AUTH_SECRET ||
  "brillo-events-santa-hub-v3-hmac-session-key-2026";
const PASSWORD_SALT = "brillo_v3_salt_2026";

export function hashPassword(plain: string): string {
  return crypto
    .createHash("sha256")
    .update(`${PASSWORD_SALT}:${plain}`)
    .digest("hex");
}

export function verifyPassword(plain: string, expectedHash?: string | null): boolean {
  if (!expectedHash) return false;
  const candidate = hashPassword(plain);
  try {
    const a = Buffer.from(candidate, "hex");
    const b = Buffer.from(expectedHash, "hex");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export interface SignedSessionPayload extends SessionUser {
  exp: number;
}

export function createSessionToken(user: SessionUser, ttlSeconds = 60 * 60 * 24 * 7): string {
  const payload: SignedSessionPayload = {
    ...user,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url"
  );
  const sig = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(encodedPayload)
    .digest("base64url");
  return `${encodedPayload}.${sig}`;
}

export function verifySessionToken(token?: string | null): SessionUser | null {
  if (!token || !token.includes(".")) return null;
  const [encodedPayload, sig] = token.split(".");
  if (!encodedPayload || !sig) return null;

  const expectedSig = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(encodedPayload)
    .digest("base64url");

  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expectedSig);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return null;
    }
    const parsed = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8")
    ) as SignedSessionPayload;
    if (!parsed.exp || parsed.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return {
      id: parsed.id,
      name: parsed.name,
      email: parsed.email,
      role: normalizeAppRole(parsed.role),
      bookingRef: parsed.bookingRef,
    };
  } catch {
    return null;
  }
}

export function getSessionFromRequest(req: NextRequest): SessionUser | null {
  const cookieVal = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (cookieVal) {
    const verified = verifySessionToken(cookieVal);
    if (verified) return verified;
  }
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return verifySessionToken(authHeader.slice(7).trim());
  }
  return null;
}

let seededOnce = false;

/**
 * Ensures the 3 core role accounts exist in SQLite on server startup:
 * - CREATOR: creator@brilloevent.com
 * - ADMIN:   admin@brilloevent.com
 * - CLIENT:  client@brilloevent.com
 */
export async function ensureSeedUsers() {
  if (seededOnce) return;
  try {
    const defaults: Array<{
      email: string;
      name: string;
      role: AppRole;
      plain: string;
    }> = [
      {
        email: "creator@brilloevent.com",
        name: "Brillo Master Creator",
        role: "CREATOR",
        plain: "BrilloCreator2026!",
      },
      {
        email: "admin@brilloevent.com",
        name: "Brillo Operations Admin",
        role: "ADMIN",
        plain: "BrilloAdmin2026!",
      },
      {
        email: "client@brilloevent.com",
        name: "Corporate Partner Client",
        role: "CLIENT",
        plain: "BrilloClient2026!",
      },
    ];

    for (const acc of defaults) {
      const existing = await prisma.user.findUnique({
        where: { email: acc.email },
      });
      if (!existing) {
        await prisma.user.create({
          data: {
            email: acc.email,
            name: acc.name,
            role: acc.role,
            passwordHash: hashPassword(acc.plain),
            isActive: true,
          },
        });
      } else if (!existing.passwordHash) {
        await prisma.user.update({
          where: { email: acc.email },
          data: {
            role: acc.role,
            passwordHash: hashPassword(acc.plain),
            isActive: true,
          },
        });
      }
    }
    seededOnce = true;
  } catch (err) {
    console.warn("ensureSeedUsers warning:", err);
  }
}
