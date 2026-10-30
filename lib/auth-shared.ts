export type AppRole = "CREATOR" | "ADMIN" | "CLIENT";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  bookingRef?: string;
}

export interface RolePermissions {
  role: AppRole;
  isCreator: boolean;
  isAdmin: boolean;
  isClient: boolean;
  canAccessAdminHub: boolean;
  canAccessClientPortal: boolean;
  canViewProfit: boolean;
  canViewInternalTalentFee: boolean;
  canDeleteRecords: boolean;
  canManageUsers: boolean;
  canAccessGovernance: boolean;
  canAccessPaluwal: boolean;
  canManageSettings: boolean;
}

export const SESSION_COOKIE_NAME = "brillo_session";

/**
 * Admin paths strictly reserved for Master CREATOR only.
 * Operations ADMIN is blocked from accessing these routes.
 */
export const CREATOR_ONLY_ADMIN_PATHS = [
  "/admin/expenses",
  "/admin/paluwal",
  "/admin/users",
  "/admin/settings",
  "/admin/import",
  "/admin/audit-log",
  "/admin/conflicts",
] as const;

export function normalizeAppRole(rawRole?: string | null): AppRole {
  const upper = String(rawRole || "").trim().toUpperCase();
  if (upper === "CREATOR" || upper === "SUPER_ADMIN" || upper === "OWNER") {
    return "CREATOR";
  }
  if (
    upper === "ADMIN" ||
    upper === "OPS_ADMIN" ||
    upper === "OPS" ||
    upper === "FINANCE_ADMIN" ||
    upper === "FINANCE" ||
    upper === "SALES"
  ) {
    return "ADMIN";
  }
  return "CLIENT";
}

export function isCreatorOnlyAdminPath(pathname: string): boolean {
  const clean = pathname.replace(/\/+$/, "") || "/";
  return CREATOR_ONLY_ADMIN_PATHS.some(
    (restricted) => clean === restricted || clean.startsWith(`${restricted}/`)
  );
}

export function canAccessPath(role: AppRole | null, pathname: string): {
  allowed: boolean;
  redirectTo?: string;
  reason?: "UNAUTHENTICATED" | "CLIENT_BOUNDARY" | "CREATOR_ONLY";
} {
  const clean = pathname.replace(/\/+$/, "") || "/";

  if (clean.startsWith("/admin")) {
    if (!role) {
      return {
        allowed: false,
        redirectTo: `/login?next=${encodeURIComponent(pathname)}`,
        reason: "UNAUTHENTICATED",
      };
    }
    if (role === "CLIENT") {
      return {
        allowed: false,
        redirectTo: "/portal",
        reason: "CLIENT_BOUNDARY",
      };
    }
    if (role === "ADMIN" && isCreatorOnlyAdminPath(clean)) {
      return {
        allowed: false,
        redirectTo: "/admin?restricted=creator",
        reason: "CREATOR_ONLY",
      };
    }
    return { allowed: true };
  }

  if (clean.startsWith("/portal")) {
    if (!role) {
      return {
        allowed: false,
        redirectTo: `/client-login?next=${encodeURIComponent(pathname)}`,
        reason: "UNAUTHENTICATED",
      };
    }
    if (role === "CREATOR" || role === "ADMIN") {
      return {
        allowed: false,
        redirectTo: "/admin",
      };
    }
    return { allowed: true };
  }

  return { allowed: true };
}

export function getPermissionsForRole(role?: AppRole | null): RolePermissions {
  const isCreator = role === "CREATOR";
  const isAdmin = role === "ADMIN";
  const isClient = role === "CLIENT";

  return {
    role: role || "CLIENT",
    isCreator,
    isAdmin,
    isClient,
    canAccessAdminHub: isCreator || isAdmin,
    canAccessClientPortal: isClient,
    canViewProfit: isCreator,
    canViewInternalTalentFee: isCreator,
    canDeleteRecords: isCreator,
    canManageUsers: isCreator,
    canAccessGovernance: isCreator,
    canAccessPaluwal: isCreator,
    canManageSettings: isCreator,
  };
}
