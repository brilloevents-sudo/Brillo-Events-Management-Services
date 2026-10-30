import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth-shared";

export async function POST() {
  const res = NextResponse.json({ success: true, authenticated: false });
  res.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
