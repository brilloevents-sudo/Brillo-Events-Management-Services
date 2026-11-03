import { NextRequest, NextResponse } from "next/server";
import { ensureSeedUsers, getSessionFromRequest } from "@/lib/auth-server";
import { getPermissionsForRole, SESSION_COOKIE_NAME } from "@/lib/auth-shared";

export async function GET(req: NextRequest) {
  await ensureSeedUsers();
  const session = getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({
      authenticated: false,
      user: null,
      permissions: getPermissionsForRole(null),
    });
  }

  return NextResponse.json({
    authenticated: true,
    user: session,
    permissions: getPermissionsForRole(session.role),
  });
}
