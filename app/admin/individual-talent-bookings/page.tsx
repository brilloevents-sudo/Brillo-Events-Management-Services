"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  UserCheck,
  Search,
  Filter,
  Calendar,
  Building2,
  DollarSign,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
} from "lucide-react";
import { BOOKING_STATUS_CONFIG, BookingStatus } from "@/lib/booking-state";

export default function IndividualTalentBookingsPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [talents, setTalents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedTalent, setSelectedTalent] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [venueFilter, setVenueFilter] = useState("");

  function fetchRecords() {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedTalent) params.set("talentId", selectedTalent);
    if (selectedStatus) params.set("status", selectedStatus);
    if (searchQuery) params.set("search", searchQuery);
    if (venueFilter) params.set("venue", venueFilter);

    fetch(`/api/individual-bookings?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.records) setRecords(data.records);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetch("/api/talents")
      .then((res) => res.json())
      .then((d) => {
        if (d.talents) setTalents(d.talents);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [selectedTalent, selectedStatus, venueFilter]);

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gold-950 text-gold-400 border border-gold-800 font-mono">
              MANDATORY MODULE
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center">
              Individual Talent Bookings
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Talent-centric register answering <strong className="text-slate-200">&quot;Who booked this Santa?&quot;</strong> across historical and upcoming schedules.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/admin/calendar"
            className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-obsidian-850 hover:bg-obsidian-800 border border-slate-700 text-slate-200 transition flex items-center"
          >
            <Calendar className="w-3.5 h-3.5 mr-1.5 text-gold-400" />
            Calendar View
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-obsidian-900 border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Santa Filter */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Filter by Santa</label>
            <select
              value={selectedTalent}
              onChange={(e) => setSelectedTalent(e.target.value)}
              className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded-lg text-slate-200 focus:border-gold-500"
            >
              <option value="">All Santas ({talents.length})</option>
              {talents.map((t) => (
                <option key={t.id} value={t.id}>
                  Santa {t.displayName} ({t.canonicalId})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Booking Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded-lg text-slate-200 focus:border-gold-500"
            >
              <option value="">All Statuses</option>
              <option value="SECURED_UNASSIGNED">Secured / Confirmed</option>
              <option value="TEMPORARY_HOLD">Temporary Hold (24h)</option>
              <option value="AWAITING_STAFF_APPROVAL">Awaiting Approval</option>
              <option value="READY_FOR_DEPLOYMENT">Ready for Deployment</option>
              <option value="EVENT_COMPLETED">Delivered / Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Venue Search */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Venue / Branch</label>
            <input
              type="text"
              value={venueFilter}
              onChange={(e) => setVenueFilter(e.target.value)}
              placeholder="e.g. SM Megamall, SM Pasig..."
              className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-600 focus:border-gold-500"
            />
          </div>

          {/* Search Bar */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Search Keyword</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchRecords()}
                placeholder="Booking #, client, agency..."
                className="w-full pl-8 pr-3 py-2 bg-obsidian-950 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-600 focus:border-gold-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Main List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
          <span>Found {records.length} booking records</span>
          <span>Sorted chronologically</span>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center bg-obsidian-900 border border-slate-800 rounded-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-400"></div>
          </div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center bg-obsidian-900 border border-slate-800 rounded-xl">
            <UserCheck className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-white">No individual bookings match filters</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Try adjusting the Santa or status filter, or import the 2026 Excel tracker from the Import Center.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((r) => {
              const statusConfig = BOOKING_STATUS_CONFIG[r.status as BookingStatus] || {
                label: r.status,
                color: "bg-slate-800 text-slate-300 border-slate-700",
              };
              const eventDateObj = new Date(r.eventDate);

              return (
                <div
                  key={r.bookingId}
                  className="p-5 rounded-xl bg-obsidian-900 border border-slate-800/90 hover:border-slate-700 transition shadow-sm space-y-4"
                >
                  {/* Top Bar: Santa + Date + Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-crimson-950 border border-crimson-800/80 flex items-center justify-center font-bold text-xs text-gold-300">
                        {r.talent ? r.talent.displayName.slice(0, 2).toUpperCase() : "??"}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-white">
                            Santa {r.talent ? r.talent.displayName : "Unassigned"}
                          </span>
                          {r.talent && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-obsidian-950 text-slate-400 border border-slate-800 font-mono">
                              {r.talent.canonicalId}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center space-x-2 mt-0.5">
                          <span className="font-mono text-gold-400 font-semibold">{r.bookingNumber}</span>
                          <span>•</span>
                          <span>{r.eventName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold border ${statusConfig.color}`}
                      >
                        {statusConfig.label}
                      </span>
                      <Link
                        href={`/admin/bookings/${r.bookingId}`}
                        className="px-2.5 py-1 rounded text-xs bg-obsidian-850 hover:bg-obsidian-800 border border-slate-700 text-slate-300 transition"
                      >
                        Open Details →
                      </Link>
                    </div>
                  </div>

                  {/* Middle Grid: Who booked this Santa? & Financials */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    {/* Column 1: Client & Agency ("Who Booked This Santa?") */}
                    <div className="space-y-1.5 p-3 rounded-lg bg-obsidian-950 border border-slate-800/70">
                      <div className="text-[10px] font-mono text-gold-400 font-bold uppercase tracking-wider">
                        Who Booked This Santa?
                      </div>
                      <div>
                        <span className="text-slate-400">Client / Company:</span>
                        <div className="text-white font-semibold text-xs mt-0.5">
                          {r.bookedBy.companyName}
                        </div>
                      </div>
                      <div className="text-slate-400">
                        Contact: <span className="text-slate-200">{r.bookedBy.primaryContact}</span>
                        {r.bookedBy.phone !== "N/A" && ` (${r.bookedBy.phone})`}
                      </div>
                      {r.contract && (
                        <div className="pt-1 text-[11px] text-slate-400">
                          Contract:{" "}
                          <span className={r.contract.isSigned ? "text-emerald-400 font-medium" : "text-amber-400 font-medium"}>
                            {r.contract.isSigned ? "Signed & Archived" : "Pending Signature"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Column 2: Event Logistics */}
                    <div className="space-y-1.5 p-3 rounded-lg bg-obsidian-950 border border-slate-800/70">
                      <div className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                        Appearance Logistics
                      </div>
                      <div className="text-slate-300 font-medium flex items-center">
                        <Building2 className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                        {r.venue}
                      </div>
                      <div className="text-slate-400 flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                        {eventDateObj.toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <div className="text-slate-400 flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                        Call Time: {r.callTime || "13:00"} | Appearance: {r.startTime || "14:00"} - {r.endTime || "18:00"}
                      </div>
                    </div>

                    {/* Column 3: Talent Fee & Settlement State */}
                    <div className="space-y-1.5 p-3 rounded-lg bg-obsidian-950 border border-slate-800/70">
                      <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                        Fee &amp; Payment Status
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Agreed Talent Fee:</span>
                        <span className="font-bold text-white">
                          ₱{Number(r.financials.agreedTalentFee || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Client Contract:</span>
                        <span className="text-slate-300">
                          ₱{Number(r.financials.clientQuotedAmount || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-slate-800 pt-1">
                        <span className="text-slate-400">Deposit Received:</span>
                        <span className="text-emerald-400 font-semibold">
                          ₱{Number(r.financials.verifiedCashReceived || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Provenance note if from Excel */}
                  {r.provenance.isHistoricalImport && (
                    <div className="text-[11px] text-slate-500 font-mono flex items-center space-x-2 pt-1 border-t border-slate-800/40">
                      <span>Source Provenance: {r.provenance.sourceSheet} (Row {r.provenance.sourceRowIndex})</span>
                      {r.provenance.internalNotes && (
                        <span>• Note: {r.provenance.internalNotes}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
