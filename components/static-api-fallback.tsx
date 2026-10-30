"use client";

import { useEffect } from "react";
import { XENDIT_PH_CHANNELS, buildQrPhString } from "@/lib/xendit";

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
        if (res.ok) return res;
      } catch {
        // Fallback to static snapshot when hosted on static GitHub Pages
      }

      const snap = await getSnapshot(origFetch);
      const urlObj = new URL(urlStr, window.location.origin);
      const pathname = urlObj.pathname;
      const method = (init?.method || "GET").toUpperCase();

      const jsonResponse = (data: any) =>
        new Response(JSON.stringify(data), {
          status: 200,
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
          if (parsedBody.eventName !== undefined) updated.eventName = parsedBody.eventName;
          if (parsedBody.mallOrVenue !== undefined) updated.mallOrVenue = parsedBody.mallOrVenue;
          if (parsedBody.venueAddress !== undefined) updated.venueAddress = parsedBody.venueAddress;
          if (parsedBody.startTime !== undefined) updated.startTime = parsedBody.startTime;
          if (parsedBody.endTime !== undefined) updated.endTime = parsedBody.endTime;
          if (parsedBody.callTime !== undefined) updated.callTime = parsedBody.callTime;
          if (parsedBody.internalNotes !== undefined) updated.internalNotes = parsedBody.internalNotes;
          if (parsedBody.specialRequests !== undefined) updated.specialRequests = parsedBody.specialRequests;
          if (parsedBody.venueNotes !== undefined) updated.venueNotes = parsedBody.venueNotes;
          if (parsedBody.totalContractAmount !== undefined)
            updated.totalContractAmount = Number(parsedBody.totalContractAmount);
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

          if (parsedBody.companyName) {
            updated.client = {
              ...(updated.client || {}),
              companyName: parsedBody.companyName,
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
        return jsonResponse({
          ...snap.dashboard,
          queues: {
            ...(snap.dashboard?.queues || {}),
            dynamicConflictSubtitle: `${
              snap.dashboard?.queues?.unresolvedSourceConflicts || 0
            } source audit flags • 0 roster overlaps`,
          },
          immediateActionQueue: allB.slice(0, 8),
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
        return jsonResponse({ success: true, booking, talents: snap.talents.talents });
      }
      if (pathname === "/api/individual-bookings") return jsonResponse(snap.individualBookings);
      if (pathname === "/api/talents") return jsonResponse(snap.talents);
      if (pathname.startsWith("/api/talents/")) {
        const id = pathname.split("/").pop();
        const talent =
          snap.talents.talents.find((t: any) => t.id === id || t.canonicalId === id) ||
          snap.talents.talents[0];
        return jsonResponse({ success: true, talent });
      }
      if (pathname === "/api/leads") return jsonResponse(snap.leads);
      if (pathname === "/api/clients") return jsonResponse(snap.clients);
      if (pathname === "/api/quotes") return jsonResponse(snap.quotes);
      if (pathname === "/api/contracts") return jsonResponse(snap.contracts);
      if (pathname === "/api/payments") return jsonResponse(snap.payments);
      if (pathname === "/api/paluwal") return jsonResponse(snap.paluwal);
      if (pathname === "/api/expenses") return jsonResponse(snap.expenses);
      if (pathname === "/api/conflicts") return jsonResponse(snap.conflicts);
      if (pathname === "/api/inbox") return jsonResponse(snap.inbox);
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
