export type UserRole =
  | "ADMIN"
  | "SALES"
  | "OPERATIONS"
  | "FINANCE"
  | "TALENT_PA"
  | "READ_ONLY";

export type PermissionAction =
  | "booking:create"
  | "booking:edit"
  | "booking:cancel"
  | "booking:confirm_secured"
  | "hold:create"
  | "hold:extend"
  | "talent:create"
  | "talent:edit_profile"
  | "talent:upload_photo"
  | "talent:view_sensitive"
  | "assignment:assign"
  | "assignment:reassign"
  | "quote:create"
  | "quote:approve"
  | "contract:generate"
  | "contract:upload_signed"
  | "payment:record"
  | "payment:verify"
  | "payment:reject"
  | "expense:create"
  | "paluwal:create"
  | "paluwal:approve"
  | "payout:record"
  | "import:execute"
  | "conflict:resolve"
  | "inbox:read"
  | "inbox:send"
  | "settings:edit";

const ROLE_PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  ADMIN: [
    "booking:create",
    "booking:edit",
    "booking:cancel",
    "booking:confirm_secured",
    "hold:create",
    "hold:extend",
    "talent:create",
    "talent:edit_profile",
    "talent:upload_photo",
    "talent:view_sensitive",
    "assignment:assign",
    "assignment:reassign",
    "quote:create",
    "quote:approve",
    "contract:generate",
    "contract:upload_signed",
    "payment:record",
    "payment:verify",
    "payment:reject",
    "expense:create",
    "paluwal:create",
    "paluwal:approve",
    "payout:record",
    "import:execute",
    "conflict:resolve",
    "inbox:read",
    "inbox:send",
    "settings:edit",
  ],
  SALES: [
    "booking:create",
    "booking:edit",
    "hold:create",
    "hold:extend",
    "quote:create",
    "contract:generate",
    "contract:upload_signed",
    "payment:record",
    "inbox:read",
    "inbox:send",
  ],
  OPERATIONS: [
    "booking:create",
    "booking:edit",
    "hold:create",
    "hold:extend",
    "talent:create",
    "talent:edit_profile",
    "talent:upload_photo",
    "assignment:assign",
    "assignment:reassign",
    "contract:upload_signed",
    "inbox:read",
  ],
  FINANCE: [
    "payment:record",
    "payment:verify",
    "payment:reject",
    "expense:create",
    "paluwal:create",
    "paluwal:approve",
    "payout:record",
    "talent:view_sensitive",
    "inbox:read",
  ],
  TALENT_PA: [],
  READ_ONLY: ["inbox:read"],
};

export function hasPermission(role: UserRole | string, action: PermissionAction): boolean {
  const normalizedRole = (role?.toUpperCase() || "READ_ONLY") as UserRole;
  const permissions = ROLE_PERMISSIONS[normalizedRole] || [];
  return permissions.includes(action);
}

export function assertPermission(role: UserRole | string, action: PermissionAction): void {
  if (!hasPermission(role, action)) {
    throw new Error(`Unauthorized: Role '${role}' lacks permission for '${action}'`);
  }
}
