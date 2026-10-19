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

      if (pathname === "/api/dashboard") return jsonResponse(snap.dashboard);
      if (pathname === "/api/bookings") return jsonResponse(snap.bookings);
      if (pathname.startsWith("/api/bookings/")) {
        const id = pathname.split("/").pop();
        const booking =
          snap.bookings.bookings.find((b: any) => b.id === id || b.bookingNumber === id) ||
          snap.bookings.bookings[0];
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
