import crypto from "crypto";
import { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth-server";

/**
 * Security, RBAC, Input Validation, Rate Limiting & SHA-256 Integrity Module (v3.1)
 * Enforces signed session cookie boundaries between CREATOR, ADMIN, and CLIENT.
 */

export type AdminRole =
  | "CREATOR"
  | "SUPER_ADMIN"
  | "ADMIN"
  | "OPS_ADMIN"
  | "FINANCE_ADMIN"
  | "CLIENT"
  | "VIEWER";

const RATE_LIMIT_BUCKETS = new Map<string, { count: number; resetAt: number }>();

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
 * Verifies the signed `brillo_session` cookie so clients cannot spoof admin headers.
 */
export function authorizeAdminRequest(
  req: NextRequest,
  allowedRoles: AdminRole[] = ["CREATOR", "SUPER_ADMIN", "ADMIN", "OPS_ADMIN", "FINANCE_ADMIN"]
): { authorized: boolean; role: AdminRole; actor: string; error?: string } {
  // 1. CSRF / Origin check for state-changing methods
  const method = req.method.toUpperCase();
  if (["POST", "PATCH", "PUT", "DELETE"].includes(method)) {
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    if (origin && host) {
      try {
        const originHost = new URL(origin).host;
        if (
          originHost !== host &&
          !originHost.endsWith("brilloevent.com") &&
          !originHost.startsWith("localhost") &&
          !originHost.startsWith("192.168.")
        ) {
          return {
            authorized: false,
            role: "VIEWER",
            actor: "ANONYMOUS",
            error: "CSRF origin verification failed.",
          };
        }
      } catch {
        return {
          authorized: false,
          role: "VIEWER",
          actor: "ANONYMOUS",
          error: "Malformed Origin header.",
        };
      }
    }
  }

  // 2. Verify signed session cookie
  const session = getSessionFromRequest(req);
  if (!session) {
    return {
      authorized: false,
      role: "VIEWER",
      actor: "UNAUTHENTICATED",
      error: "Authentication required. Please sign in at /login.",
    };
  }

  if (session.role === "CLIENT") {
    return {
      authorized: false,
      role: "CLIENT",
      actor: session.email,
      error: "Customer accounts are restricted to /portal and cannot access internal operations.",
    };
  }

  const effectiveRole: AdminRole = session.role === "CREATOR" ? "CREATOR" : "ADMIN";

  // Normalize allowedRoles: CREATOR satisfies CREATOR / SUPER_ADMIN; ADMIN satisfies ADMIN / OPS_ADMIN / FINANCE_ADMIN
  const creatorAllowed =
    allowedRoles.includes("CREATOR") || allowedRoles.includes("SUPER_ADMIN");
  const adminAllowed =
    allowedRoles.includes("ADMIN") ||
    allowedRoles.includes("OPS_ADMIN") ||
    allowedRoles.includes("FINANCE_ADMIN");

  const permitted =
    (effectiveRole === "CREATOR" && creatorAllowed) ||
    (effectiveRole === "ADMIN" && adminAllowed);

  if (!permitted) {
    return {
      authorized: false,
      role: effectiveRole,
      actor: session.email,
      error:
        effectiveRole === "ADMIN"
          ? "Master Creator permission required for this action."
          : `Role '${effectiveRole}' is not permitted to perform this operation.`,
    };
  }

  return {
    authorized: true,
    role: effectiveRole,
    actor: session.email || session.name,
  };
}

export function computeSha256Hex(input: string | Buffer): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export const ALLOWED_MEDIA_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "mp4",
  "webm",
  "mov",
  "m4v",
]);

export function sanitizeAndValidateMediaFileName(
  rawName: string,
  fallbackExt = "jpg"
): {
  valid: boolean;
  safeName: string;
  ext: string;
  error?: string;
} {
  const base =
    String(rawName || `media.${fallbackExt}`)
      .split(/[\\/]/)
      .pop() || `media.${fallbackExt}`;
  const clean = base.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/\.{2,}/g, "_");
  const parts = clean.split(".");
  const ext = parts.length > 1 ? parts.pop()!.toLowerCase() : fallbackExt;
  if (!ALLOWED_MEDIA_EXTENSIONS.has(ext)) {
    return {
      valid: false,
      safeName: "",
      ext,
      error: `Disallowed file extension '.${ext}'. Only JPG, PNG, WebP, GIF, MP4, WebM, and MOV are permitted.`,
    };
  }
  const stem = parts.join("_").slice(0, 80) || "santa_media";
  return {
    valid: true,
    safeName: `${stem}.${ext}`,
    ext,
  };
}

export function verifyWebhookTokenTimingSafe(
  providedToken: string | null | undefined,
  expectedToken: string | null | undefined
): boolean {
  if (!providedToken || !expectedToken) return false;
  try {
    const a = Buffer.from(String(providedToken));
    const b = Buffer.from(String(expectedToken));
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
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
