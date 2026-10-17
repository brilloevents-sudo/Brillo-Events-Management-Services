"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Calendar,
  Building2,
  DollarSign,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import {
  BOOKING_STATUS_CONFIG,
  BookingStatus,
  PIPELINE_STAGE_LABELS,
} from "@/lib/booking-state";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  function loadBookings() {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedStage) params.set("pipelineStage", String(selectedStage));
    if (statusFilter) params.set("status", statusFilter);
    if (search) params.set("search", search);

    fetch(`/api/bookings?${params.toString()}`)
      .then((res) => res.json())
      .then((d) => {
        if (d.bookings) setBookings(d.bookings);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadBookings();
  }, [selectedStage, statusFilter]);

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center">
            Master Booking Register &amp; Pipeline
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            End-to-end lifecycle from initial inquiry to verified payment, deployment, and post-event settlement.
          </p>
        </div>
      </div>

      {/* 5-Stage Operational Pipeline Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 border-b border-slate-800 text-xs font-mono">
        <button
          onClick={() => setSelectedStage(null)}
          className={`px-3 py-1.5 rounded-lg font-semibold transition shrink-0 ${
            selectedStage === null
              ? "bg-gold-500 text-obsidian-950 shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-obsidian-900"
          }`}
        >
          All Stages ({bookings.length})
        </button>
        {[1, 2, 3, 4, 5].map((stg) => (
          <button
            key={stg}
            onClick={() => setSelectedStage(stg)}
            className={`px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
              selectedStage === stg
                ? "bg-crimson-800 text-white shadow-sm border border-crimson-600/40"
                : "text-slate-400 hover:text-white hover:bg-obsidian-900"
            }`}
          >
            {PIPELINE_STAGE_LABELS[stg]}
          </button>
        ))}
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-xl bg-obsidian-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="w-full sm:w-72 relative">
          <input
            type="text"
            placeholder="Search booking #, mall, client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadBookings()}
            className="w-full pl-8 pr-3 py-2 bg-obsidian-950 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-600 focus:border-gold-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3" />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-obsidian-950 border border-slate-700 rounded-lg text-slate-200 focus:border-gold-500"
          >
            <option value="">All Statuses</option>
            <option value="INQUIRY_RECEIVED">Inquiry Received</option>
            <option value="TEMPORARY_HOLD">Temporary Hold (24h)</option>
            <option value="AWAITING_STAFF_APPROVAL">Awaiting Staff Approval</option>
            <option value="SECURED_UNASSIGNED">Secured &amp; Confirmed</option>
            <option value="READY_FOR_DEPLOYMENT">Ready for Deployment</option>
            <option value="EVENT_COMPLETED">Event Delivered</option>
            <option value="SETTLED_PENDING_TALENT_PAYOUT">Settled / Payout Pending</option>
            <option value="CLOSED">Closed &amp; Settled</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <button
            onClick={loadBookings}
            className="px-4 py-2 rounded-lg bg-obsidian-850 hover:bg-obsidian-800 border border-slate-700 text-slate-200"
          >
            Filter
          </button>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="rounded-xl bg-obsidian-900 border border-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-400"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No bookings found matching current criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-obsidian-950/80 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  <th className="p-3.5">Ref / Mall</th>
                  <th className="p-3.5">Event Date</th>
                  <th className="p-3.5">Client / Agency</th>
                  <th className="p-3.5">Assigned Santa</th>
                  <th className="p-3.5">Contract (₱)</th>
                  <th className="p-3.5">Deposit Paid</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {bookings.map((b) => {
                  const statusMeta = BOOKING_STATUS_CONFIG[b.status as BookingStatus] || {
                    label: b.status,
                    color: "bg-slate-800 text-slate-300 border-slate-700",
                  };
                  const dateObj = new Date(b.eventDate);
                  const assigned = b.talentAssignments[0]?.talent;

                  return (
                    <tr key={b.id} className="hover:bg-obsidian-850/50 transition">
                      <td className="p-3.5 font-medium">
                        <div className="font-mono text-gold-400 text-[11px]">
                          {b.bookingNumber}
                        </div>
                        <div className="text-white font-semibold text-xs mt-0.5">
                          {b.mallOrVenue}
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-slate-300">
                        {dateObj.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                        <div className="text-[10px] text-slate-500">
                          {b.startTime || "14:00"} - {b.endTime || "18:00"}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="text-slate-200 font-medium">
                          {b.client?.companyName || "Direct"}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {b.client?.primaryContact}
                        </div>
                      </td>
                      <td className="p-3.5">
                        {assigned ? (
                          <div className="flex items-center space-x-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span className="text-white font-medium">
                              Santa {assigned.displayName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500 font-mono text-[11px]">
                            -- Unassigned --
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 font-mono font-semibold text-slate-200">
                        ₱{Number(b.totalContractAmount || 0).toLocaleString()}
                      </td>
                      <td className="p-3.5 font-mono text-emerald-400 font-medium">
                        ₱{Number(b.depositPaid || 0).toLocaleString()}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${statusMeta.color}`}
                        >
                          {statusMeta.label}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <Link
                          href={`/admin/bookings/${b.id}`}
                          className="px-2.5 py-1 rounded bg-obsidian-950 hover:bg-obsidian-800 border border-slate-700 text-slate-300 font-medium transition"
                        >
                          Manage →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
