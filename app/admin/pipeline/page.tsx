"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  KanbanSquare,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  DollarSign,
  Plus,
  RefreshCw,
} from "lucide-react";

export default function PipelinePage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = () => {
    setLoading(true);
    fetch("/api/bookings")
      .then((res) => res.json())
      .then((d) => {
        if (d.success) setBookings(d.bookings);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // 5 Operational Stages
  const stages = [
    {
      id: "STAGE_1_INGESTION",
      title: "1. Inquiries & Intake",
      statuses: ["INQUIRY_RECEIVED"],
      color: "border-blue-300 bg-blue-50/40 text-blue-900",
      badge: "Intake",
    },
    {
      id: "STAGE_2_QUOTING",
      title: "2. Quoted & In Review",
      statuses: ["QUOTED", "UNDER_CLIENT_REVIEW", "AWAITING_STAFF_APPROVAL"],
      color: "border-purple-300 bg-purple-50/40 text-purple-900",
      badge: "Review",
    },
    {
      id: "STAGE_3_RESERVATION",
      title: "3. 24h Holds & Contracts",
      statuses: [
        "TEMPORARY_HOLD",
        "AGREEMENT_OUT",
        "AGREEMENT_SIGNED",
        "PAYMENT_PENDING",
        "CONTRACT_SIGNED_PENDING_PAYMENT",
        "PAYMENT_VERIFIED_PENDING_CONTRACT",
      ],
      color: "border-amber-300 bg-amber-50/40 text-amber-900",
      badge: "Holds",
    },
    {
      id: "STAGE_4_SECURED",
      title: "4. Secured & Staffing",
      statuses: [
        "SECURED_UNASSIGNED",
        "TALENT_PROPOSED",
        "TALENT_CONFIRMED",
        "PA_CONFIRMED",
        "LOGISTICS_COORDINATED",
      ],
      color: "border-emerald-300 bg-emerald-50/40 text-emerald-900",
      badge: "Dual-Gate Cleared",
    },
    {
      id: "STAGE_5_DELIVERED",
      title: "5. Delivered & Settled",
      statuses: [
        "READY_FOR_DISPATCH",
        "ON_SITE",
        "EVENT_COMPLETED",
        "SETTLEMENT_PENDING",
        "SETTLEMENT_CLEARED",
        "CLOSED",
      ],
      color: "border-slate-300 bg-slate-50/40 text-slate-900",
      badge: "Executed",
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E2DED4]">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#B99A5B] font-bold">
            CRM Pipeline
          </span>
          <h1 className="text-2xl font-serif font-bold text-[#252824] tracking-tight mt-0.5">
            5-Stage Operational Pipeline (Kanban)
          </h1>
          <p className="text-xs text-[#6B706C] mt-1">
            Visual progression of all 96 historical and current bookings across verified lifecycle milestones.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={fetchBookings}
            className="p-2 rounded-lg bg-[#FFFEFB] border border-[#E2DED4] text-[#6B706C] hover:text-[#252824] shadow-sm transition"
            title="Refresh pipeline"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link
            href="/admin/leads"
            className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[#FFFEFB] hover:bg-[#F6F3EC] border border-[#E2DED4] text-[#252824] shadow-sm transition"
          >
            Table Inbox View
          </Link>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start overflow-x-auto pb-4">
        {stages.map((stage) => {
          const items = bookings.filter((b) => stage.statuses.includes(b.status));

          return (
            <div
              key={stage.id}
              className="bg-[#FBF9F4] border border-[#E2DED4] rounded-xl p-3 flex flex-col min-h-[500px] shadow-sm"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#E2DED4]">
                <div>
                  <h2 className="text-xs font-serif font-bold text-[#252824]">{stage.title}</h2>
                  <span className="text-[10px] text-[#6B706C] font-mono">
                    {items.length} {items.length === 1 ? "booking" : "bookings"}
                  </span>
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold ${stage.color}`}>
                  {stage.badge}
                </span>
              </div>

              {/* Cards Container */}
              <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[700px] pr-1">
                {items.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#6B706C] font-mono">
                    Empty column
                  </div>
                ) : (
                  items.map((b) => {
                    const santa = b.talentAssignments?.[0]?.talent;
                    return (
                      <Link
                        key={b.id}
                        href={`/admin/bookings/${b.id}`}
                        className="p-3 bg-[#FFFEFB] border border-[#E2DED4] hover:border-[#B99A5B] rounded-lg shadow-sm hover:shadow transition block space-y-2 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-[#A92F3A] font-bold">
                            {b.bookingNumber}
                          </span>
                          <span className="text-[10px] text-[#6B706C] font-mono">
                            {new Date(b.eventDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>

                        <div>
                          <strong className="text-xs text-[#252824] group-hover:text-[#A92F3A] transition block truncate">
                            {b.eventName}
                          </strong>
                          <span className="text-[11px] text-[#6B706C] block truncate">
                            {b.mallOrVenue}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-[#E2DED4]/60 flex items-center justify-between text-[11px]">
                          <span className="text-[#252824] font-medium truncate">
                            🎅 {santa ? santa.displayName : "Unassigned"}
                          </span>
                          <span className="font-mono text-[10px] text-[#6B706C]">
                            ₱{Number(b.clientQuotedAmount || 18000).toLocaleString()}
                          </span>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
