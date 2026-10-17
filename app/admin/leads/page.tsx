"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Inbox,
  Search,
  Filter,
  Plus,
  ArrowRight,
  Clock,
  Building2,
  Calendar,
  MapPin,
  X,
  FileText,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [selectedLead, setSelectedLead] = useState<any | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leads?filter=${activeFilter}&search=${encodeURIComponent(search)}`)
      .then((res) => res.json())
      .then((d) => {
        if (d.success) setLeads(d.leads);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeFilter, search]);

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E2DED4]">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#B99A5B] font-bold">
            CRM &amp; Acquisition
          </span>
          <h1 className="text-2xl font-serif font-bold text-[#252824] tracking-tight mt-0.5">
            Leads &amp; Inquiries Inbox
          </h1>
          <p className="text-xs text-[#6B706C] mt-1">
            Capture, triage, and qualify incoming booking requests before issuing binding quotes.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <Link
            href="/admin/pipeline"
            className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[#FFFEFB] hover:bg-[#F6F3EC] border border-[#E2DED4] text-[#252824] shadow-sm transition"
          >
            Kanban Pipeline View
          </Link>
          <Link
            href="/request-quote"
            target="_blank"
            className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[#A92F3A] hover:bg-[#8E252F] text-white shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            New Public Inquiry
          </Link>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: "ALL", label: "All Leads" },
            { id: "NEW", label: "New Unassigned" },
            { id: "FOLLOW_UP", label: "Needs Follow-up" },
            { id: "CORPORATE", label: "Corporate Mall" },
            { id: "PRIVATE", label: "Private Events" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                activeFilter === tab.id
                  ? "bg-[#252824] text-white shadow-sm"
                  : "bg-[#FFFEFB] border border-[#E2DED4] text-[#6B706C] hover:text-[#252824]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#6B706C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search lead or venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#FFFEFB] border border-[#E2DED4] text-xs text-[#252824] placeholder-[#6B706C]/70 rounded-md pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#B99A5B] focus:border-[#B99A5B] transition shadow-sm"
          />
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-[#FFFEFB] border border-[#E2DED4] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F6F3EC] border-b border-[#E2DED4] text-[10px] font-mono uppercase tracking-wider text-[#6B706C]">
                <th className="py-3 px-4 font-semibold">Lead ID &amp; Event</th>
                <th className="py-3 px-4 font-semibold">Client / Company</th>
                <th className="py-3 px-4 font-semibold">Target Date</th>
                <th className="py-3 px-4 font-semibold">Venue &amp; City</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2DED4]/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#6B706C]">
                    Loading leads...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#6B706C]">
                    No leads found matching current filter.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className="hover:bg-[#F6F3EC]/70 cursor-pointer transition"
                  >
                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] text-[#A92F3A] font-bold block">
                        {lead.bookingNumber}
                      </span>
                      <span className="font-semibold text-[#252824] block mt-0.5">
                        {lead.eventName}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[#252824] font-medium block">
                        {lead.client?.companyName || lead.client?.contactPerson || "Direct Client"}
                      </span>
                      <span className="text-[11px] text-[#6B706C] block">
                        {lead.bookingType.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[#252824]">
                      {new Date(lead.eventDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[#252824] block">{lead.mallOrVenue}</span>
                      <span className="text-[11px] text-[#6B706C] block">{lead.locationCity}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-[#FFF9E6] text-[#8C6207] border border-[#FDE047] font-mono">
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLead(lead);
                        }}
                        className="px-2.5 py-1 text-[11px] font-medium rounded bg-[#F6F3EC] hover:bg-[#E2DED4] text-[#252824] transition"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Detail Drawer */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-lg bg-[#FFFEFB] border-l border-[#E2DED4] h-full overflow-y-auto p-6 space-y-6 shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2DED4]">
              <div>
                <span className="font-mono text-xs text-[#A92F3A] font-bold">
                  {selectedLead.bookingNumber}
                </span>
                <h2 className="text-xl font-serif font-bold text-[#252824]">
                  {selectedLead.eventName}
                </h2>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-1 rounded-md text-[#6B706C] hover:text-[#252824] hover:bg-[#F6F3EC]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Event Specs */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#6B706C]">
                Event Specifications
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-[#F6F3EC]">
                  <span className="text-[#6B706C] block text-[11px]">Venue &amp; Mall</span>
                  <strong className="text-[#252824] block mt-0.5">{selectedLead.mallOrVenue}</strong>
                </div>
                <div className="p-3 rounded-lg bg-[#F6F3EC]">
                  <span className="text-[#6B706C] block text-[11px]">Event Date</span>
                  <strong className="text-[#252824] block mt-0.5">
                    {new Date(selectedLead.eventDate).toLocaleDateString()}
                  </strong>
                </div>
                <div className="p-3 rounded-lg bg-[#F6F3EC]">
                  <span className="text-[#6B706C] block text-[11px]">Call Time / Show</span>
                  <strong className="text-[#252824] block mt-0.5">
                    {selectedLead.callTime || "Standard"} • {selectedLead.startTime || "4:00 PM"}
                  </strong>
                </div>
                <div className="p-3 rounded-lg bg-[#F6F3EC]">
                  <span className="text-[#6B706C] block text-[11px]">Client Budget / Quote</span>
                  <strong className="text-[#A92F3A] block mt-0.5">
                    ₱{Number(selectedLead.clientQuotedAmount || 18000).toLocaleString()}
                  </strong>
                </div>
              </div>
            </div>

            {/* Client Info */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#6B706C]">
                Client &amp; Contact
              </h3>
              <div className="p-4 rounded-lg bg-[#F6F3EC] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#6B706C]">Company:</span>
                  <strong className="text-[#252824]">
                    {selectedLead.client?.companyName || "Direct / Private"}
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6B706C]">Contact Liaison:</span>
                  <strong className="text-[#252824]">
                    {selectedLead.client?.contactPerson || "Not provided"}
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6B706C]">Email:</span>
                  <span className="text-[#252824] font-mono">
                    {selectedLead.client?.email || "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6B706C]">Phone:</span>
                  <span className="text-[#252824] font-mono">
                    {selectedLead.client?.phone || "0927 887 2343 (Verify)"}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-[#E2DED4] space-y-2">
              <Link
                href={`/admin/bookings/${selectedLead.id}`}
                className="w-full py-2.5 px-4 rounded-lg bg-[#A92F3A] hover:bg-[#8E252F] text-white text-xs font-semibold flex items-center justify-center transition"
              >
                Open Full Booking Workspace <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
              <Link
                href={`/admin/quotes?bookingId=${selectedLead.id}`}
                className="w-full py-2 px-4 rounded-lg bg-[#FFFEFB] hover:bg-[#F6F3EC] border border-[#E2DED4] text-[#252824] text-xs font-medium flex items-center justify-center transition"
              >
                Create Official Quote
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
