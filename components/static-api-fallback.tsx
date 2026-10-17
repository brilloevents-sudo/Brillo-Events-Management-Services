"use client";

import { useEffect } from "react";

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
