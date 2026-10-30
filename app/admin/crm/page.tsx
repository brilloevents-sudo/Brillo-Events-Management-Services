"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  ArrowRight,
  X,
  List,
  KanbanSquare,
  Calendar,
} from "lucide-react";
import {
  normalizeToLifecycleState,
  LIFECYCLE_METADATA,
} from "@/lib/booking-state-machine";

export default function UnifiedCrmPipelinePage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"LIST" | "KANBAN">("LIST");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [selectedLead, setSelectedLead] = useState<any | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leads?filter=${activeFilter}&search=${encodeURIComponent(search)}`)
      .then((res) => res.json())
      .then((d) => {
        if (d.success && d.leads) setLeads(d.leads);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeFilter, search]);

  const kanbanColumns = [
    {
      id: "INQUIRY_RECEIVED",
      title: "1. Inquiry Received",
      items: leads.filter((l) => normalizeToLifecycleState(l.status) === "INQUIRY_RECEIVED"),
    },
    {
      id: "HOLD_24H_ACTIVE",
      title: "2. 24h Calendar Hold",
      items: leads.filter((l) => normalizeToLifecycleState(l.status) === "HOLD_24H_ACTIVE"),
    },
    {
      id: "QUOTE_ISSUED",
      title: "3. Quote & Contract",
      items: leads.filter((l) =>
        ["QUOTE_ISSUED", "CONTRACT_SENT", "CONTRACT_SIGNED_PENDING_DEPOSIT"].includes(
          normalizeToLifecycleState(l.status)
        )
      ),
    },
    {
      id: "AWAITING_STAFF_SIGNOFF",
      title: "4. Awaiting Signoff",
      items: leads.filter(
        (l) => normalizeToLifecycleState(l.status) === "AWAITING_STAFF_SIGNOFF"
      ),
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E8DFE0]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="badge-esign px-2.5 py-0.5 rounded text-[10px] font-mono">
              STAGE 1 • COMMERCIAL INTAKE
            </span>
            <h1 className="page-title text-2xl font-serif tracking-tight">
              Leads &amp; CRM Pipeline
            </h1>
          </div>
          <p className="page-subtitle text-xs mt-1">
            Qualify incoming mall &amp; private inquiries, lock 24h holds, and advance deals to Quotes &amp; Contracts.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* List vs Kanban Toggle */}
          <div className="inline-flex rounded-lg bg-white border border-[#D6C7C9] p-0.5 shadow-sm text-xs">
            <button
              type="button"
              onClick={() => setViewMode("LIST")}
              className={`px-3 py-1.5 rounded-md font-semibold flex items-center space-x-1.5 transition ${
                viewMode === "LIST"
                  ? "bg-[#9B1B30] text-white"
                  : "text-[#4A3A3D] hover:text-[#1E1416]"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("KANBAN")}
              className={`px-3 py-1.5 rounded-md font-semibold flex items-center space-x-1.5 transition ${
                viewMode === "KANBAN"
                  ? "bg-[#9B1B30] text-white"
                  : "text-[#4A3A3D] hover:text-[#1E1416]"
              }`}
            >
              <KanbanSquare className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
          </div>

          <Link
            href="/request-quote"
            target="_blank"
            className="btn-primary inline-flex items-center px-3.5 py-2 rounded-lg text-xs font-semibold transition"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            New Inquiry
          </Link>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: "ALL", label: "All Inquiries" },
            { id: "NEW", label: "New Unassigned" },
            { id: "FOLLOW_UP", label: "Needs Follow-up" },
            { id: "CORPORATE", label: "Corporate & Malls" },
            { id: "PRIVATE", label: "Private Events" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeFilter === tab.id
                  ? "bg-[#1E1416] text-white shadow-sm"
                  : "bg-white border border-[#E8DFE0] text-[#4A3A3D] hover:border-[#9B1B30]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#756568] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search lead or venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs"
          />
        </div>
      </div>

      {/* VIEW MODE: KANBAN BOARD */}
      {viewMode === "KANBAN" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kanbanColumns.map((col) => (
            <div key={col.id} className="dashboard-card p-3.5 flex flex-col space-y-3">
              <div className="flex items-center justify-between border-b border-[#E8DFE0] pb-2.5">
                <span className="text-xs font-bold text-[#1E1416]">{col.title}</span>
                <span className="badge-esign px-2 py-0.5 rounded-full text-[10px] font-mono">
                  {col.items.length}
                </span>
              </div>

              <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
                {col.items.length === 0 ? (
                  <div className="p-6 text-center text-[11px] text-[#756568]">
                    No deals in stage
                  </div>
                ) : (
                  col.items.map((lead) => (
                    <div
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className="p-3 rounded-lg bg-[#FCF9F8] border border-[#E8DFE0] hover:border-[#9B1B30] cursor-pointer transition space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between font-mono text-[10px]">
                        <span className="font-bold text-[#9B1B30]">{lead.bookingNumber}</span>
                        <span className="text-[#756568]">
                          ₱{Number(lead.clientQuotedAmount || 18000).toLocaleString()}
                        </span>
                      </div>
                      <div className="font-bold text-[#1E1416] truncate">
                        {lead.mallOrVenue}
                      </div>
                      <div className="text-[11px] text-[#756568] flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-[#C68A12]" />
                        <span>
                          {new Date(lead.eventDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* VIEW MODE: LIST TABLE */
        <div className="dashboard-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FCF9F8] border-b border-[#E8DFE0] text-[10px] font-mono uppercase tracking-wider text-[#756568]">
                  <th className="py-3 px-4 font-semibold">Lead ID &amp; Event</th>
                  <th className="py-3 px-4 font-semibold">Client / Company</th>
                  <th className="py-3 px-4 font-semibold">Target Date</th>
                  <th className="py-3 px-4 font-semibold">Venue &amp; City</th>
                  <th className="py-3 px-4 font-semibold">Lifecycle Stage</th>
                  <th className="py-3 px-4 font-semibold text-right">Next Step</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DFE0]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#756568]">
                      Loading CRM leads...
                    </td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#756568]">
                      No leads found matching current filter.
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => {
                    const st = normalizeToLifecycleState(lead.status);
                    const meta = LIFECYCLE_METADATA[st];
                    return (
                      <tr
                        key={lead.id}
                        onClick={() => setSelectedLead(lead)}
                        className="hover:bg-[#F4ECEE]/60 cursor-pointer transition"
                      >
                        <td className="py-3 px-4">
                          <span className="font-mono text-[11px] text-[#9B1B30] font-bold block">
                            {lead.bookingNumber}
                          </span>
                          <span className="font-semibold text-[#1E1416] block mt-0.5">
                            {lead.eventName}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[#1E1416] font-medium block">
                            {lead.client?.companyName ||
                              lead.client?.contactPerson ||
                              "Direct Client"}
                          </span>
                          <span className="text-[11px] text-[#756568] block">
                            {(lead.bookingType || "CORPORATE").replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[#4A3A3D]">
                          {new Date(lead.eventDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[#1E1416] font-medium block">
                            {lead.mallOrVenue}
                          </span>
                          <span className="text-[11px] text-[#756568] block">
                            {lead.locationCity}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${meta.badgeClass}`}
                          >
                            {meta.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-1.5">
                          <Link
                            href={`/admin/quotes?bookingId=${lead.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded bg-[#F9EBED] text-[#9B1B30] border border-[#F0D0D5] hover:bg-[#F3DCE0] transition"
                          >
                            Quote →
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slide-over Detail Drawer */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-lg liquid-glass-modal h-full overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8DFE0]">
              <div>
                <span className="font-mono text-xs text-[#9B1B30] font-bold">
                  {selectedLead.bookingNumber}
                </span>
                <h2 className="text-xl font-serif font-bold text-[#1E1416]">
                  {selectedLead.eventName}
                </h2>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-1.5 rounded-lg text-[#756568] hover:text-[#1E1416] hover:bg-[#F4ECEE]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-[#FCF9F8] border border-[#E8DFE0]">
                <span className="text-[#756568] block text-[11px]">Venue &amp; Mall</span>
                <strong className="text-[#1E1416] block mt-0.5">
                  {selectedLead.mallOrVenue}
                </strong>
              </div>
              <div className="p-3 rounded-lg bg-[#FCF9F8] border border-[#E8DFE0]">
                <span className="text-[#756568] block text-[11px]">Event Date</span>
                <strong className="text-[#1E1416] block mt-0.5">
                  {new Date(selectedLead.eventDate).toLocaleDateString()}
                </strong>
              </div>
              <div className="p-3 rounded-lg bg-[#FCF9F8] border border-[#E8DFE0]">
                <span className="text-[#756568] block text-[11px]">Call Time / Block</span>
                <strong className="text-[#1E1416] block mt-0.5">
                  {selectedLead.callTime || "Standard"} • {selectedLead.startTime || "14:00"}
                </strong>
              </div>
              <div className="p-3 rounded-lg bg-[#FCF9F8] border border-[#E8DFE0]">
                <span className="text-[#756568] block text-[11px]">Quoted Investment</span>
                <strong className="text-[#9B1B30] block mt-0.5 font-mono">
                  ₱{Number(selectedLead.clientQuotedAmount || 18000).toLocaleString()}
                </strong>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E8DFE0] space-y-2.5">
              <Link
                href={`/admin/quotes?bookingId=${selectedLead.id}`}
                className="btn-primary w-full py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center transition"
              >
                Step 1: Issue Costing &amp; Official Quote{" "}
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
              <Link
                href="/admin/contracts"
                className="w-full py-2.5 px-4 rounded-lg bg-white hover:bg-[#F4ECEE] border border-[#D6C7C9] text-[#1E1416] text-xs font-semibold flex items-center justify-center transition"
              >
                Step 2: Generate Contract &amp; E-Sign
              </Link>
              <Link
                href={`/admin/bookings/${selectedLead.id}`}
                className="w-full py-2 px-4 rounded-lg bg-[#FCF9F8] hover:bg-[#F4ECEE] text-[#4A3A3D] text-xs font-medium flex items-center justify-center transition"
              >
                Open Full Booking Record
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
