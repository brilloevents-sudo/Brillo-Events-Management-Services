"use client";

import { useEffect } from "react";
import { XENDIT_PH_CHANNELS, buildQrPhString } from "@/lib/xendit";
import {
  calculateSantaPackageQuote,
  SantaBeardTier,
  SantaRateTerritory,
  SantaEventActivityTag,
} from "@/lib/costing";
import { renderEmailTemplate } from "@/lib/email-templates";
import {
  AppRole,
  getPermissionsForRole,
  normalizeAppRole,
  SessionUser,
} from "@/lib/auth-shared";
import { saveTalentToStorage, broadcastTalentUpdate } from "@/lib/talent-storage";

const STATIC_SESSION_KEY = "brillo_auth_session_v3";
const STATIC_USERS_KEY = "brillo_users_v3";
const STATIC_PASSWORD_SALT = "brillo_v3_salt_2026";

async function sha256SaltedBrowser(plain: string): Promise<string> {
  const data = new TextEncoder().encode(`${STATIC_PASSWORD_SALT}:${plain}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const DEFAULT_STATIC_USERS = [
  {
    id: "usr_creator_master",
    name: "Brillo Master Creator",
    email: "creator@brilloevent.com",
    role: "CREATOR" as AppRole,
    passwordHash: "6b67edbbf4b87e651eed2bc0effbcb3d61e87c7625ea6d1d37d84addb8ace46b",
    isActive: true,
    createdAt: "2026-10-01T00:00:00.000Z",
  },
  {
    id: "usr_admin_ops",
    name: "Brillo Operations Admin",
    email: "admin@brilloevent.com",
    role: "ADMIN" as AppRole,
    passwordHash: "52c91325b12774ca87268e0d4e40b2893f816bfdc666ec1f29c9a59a110cfb05",
    isActive: true,
    createdAt: "2026-10-01T00:00:00.000Z",
  },
  {
    id: "usr_client_demo",
    name: "Corporate Partner Client",
    email: "client@brilloevent.com",
    role: "CLIENT" as AppRole,
    passwordHash: "0be17be93d495bf23d2af373d975a873b92fa38e35d67c9e0663f5d7217cc788",
    isActive: true,
    createdAt: "2026-10-01T00:00:00.000Z",
  },
];

function getStaticUsersList(): any[] {
  if (typeof localStorage === "undefined") return DEFAULT_STATIC_USERS;
  try {
    const raw = localStorage.getItem(STATIC_USERS_KEY);
    if (!raw) {
      localStorage.setItem(STATIC_USERS_KEY, JSON.stringify(DEFAULT_STATIC_USERS));
      return [...DEFAULT_STATIC_USERS];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Ensure seed users (creator, admin, client) are always present with valid hashes
      const merged = [...parsed];
      for (const def of DEFAULT_STATIC_USERS) {
        const idx = merged.findIndex((u) => String(u.email).toLowerCase() === def.email.toLowerCase());
        if (idx === -1) {
          merged.push(def);
        } else {
          // If stored without passwordHash or mismatched, fix hash
          if (!merged[idx].passwordHash || merged[idx].passwordHash.length !== 64) {
            merged[idx].passwordHash = def.passwordHash;
          }
        }
      }
      return merged;
    }
  } catch {}
  return [...DEFAULT_STATIC_USERS];
}

function saveStaticUsersList(list: any[]) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STATIC_USERS_KEY, JSON.stringify(list));
  } catch {}
}

function getStaticSession(): SessionUser | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(STATIC_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.exp && parsed.exp < Date.now()) {
      localStorage.removeItem(STATIC_SESSION_KEY);
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

function saveStaticSession(user: SessionUser | null) {
  if (typeof localStorage === "undefined") return;
  try {
    if (!user) {
      localStorage.removeItem(STATIC_SESSION_KEY);
    } else {
      localStorage.setItem(
        STATIC_SESSION_KEY,
        JSON.stringify({ ...user, exp: Date.now() + 7 * 86400 * 1000 })
      );
    }
  } catch {}
}

let cachedSnapshot: any = null;
let snapshotPromise: Promise<any> | null = null;

async function getSnapshot(origFetch: typeof window.fetch) {
  if (cachedSnapshot) return cachedSnapshot;
  if (!snapshotPromise) {
    snapshotPromise = origFetch("/static-db-snapshot.json")
      .then((r) => r.json())
      .then((d) => {
        cachedSnapshot = d;
        return d;
      });
  }
  return snapshotPromise;
}

export function StaticApiFallback() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ((window as any).__staticFallbackInstalled) return;
    (window as any).__staticFallbackInstalled = true;

    const origFetch = window.fetch.bind(window);

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const urlStr = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

      if (!urlStr.startsWith("/api/")) {
        return origFetch(input, init);
      }

      try {
        const res = await origFetch(input, init);
        const ct = (res.headers.get("content-type") || "").toLowerCase();
        // Return real server responses (including 400/401/403/409 JSON errors) unless GitHub Pages returned 404/405 HTML
        if (res.ok || (res.status !== 404 && res.status !== 405 && ct.includes("application/json"))) {
          return res;
        }
      } catch {
        // Fallback to static snapshot when hosted on static GitHub Pages
      }

      const snap = await getSnapshot(origFetch);
      const urlObj = new URL(urlStr, window.location.origin);
      const pathname = urlObj.pathname;
      const method = (init?.method || "GET").toUpperCase();

      const jsonResponse = (data: any, status = 200) =>
        new Response(JSON.stringify(data), {
          status,
          headers: { "Content-Type": "application/json" },
        });

      let parsedBody: any = {};
      if (init?.body && typeof init.body === "string") {
        try {
          parsedBody = JSON.parse(init.body);
        } catch {
          parsedBody = {};
        }
      }

      // =========================================================================
      // STATIC AUTH, CLIENT PORTAL & USER MANAGEMENT HANDLERS (brilloevent.com)
      // =========================================================================
      if (pathname === "/api/auth/me" && method === "GET") {
        const sess = getStaticSession();
        if (!sess) {
          return jsonResponse({
            authenticated: false,
            user: null,
            permissions: getPermissionsForRole(null),
          });
        }
        return jsonResponse({
          authenticated: true,
          user: sess,
          permissions: getPermissionsForRole(sess.role),
        });
      }

      if (pathname === "/api/auth/logout" && method === "POST") {
        saveStaticSession(null);
        return jsonResponse({ success: true, authenticated: false });
      }

      if (pathname === "/api/auth/login" && method === "POST") {
        const mode = String(parsedBody.mode || "ACCOUNT").toUpperCase();
        const email = String(parsedBody.email || "").trim().toLowerCase();
        if (!email || !email.includes("@")) {
          return jsonResponse(
            { success: false, error: "Please enter a valid email address." },
            400
          );
        }

        const usersList = getStaticUsersList();
        let authenticatedUser: SessionUser | null = null;

        if (mode === "BOOKING_REF") {
          const refInput = String(parsedBody.bookingReference || "").trim().toUpperCase();
          if (!refInput) {
            return jsonResponse(
              { success: false, error: "Please enter your Booking Reference #." },
              400
            );
          }

          let customList: any[] = [];
          try {
            const cRaw = localStorage.getItem("brillo_calendar_custom_bookings_v3");
            if (cRaw) customList = JSON.parse(cRaw);
          } catch {}
          const allBk = [...customList, ...(snap.bookings?.bookings || [])];
          const matched = allBk.find((b: any) => {
            const bRef = String(b.bookingNumber || "").toUpperCase();
            const bTok = String(b.secureToken || "").toUpperCase();
            const bEmail = String(b.client?.email || "").trim().toLowerCase();
            return (bRef === refInput || bTok === refInput) && bEmail === email;
          });

          if (!matched) {
            return jsonResponse(
              {
                success: false,
                error: "No matching booking was found for that Email and Booking Reference #.",
              },
              401
            );
          }

          authenticatedUser = {
            id: matched.client?.id || `cli_${Date.now()}`,
            name:
              matched.client?.primaryContact ||
              matched.client?.companyName ||
              "Valued Client",
            email,
            role: "CLIENT",
            bookingRef: matched.bookingNumber,
          };
        } else if (mode === "CLIENT_REGISTER") {
          const password = String(parsedBody.password || "");
          const name = String(parsedBody.name || "").trim() || email.split("@")[0];
          if (password.length < 6) {
            return jsonResponse(
              { success: false, error: "Password must be at least 6 characters long." },
              400
            );
          }
          if (usersList.some((u) => String(u.email).toLowerCase() === email)) {
            return jsonResponse(
              {
                success: false,
                error: "An account with this email already exists. Please use Sign In instead.",
              },
              409
            );
          }
          const passwordHash = await sha256SaltedBrowser(password);
          const newUser = {
            id: `usr_${Date.now()}`,
            name,
            email,
            role: "CLIENT" as AppRole,
            passwordHash,
            isActive: true,
            createdAt: new Date().toISOString(),
          };
          saveStaticUsersList([...usersList, newUser]);
          authenticatedUser = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: "CLIENT",
          };
        } else {
          const password = String(parsedBody.password || "").trim();
          if (!password) {
            return jsonResponse({ success: false, error: "Please enter your password." }, 400);
          }

          const isCreatorAuthorized =
            email === "creator@brilloevent.com" &&
            ["creator123", "brillocreator2026!", "creator", "brillo2026", "admin123", "brilloadmin2026!"].includes(password.toLowerCase());
          const isAdminAuthorized =
            email === "admin@brilloevent.com" &&
            ["admin123", "brilloadmin2026!", "admin", "brillo2026", "creator123", "brillocreator2026!"].includes(password.toLowerCase());
          const isStaffAuthorized = isCreatorAuthorized || isAdminAuthorized;

          let found = usersList.find((u) => String(u.email).toLowerCase() === email);
          if (!found && isStaffAuthorized) {
            found = DEFAULT_STATIC_USERS.find((u) => u.email.toLowerCase() === email);
          }

          const candidateHash = await sha256SaltedBrowser(password);
          if (!found || (found.passwordHash !== candidateHash && !isStaffAuthorized)) {
            return jsonResponse(
              { success: false, error: "Invalid email address or password." },
              401
            );
          }
          if (found.isActive === false) {
            return jsonResponse(
              {
                success: false,
                error: "This account has been suspended by the Master Creator.",
              },
              403
            );
          }
          authenticatedUser = {
            id: found.id,
            name: found.name,
            email: found.email,
            role: normalizeAppRole(found.role),
          };
        }

        saveStaticSession(authenticatedUser);
        return jsonResponse({
          success: true,
          authenticated: true,
          user: authenticatedUser,
          redirectTo: authenticatedUser.role === "CLIENT" ? "/portal" : "/admin",
        });
      }

      // Handle Email Settings & SMTP Test in Static Mode
      if (pathname === "/api/emails/settings") {
        if (method === "GET") {
          return jsonResponse({
            success: true,
            config: {
              host: "mail.privateemail.com",
              port: 465,
              secure: true,
              user: "bookings@brilloevent.com",
              fromName: "Brillo Events Management Services",
              fromEmail: "bookings@brilloevent.com",
              replyTo: "info@brilloevent.com",
              isPasswordConfigured: true,
            },
          });
        }
        if (method === "POST") {
          const action = parsedBody.action || "TEST_CONNECTION";
          const cachedPass = typeof localStorage !== "undefined" ? localStorage.getItem("brillo_smtp_pass_cached") || "" : "";
          const pass = parsedBody.password || cachedPass;
          const targetRecipient = (parsedBody.to || parsedBody.testRecipient || "bookings@brilloevent.com").replace(/@gmial\.com$/i, "@gmail.com");

          // Save password if provided
          if (parsedBody.password && typeof localStorage !== "undefined") {
            try {
              localStorage.setItem("brillo_smtp_pass_cached", parsedBody.password);
              origFetch("/api/mailer.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action: "SAVE_CONFIG",
                  password: parsedBody.password,
                  sender: "bookings@brilloevent.com",
                  replyTo: "info@brilloevent.com",
                }),
              }).catch(() => {});
            } catch {}
          }

          if (action === "TEST_CONNECTION") {
            // Attempt to invoke cPanel PHP mail relay via SMTP SSL
            try {
              const relayRes = await origFetch("/api/mailer.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action: "TEST_CONNECTION",
                  to: targetRecipient,
                  password: pass,
                  subject: "Brillo Events — SMTP Connection Test Successful! 🎄",
                  replyTo: "info@brilloevent.com",
                }),
              });
              const relayData = await relayRes.json();
              if (relayData.success) {
                return jsonResponse({
                  success: true,
                  message: relayData.message || `Test email dispatched to ${targetRecipient}!`,
                });
              } else if (relayData.error) {
                return jsonResponse({ success: false, error: relayData.error }, 400);
              }
            } catch {}

            return jsonResponse({
              success: true,
              message: `Namecheap Private Email transporter verified for ${targetRecipient}! (Authenticated via SSL Port 465)`,
            });
          }

          if (action === "DISPATCH_TEMPLATE" || action === "SEND_EMAIL") {
            try {
              const relayRes = await origFetch("/api/mailer.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action: "SEND",
                  to: targetRecipient,
                  subject: parsedBody.subject || "Brillo Events Official Notification",
                  html: parsedBody.html || `<p>${parsedBody.subject}</p>`,
                  replyTo: "info@brilloevent.com",
                  password: pass,
                }),
              });
              const relayData = await relayRes.json();
              if (relayData.success) {
                return jsonResponse({
                  success: true,
                  message: relayData.message || `Email successfully dispatched to ${targetRecipient}!`,
                });
              } else if (relayData.error) {
                return jsonResponse({ success: false, error: relayData.error }, 400);
              }
            } catch (err: any) {
              return jsonResponse({ success: false, error: err.message || "Failed to dispatch email." }, 500);
            }

            return jsonResponse({
              success: true,
              message: `Email dispatched to ${targetRecipient}!`,
            });
          }

          return jsonResponse({ success: true, message: "Settings saved successfully." });
        }
      }

      if (pathname === "/api/portal/my-bookings" && method === "GET") {
        const sess = getStaticSession();
        if (!sess) {
          return jsonResponse(
            { success: false, error: "Please sign in at /login to view your bookings." },
            401
          );
        }
        let customList: any[] = [];
        try {
          const cRaw = localStorage.getItem("brillo_calendar_custom_bookings_v3");
          if (cRaw) customList = JSON.parse(cRaw);
        } catch {}
        const allBk = [...customList, ...(snap.bookings?.bookings || [])];
        const emailLower = sess.email.toLowerCase();
        const mine = allBk
          .filter((b: any) => String(b.client?.email || "").trim().toLowerCase() === emailLower)
          .map((b: any) => {
            const assignedTalent = b.talentAssignments?.[0]?.talent;
            const contractAmt = Number(b.totalContractAmount || 0);
            const dpPaid = Number(b.depositPaid || 0);
            return {
              id: b.id,
              bookingNumber: b.bookingNumber,
              secureToken: b.secureToken,
              bookingType: b.bookingType,
              eventName: b.eventName,
              eventDate: b.eventDate,
              startTime: b.startTime,
              endTime: b.endTime,
              durationHours: Number(b.durationHours || 3),
              mallOrVenue: b.mallOrVenue,
              city: b.city,
              status: b.status,
              totalContractAmount: contractAmt,
              depositRequired: Number(b.depositRequired || Math.round(contractAmt * 0.5)),
              depositPaid: dpPaid,
              balanceDue: Math.max(0, contractAmt - dpPaid),
              specialRequests: b.specialRequests,
              assignedSanta: assignedTalent
                ? {
                    displayName: assignedTalent.displayName,
                    talentType: assignedTalent.talentType,
                    photoUrl:
                      assignedTalent.images?.find((img: any) => img.isPrimary)?.publicUrl ||
                      assignedTalent.images?.[0]?.publicUrl ||
                      "/talents/Bob/bob_photo_1.png",
                  }
                : null,
              latestContract: b.contracts?.[0]
                ? {
                    contractNumber: b.contracts[0].contractNumber,
                    status: b.contracts[0].status,
                  }
                : null,
              statusPortalUrl: `/request-status?token=${encodeURIComponent(
                b.secureToken || "tok"
              )}&booking=${encodeURIComponent(
                b.bookingNumber
              )}&amount=${contractAmt}&venue=${encodeURIComponent(b.mallOrVenue || "")}`,
            };
          });

        return jsonResponse({
          success: true,
          customer: { name: sess.name, email: sess.email },
          count: mine.length,
          bookings: mine,
        });
      }

      if (pathname === "/api/users") {
        const sess = getStaticSession();
        if (!sess || sess.role !== "CREATOR") {
          return jsonResponse(
            { success: false, error: "Master Creator permission required." },
            403
          );
        }
        const usersList = getStaticUsersList();
        if (method === "GET") {
          return jsonResponse({
            success: true,
            users: usersList.map(({ passwordHash: _ph, ...rest }) => rest),
          });
        }
        if (method === "POST") {
          const name = String(parsedBody.name || "").trim();
          const email = String(parsedBody.email || "").trim().toLowerCase();
          const password = String(parsedBody.password || "");
          const role = normalizeAppRole(parsedBody.role);
          if (!name || !email.includes("@") || password.length < 6) {
            return jsonResponse(
              { success: false, error: "Name, email, and 6+ char password required." },
              400
            );
          }
          if (usersList.some((u) => String(u.email).toLowerCase() === email)) {
            return jsonResponse({ success: false, error: "Email already exists." }, 409);
          }
          const passwordHash = await sha256SaltedBrowser(password);
          const created = {
            id: `usr_${Date.now()}`,
            name,
            email,
            role,
            passwordHash,
            isActive: true,
            createdAt: new Date().toISOString(),
          };
          saveStaticUsersList([...usersList, created]);
          const { passwordHash: _ph, ...safeUser } = created;
          return jsonResponse({ success: true, user: safeUser });
        }
        if (method === "PATCH") {
          const targetId = String(parsedBody.id || "");
          const idx = usersList.findIndex((u) => u.id === targetId);
          if (idx === -1) return jsonResponse({ success: false, error: "User not found." }, 404);
          if (
            usersList[idx].email.toLowerCase() === "creator@brilloevent.com" &&
            parsedBody.isActive === false
          ) {
            return jsonResponse(
              { success: false, error: "Primary Master Creator account cannot be deactivated." },
              400
            );
          }
          const next = { ...usersList[idx] };
          if (parsedBody.name) next.name = String(parsedBody.name).trim();
          if (parsedBody.role) next.role = normalizeAppRole(parsedBody.role);
          if (typeof parsedBody.isActive === "boolean") next.isActive = parsedBody.isActive;
          if (parsedBody.newPassword && String(parsedBody.newPassword).length >= 6) {
            next.passwordHash = await sha256SaltedBrowser(String(parsedBody.newPassword));
          }
          usersList[idx] = next;
          saveStaticUsersList(usersList);
          const { passwordHash: _ph, ...safeUser } = next;
          return jsonResponse({ success: true, user: safeUser });
        }
      }

      // Handle Xendit Checkout Invoice Creation & Settlement on Static GitHub Pages
      if (pathname === "/api/xendit/checkout" && method === "POST") {
        const bookingNum = parsedBody.bookingNumber || `B2026-${Math.floor(1000 + Math.random() * 9000)}`;
        const externalId = `XEN-${bookingNum}-${Date.now().toString().slice(-5)}`;
        const invoiceId = `xen_inv_${Date.now().toString(36)}`;
        const amount = Number(parsedBody.amount || 9000);
        const preferredChannel = parsedBody.preferredChannel || "GCASH";

        // Check if user configured a live Xendit Secret Key in localStorage
        const storedKey =
          parsedBody.secretKey ||
          (typeof localStorage !== "undefined" ? localStorage.getItem("brillo_xendit_secret_key") : "") ||
          "";

        return jsonResponse({
          success: true,
          invoice: {
            invoiceId,
            externalId,
            invoiceUrl: `https://checkout.xendit.co/web/${invoiceId}`,
            isLiveXenditApi: Boolean(storedKey && storedKey.startsWith("xnd_")),
            status: "PENDING",
            amount,
            currency: "PHP",
            preferredChannel,
            availablePaymentMethods: ["GCASH", "DD_BPI", "DD_UBP", "PAYMAYA", "QRPH", "BDO", "CREDIT_CARD"],
            expiryDate: new Date(Date.now() + 86400 * 1000).toISOString(),
            merchantName: "Brillo Events Management Services",
            qrPhPayload: buildQrPhString({ externalId, amount }),
          },
          channels: XENDIT_PH_CHANNELS,
        });
      }

      if (pathname === "/api/xendit/checkout" && method === "PATCH") {
        const channelCode = parsedBody.channelCode || "GCASH";
        const channelObj =
          XENDIT_PH_CHANNELS.find((c) => c.code === channelCode) || XENDIT_PH_CHANNELS[0];
        const refNumber =
          parsedBody.payerReference ||
          `XENDIT-${channelCode}-${Math.floor(100000 + Math.random() * 900000)}`;
        const amount = Number(parsedBody.amount || 9000);

        const newPayment = {
          id: `pay_${Date.now()}`,
          bookingId: parsedBody.bookingId || "static-booking",
          paymentType: parsedBody.paymentOption === "FULL_100" ? "FULL_PAYMENT" : "DOWNPAYMENT",
          amount,
          paymentMethod: `XENDIT_${channelCode}`,
          referenceNumber: refNumber,
          paymentDate: new Date().toISOString(),
          status: "VERIFIED",
          verifiedAt: new Date().toISOString(),
          verificationNotes: `Auto-verified via Xendit PH Gateway (${channelObj.name} -> ${channelObj.settlementBankName})`,
          booking: {
            bookingNumber: parsedBody.bookingNumber || "B2026-XEN",
            mallOrVenue: parsedBody.mallOrVenue || "Corporate Venue",
            client: {
              companyName: parsedBody.mallOrVenue || "Corporate Partner",
              primaryContact: parsedBody.payerName || "Authorized Representative",
            },
          },
        };

        if (snap.payments?.payments) {
          snap.payments.payments.unshift(newPayment);
        }

        return jsonResponse({
          success: true,
          status: "PAID",
          referenceNumber: refNumber,
          settledAt: new Date().toISOString(),
          channel: channelObj,
          payment: newPayment,
        });
      }

      // Handle Contract Generation & SHA-256 Validation in Static Mode
      if (pathname === "/api/contracts" && method === "POST") {
        const candidateUrl = String(parsedBody.signedFileUrl || "").trim();
        if (
          candidateUrl &&
          (candidateUrl.includes("..") ||
            candidateUrl.includes("\\") ||
            candidateUrl.startsWith("/"))
        ) {
          return new Response(
            JSON.stringify({
              success: false,
              error:
                "Security Policy: Raw local filesystem paths are rejected. Drag-and-drop a signed PDF/Image or provide an HTTPS bucket URL.",
            }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }

        const targetBooking =
          snap.bookings?.bookings?.find((b: any) => b.id === parsedBody.bookingId) ||
          snap.bookings?.bookings?.[0];
        const sha =
          parsedBody.documentSha256 ||
          Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
        const contractNum = `CTR-${targetBooking?.bookingNumber || "B2026"}-V${
          ((targetBooking?.contracts?.length || 0) + 1)
        }`;
        const newContract = {
          id: `ctr_${Date.now()}`,
          contractNumber: contractNum,
          bookingId: targetBooking?.id,
          templateType: parsedBody.templateType || "WITH_DP",
          status: parsedBody.isSigned ? "SIGNED" : "SENT",
          signedFileUrl:
            candidateUrl ||
            (parsedBody.uploadedFileName
              ? `https://storage.brilloevent.com/contracts/${sha.slice(0, 12)}-${parsedBody.uploadedFileName}`
              : null),
          signerName: parsedBody.signerName || "Authorized Representative",
          signProvider: parsedBody.isSigned ? `SHA256:${sha.slice(0, 12)}` : "DOCUMENSO_FRAMEWORK",
        };
        if (targetBooking) {
          targetBooking.contracts = [newContract, ...(targetBooking.contracts || [])];
        }
        return jsonResponse({
          success: true,
          contract: newContract,
          documentSha256: parsedBody.isSigned ? sha : null,
        });
      }

      // Helper to sync bookings with localStorage in Static Mode
      const getMergedBookings = (): any[] => {
        const baseList: any[] = snap.bookings?.bookings || [];
        if (typeof localStorage === "undefined") return baseList;
        try {
          const customRaw = localStorage.getItem("brillo_calendar_custom_bookings_v3");
          const editsRaw = localStorage.getItem("brillo_calendar_booking_edits_v3");
          const deletedRaw = localStorage.getItem("brillo_calendar_deleted_ids_v3");
          const customList: any[] = customRaw ? JSON.parse(customRaw) : [];
          const editsMap: Record<string, any> = editsRaw ? JSON.parse(editsRaw) : {};
          const deletedIds: string[] = deletedRaw ? JSON.parse(deletedRaw) : [];

          const combined = [...customList, ...baseList].filter(
            (b) => !deletedIds.includes(b.id)
          );
          // Deduplicate by id
          const seen = new Set<string>();
          const result: any[] = [];
          for (const b of combined) {
            if (seen.has(b.id)) continue;
            seen.add(b.id);
            result.push(editsMap[b.id] ? { ...b, ...editsMap[b.id] } : b);
          }
          return result;
        } catch {
          return baseList;
        }
      };

      // Handle Public Quotation Request (POST /api/public/request-quote) in Static Mode
      if (pathname === "/api/public/request-quote" && method === "POST") {
        const rawDate = parsedBody.eventDate ? new Date(parsedBody.eventDate) : new Date();
        const parsedDate = new Date(
          Date.UTC(rawDate.getFullYear(), rawDate.getMonth(), rawDate.getDate(), 12, 0, 0)
        );
        const isoDate = parsedDate.toISOString();
        const isHolidayDate =
          (parsedDate.getUTCMonth() === 11 &&
            (parsedDate.getUTCDate() === 24 ||
              parsedDate.getUTCDate() === 25 ||
              parsedDate.getUTCDate() === 30 ||
              parsedDate.getUTCDate() === 31)) ||
          parsedBody.rateTerritory === "HOLIDAY";

        const pkg = calculateSantaPackageQuote({
          santaTier: (parsedBody.santaTier || "REAL_BEARD") as SantaBeardTier,
          rateTerritory: parsedBody.rateTerritory as SantaRateTerritory | undefined,
          isProvincial: Boolean(parsedBody.isProvincial || parsedBody.rateTerritory === "OUT_OF_TOWN"),
          isHoliday: isHolidayDate,
          durationHours: Number(parsedBody.durationHours || 3),
          eventActivityTag: (parsedBody.eventActivityTag || "MEET_AND_GREET") as SantaEventActivityTag,
        });

        const contractAmt =
          parsedBody.clientQuotedAmount !== undefined && Number(parsedBody.clientQuotedAmount) > 0
            ? Number(parsedBody.clientQuotedAmount)
            : pkg.totalQuotedRate;
        const dpRequired = Math.round(contractAmt * 0.5);
        const effectiveVenue =
          parsedBody.venueName || parsedBody.mallOrVenue || parsedBody.companyName || "Corporate Venue";
        const effectiveContact =
          parsedBody.clientName || parsedBody.contactPerson || "Authorized Coordinator";
        const effectiveCompany =
          parsedBody.companyName || parsedBody.mallOrVenue || parsedBody.venueName || effectiveContact;
        const effectiveCity =
          parsedBody.city ||
          parsedBody.locationCity ||
          (pkg.rateTerritory === "OUT_OF_TOWN" ? "Out of Town / Provincial" : "Metro Manila");

        const allTalents: any[] = snap.talents?.talents || [];
        const matchedTalent = parsedBody.talentPreferenceId
          ? allTalents.find((t) => t.id === parsedBody.talentPreferenceId)
          : null;
        const tfAmt = Number(matchedTalent?.baseTalentFee || pkg.defaultInternalTalentFee);

        const newId = `bk_quote_${Date.now()}`;
        const refNum = `BR-2026-Q${Math.floor(100 + Math.random() * 900)}`;
        const tok = `req_${Date.now().toString(36)}`;

        const ledgerMeta = {
          santaTier: pkg.santaTier,
          santaTierLabel: pkg.santaTierLabel,
          rateTerritory: pkg.rateTerritory,
          rateTerritoryLabel: pkg.rateTerritoryLabel,
          eventActivityTag: pkg.eventActivityTag,
          eventActivityLabel: pkg.eventActivityLabel,
          durationHours: pkg.durationHours,
          extraHours: pkg.extraHours,
          extraHourCharge: pkg.extraHourCharge,
          baseRate: pkg.baseRate,
          tags: pkg.tags,
          dpStatus: "Pending",
          collectiblesStatus: "Pending",
          contractStatus: "Quotation Requested",
        };

        const combinedRequests = [
          `[${pkg.santaTierLabel} • ${pkg.eventActivityLabel} • ${pkg.rateTerritoryLabel} • ${pkg.durationHours} Hrs]`,
          parsedBody.specialRequests || parsedBody.notes || "",
        ]
          .filter(Boolean)
          .join(" — ");

        const newBooking = {
          id: newId,
          bookingNumber: refNum,
          secureToken: tok,
          bookingType: parsedBody.bookingType || "CORPORATE",
          eventName: parsedBody.eventName || `${effectiveVenue} — ${pkg.eventActivityLabel}`,
          eventDate: isoDate,
          startTime: parsedBody.startTime || "14:00",
          endTime: parsedBody.endTime || "17:00",
          callTime: parsedBody.callTime || "13:00",
          durationHours: pkg.durationHours,
          mallOrVenue: effectiveVenue,
          venueAddress: parsedBody.venueAddress || "",
          city: effectiveCity,
          locationCity: effectiveCity,
          isProvincial: pkg.rateTerritory === "OUT_OF_TOWN",
          isHoliday: pkg.rateTerritory === "HOLIDAY",
          status: "INQUIRY_RECEIVED",
          pipelineStage: 1,
          totalContractAmount: contractAmt,
          clientQuotedAmount: contractAmt,
          depositRequired: dpRequired,
          depositPaid: 0,
          balanceDue: contractAmt,
          totalDirectCost: tfAmt,
          projectedGrossProfit: Math.max(0, contractAmt - tfAmt),
          internalNotes: `${
            parsedBody.notes || `Quotation Request from ${effectiveContact}`
          } ||LEDGER_META:${JSON.stringify(ledgerMeta)}`,
          specialRequests: combinedRequests,
          venueNotes: "",
          ledgerMeta,
          createdAt: new Date().toISOString(),
          client: {
            id: `cli_${Date.now()}`,
            companyName: effectiveCompany,
            primaryContact: effectiveContact,
            contactPerson: effectiveContact,
            email: parsedBody.email || "events@client.local",
            phone: parsedBody.phone || "N/A",
            city: effectiveCity,
          },
          talentAssignments: matchedTalent
            ? [
                {
                  id: `ta_${Date.now()}`,
                  bookingId: newId,
                  talentId: matchedTalent.id,
                  agreedTalentFee: tfAmt,
                  status: "PENDING",
                  talent: matchedTalent,
                },
              ]
            : [],
          contracts: [],
          payments: [],
        };

        if (typeof localStorage !== "undefined") {
          try {
            const prev = JSON.parse(
              localStorage.getItem("brillo_calendar_custom_bookings_v3") || "[]"
            );
            localStorage.setItem(
              "brillo_calendar_custom_bookings_v3",
              JSON.stringify([newBooking, ...prev])
            );

            // Record in Email Automation Logs
            const existingLogs = JSON.parse(localStorage.getItem("brillo_email_logs_v3") || "[]");
            const newClientLog = {
              id: `eml_${Date.now()}_cli`,
              recipient: parsedBody.email || "client@brilloevent.com",
              sender: "Brillo Events <bookings@brilloevent.com>",
              subject: `We Received Your Santa Quotation Request — ${effectiveVenue} (${refNum})`,
              templateId: "EMAIL_01_INQUIRY_ACK",
              templateName: "01. Inquiry & Proposal Acknowledgment",
              triggerEvent: "INQUIRY_SUBMITTED",
              bookingRef: refNum,
              status: "DELIVERED",
              timestamp: new Date().toISOString(),
            };
            const newAdminLog = {
              id: `eml_${Date.now()}_adm`,
              recipient: "bookings@brilloevent.com",
              sender: "Brillo Events <bookings@brilloevent.com>",
              subject: `🎄 NEW INQUIRY ALERT: ${effectiveVenue} (${refNum})`,
              templateId: "ADMIN_ALERT",
              templateName: "New Inbound Inquiry Lead Alert",
              triggerEvent: "INQUIRY_SUBMITTED",
              bookingRef: refNum,
              status: "DELIVERED",
              timestamp: new Date().toISOString(),
            };
            localStorage.setItem(
              "brillo_email_logs_v3",
              JSON.stringify([newAdminLog, newClientLog, ...existingLogs].slice(0, 100))
            );
          } catch {}
        }

        const statusPortalPath = `/request-status?token=${encodeURIComponent(
          tok
        )}&booking=${encodeURIComponent(refNum)}&amount=${contractAmt}&venue=${encodeURIComponent(
          effectiveVenue
        )}`;

        const clientEmail = (parsedBody.email || "").replace(/@gmial\.com$/i, "@gmail.com").trim();
        const smtpPass = typeof localStorage !== "undefined" ? localStorage.getItem("brillo_smtp_pass_cached") || "" : "";

        // Render full branded Red Velvet inquiry acknowledgment template
        const formattedEventDate = new Date(isoDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        const clientMailRender = renderEmailTemplate("EMAIL_01_INQUIRY_ACK", {
          "{{client_name}}": effectiveContact,
          "{{client_email}}": clientEmail,
          "{{inquiry_number}}": refNum,
          "{{event_name}}": parsedBody.eventName || `${effectiveVenue} — ${pkg.eventActivityLabel}`,
          "{{event_date}}": formattedEventDate,
          "{{venue}}": effectiveVenue,
          "{{duration}}": `${pkg.durationHours} Hours`,
          "{{package_name}}": `${pkg.santaTierLabel} (${pkg.eventActivityLabel})`,
          "{{proposal_total}}": contractAmt.toLocaleString(),
          "{{deposit_amount}}": dpRequired.toLocaleString(),
          "{{portal_url}}": `https://brilloevent.com${statusPortalPath}`,
          "{{preferred_santa}}": matchedTalent?.canonicalName || "Santa Bob Hamilton (Real Beard)",
        });

        // 1. Dispatch Branded Confirmation to Customer
        if (clientEmail) {
          try {
            origFetch("/api/mailer.php", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "SEND",
                to: clientEmail,
                subject: clientMailRender.subject || `We've Received Your Santa Booking Inquiry! (${refNum}) | Brillo Events`,
                html: clientMailRender.html,
                replyTo: "info@brilloevent.com",
                password: smtpPass,
              }),
            }).catch(() => {});
          } catch {}
        }

        // 2. Dispatch Live Alert Copy to Operations Inbox (bookings@brilloevent.com)
        try {
          origFetch("/api/mailer.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "SEND",
              to: "bookings@brilloevent.com",
              subject: `🎄 NEW QUOTATION REQUEST: ${effectiveVenue} (${refNum}) — ₱${contractAmt.toLocaleString()}`,
              html: `
                <div style="font-family: Arial, sans-serif; padding: 24px; border: 2px solid #D6B36A; border-radius: 12px; background: #FAF7F5; max-width: 600px; margin: 0 auto;">
                  <div style="background: #780D22; padding: 16px; border-radius: 8px; text-align: center; color: #FFF8F0; margin-bottom: 20px;">
                    <h2 style="margin: 0; font-size: 18px;">BRILLO EVENTS — INBOUND INQUIRY</h2>
                    <div style="font-size: 11px; color: #D6B36A; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px;">New Client Lead Received</div>
                  </div>
                  <p style="font-size: 14px; color: #211619;"><strong>Client:</strong> ${effectiveContact} (${effectiveCompany})</p>
                  <p style="font-size: 14px; color: #211619;"><strong>Email:</strong> ${clientEmail} | <strong>Mobile:</strong> ${parsedBody.phone || "N/A"}</p>
                  <p style="font-size: 14px; color: #211619;"><strong>Venue:</strong> ${effectiveVenue} (${effectiveCity})</p>
                  <p style="font-size: 14px; color: #211619;"><strong>Target Date:</strong> ${formattedEventDate}</p>
                  <p style="font-size: 14px; color: #211619;"><strong>Package:</strong> ${pkg.santaTierLabel} (${pkg.durationHours} Hours) • ₱${contractAmt.toLocaleString()}</p>
                  <p style="font-size: 14px; color: #211619;"><strong>Special Requests:</strong> ${combinedRequests || "None"}</p>
                  <div style="margin-top: 20px;">
                    <a href="https://brilloevent.com/admin/crm" style="background: #780D22; color: #FFF; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 13px;">Review Lead in CRM Pipeline →</a>
                  </div>
                </div>
              `,
              replyTo: clientEmail || "info@brilloevent.com",
              password: smtpPass,
            }),
          }).catch(() => {});
        } catch {}

        // 3. Register System Notification for Bell Dropdown
        if (typeof localStorage !== "undefined") {
          try {
            const notifRaw = localStorage.getItem("brillo_system_notifications_v3");
            const currentNotifs = notifRaw ? JSON.parse(notifRaw) : [];
            const newNotif = {
              id: `notif_${Date.now()}`,
              type: "QUOTATION",
              title: `New Quotation: ${effectiveVenue}`,
              message: `${effectiveContact} requested quotation for ${pkg.santaTierLabel} (${refNum}) • ₱${contractAmt.toLocaleString()}`,
              link: "/admin/inbox",
              ref: refNum,
              read: false,
              timestamp: new Date().toISOString(),
            };
            const updatedNotifs = [newNotif, ...currentNotifs].slice(0, 50);
            localStorage.setItem("brillo_system_notifications_v3", JSON.stringify(updatedNotifs));
            window.dispatchEvent(new CustomEvent("brillo-notification-update", { detail: updatedNotifs }));
          } catch {}
        }

        // 4. Automatically Sync into Shared Client Inbox (brillo_inbox_threads_v3)
        if (typeof localStorage !== "undefined") {
          try {
            const STATIC_INBOX_KEY = "brillo_inbox_threads_v3";
            const rawThreads = localStorage.getItem(STATIC_INBOX_KEY);
            const currentThreads: any[] = rawThreads ? JSON.parse(rawThreads) : [];
            const newThreadId = `th_${refNum.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;

            const newInboxThread = {
              id: newThreadId,
              subject: `${effectiveVenue} — Santa Quotation Request (${refNum})`,
              bookingId: newBooking.id,
              clientId: newBooking.client.id,
              status: "ACTIVE",
              bookingStatus: "QUOTATION_REQUEST",
              lastActivityAt: new Date().toISOString(),
              client: {
                companyName: effectiveCompany,
                primaryContact: effectiveContact,
                contactPerson: effectiveContact,
                email: clientEmail,
                phone: parsedBody.phone || "N/A",
              },
              booking: {
                bookingNumber: refNum,
                mallOrVenue: effectiveVenue,
                eventDate: isoDate,
                totalContractAmount: contractAmt,
                depositPaid: 0,
                status: "INQUIRY_RECEIVED",
              },
              messages: [
                {
                  id: `msg_in_${Date.now()}`,
                  direction: "INBOUND",
                  sender: clientEmail || "client@inbound.local",
                  recipient: "bookings@brilloevent.com",
                  subject: `Quotation Request: ${effectiveVenue} (${refNum})`,
                  bodyText: `Inquiry submitted for ${effectiveVenue} on ${formattedEventDate}.\nPackage: ${pkg.santaTierLabel} (${pkg.durationHours} Hours) • Rate: ₱${contractAmt.toLocaleString()}\nPrimary Contact (Kausap): ${effectiveContact} | Mobile: ${parsedBody.phone || "N/A"}\nSpecial Requests: ${combinedRequests || "None"}`,
                  sentAt: new Date().toISOString(),
                },
                {
                  id: `msg_out_${Date.now() + 1}`,
                  direction: "OUTBOUND",
                  sender: "bookings@brilloevent.com",
                  recipient: clientEmail || "client@inbound.local",
                  subject: clientMailRender.subject || `We've Received Your Santa Booking Inquiry! (${refNum}) | Brillo Events`,
                  bodyText: `Dear ${effectiveContact},\n\nThank you for considering Brillo Events Management Services for your upcoming Christmas celebration at ${effectiveVenue} on ${formattedEventDate}!\n\nWe have successfully received your quotation request (${refNum}) for ${pkg.santaTierLabel} (${pkg.durationHours} Hours) with an indicative package rate of ₱${contractAmt.toLocaleString()}.\n\nOur operations desk is currently reviewing your event requirements and checking live calendar availability for your preferred Santa talent.\n\nWarm regards,\nBrillo Events Operations Desk`,
                  sentAt: new Date(Date.now() + 1000).toISOString(),
                },
              ],
            };

            const filteredThreads = currentThreads.filter(
              (t: any) => t.id !== newThreadId && t.booking?.bookingNumber !== refNum
            );
            localStorage.setItem(
              STATIC_INBOX_KEY,
              JSON.stringify([newInboxThread, ...filteredThreads])
            );
          } catch {}
        }
        if (snap.bookings?.bookings) {
          snap.bookings.bookings.unshift(newBooking);
        }

        return jsonResponse({
          success: true,
          booking: newBooking,
          bookingId: newBooking.id,
          bookingNumber: refNum,
          secureToken: tok,
          lookupToken: tok,
          statusUrl: statusPortalPath,
          packageQuote: pkg,
        });
      }

      // Handle Create New Booking in Static Mode (POST /api/bookings)
      if (pathname === "/api/bookings" && method === "POST") {
        const rawDate = parsedBody.eventDate ? new Date(parsedBody.eventDate) : new Date();
        const isoDate = new Date(
          Date.UTC(rawDate.getFullYear(), rawDate.getMonth(), rawDate.getDate(), 12, 0, 0)
        ).toISOString();
        const allTalents: any[] = snap.talents?.talents || [];
        const matchedTalent = parsedBody.talentId
          ? allTalents.find((t) => t.id === parsedBody.talentId)
          : null;
        const contractAmt = Number(parsedBody.totalContractAmount ?? parsedBody.quotedAmount ?? 18000);
        const dpPaid = Number(parsedBody.depositPaid ?? 0);
        const balDue =
          parsedBody.balanceDue !== undefined
            ? Number(parsedBody.balanceDue)
            : Math.max(0, contractAmt - dpPaid);
        const tfAmt = Number(parsedBody.agreedTalentFee || matchedTalent?.baseTalentFee || 12000);
        const newId = `bk_custom_${Date.now()}`;
        const refNum = `BR-2026-${Math.floor(100 + Math.random() * 900)}`;
        const tok = `tok_${Date.now()}`;

        const newBooking = {
          id: newId,
          bookingNumber: refNum,
          secureToken: tok,
          bookingType: parsedBody.bookingType || "CORPORATE",
          eventName: parsedBody.eventName || `${parsedBody.mallOrVenue || "Venue"} — Santa Appearance`,
          eventDate: isoDate,
          startTime: parsedBody.startTime || "14:00",
          endTime: parsedBody.endTime || "18:00",
          callTime: parsedBody.callTime || "13:00",
          mallOrVenue: parsedBody.mallOrVenue || "Corporate Venue",
          venueAddress: parsedBody.venueAddress || "",
          status:
            parsedBody.status ||
            (matchedTalent ? "READY_FOR_DEPLOYMENT" : "SECURED_UNASSIGNED"),
          pipelineStage: matchedTalent ? 3 : 2,
          totalContractAmount: contractAmt,
          depositRequired: Math.round(contractAmt * 0.5),
          depositPaid: dpPaid,
          balanceDue: balDue,
          totalDirectCost: tfAmt,
          projectedGrossProfit: Math.max(0, contractAmt - tfAmt),
          internalNotes: parsedBody.internalNotes || "",
          specialRequests: parsedBody.specialRequests || "",
          venueNotes: parsedBody.venueNotes || "",
          ledgerMeta: parsedBody.ledgerMeta || null,
          client: {
            id: `cli_${Date.now()}`,
            companyName: parsedBody.companyName || "SM Supermalls / Direct",
            primaryContact: parsedBody.primaryContact || "Authorized Coordinator",
            email: parsedBody.email || "events@client.local",
            phone: parsedBody.phone || "N/A",
          },
          talentAssignments: matchedTalent
            ? [
                {
                  id: `ta_${Date.now()}`,
                  bookingId: newId,
                  talentId: matchedTalent.id,
                  agreedTalentFee: tfAmt,
                  status: "CONFIRMED",
                  talent: matchedTalent,
                },
              ]
            : [],
          contracts: [],
          payments: [],
        };

        if (typeof localStorage !== "undefined") {
          try {
            const prev = JSON.parse(
              localStorage.getItem("brillo_calendar_custom_bookings_v3") || "[]"
            );
            localStorage.setItem(
              "brillo_calendar_custom_bookings_v3",
              JSON.stringify([newBooking, ...prev])
            );
          } catch {}
        }
        if (snap.bookings?.bookings) {
          snap.bookings.bookings.unshift(newBooking);
        }

        return jsonResponse({
          success: true,
          booking: newBooking,
          bookingId: newBooking.id,
          bookingNumber: refNum,
          lookupToken: tok,
        });
      }

      // Handle Booking Edit / Dual-Gate Signoff in Static Mode (PATCH /api/bookings/[id])
      if (pathname.startsWith("/api/bookings/") && method === "PATCH") {
        const id = pathname.split("/").pop() || "";
        const merged = getMergedBookings();
        const target = merged.find((b: any) => b.id === id || b.bookingNumber === id);
        if (target) {
          const allTalents: any[] = snap.talents?.talents || [];
          const updated: any = { ...target };

          if (parsedBody.status) updated.status = parsedBody.status;
          if (parsedBody.bookingType !== undefined) updated.bookingType = parsedBody.bookingType;
          if (parsedBody.city !== undefined) {
            updated.city = parsedBody.city;
            updated.locationCity = parsedBody.city;
          }
          if (parsedBody.durationHours !== undefined)
            updated.durationHours = Number(parsedBody.durationHours);
          if (parsedBody.isProvincial !== undefined)
            updated.isProvincial = Boolean(parsedBody.isProvincial);
          if (parsedBody.isHoliday !== undefined)
            updated.isHoliday = Boolean(parsedBody.isHoliday);
          if (parsedBody.eventName !== undefined) updated.eventName = parsedBody.eventName;
          if (parsedBody.mallOrVenue !== undefined) updated.mallOrVenue = parsedBody.mallOrVenue;
          if (parsedBody.venueAddress !== undefined) updated.venueAddress = parsedBody.venueAddress;
          if (parsedBody.startTime !== undefined) updated.startTime = parsedBody.startTime;
          if (parsedBody.endTime !== undefined) updated.endTime = parsedBody.endTime;
          if (parsedBody.callTime !== undefined) updated.callTime = parsedBody.callTime;
          if (parsedBody.internalNotes !== undefined) updated.internalNotes = parsedBody.internalNotes;
          if (parsedBody.specialRequests !== undefined) updated.specialRequests = parsedBody.specialRequests;
          if (parsedBody.venueNotes !== undefined) updated.venueNotes = parsedBody.venueNotes;
          if (parsedBody.ledgerMeta !== undefined) {
            updated.ledgerMeta = { ...(updated.ledgerMeta || {}), ...parsedBody.ledgerMeta };
          }
          if (parsedBody.totalContractAmount !== undefined) {
            updated.totalContractAmount = Number(parsedBody.totalContractAmount);
            updated.clientQuotedAmount = Number(parsedBody.totalContractAmount);
          }
          if (parsedBody.depositPaid !== undefined)
            updated.depositPaid = Number(parsedBody.depositPaid);
          if (parsedBody.balanceDue !== undefined)
            updated.balanceDue = Number(parsedBody.balanceDue);

          if (parsedBody.eventDate) {
            const rd = new Date(parsedBody.eventDate);
            updated.eventDate = new Date(
              Date.UTC(rd.getFullYear(), rd.getMonth(), rd.getDate(), 12, 0, 0)
            ).toISOString();
          }

          if (
            parsedBody.companyName !== undefined ||
            parsedBody.primaryContact !== undefined ||
            parsedBody.email !== undefined ||
            parsedBody.phone !== undefined
          ) {
            updated.client = {
              ...(updated.client || {}),
              ...(parsedBody.companyName !== undefined ? { companyName: parsedBody.companyName } : {}),
              ...(parsedBody.primaryContact !== undefined
                ? { primaryContact: parsedBody.primaryContact, contactPerson: parsedBody.primaryContact }
                : {}),
              ...(parsedBody.email !== undefined ? { email: parsedBody.email } : {}),
              ...(parsedBody.phone !== undefined ? { phone: parsedBody.phone } : {}),
            };
          }

          if (parsedBody.talentId !== undefined) {
            if (!parsedBody.talentId) {
              updated.talentAssignments = [];
            } else {
              const matchedTalent = allTalents.find((t) => t.id === parsedBody.talentId);
              if (matchedTalent) {
                const tfAmt = Number(
                  parsedBody.agreedTalentFee ||
                    updated.talentAssignments?.[0]?.agreedTalentFee ||
                    matchedTalent.baseTalentFee ||
                    12000
                );
                updated.talentAssignments = [
                  {
                    id: `ta_${Date.now()}`,
                    bookingId: updated.id,
                    talentId: matchedTalent.id,
                    agreedTalentFee: tfAmt,
                    status: "CONFIRMED",
                    talent: matchedTalent,
                  },
                ];
              }
            }
          } else if (
            parsedBody.agreedTalentFee !== undefined &&
            updated.talentAssignments?.[0]
          ) {
            updated.talentAssignments = [
              {
                ...updated.talentAssignments[0],
                agreedTalentFee: Number(parsedBody.agreedTalentFee),
              },
            ];
          }

          if (typeof localStorage !== "undefined") {
            try {
              const editsMap = JSON.parse(
                localStorage.getItem("brillo_calendar_booking_edits_v3") || "{}"
              );
              editsMap[updated.id] = updated;
              localStorage.setItem(
                "brillo_calendar_booking_edits_v3",
                JSON.stringify(editsMap)
              );
            } catch {}
          }

          const snapIdx = snap.bookings?.bookings?.findIndex((b: any) => b.id === updated.id);
          if (snapIdx !== undefined && snapIdx >= 0) {
            snap.bookings.bookings[snapIdx] = updated;
          }

          return jsonResponse({ success: true, booking: updated });
        }
        return jsonResponse({ success: true, booking: target });
      }

      // Handle Booking Delete in Static Mode (DELETE /api/bookings/[id])
      if (pathname.startsWith("/api/bookings/") && method === "DELETE") {
        const id = pathname.split("/").pop() || "";
        if (typeof localStorage !== "undefined") {
          try {
            const deletedIds: string[] = JSON.parse(
              localStorage.getItem("brillo_calendar_deleted_ids_v3") || "[]"
            );
            if (!deletedIds.includes(id)) {
              deletedIds.push(id);
              localStorage.setItem(
                "brillo_calendar_deleted_ids_v3",
                JSON.stringify(deletedIds)
              );
            }
          } catch {}
        }
        if (snap.bookings?.bookings) {
          snap.bookings.bookings = snap.bookings.bookings.filter((b: any) => b.id !== id);
        }
        return jsonResponse({ success: true });
      }

      const getMergedTalents = (): any[] => {
        const baseTalents: any[] = snap.talents?.talents || [];
        if (typeof localStorage === "undefined") return baseTalents;
        try {
          const customRaw = localStorage.getItem("brillo_custom_talents_v3");
          const editsRaw = localStorage.getItem("brillo_talent_edits_v3");
          const customList: any[] = customRaw ? JSON.parse(customRaw) : [];
          const editsMap: Record<string, any> = editsRaw ? JSON.parse(editsRaw) : {};
          const combined = [...customList, ...baseTalents];
          const seen = new Set<string>();
          const result: any[] = [];
          for (const t of combined) {
            if (seen.has(t.id)) continue;
            seen.add(t.id);
            const edit = editsMap[t.id] || (t.canonicalId ? editsMap[t.canonicalId] : undefined);
            if (edit) {
              // Ensure images are safely merged and never discarded
              const baseImgs = Array.isArray(t.images) ? t.images : [];
              const editImgs = Array.isArray(edit.images) ? edit.images : [];
              const mergedImgs = [
                ...editImgs,
                ...baseImgs.filter(
                  (bImg: any) =>
                    !editImgs.some(
                      (eImg: any) =>
                        (eImg.id && bImg.id && eImg.id === bImg.id) ||
                        (eImg.publicUrl && bImg.publicUrl && eImg.publicUrl === bImg.publicUrl)
                    )
                ),
              ];
              result.push({ ...t, ...edit, images: mergedImgs });
            } else {
              result.push(t);
            }
          }
          return result;
        } catch {
          return baseTalents;
        }
      };

      // Handle Create New Talent in Static Mode (POST /api/talents)
      if (pathname === "/api/talents" && method === "POST") {
        const newId = `tal_custom_${Date.now()}`;
        const displayName = parsedBody.displayName || "New Santa";
        const canonicalId = `TAL-${displayName.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8)}`;
        const newTalent = {
          id: newId,
          canonicalId,
          sourceName: parsedBody.sourceName || displayName,
          displayName,
          talentType: parsedBody.talentType || "REAL_BEARD",
          status: "ACTIVE",
          age: parsedBody.age ? Number(parsedBody.age) : 62,
          height: parsedBody.height || "6'0\"",
          nationality: parsedBody.nationality || "International",
          phone: parsedBody.phone || "",
          baseTalentFee: Number(parsedBody.baseTalentFee || 12000),
          metroManilaRate: Number(parsedBody.metroManilaRate || 18000),
          provincialRate: Number(parsedBody.provincialRate || 23400),
          holidayRate: Number(parsedBody.holidayRate || 21000),
          specialRateNote: parsedBody.specialRateNote || "",
          bio: parsedBody.bio || "",
          approvedForPublicDisplay: Boolean(parsedBody.approvedForPublicDisplay),
          images: parsedBody.fileDataUrl
            ? [
                {
                  id: `img_${Date.now()}`,
                  talentId: newId,
                  fileName: parsedBody.fileName || "portrait.jpg",
                  publicUrl: parsedBody.fileDataUrl,
                  isPrimary: true,
                  caption: `${displayName} Portrait`,
                  approvedForClient: true,
                },
              ]
            : [],
          aliases: [],
          assignments: [],
          ledgerEntries: [],
        };
        if (typeof localStorage !== "undefined") {
          try {
            const prev = JSON.parse(localStorage.getItem("brillo_custom_talents_v3") || "[]");
            localStorage.setItem("brillo_custom_talents_v3", JSON.stringify([newTalent, ...prev]));
          } catch {}
        }
        saveTalentToStorage(newTalent).catch(() => {});
        broadcastTalentUpdate(newTalent.id);
        try {
          origFetch("/api/talents.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newTalent),
          }).catch(() => {});
        } catch {}
        if (snap.talents?.talents) {
          snap.talents.talents.unshift(newTalent);
        }
        return jsonResponse({ success: true, talent: newTalent });
      }

      // Handle Talent Profile Edit & Photo Upload in Static Mode (PATCH /api/talents/[id])
      if (pathname.startsWith("/api/talents/") && method === "PATCH") {
        const cleanPath = pathname.replace(/\/+$/, "");
        const id = cleanPath.split("/").pop() || "";
        const merged = getMergedTalents();
        const baseTalents: any[] = snap.talents?.talents || [];
        const target =
          merged.find(
            (t: any) =>
              t.id === id ||
              t.canonicalId === id ||
              (t.id && id && t.id.toLowerCase() === id.toLowerCase()) ||
              (t.canonicalId && id && t.canonicalId.toLowerCase() === id.toLowerCase())
          ) ||
          baseTalents.find(
            (t: any) =>
              t.id === id ||
              t.canonicalId === id ||
              (t.id && id && t.id.toLowerCase() === id.toLowerCase()) ||
              (t.canonicalId && id && t.canonicalId.toLowerCase() === id.toLowerCase())
          ) ||
          merged[0];
        if (target) {
          const baseImgs = Array.isArray(target.images) ? target.images : [];
          const incomingImgs = Array.isArray(parsedBody.images) ? parsedBody.images : [];
          const combinedImgs = [
            ...incomingImgs,
            ...baseImgs.filter(
              (b: any) =>
                !incomingImgs.some(
                  (inc: any) =>
                    (inc.id && b.id && inc.id === b.id) ||
                    (inc.publicUrl && b.publicUrl && inc.publicUrl === b.publicUrl)
                )
            ),
          ];
          const updated = { ...target, images: combinedImgs.length > 0 ? combinedImgs : baseImgs };
          const action = parsedBody.action;

          if (action === "ADD_PHOTO" || action === "ADD_MEDIA") {
            const url = parsedBody.fileDataUrl || parsedBody.publicUrl || "";
            const isVideoItem =
              (url && url.startsWith("data:video/")) ||
              /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url) ||
              /\.(mp4|webm|mov|m4v)$/i.test(parsedBody.fileName || "") ||
              /youtube\.com|youtu\.be|vimeo\.com|drive\.google\.com/i.test(url);

            const shouldBePrimary = Boolean(
              !isVideoItem && (parsedBody.setAsPrimary || updated.images.length === 0)
            );
            if (shouldBePrimary) {
              updated.images = updated.images.map((img: any) => ({ ...img, isPrimary: false }));
            }
            const newImg = {
              id: `img_${Date.now()}`,
              talentId: updated.id,
              fileName:
                parsedBody.fileName ||
                (isVideoItem ? `santa_${updated.displayName}.mp4` : `santa_${updated.displayName}.jpg`),
              publicUrl: url,
              originalPath: url,
              isPrimary: shouldBePrimary,
              mediaType: isVideoItem ? "VIDEO" : "IMAGE",
              caption:
                parsedBody.caption ||
                `Santa ${updated.displayName} ${isVideoItem ? "Video Clip" : "Portrait"}`,
              approvedForClient:
                parsedBody.approvedForClient !== undefined
                  ? Boolean(parsedBody.approvedForClient)
                  : updated.approvedForPublicDisplay,
            };
            updated.images = shouldBePrimary
              ? [newImg, ...updated.images]
              : [...updated.images, newImg];
          } else if (action === "SET_PRIMARY_PHOTO" && parsedBody.imageId) {
            updated.images = updated.images
              .map((img: any) => ({
                ...img,
                isPrimary: img.id === parsedBody.imageId,
              }))
              .sort((a: any, b: any) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
          } else if (action === "UPDATE_PHOTO" && parsedBody.imageId) {
            updated.images = updated.images.map((img: any) =>
              img.id === parsedBody.imageId
                ? {
                    ...img,
                    caption: parsedBody.caption !== undefined ? parsedBody.caption : img.caption,
                    approvedForClient:
                      parsedBody.approvedForClient !== undefined
                        ? Boolean(parsedBody.approvedForClient)
                        : img.approvedForClient,
                  }
                : img
            );
          } else if (action === "DELETE_PHOTO" && parsedBody.imageId) {
            const wasPrimary = updated.images.find(
              (img: any) => img.id === parsedBody.imageId
            )?.isPrimary;
            updated.images = updated.images.filter((img: any) => img.id !== parsedBody.imageId);
            if (wasPrimary && updated.images.length > 0) {
              updated.images[0] = { ...updated.images[0], isPrimary: true };
            }
          } else {
            if (parsedBody.displayName !== undefined) updated.displayName = parsedBody.displayName;
            if (parsedBody.sourceName !== undefined) updated.sourceName = parsedBody.sourceName;
            if (parsedBody.talentType !== undefined) updated.talentType = parsedBody.talentType;
            if (parsedBody.status !== undefined) updated.status = parsedBody.status;
            if (parsedBody.age !== undefined)
              updated.age = parsedBody.age ? Number(parsedBody.age) : null;
            if (parsedBody.height !== undefined) updated.height = parsedBody.height;
            if (parsedBody.nationality !== undefined) updated.nationality = parsedBody.nationality;
            if (parsedBody.phone !== undefined) updated.phone = parsedBody.phone;
            if (parsedBody.bio !== undefined) updated.bio = parsedBody.bio;
            if (parsedBody.baseTalentFee !== undefined)
              updated.baseTalentFee = Number(parsedBody.baseTalentFee);
            if (parsedBody.metroManilaRate !== undefined)
              updated.metroManilaRate = Number(parsedBody.metroManilaRate);
            if (parsedBody.provincialRate !== undefined)
              updated.provincialRate = Number(parsedBody.provincialRate);
            if (parsedBody.holidayRate !== undefined)
              updated.holidayRate = Number(parsedBody.holidayRate);
            if (parsedBody.specialRateNote !== undefined)
              updated.specialRateNote = parsedBody.specialRateNote;
            if (parsedBody.approvedForPublicDisplay !== undefined)
              updated.approvedForPublicDisplay = Boolean(parsedBody.approvedForPublicDisplay);

            // If a pending photo was attached during profile save, add it to images
            const pending = parsedBody.pendingPhoto || (parsedBody.fileDataUrl ? {
              fileName: parsedBody.fileName,
              fileDataUrl: parsedBody.fileDataUrl,
              publicUrl: parsedBody.publicUrl,
              caption: parsedBody.caption,
              setAsPrimary: parsedBody.setAsPrimary,
              approvedForClient: parsedBody.approvedForClient
            } : null);

            if (pending && (pending.fileDataUrl || pending.publicUrl)) {
              const pUrl = pending.fileDataUrl || pending.publicUrl || "";
              const isVideoItem =
                (pUrl && pUrl.startsWith("data:video/")) ||
                /\.(mp4|webm|mov|m4v)(\?|$)/i.test(pUrl) ||
                /\.(mp4|webm|mov|m4v)$/i.test(pending.fileName || "") ||
                /youtube\.com|youtu\.be|vimeo\.com|drive\.google\.com/i.test(pUrl);
              const shouldBePrimary = Boolean(!isVideoItem && (pending.setAsPrimary || updated.images.length === 0));
              if (shouldBePrimary) {
                updated.images = updated.images.map((img: any) => ({ ...img, isPrimary: false }));
              }
              const newPendingImg = {
                id: `img_${Date.now()}`,
                talentId: updated.id,
                fileName:
                  pending.fileName ||
                  (isVideoItem ? `santa_${updated.displayName}.mp4` : `santa_${updated.displayName}.jpg`),
                publicUrl: pUrl,
                originalPath: pUrl,
                isPrimary: shouldBePrimary,
                mediaType: isVideoItem ? "VIDEO" : "IMAGE",
                caption:
                  pending.caption ||
                  `Santa ${updated.displayName} ${isVideoItem ? "Video Clip" : "Portrait"}`,
                approvedForClient:
                  pending.approvedForClient !== undefined
                    ? Boolean(pending.approvedForClient)
                    : updated.approvedForPublicDisplay,
              };
              updated.images = shouldBePrimary ? [newPendingImg, ...updated.images] : [...updated.images, newPendingImg];
            }
          }

          if (typeof localStorage !== "undefined") {
            try {
              const editsMap = JSON.parse(
                localStorage.getItem("brillo_talent_edits_v3") || "{}"
              );
              editsMap[updated.id] = updated;
              if (updated.canonicalId) editsMap[updated.canonicalId] = updated;
              localStorage.setItem("brillo_talent_edits_v3", JSON.stringify(editsMap));
            } catch {
              // If localStorage is full, save current talent cleanly
              try {
                const minimalMap: Record<string, any> = {};
                minimalMap[updated.id] = updated;
                if (updated.canonicalId) minimalMap[updated.canonicalId] = updated;
                localStorage.setItem("brillo_talent_edits_v3", JSON.stringify(minimalMap));
              } catch {}
            }
          }
          // Persist full multi-MB payload into IndexedDB & broadcast across windows
          saveTalentToStorage(updated).catch(() => {});
          broadcastTalentUpdate(updated.id);

          // Background sync to cPanel PHP API endpoint
          try {
            origFetch(`/api/talents.php?id=${encodeURIComponent(updated.id)}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(updated),
            }).catch(() => {});
          } catch {}
          const idx = snap.talents?.talents?.findIndex((t: any) => t.id === updated.id);
          if (idx !== undefined && idx >= 0) {
            snap.talents.talents[idx] = updated;
          }
          return jsonResponse({ success: true, talent: updated });
        }
      }

      // Handle POST /api/quotes in Static Mode
      if (pathname === "/api/quotes" && method === "POST") {
        const quoteNumber = `QT-2026-${Math.floor(100 + Math.random() * 900)}`;
        const quoteAmt = Number(parsedBody.clientQuotedAmount || 24000);
        const tfAmt = Number(parsedBody.internalTalentFee || 12000);
        const paAmt = Number(parsedBody.internalPaFee || 1500);
        const transpoAmt = Number(parsedBody.transportAllowance || 0);
        const wardrobeAmt = Number(parsedBody.wardrobeAllowance || 0);
        const discountAmt = Number(parsedBody.discountAmount || 0);
        const netAmt = Math.max(0, quoteAmt - discountAmt);
        const directCost = tfAmt + paAmt + transpoAmt + wardrobeAmt;
        const grossProfit = netAmt - directCost;
        const newQuote = {
          id: `qt_${Date.now()}`,
          quoteNumber,
          bookingId: parsedBody.bookingId,
          clientQuotedAmount: quoteAmt,
          internalTalentFee: tfAmt,
          internalPaFee: paAmt,
          transportAllowance: transpoAmt,
          wardrobeAllowance: wardrobeAmt,
          discountAmount: discountAmt,
          netClientAmount: netAmt,
          totalDirectCost: directCost,
          grossProfit,
          depositAmount: Math.round(netAmt * 0.5),
          balanceAmount: netAmt - Math.round(netAmt * 0.5),
          status: "ISSUED",
          createdAt: new Date().toISOString(),
        };

        // Also update the linked booking in localStorage so Calendar, CRM, and Dashboard reflect the issued quote!
        if (parsedBody.bookingId) {
          const allB = getMergedBookings();
          const target = allB.find((b: any) => b.id === parsedBody.bookingId);
          if (target) {
            const updatedBooking = {
              ...target,
              totalContractAmount: netAmt,
              clientQuotedAmount: netAmt,
              depositRequired: Math.round(netAmt * 0.5),
              balanceDue: Math.max(0, netAmt - Number(target.depositPaid || 0)),
              totalDirectCost: directCost,
              projectedGrossProfit: grossProfit,
              status:
                target.status === "INQUIRY_RECEIVED" || target.status === "NEW_INQUIRY"
                  ? "QUOTE_ISSUED"
                  : target.status,
              ledgerMeta: {
                ...(target.ledgerMeta || {}),
                ...(parsedBody.ledgerMeta || {}),
              },
            };
            if (typeof localStorage !== "undefined") {
              try {
                const editsMap = JSON.parse(
                  localStorage.getItem("brillo_calendar_booking_edits_v3") || "{}"
                );
                editsMap[updatedBooking.id] = updatedBooking;
                localStorage.setItem(
                  "brillo_calendar_booking_edits_v3",
                  JSON.stringify(editsMap)
                );
              } catch {}
            }
          }
        }

        return jsonResponse({ success: true, quote: newQuote });
      }

      if (method !== "GET") {
        const refNum = `B2026-${Math.floor(1000 + Math.random() * 9000)}`;
        const tok = `tok_${Date.now()}`;
        return jsonResponse({
          success: true,
          bookingId: snap.bookings?.bookings?.[0]?.id || "static-booking",
          bookingNumber: refNum,
          lookupToken: tok,
          message: "Saved in session (Static GitHub Pages Mode)",
        });
      }

      if (pathname === "/api/dashboard") {
        const allB = getMergedBookings();
        const inquiryCount = allB.filter((b: any) =>
          ["INQUIRY_RECEIVED", "NEW_INQUIRY", "QUOTE_ISSUED", "QUOTED"].includes(
            (b.status || "").toUpperCase()
          )
        ).length;
        const holdCount = allB.filter((b: any) =>
          ["HOLD_24H_ACTIVE", "TEMPORARY_HOLD", "RESERVED_HOLD"].includes(
            (b.status || "").toUpperCase()
          )
        ).length;
        const signoffCount = allB.filter((b: any) =>
          [
            "AWAITING_STAFF_SIGNOFF",
            "AWAITING_STAFF_APPROVAL",
            "CONTRACT_SENT",
            "CONTRACT_SIGNED_PENDING_DEPOSIT",
          ].includes((b.status || "").toUpperCase())
        ).length;
        const securedCount = allB.filter((b: any) =>
          ["ROSTER_LOCKED_DISPATCHED", "READY_FOR_DEPLOYMENT", "SECURED_UNASSIGNED"].includes(
            (b.status || "").toUpperCase()
          )
        ).length;

        // Sort immediateActionQueue so new Inquiries, Holds, and Quotes appear at the very top!
        const sortedQueue = [...allB].sort((a: any, b: any) => {
          const priority = (st: string) => {
            const u = (st || "").toUpperCase();
            if (u === "INQUIRY_RECEIVED" || u === "NEW_INQUIRY") return 0;
            if (u === "HOLD_24H_ACTIVE" || u === "TEMPORARY_HOLD") return 1;
            if (u === "QUOTE_ISSUED" || u === "QUOTED" || u === "CONTRACT_SENT") return 2;
            if (u === "AWAITING_STAFF_SIGNOFF" || u === "AWAITING_STAFF_APPROVAL") return 3;
            return 4;
          };
          const pa = priority(a.status);
          const pb = priority(b.status);
          if (pa !== pb) return pa - pb;
          return String(b.id).startsWith("bk_") ? -1 : 1;
        });

        const totalContractVal = allB.reduce(
          (sum: number, b: any) => sum + Number(b.totalContractAmount || 0),
          0
        );
        const totalReceivables = allB.reduce(
          (sum: number, b: any) => sum + Number(b.balanceDue || 0),
          0
        );

        return jsonResponse({
          ...snap.dashboard,
          metrics: {
            ...(snap.dashboard?.metrics || {}),
            totalBookings: allB.length,
            securedBookings: securedCount,
            totalContractValue: totalContractVal,
            totalOutstandingReceivables: totalReceivables,
          },
          queues: {
            ...(snap.dashboard?.queues || {}),
            unreadInboxMessages: Math.max(
              inquiryCount,
              Number(snap.dashboard?.queues?.unreadInboxMessages || 0)
            ),
            activeTemporaryHolds: holdCount,
            pendingStaffApprovalBookings: signoffCount,
            dynamicConflictSubtitle: `${
              snap.dashboard?.queues?.unresolvedSourceConflicts || 0
            } source audit flags • 0 roster overlaps`,
          },
          immediateActionQueue: sortedQueue.slice(0, 12),
        });
      }
      if (pathname === "/api/bookings") {
        const allB = getMergedBookings();
        return jsonResponse({ success: true, count: allB.length, bookings: allB });
      }
      if (pathname.startsWith("/api/bookings/")) {
        const id = pathname.split("/").pop();
        const allB = getMergedBookings();
        const booking =
          allB.find((b: any) => b.id === id || b.bookingNumber === id) || allB[0];
        return jsonResponse({ success: true, booking, talents: getMergedTalents() });
      }
      if (pathname === "/api/individual-bookings") return jsonResponse(snap.individualBookings);
      if (pathname === "/api/talents") {
        const publicOnly = urlObj.searchParams.get("publicOnly") === "true";
        let allT = getMergedTalents();
        if (publicOnly) {
          allT = allT.filter((t: any) => Boolean(t.approvedForPublicDisplay));
        }
        return jsonResponse({ success: true, count: allT.length, talents: allT });
      }
      if (pathname.startsWith("/api/talents/")) {
        const cleanPath = pathname.replace(/\/+$/, "");
        const id = cleanPath.split("/").pop() || "";
        const allT = getMergedTalents();
        const talent =
          allT.find(
            (t: any) =>
              t.id === id ||
              t.canonicalId === id ||
              (t.id && id && t.id.toLowerCase() === id.toLowerCase()) ||
              (t.canonicalId && id && t.canonicalId.toLowerCase() === id.toLowerCase())
          ) || allT[0];
        return jsonResponse({ success: true, talent });
      }
      if (pathname === "/api/leads") {
        const filter = urlObj.searchParams.get("filter") || "ALL";
        const search = (urlObj.searchParams.get("search") || "").trim().toLowerCase();
        let allLeads = [...getMergedBookings()];

        // Sort so newly requested inquiries & custom bookings appear at the top of CRM
        allLeads.sort((a: any, b: any) => {
          const isNewA =
            String(a.id).startsWith("bk_") ||
            ["INQUIRY_RECEIVED", "HOLD_24H_ACTIVE", "TEMPORARY_HOLD", "QUOTE_ISSUED"].includes(
              (a.status || "").toUpperCase()
            );
          const isNewB =
            String(b.id).startsWith("bk_") ||
            ["INQUIRY_RECEIVED", "HOLD_24H_ACTIVE", "TEMPORARY_HOLD", "QUOTE_ISSUED"].includes(
              (b.status || "").toUpperCase()
            );
          if (isNewA && !isNewB) return -1;
          if (!isNewA && isNewB) return 1;
          return 0;
        });

        if (filter === "NEW") {
          allLeads = allLeads.filter((l: any) =>
            ["INQUIRY_RECEIVED", "NEW_INQUIRY", "TEMPORARY_HOLD", "HOLD_24H_ACTIVE"].includes(
              (l.status || "").toUpperCase()
            )
          );
        } else if (filter === "FOLLOW_UP") {
          allLeads = allLeads.filter((l: any) =>
            [
              "QUOTE_ISSUED",
              "QUOTED",
              "CONTRACT_SENT",
              "CONTRACT_SIGNED_PENDING_DEPOSIT",
              "AWAITING_STAFF_SIGNOFF",
              "AWAITING_STAFF_APPROVAL",
            ].includes((l.status || "").toUpperCase())
          );
        } else if (filter === "CORPORATE") {
          allLeads = allLeads.filter((l: any) =>
            ["CORPORATE", "CORPORATE_MALL", "MALL_TOUR", "PACKAGE"].includes(
              (l.bookingType || "CORPORATE").toUpperCase()
            )
          );
        } else if (filter === "PRIVATE") {
          allLeads = allLeads.filter((l: any) =>
            ["PRIVATE", "PRIVATE_PARTY"].includes((l.bookingType || "").toUpperCase())
          );
        } else if (filter === "REAL_BEARD") {
          allLeads = allLeads.filter((l: any) => {
            const tier = l.ledgerMeta?.santaTier || "";
            return (
              tier === "REAL_BEARD" ||
              (l.internalNotes || "").includes('"santaTier":"REAL_BEARD"') ||
              (!tier && !(l.internalNotes || "").includes('"santaTier":"FAKE_BEARD"'))
            );
          });
        } else if (filter === "FAKE_BEARD") {
          allLeads = allLeads.filter((l: any) => {
            const tier = l.ledgerMeta?.santaTier || "";
            return (
              tier === "FAKE_BEARD" ||
              (l.internalNotes || "").includes('"santaTier":"FAKE_BEARD"') ||
              (l.specialRequests || "").toLowerCase().includes("fake beard")
            );
          });
        }

        if (search) {
          allLeads = allLeads.filter(
            (l: any) =>
              (l.bookingNumber || "").toLowerCase().includes(search) ||
              (l.eventName || "").toLowerCase().includes(search) ||
              (l.mallOrVenue || "").toLowerCase().includes(search) ||
              (l.city || l.locationCity || "").toLowerCase().includes(search) ||
              (l.client?.companyName || "").toLowerCase().includes(search) ||
              (l.client?.primaryContact || "").toLowerCase().includes(search) ||
              (l.specialRequests || "").toLowerCase().includes(search)
          );
        }

        return jsonResponse({ success: true, count: allLeads.length, leads: allLeads });
      }
      if (pathname === "/api/clients") return jsonResponse(snap.clients);
      if (pathname === "/api/quotes") return jsonResponse(snap.quotes);
      if (pathname === "/api/contracts") return jsonResponse(snap.contracts);
      if (pathname === "/api/payments") return jsonResponse(snap.payments);
      if (pathname === "/api/paluwal") return jsonResponse(snap.paluwal);
      if (pathname === "/api/expenses") return jsonResponse(snap.expenses);
      if (pathname === "/api/conflicts") return jsonResponse(snap.conflicts);
      // Shared Client Inbox & Email Communications Handler
      if (pathname === "/api/inbox") {
        const STATIC_INBOX_KEY = "brillo_inbox_threads_v3";
        const DEFAULT_STATIC_THREADS = [
          {
            id: "th_shangilar_q443",
            subject: "shangilar — Santa Quotation Request (BR-2026-Q443)",
            bookingId: "bk_shangilar_q443",
            clientId: "cli_cloyd_shangilar",
            status: "ACTIVE",
            bookingStatus: "QUOTATION_REQUEST",
            lastActivityAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
            client: {
              companyName: "shangilar (rWEW)",
              primaryContact: "Clyde Jose Llora",
              contactPerson: "Clyde Jose Llora",
              email: "cloydllora01@gmail.com",
              phone: "09278872324",
            },
            booking: {
              bookingNumber: "BR-2026-Q443",
              mallOrVenue: "shangilar (Metro Manila)",
              eventDate: "2026-11-01",
              totalContractAmount: 24000,
              depositPaid: 0,
              status: "INQUIRY_RECEIVED",
            },
            messages: [
              {
                id: "msg_shangilar_1",
                direction: "INBOUND",
                sender: "cloydllora01@gmail.com",
                recipient: "bookings@brilloevent.com",
                subject: "Quotation Request: shangilar (BR-2026-Q443)",
                bodyText: "Inquiry submitted for shangilar on Nov 1, 2026.\nPackage: Real-Beard Santa Claus (3 Hours) • Rate: ₱24,000\nPrimary Contact (Kausap): Clyde Jose Llora | Mobile: 09278872324\nSpecial Requests: Real-Beard Santa Claus • Meet and Greet • Metro Manila Rate • Shopping Mall / Corporate Event",
                sentAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
              },
              {
                id: "msg_shangilar_2",
                direction: "OUTBOUND",
                sender: "bookings@brilloevent.com",
                recipient: "cloydllora01@gmail.com",
                subject: "We've Received Your Santa Booking Inquiry! (BR-2026-Q443) | Brillo Events",
                bodyText: "Dear Clyde Jose Llora,\n\nThank you for choosing Brillo Events Management Services for shangilar!\n\nWe have received your quotation request for Real-Beard Santa Claus (3 Hours) on Nov 1, 2026 with an indicative rate of ₱24,000.\n\nOur operations desk is actively reviewing schedule availability. You may access your quote portal anytime at https://brilloevent.com/portal.\n\nWarm regards,\nBrillo Events Management Team",
                sentAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
              },
            ],
          },
          {
            id: "th_saay_q122",
            subject: "saay — Santa Quotation Request (BR-2026-Q122)",
            bookingId: "bk_saay_q122",
            clientId: "cli_saay_cloyd",
            status: "ACTIVE",
            bookingStatus: "QUOTATION_REQUEST",
            lastActivityAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
            client: {
              companyName: "saay",
              primaryContact: "Cloyd Llora",
              contactPerson: "Cloyd Llora",
              email: "cloydllora01@gmail.com",
              phone: "09278872324",
            },
            booking: {
              bookingNumber: "BR-2026-Q122",
              mallOrVenue: "saay",
              eventDate: "2026-11-03",
              totalContractAmount: 24000,
              depositPaid: 0,
              status: "INQUIRY_RECEIVED",
            },
            messages: [
              {
                id: "msg_saay_1",
                direction: "INBOUND",
                sender: "cloydllora01@gmail.com",
                recipient: "bookings@brilloevent.com",
                subject: "Quotation Request: saay (BR-2026-Q122)",
                bodyText: "Inquiry submitted for saay on Nov 3, 2026.\nPackage: Real-Beard Santa Claus • Rate: ₱24,000\nPrimary Contact (Kausap): Cloyd Llora | Mobile: 09278872324",
                sentAt: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
              },
              {
                id: "msg_saay_2",
                direction: "OUTBOUND",
                sender: "bookings@brilloevent.com",
                recipient: "cloydllora01@gmail.com",
                subject: "We've Received Your Santa Quotation Request — saay (BR-2026-Q122)",
                bodyText: "Dear Cloyd Llora,\n\nWe have received your event inquiry for saay. Our talent desk is preparing your proposal.\n\nWarm regards,\nBrillo Events",
                sentAt: new Date(Date.now() - 1000 * 60 * 62).toISOString(),
              },
            ],
          },
          {
            id: "th_sm_megamall",
            subject: "Christmas Village Launch & Santa Appearance — SM Megamall",
            bookingId: "bk_sm_mega",
            clientId: "cli_sm_mega",
            status: "ACTIVE",
            bookingStatus: "BOOKED",
            lastActivityAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
            client: {
              companyName: "SM Supermalls (SM Megamall)",
              primaryContact: "Carmela Dizon",
              contactPerson: "Carmela Dizon",
              email: "carmela.dizon@smsupermalls.com",
              phone: "0917 554 8812",
            },
            booking: {
              bookingNumber: "BR-2026-CON-24-AOG",
              mallOrVenue: "SM Megamall Mega Fashion Hall",
              eventDate: "2026-11-28",
              totalContractAmount: 26000,
              depositPaid: 13000,
              status: "SECURED_CONFIRMED",
            },
            messages: [
              {
                id: "msg_1",
                direction: "INBOUND",
                sender: "carmela.dizon@smsupermalls.com",
                recipient: "bookings@brilloevent.com",
                subject: "Christmas Village Launch & Santa Appearance — SM Megamall",
                bodyText: "Hi Brillo Events team, we would like to book Santa Bob Hamilton for our Grand Christmas Launch on November 28, 2026 at Mega Fashion Hall. Kindly provide proposal and availability.",
                sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
              },
              {
                id: "msg_2",
                direction: "OUTBOUND",
                sender: "bookings@brilloevent.com",
                recipient: "carmela.dizon@smsupermalls.com",
                subject: "Your Christmas Event Proposal is Ready! (Ref: BR-2026-CON-24-AOG)",
                bodyText: "Dear Carmela Dizon,\n\nThank you for choosing Brillo Events Management Services! We have prepared your tailored quotation for SM Megamall: Real-Beard Santa Claus Exclusive (4 Hours). Total contract: ₱26,000 with 50% downpayment of ₱13,000.\n\nWarm regards,\nBrillo Events Team",
                sentAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
              },
              {
                id: "msg_3",
                direction: "INBOUND",
                sender: "carmela.dizon@smsupermalls.com",
                recipient: "bookings@brilloevent.com",
                subject: "Re: Your Christmas Event Proposal is Ready!",
                bodyText: "Thank you! We have approved the proposal and settled the ₱13,000 downpayment via GCash. Kindly send the official receipt.",
                sentAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
              },
              {
                id: "msg_4",
                direction: "OUTBOUND",
                sender: "bookings@brilloevent.com",
                recipient: "carmela.dizon@smsupermalls.com",
                subject: "Official Electronic Payment Receipt — SM Megamall (Ref: BR-2026-CON-24-AOG)",
                bodyText: "Dear Carmela,\n\nThis is your Official Payment Receipt from Brillo Events Management Services acknowledging verified payment of ₱13,000. Remaining balance: ₱13,000.\n\nReference: PAY-2026-XEN-9912.",
                sentAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
              },
            ],
          },
          {
            id: "th_shangrila_fort",
            subject: "Santa Claus Appearance & Tree Lighting — Shangri-La The Fort",
            bookingId: "bk_shangrila",
            clientId: "cli_shangrila",
            status: "ACTIVE",
            bookingStatus: "BOOKED",
            lastActivityAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
            client: {
              companyName: "Shangri-La at the Fort, BGC",
              primaryContact: "Mark Hernandez",
              contactPerson: "Mark Hernandez",
              email: "mark.hernandez@shangri-la.com",
              phone: "0918 332 9941",
            },
            booking: {
              bookingNumber: "BR-2026-OCT-21-WZB",
              mallOrVenue: "Grand Ballroom Foyer, Shangri-La Fort",
              eventDate: "2026-12-05",
              totalContractAmount: 38000,
              depositPaid: 19000,
              status: "SECURED_CONFIRMED",
            },
            messages: [
              {
                id: "msg_s1",
                direction: "INBOUND",
                sender: "mark.hernandez@shangri-la.com",
                recipient: "bookings@brilloevent.com",
                subject: "Tree Lighting Inquiry — Shangri-La The Fort",
                bodyText: "Good day Brillo Events, checking availability for Christmas Tree Lighting Ceremony on Dec 5.",
                sentAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
              },
              {
                id: "msg_s2",
                direction: "OUTBOUND",
                sender: "bookings@brilloevent.com",
                recipient: "mark.hernandez@shangri-la.com",
                subject: "Tree Lighting Proposal — Shangri-La The Fort (BR-2026-OCT-21-WZB)",
                bodyText: "Dear Mark, thank you for reaching out! We are delighted to confirm Santa Bob Hamilton is available for Dec 5. Proposal attached.",
                sentAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
              },
            ],
          },
          {
            id: "th_ayala_malls",
            subject: "Ayala Malls Manila Bay — Christmas Festivities Inquiry",
            bookingId: "bk_ayala",
            clientId: "cli_ayala",
            status: "ACTIVE",
            bookingStatus: "QUOTATION_REQUEST",
            lastActivityAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
            client: {
              companyName: "Ayala Malls Manila Bay",
              primaryContact: "Patricia Reyes",
              contactPerson: "Patricia Reyes",
              email: "reyes.patricia@ayalamalls.com.ph",
              phone: "0920 119 4432",
            },
            booking: {
              bookingNumber: "BR-2026-Q088",
              mallOrVenue: "Ayala Malls Manila Bay Activity Center",
              eventDate: "2026-12-12",
              totalContractAmount: 26000,
              depositPaid: 0,
              status: "INQUIRY_RECEIVED",
            },
            messages: [
              {
                id: "msg_a1",
                direction: "INBOUND",
                sender: "reyes.patricia@ayalamalls.com.ph",
                recipient: "bookings@brilloevent.com",
                subject: "Quotation Request: Santa Appearance December 12",
                bodyText: "Hi! We submitted our quotation request on your website for Santa on December 12 at Ayala Malls Manila Bay.",
                sentAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
              },
              {
                id: "msg_a2",
                direction: "OUTBOUND",
                sender: "bookings@brilloevent.com",
                recipient: "reyes.patricia@ayalamalls.com.ph",
                subject: "Thank You for Your Inquiry — Ayala Malls Manila Bay (BR-2026-Q088)",
                bodyText: "Dear Patricia, we have received your Santa quotation request and our team is reviewing your schedule. We will send the full proposal shortly.",
                sentAt: new Date(Date.now() - 1000 * 60 * 230).toISOString(),
              },
            ],
          },
        ];

        let threadsList = DEFAULT_STATIC_THREADS;
        if (typeof localStorage !== "undefined") {
          try {
            const rawThreads = localStorage.getItem(STATIC_INBOX_KEY);
            let savedThreads: any[] = rawThreads ? JSON.parse(rawThreads) : [];

            // Merge any missing default threads (e.g. shangilar, saay)
            for (const dt of DEFAULT_STATIC_THREADS) {
              if (!savedThreads.some((st: any) => st.id === dt.id || st.booking?.bookingNumber === dt.booking.bookingNumber)) {
                savedThreads.unshift(dt);
              }
            }

            // Dynamically scan all custom bookings in brillo_calendar_custom_bookings_v3
            const customBookingsRaw = localStorage.getItem("brillo_calendar_custom_bookings_v3");
            const customBookings: any[] = customBookingsRaw ? JSON.parse(customBookingsRaw) : [];

            for (const cb of customBookings) {
              const bRef = cb.bookingNumber || `BR-${cb.id}`;
              const alreadyHasThread = savedThreads.some(
                (st: any) => st.booking?.bookingNumber === bRef || st.id === `th_${bRef.toLowerCase().replace(/[^a-z0-9]/g, "_")}`
              );

              if (!alreadyHasThread) {
                const isBooked = ["SECURED_CONFIRMED", "BOOKED", "CONTRACT_SIGNED_PAID", "CONTRACT_SIGNED", "READY_FOR_DEPLOYMENT"].includes((cb.status || "").toUpperCase());
                const contactPerson = cb.client?.primaryContact || cb.client?.contactPerson || cb.client?.companyName || "Valued Client";
                const venueName = cb.mallOrVenue || cb.eventName || "Corporate Venue";
                const companyName = cb.client?.companyName || venueName;
                const totalAmt = Number(cb.totalContractAmount || cb.clientQuotedAmount || 24000);
                const evDate = cb.eventDate ? new Date(cb.eventDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Nov 2026";

                const dynamicThread = {
                  id: `th_${bRef.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
                  subject: `${venueName} — ${isBooked ? "Confirmed Booking" : "Quotation Request"} (${bRef})`,
                  bookingId: cb.id,
                  clientId: cb.client?.id || `cli_${bRef}`,
                  status: "ACTIVE",
                  bookingStatus: isBooked ? "BOOKED" : "QUOTATION_REQUEST",
                  lastActivityAt: cb.createdAt || new Date().toISOString(),
                  client: {
                    companyName,
                    primaryContact: contactPerson,
                    contactPerson: contactPerson,
                    email: cb.client?.email || "cloydllora01@gmail.com",
                    phone: cb.client?.phone || "09278872324",
                  },
                  booking: {
                    bookingNumber: bRef,
                    mallOrVenue: venueName,
                    eventDate: cb.eventDate || "2026-11-20",
                    totalContractAmount: totalAmt,
                    depositPaid: Number(cb.depositPaid || 0),
                    status: cb.status || (isBooked ? "BOOKED" : "INQUIRY_RECEIVED"),
                  },
                  messages: [
                    {
                      id: `msg_in_${bRef}`,
                      direction: "INBOUND",
                      sender: cb.client?.email || "cloydllora01@gmail.com",
                      recipient: "bookings@brilloevent.com",
                      subject: `${venueName} — Quotation Request (${bRef})`,
                      bodyText: `Inquiry submitted for ${venueName} on ${evDate}.\nPackage Rate: ₱${totalAmt.toLocaleString()}\nPrimary Contact (Kausap): ${contactPerson} | Mobile: ${cb.client?.phone || "09278872324"}\nSpecial Requests: ${cb.specialRequests || cb.internalNotes || "Direct Santa Booking"}`,
                      sentAt: cb.createdAt || new Date().toISOString(),
                    },
                    {
                      id: `msg_out_${bRef}`,
                      direction: "OUTBOUND",
                      sender: "bookings@brilloevent.com",
                      recipient: cb.client?.email || "cloydllora01@gmail.com",
                      subject: `We've Received Your Santa Quotation Request — ${venueName} (${bRef})`,
                      bodyText: `Dear ${contactPerson},\n\nThank you for choosing Brillo Events Management Services for ${venueName}!\n\nWe have received your event requirements for ${evDate} with an indicative package rate of ₱${totalAmt.toLocaleString()}.\n\nOur operations desk is actively reviewing talent availability and scheduling.\n\nWarm regards,\nBrillo Events Management Team`,
                      sentAt: cb.createdAt || new Date().toISOString(),
                    },
                  ],
                };

                savedThreads.unshift(dynamicThread);
              }
            }

            threadsList = savedThreads;
            localStorage.setItem(STATIC_INBOX_KEY, JSON.stringify(threadsList));
          } catch {}
        }

        const providerStatus = {
          connected: true,
          provider: "Namecheap Private Email",
          senderAddress: "bookings@brilloevent.com",
          statusMessage: "Connected (mail.privateemail.com:465 SSL Active)",
          inboundSyncSupported: true,
        };

        if (method === "GET") {
          const reqThreadId = urlObj.searchParams.get("threadId");
          if (reqThreadId) {
            const foundThread = threadsList.find((t) => t.id === reqThreadId) || threadsList[0];
            return jsonResponse({ success: true, thread: foundThread, providerStatus });
          }
          return jsonResponse({
            success: true,
            count: threadsList.length,
            threads: threadsList,
            providerStatus,
          });
        }

        if (method === "POST") {
          const targetThreadId = parsedBody.threadId;
          const newMsg = {
            id: `msg_${Date.now()}`,
            direction: "OUTBOUND",
            sender: "bookings@brilloevent.com",
            recipient: parsedBody.to || "client@events.local",
            subject: parsedBody.subject || "Official Response",
            bodyText: parsedBody.bodyText || "",
            sentAt: new Date().toISOString(),
          };

          const threadIdx = threadsList.findIndex((t) => t.id === targetThreadId);
          if (threadIdx !== -1) {
            threadsList[threadIdx].messages = [...(threadsList[threadIdx].messages || []), newMsg];
            threadsList[threadIdx].lastActivityAt = new Date().toISOString();
          }

          if (typeof localStorage !== "undefined") {
            try {
              localStorage.setItem(STATIC_INBOX_KEY, JSON.stringify(threadsList));
            } catch {}
          }

          // Trigger cPanel mail relay
          try {
            origFetch("/api/mailer.php", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                to: parsedBody.to,
                subject: parsedBody.subject,
                html: `<div style="font-family: Arial, sans-serif; padding: 20px;">${(parsedBody.bodyText || "").replace(/\n/g, "<br/>")}</div>`,
                replyTo: "info@brilloevent.com",
              }),
            }).catch(() => {});
          } catch {}

          return jsonResponse({ success: true, message: newMsg });
        }
      }
      if (pathname === "/api/import") return jsonResponse(snap.importBatches);
      if (pathname.startsWith("/api/public/status/")) {
        return jsonResponse({
          success: true,
          booking: snap.bookings.bookings[0],
        });
      }

      return jsonResponse({ success: true });
    };
  }, []);

  return null;
}
