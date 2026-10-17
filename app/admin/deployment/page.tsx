"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Truck, CheckCircle2, Clock, AlertCircle, Calendar, MapPin, ArrowRight } from "lucide-react";

export default function DeploymentPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bookings")
      .then((res) => res.json())
      .then((d) => {
        if (d.success) setBookings(d.bookings);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div className="pb-4 border-b border-[#E2DED4]">
        <span className="text-[11px] font-mono uppercase tracking-widest text-[#B99A5B] font-bold">
          Field Logistics &amp; Ingress
        </span>
        <h1 className="text-2xl font-serif font-bold text-[#252824] tracking-tight mt-0.5">
          Event Deployment &amp; Readiness Checklists
        </h1>
        <p className="text-xs text-[#6B706C] mt-1">
          Verify Santa assignment, handler coordination, call times, wardrobe brief, and venue access before event dispatch.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-[#6B706C]">
            Loading deployment schedules...
          </div>
        ) : (
          bookings.slice(0, 16).map((b) => {
            const santa = b.talentAssignments?.[0]?.talent;
            const hasSanta = Boolean(santa);
            const hasTime = Boolean(b.callTime || b.startTime);
            const isSecured = b.status.includes("SECURED") || b.status.includes("CONFIRMED") || b.status === "EVENT_COMPLETED";

            return (
              <div
                key={b.id}
                className="p-5 rounded-xl bg-[#FFFEFB] border border-[#E2DED4] shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[11px] text-[#A92F3A] font-bold">
                      {b.bookingNumber} • {new Date(b.eventDate).toLocaleDateString()}
                    </span>
                    <h2 className="text-sm font-bold text-[#252824] mt-0.5">{b.mallOrVenue}</h2>
                    <p className="text-[11px] text-[#6B706C]">{b.eventName}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#F6F3EC] border border-[#E2DED4] text-[#252824]">
                    {b.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-[#E2DED4]/60">
                  <div className="flex items-center space-x-1.5">
                    {hasSanta ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    )}
                    <span className="truncate">
                      Santa: <strong>{santa ? santa.displayName : "Pending"}</strong>
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {hasTime ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    )}
                    <span className="truncate">
                      Call: <strong>{b.callTime || b.startTime || "TBD"}</strong>
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {isSecured ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    )}
                    <span>Dual Gate: {isSecured ? "Cleared" : "Pending"}</span>
                  </div>
                  <div className="text-right">
                    <Link
                      href={`/admin/bookings/${b.id}`}
                      className="text-[#A92F3A] font-semibold hover:underline inline-flex items-center"
                    >
                      Briefing <ArrowRight className="w-3 h-3 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
