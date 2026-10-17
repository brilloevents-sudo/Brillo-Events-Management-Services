"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Calendar,
  Building2,
  DollarSign,
  User,
  Clock,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Receipt,
  FileCheck2,
  ArrowLeft,
} from "lucide-react";
import { BOOKING_STATUS_CONFIG, BookingStatus } from "@/lib/booking-state";

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status mutation state
  const [targetStatus, setTargetStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  function loadBooking() {
    setLoading(true);
    fetch(`/api/bookings/${params.id}`)
      .then((res) => res.json())
      .then((d) => {
        if (d.success) setBooking(d.booking);
        else setError(d.error);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadBooking();
  }, [params.id]);

  async function handleStatusChange(newStatus: string) {
    setUpdating(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      loadBooking();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="p-12 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-400"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-12 text-center text-slate-400 text-xs">
        Booking not found.
      </div>
    );
  }

  const statusMeta = BOOKING_STATUS_CONFIG[booking.status as BookingStatus] || {
    label: booking.status,
    color: "bg-slate-800 text-slate-300",
  };

  const talent = booking.talentAssignments[0]?.talent;
  const eventDateObj = new Date(booking.eventDate);

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/bookings"
            className="p-2 rounded-lg bg-obsidian-900 border border-slate-800 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-gold-400 font-bold text-sm">
                {booking.bookingNumber}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${statusMeta.color}`}>
                {statusMeta.label}
              </span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight mt-0.5">
              {booking.eventName}
            </h1>
          </div>
        </div>

        {/* Quick Status Gate Action */}
        <div className="flex items-center space-x-2">
          {booking.status === "AWAITING_STAFF_APPROVAL" && (
            <button
              onClick={() => handleStatusChange("SECURED_UNASSIGNED")}
              disabled={updating}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white flex items-center shadow-md transition disabled:opacity-50"
            >
              <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
              Confirm as Secured
            </button>
          )}

          {booking.status === "TEMPORARY_HOLD" && (
            <button
              onClick={() => handleStatusChange("AWAITING_STAFF_APPROVAL")}
              disabled={updating}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-amber-700 hover:bg-amber-600 text-white flex items-center shadow-md transition disabled:opacity-50"
            >
              <Clock className="w-3.5 h-3.5 mr-1.5" />
              Route to Staff Review
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
        {/* Left Column: Details (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          {/* Logistics Card */}
          <div className="p-5 rounded-xl bg-obsidian-900 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center">
              <Building2 className="w-4 h-4 mr-2 text-gold-400" />
              Appearance &amp; Logistics Overview
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400">Mall / Venue:</span>
                <div className="font-semibold text-white text-sm mt-0.5">{booking.mallOrVenue}</div>
                <div className="text-slate-400 mt-0.5">{booking.venueAddress || "Address on file"}</div>
              </div>

              <div>
                <span className="text-slate-400">Date &amp; Schedule:</span>
                <div className="font-semibold text-white text-sm mt-0.5">
                  {eventDateObj.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                </div>
                <div className="text-slate-400 mt-0.5">
                  Call: <strong className="text-slate-200">{booking.callTime || "13:00"}</strong> | Event: {booking.startTime || "14:00"} - {booking.endTime || "18:00"}
                </div>
              </div>
            </div>

            {booking.holdExpiresAt && (
              <div className="p-3 rounded-lg bg-amber-950/60 border border-amber-800/80 text-amber-200 flex items-center justify-between">
                <div>
                  <strong className="block font-semibold">24-Hour Temporary Hold Active</strong>
                  <span className="text-[11px] font-mono text-amber-300">
                    Expires: {new Date(booking.holdExpiresAt).toLocaleString()}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-amber-400">
                  {booking.isHoldExpired ? "EXPIRED" : "SLOT RESERVED"}
                </span>
              </div>
            )}
          </div>

          {/* Assigned Santa Card */}
          <div className="p-5 rounded-xl bg-obsidian-900 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center">
              <User className="w-4 h-4 mr-2 text-emerald-400" />
              Assigned Talent &amp; Crew
            </h2>

            {talent ? (
              <div className="flex items-center justify-between p-3.5 rounded-lg bg-obsidian-950 border border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-obsidian-900 border border-slate-700">
                    {talent.images[0]?.publicUrl ? (
                      <img src={talent.images[0].publicUrl} alt={talent.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-gold-400">
                        {talent.displayName.slice(0, 2)}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Santa {talent.displayName}</div>
                    <div className="text-xs text-slate-400 font-mono">{talent.canonicalId} • {talent.nationality || "Real Beard"}</div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-slate-400 text-[11px]">Agreed Internal TF:</span>
                  <div className="text-sm font-mono font-bold text-emerald-400">
                    ₱{Number(booking.talentAssignments[0]?.agreedTalentFee || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center rounded-lg bg-obsidian-950 border border-slate-800 text-slate-500 font-mono">
                No Santa assigned yet. Use Quick Action to assign talent.
              </div>
            )}
          </div>

          {/* Status Timeline History */}
          <div className="p-5 rounded-xl bg-obsidian-900 border border-slate-800 space-y-3">
            <h2 className="text-sm font-bold text-white flex items-center">
              <Clock className="w-4 h-4 mr-2 text-slate-400" />
              Status Audit History
            </h2>

            <div className="space-y-2 border-l-2 border-slate-800 pl-4 ml-1">
              {booking.statusHistory?.map((h: any) => (
                <div key={h.id} className="text-xs space-y-0.5">
                  <div className="flex items-center space-x-2 font-mono text-[10px] text-slate-500">
                    <span>{new Date(h.createdAt).toLocaleString()}</span>
                    <span>•</span>
                    <span className="text-slate-400">{h.actor}</span>
                  </div>
                  <div className="font-semibold text-slate-200">
                    {h.fromStatus} → {h.toStatus}
                  </div>
                  {h.reason && <p className="text-slate-400 italic text-[11px]">{h.reason}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Financials & Contract (1 col) */}
        <div className="space-y-6">
          {/* Financial Summary */}
          <div className="p-5 rounded-xl bg-obsidian-900 border border-slate-800 space-y-3">
            <h2 className="text-sm font-bold text-white flex items-center">
              <DollarSign className="w-4 h-4 mr-1 text-gold-400" />
              Financial Ledger
            </h2>

            <div className="space-y-2 pt-1 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Quoted Amount:</span>
                <span className="font-bold text-white">₱{Number(booking.totalContractAmount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Required Downpayment:</span>
                <span className="text-slate-300">₱{Number(booking.depositRequired || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-1">
                <span className="text-slate-400">Verified Cash Received:</span>
                <span className="font-bold text-emerald-400">₱{Number(booking.depositPaid || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Balance Outstanding:</span>
                <span className="font-bold text-rose-400">₱{Number(booking.balanceDue || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Client Account */}
          <div className="p-5 rounded-xl bg-obsidian-900 border border-slate-800 space-y-3">
            <h2 className="text-sm font-bold text-white">Client Information</h2>
            <div className="space-y-1 text-xs">
              <div className="text-white font-semibold text-sm">{booking.client?.companyName}</div>
              <div className="text-slate-400">Contact: {booking.client?.primaryContact}</div>
              <div className="text-slate-400">Email: {booking.client?.email}</div>
              <div className="text-slate-400">Phone: {booking.client?.phone}</div>
            </div>
          </div>

          {/* Contract Archive */}
          <div className="p-5 rounded-xl bg-obsidian-900 border border-slate-800 space-y-3">
            <h2 className="text-sm font-bold text-white flex items-center">
              <FileCheck2 className="w-4 h-4 mr-1.5 text-purple-400" />
              Service Contract
            </h2>

            {booking.contracts?.length > 0 ? (
              <div className="p-3 rounded-lg bg-obsidian-950 border border-slate-800 space-y-1 text-xs">
                <div className="font-semibold text-white">{booking.contracts[0].title}</div>
                <div className="font-mono text-[10px] text-slate-400">Version: {booking.contracts[0].version} ({booking.contracts[0].templateType})</div>
                <div className="text-emerald-400 font-semibold text-[11px] pt-1">Status: {booking.contracts[0].status}</div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 font-mono">No contract generated yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
