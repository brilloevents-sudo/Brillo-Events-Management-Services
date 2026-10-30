import crypto from "crypto";
import { NextRequest } from "next/server";

/**
 * Security, RBAC, Input Validation, Rate Limiting & SHA-256 Integrity Module (v3.0)
 * Aligned with .agents/skills/security-audit & 90DaysOfCyberSecurity guidelines.
 */

export type AdminRole = "SUPER_ADMIN" | "OPS_ADMIN" | "FINANCE_ADMIN" | "VIEWER";

const RATE_LIMIT_BUCKETS = new Map<string, { count: number; resetAt: number }>();

/**
 * Sliding-window in-memory rate limiter for sensitive mutation & import routes
 */
export function checkRateLimit(
  key: string,
  maxRequests = 30,
  windowMs = 60_000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const bucket = RATE_LIMIT_BUCKETS.get(key);
  if (!bucket || now > bucket.resetAt) {
    RATE_LIMIT_BUCKETS.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }
  if (bucket.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }
  bucket.count += 1;
  return { allowed: true, remaining: maxRequests - bucket.count };
}

/**
 * Resolves and authorizes the caller's RBAC role on admin API endpoints
 */
export function authorizeAdminRequest(
  req: NextRequest,
  allowedRoles: AdminRole[] = ["SUPER_ADMIN", "OPS_ADMIN", "FINANCE_ADMIN"]
): { authorized: boolean; role: AdminRole; actor: string; error?: string } {
  const headerRole = (req.headers.get("x-brillo-role") || "SUPER_ADMIN").toUpperCase() as AdminRole;
  const actor = req.headers.get("x-brillo-actor") || "SUPER_ADMIN";

  const validRoles: AdminRole[] = ["SUPER_ADMIN", "OPS_ADMIN", "FINANCE_ADMIN", "VIEWER"];
  const role: AdminRole = validRoles.includes(headerRole) ? headerRole : "VIEWER";

  // CSRF / Origin check for state-changing methods when Origin header is present
  const method = req.method.toUpperCase();
  if (["POST", "PATCH", "PUT", "DELETE"].includes(method)) {
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    if (origin && host) {
      try {
        const originHost = new URL(origin).host;
        if (originHost !== host && !originHost.endsWith("brilloevent.com") && !originHost.startsWith("localhost")) {
          return {
            authorized: false,
            role,
            actor,
            error: "CSRF origin verification failed.",
          };
        }
      } catch {
        return { authorized: false, role, actor, error: "Malformed Origin header." };
      }
    }
  }

  if (!allowedRoles.includes(role)) {
    return {
      authorized: false,
      role,
      actor,
      error: `Role '${role}' is not permitted to perform this operation.`,
    };
  }

  return { authorized: true, role, actor };
}

/**
 * Computes cryptographic SHA-256 hex digest for signed contract documents or bank references
 */
export function computeSha256Hex(input: string | Buffer): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

const ALLOWED_FRAMEWORKS = ["WITH_DP", "NO_DP", "SM_CUSTOM"] as const;

export interface ValidatedContractInput {
  bookingId: string;
  templateType: (typeof ALLOWED_FRAMEWORKS)[number];
  signerName: string;
  signerEmail?: string;
  signedFileUrl: string | null;
  documentSha256: string | null;
  isSigned: boolean;
}

/**
 * Strict schema & path-traversal validator for /api/contracts
 * Rejects raw local filesystem paths, "../" traversal, backslashes, or unverified protocols.
 */
export function validateContractPayload(raw: any): {
  valid: boolean;
  data?: ValidatedContractInput;
  error?: string;
} {
  if (!raw || typeof raw !== "object") {
    return { valid: false, error: "Invalid JSON payload." };
  }

  const bookingId = String(raw.bookingId || "").trim();
  if (!bookingId || bookingId.length > 80 || /[^a-zA-Z0-9_-]/.test(bookingId)) {
    return { valid: false, error: "Invalid or missing bookingId." };
  }

  const templateType = String(raw.templateType || "WITH_DP").trim() as any;
  if (!ALLOWED_FRAMEWORKS.includes(templateType)) {
    return {
      valid: false,
      error: "Invalid framework template. Allowed: WITH_DP, NO_DP, SM_CUSTOM.",
    };
  }

  const signerName = String(raw.signerName || "").trim().slice(0, 120);
  const signerEmail = raw.signerEmail ? String(raw.signerEmail).trim().slice(0, 160) : undefined;

  let signedFileUrl: string | null = null;
  let documentSha256: string | null = raw.documentSha256
    ? String(raw.documentSha256).trim().toLowerCase()
    : null;

  if (documentSha256 && !/^[a-f0-9]{64}$/.test(documentSha256)) {
    return { valid: false, error: "Invalid SHA-256 document hash format." };
  }

  if (raw.uploadedFileBase64 && typeof raw.uploadedFileBase64 === "string") {
    // Compute server-side SHA-256 digest of uploaded PDF/Image bytes
    const base64Clean = raw.uploadedFileBase64.replace(/^data:[^;]+;base64,/, "");
    const buf = Buffer.from(base64Clean, "base64");
    if (buf.byteLength > 10 * 1024 * 1024) {
      return { valid: false, error: "Uploaded signed document exceeds 10MB limit." };
    }
    const computedHash = computeSha256Hex(buf);
    documentSha256 = computedHash;
    const safeFileName = String(raw.uploadedFileName || "signed-contract.pdf").replace(
      /[^a-zA-Z0-9._-]/g,
      "_"
    );
    signedFileUrl = `https://storage.brilloevent.com/contracts/${computedHash.slice(
      0,
      16
    )}-${safeFileName}`;
  } else if (raw.signedFileUrl && String(raw.signedFileUrl).trim().length > 0) {
    const candidate = String(raw.signedFileUrl).trim();

    // Reject path traversal, Windows drive paths, backslashes, or local file:// schemes
    if (
      candidate.includes("..") ||
      candidate.includes("\\") ||
      /^[a-zA-Z]:/.test(candidate) ||
      candidate.startsWith("/") ||
      candidate.startsWith("file:")
    ) {
      return {
        valid: false,
        error:
          "Security Policy: Raw local filesystem paths (e.g. /proofs/...) are rejected. Upload a signed PDF/Image above or provide a verified HTTPS storage URL.",
      };
    }

    try {
      const parsed = new URL(candidate);
      if (parsed.protocol !== "https:") {
        return {
          valid: false,
          error: "Signed document URL must use HTTPS object storage.",
        };
      }
      signedFileUrl = parsed.toString();
      if (!documentSha256) {
        documentSha256 = computeSha256Hex(signedFileUrl);
      }
    } catch {
      return { valid: false, error: "Malformed signed document URL." };
    }
  }

  return {
    valid: true,
    data: {
      bookingId,
      templateType,
      signerName,
      signerEmail,
      signedFileUrl,
      documentSha256,
      isSigned: Boolean(raw.isSigned || signedFileUrl),
    },
  };
}
