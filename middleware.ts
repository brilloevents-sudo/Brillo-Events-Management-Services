import { NextRequest, NextResponse } from "next/server";
import {
  canAccessPath,
  normalizeAppRole,
  SESSION_COOKIE_NAME,
} from "@/lib/auth-shared";

const AUTH_SECRET =
  process.env.BRILLO_AUTH_SECRET ||
  "brillo-events-santa-hub-v3-hmac-session-key-2026";

function base64UrlToUint8Array(base64Url: string): Uint8Array {
  const padding = "=".repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    arr[i] = raw.charCodeAt(i);
  }
  return arr;
}

async function verifyEdgeSessionCookie(token?: string) {
  if (!token || !token.includes(".")) return null;
  const [encodedPayload, sig] = token.split(".");
  if (!encodedPayload || !sig) return null;

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(AUTH_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const sigBytes = base64UrlToUint8Array(sig);
    const dataBytes = encoder.encode(encodedPayload);
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes.buffer as ArrayBuffer,
      dataBytes.buffer as ArrayBuffer
    );
    if (!valid) return null;

    const jsonStr = new TextDecoder().decode(base64UrlToUint8Array(encodedPayload));
    const parsed = JSON.parse(jsonStr);
    if (!parsed.exp || parsed.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return {
      email: String(parsed.email || ""),
      role: normalizeAppRole(parsed.role),
    };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/admin") && !pathname.startsWith("/portal")) {
    return NextResponse.next();
  }

  const cookieVal = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifyEdgeSessionCookie(cookieVal);
  const check = canAccessPath(session ? session.role : null, pathname);

  if (!check.allowed && check.redirectTo) {
    const targetUrl = new URL(check.redirectTo, req.url);
    return NextResponse.redirect(targetUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*"],
};
