"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileCheck2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ArrowRight,
  FileSpreadsheet,
  Sparkles,
  ShieldAlert,
  Inbox,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import {
  normalizeToLifecycleState,
  LIFECYCLE_METADATA,
} from "@/lib/booking-state-machine";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [fallbackQueue, setFallbackQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/dashboard").then((r) => r.json()),
      fetch("/api/bookings").then((r) => r.json()).catch(() => ({ bookings: [] })),
    ])
      .then(([d, bData]) => {
        if (d.success) setData(d);
        if (bData?.bookings) setFallbackQueue(bData.bookings.slice(0, 10));
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9B1B30]"></div>
          <span className="text-xs text-[#756568] font-mono uppercase tracking-wider">
            Loading Executive Command Center...
          </span>
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const queues = data?.queues || {};
  const actionQueue: any[] =
    data?.immediateActionQueue && data.immediateActionQueue.length > 0
      ? data.immediateActionQueue
      : fallbackQueue;

  const inquiryCount = Number(queues.unreadInboxMessages || 0);
  const holdsCount = Number(queues.activeTemporaryHolds || 0);
  const signoffCount = Number(queues.pendingStaffApprovalBookings || 0);
  const conflictCount = Number(queues.unresolvedSourceConflicts || 0);

  const dynamicConflictSubtitle =
    queues.dynamicConflictSubtitle ||
    (conflictCount > 0
      ? `${conflictCount} source & schedule audit flags requiring review`
      : "Zero unresolved schedule or import anomalies");

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* 1. Executive Header (Cleaned: No developer outbox pill in header) */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-6 border-b border-[#E8DFE0]">
        <div>
          <div className="flex items-center space-x-2 text-[11px] font-mono uppercase tracking-widest text-[#C68A12] font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Executive Command Center</span>
          </div>
          <h1 className="page-title text-3xl font-serif tracking-tight mt-1">
            Operations Overview
          </h1>
          <p className="page-subtitle text-xs mt-1.5">
            Chronological lifecycle triage: Inquiry → Quote &amp; Contract → Dual-Gate Signoff → Dispatch &amp; Settlement
          </p>
        </div>

        {/* Clean Operational Action Shortcuts */}
        <div className="flex items-center space-x-2.5">
          <Link
            href="/admin/import"
            className="inline-flex items-center px-3.5 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-[#F4ECEE] border border-[#E8DFE0] text-[#1E1416] shadow-sm transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-[#C68A12]" />
            Import Center
          </Link>

          <Link
            href="/admin/quotes"
            className="inline-flex items-center px-3.5 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-[#F4ECEE] border border-[#E8DFE0] text-[#1E1416] shadow-sm transition"
          >
            + Issue Quote
          </Link>

          <Link
            href="/admin/bookings"
            className="btn-primary inline-flex items-center px-4 py-2 rounded-lg text-xs font-semibold transition"
          >
            + New Booking
          </Link>
        </div>
      </div>

      {/* 2. Priority Action Items — 4 Cards in Strict Chronological Order */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-[#9B1B30]" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#1E1416]">
              Priority Action Items (Chronological Lifecycle Gates)
            </h2>
          </div>
          <span className="text-[11px] text-[#756568]">
            Zero-count stages automatically dimmed to highlight active bottlenecks
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Stage 1 — Customer Inquiries */}
          <Link
            href="/admin/crm"
            className={`dashboard-card p-4 transition group block relative overflow-hidden ${
              inquiryCount === 0 ? "opacity-75" : "hover:border-[#C68A12]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#4A3A3D] font-semibold">
                1. Customer Inquiries
              </span>
              <span className="p-1.5 rounded-lg bg-[#FDF6E7] text-[#C68A12]">
                <Inbox className="w-4 h-4" />
              </span>
            </div>
            <div
              className={`text-2xl font-serif font-bold mt-2 ${
                inquiryCount === 0 ? "text-[#756568]" : "text-[#1E1416]"
              }`}
            >
              {inquiryCount}
            </div>
            <p className="text-[11px] text-[#756568] mt-1">
              Incoming B2B mall &amp; private event leads
            </p>
            <div className="mt-3 flex items-center text-[11px] font-semibold text-[#9B1B30] group-hover:translate-x-0.5 transition">
              Open CRM Pipeline <ArrowRight className="w-3 h-3 ml-1" />
            </div>
          </Link>

          {/* Card 2: Stage 2 — Active 24h Holds */}
          <Link
            href="/admin/calendar"
            className={`dashboard-card p-4 transition group block relative overflow-hidden ${
              holdsCount === 0 ? "opacity-75" : "hover:border-[#C68A12]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#4A3A3D] font-semibold">
                2. Active 24h Holds
              </span>
              <span className="p-1.5 rounded-lg bg-[#FDF6E7] text-[#C68A12]">
                <Clock className="w-4 h-4" />
              </span>
            </div>
            <div
              className={`text-2xl font-serif font-bold mt-2 ${
                holdsCount === 0 ? "text-[#756568]" : "text-[#C68A12]"
              }`}
            >
              {holdsCount}
            </div>
            <p className="text-[11px] text-[#756568] mt-1">
              Soft-held dates awaiting quote &amp; deposit
            </p>
            <div className="mt-3 flex items-center text-[11px] font-semibold text-[#8A5E08] group-hover:translate-x-0.5 transition">
              Inspect Calendar Holds <ArrowRight className="w-3 h-3 ml-1" />
            </div>
          </Link>

          {/* Card 3: Stage 3 — Awaiting Staff Signoff (Red Velvet Highlight when > 0) */}
          <Link
            href="/admin/bookings?tab=AWAITING_SIGNOFF"
            className={`p-4 rounded-xl transition group block relative overflow-hidden ${
              signoffCount > 0
                ? "bg-[#FFFFFF] border-2 border-[#9B1B30] shadow-md ring-2 ring-[#9B1B30]/10"
                : "dashboard-card opacity-75"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#1E1416] font-bold">
                3. Awaiting Staff Signoff
              </span>
              <span className="p-1.5 rounded-lg bg-[#F9EBED] text-[#9B1B30]">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            </div>
            <div
              className={`text-3xl font-serif font-black mt-2 ${
                signoffCount > 0 ? "text-[#9B1B30]" : "text-[#756568]"
              }`}
            >
              {signoffCount}
            </div>
            <p className="text-[11px] text-[#4A3A3D] mt-1">
              Dual-gate approval before locking roster
            </p>
            <div className="mt-3 flex items-center text-[11px] font-bold text-[#9B1B30] group-hover:translate-x-0.5 transition">
              Execute Dual-Gate Signoff <ArrowRight className="w-3 h-3 ml-1" />
            </div>
          </Link>

          {/* Card 4: Stage 4 — Data & Schedule Conflicts (Dynamic Validation Count) */}
          <Link
            href="/admin/conflicts"
            className={`dashboard-card p-4 transition group block relative overflow-hidden ${
              conflictCount === 0 ? "opacity-75" : "hover:border-[#9B1B30]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#4A3A3D] font-semibold">
                4. Data &amp; Schedule Conflicts
              </span>
              <span className="p-1.5 rounded-lg bg-[#F9EBED] text-[#9B1B30]">
                <AlertTriangle className="w-4 h-4" />
              </span>
            </div>
            <div
              className={`text-2xl font-serif font-bold mt-2 ${
                conflictCount > 0 ? "text-[#9B1B30]" : "text-[#756568]"
              }`}
            >
              {conflictCount}
            </div>
            <p className="text-[11px] text-[#756568] mt-1 truncate" title={dynamicConflictSubtitle}>
              {dynamicConflictSubtitle}
            </p>
            <div className="mt-3 flex items-center text-[11px] font-semibold text-[#9B1B30] group-hover:translate-x-0.5 transition">
              Audit &amp; Reconcile <ArrowRight className="w-3 h-3 ml-1" />
            </div>
          </Link>
        </div>
      </div>

      {/* 3. Immutable Financial & Roster Metrics */}
      <div className="space-y-3">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#1E1416]">
          Immutable Financial &amp; Roster Ledger Metrics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="dashboard-card p-4">
            <span className="text-xs text-[#4A3A3D] font-semibold">
              Total Bookings on Register
            </span>
            <div className="text-2xl font-serif font-bold text-[#1E1416] mt-1.5">
              {metrics.totalBookings || 0}
            </div>
            <div className="flex items-center space-x-2 mt-2 text-[11px] text-[#756568]">
              <span className="text-emerald-700 font-semibold">
                {metrics.securedBookings || 0} Locked
              </span>
              <span>•</span>
              <span>{metrics.completedBookings || 0} Delivered</span>
            </div>
          </div>

          <div className="dashboard-card p-4">
            <span className="text-xs text-[#4A3A3D] font-semibold">
              Verified Revenue Cleared
            </span>
            <div className="text-2xl font-serif font-bold text-emerald-700 mt-1.5">
              ₱{Number(metrics.totalVerifiedRevenue || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-[#756568] mt-2">
              Xendit &amp; audited bank deposits (append-only ledger)
            </div>
          </div>

          <div className="dashboard-card p-4">
            <span className="text-xs text-[#4A3A3D] font-semibold">
              Outstanding Receivables
            </span>
            <div className="text-2xl font-serif font-bold text-[#9B1B30] mt-1.5">
              ₱{Number(metrics.totalOutstandingReceivables || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-[#756568] mt-2">
              Collectibles tied to executed contracts
            </div>
          </div>

          <div className="dashboard-card p-4">
            <span className="text-xs text-[#4A3A3D] font-semibold">
              Paluwal (Talent Advances)
            </span>
            <div className="text-2xl font-serif font-bold text-[#C68A12] mt-1.5">
              ₱{Number(metrics.totalPaluwalAdvances || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-[#756568] mt-2">
              Pre-event advances tracked for settlement offset
            </div>
          </div>
        </div>
      </div>

      {/* 4. Live Immediate Action Queue & 7-Day Dispatch Table (Replaces static promo cards) */}
      <div className="dashboard-card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#E8DFE0] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <span className="badge-esign px-2 py-0.5 rounded text-[10px] font-mono">
                LIVE TRIAGE QUEUE
              </span>
              <h3 className="text-sm font-bold text-[#1E1416]">
                Immediate Action Queue &amp; 7-Day Dispatch
              </h3>
            </div>
            <p className="text-[11px] text-[#756568] mt-0.5">
              Top bookings awaiting contract generation, deposit verification, or Dual-Gate staff signoff.
            </p>
          </div>
          <Link
            href="/admin/bookings?tab=AWAITING_SIGNOFF"
            className="text-xs font-semibold text-[#9B1B30] hover:underline inline-flex items-center"
          >
            View All {signoffCount || metrics.totalBookings || ""} Queue Records
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {actionQueue.length === 0 ? (
          <div className="p-10 text-center text-xs text-[#756568]">
            All immediate commercial and dispatch gates are clear.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E8DFE0] bg-[#FCF9F8] text-[10px] font-mono text-[#756568] uppercase tracking-wider">
                  <th className="p-3.5">Booking Ref &amp; Venue</th>
                  <th className="p-3.5">Event Date</th>
                  <th className="p-3.5">Assigned Santa</th>
                  <th className="p-3.5">Commercial Gate</th>
                  <th className="p-3.5">Lifecycle State</th>
                  <th className="p-3.5 text-right">Next Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DFE0]">
                {actionQueue.slice(0, 8).map((b: any) => {
                  const lifecycleState = normalizeToLifecycleState(b.status);
                  const meta = LIFECYCLE_METADATA[lifecycleState];
                  const assigned = b.talentAssignments?.[0]?.talent;
                  const hasContract = (b.contracts || []).length > 0;
                  const depositPaid = Number(b.depositPaid || 0);
                  const contractAmt = Number(b.totalContractAmount || 24000);

                  let parsedMeta: any = b.ledgerMeta || {};
                  if (
                    !b.ledgerMeta &&
                    typeof b.internalNotes === "string" &&
                    b.internalNotes.includes("||LEDGER_META:")
                  ) {
                    try {
                      parsedMeta = JSON.parse(b.internalNotes.split("||LEDGER_META:")[1]);
                    } catch {}
                  }
                  const tierLabel =
                    parsedMeta.santaTier === "FAKE_BEARD"
                      ? "🎭 Fake Beard"
                      : "🎅 Real Beard • Limited";
                  const activityLabel =
                    parsedMeta.eventActivityLabel ||
                    ((b.bookingType || "").includes("PRIVATE")
                      ? "Private Party"
                      : "Meet & Greet");

                  return (
                    <tr key={b.id} className="hover:bg-[#F4ECEE]/60 transition">
                      <td className="p-3.5">
                        <div className="font-mono font-bold text-[#9B1B30] text-[11px]">
                          {b.bookingNumber}
                        </div>
                        <div className="font-semibold text-[#1E1416] mt-0.5">
                          {b.mallOrVenue}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="px-1.5 py-0.5 rounded bg-[#F9EBED] text-[#9B1B30] border border-[#F0D0D5] font-mono text-[9px] font-semibold">
                            {tierLabel}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 font-mono text-[9px]">
                            {activityLabel}
                          </span>
                        </div>
                      </td>

                      <td className="p-3.5 font-mono text-[#4A3A3D]">
                        <div className="inline-flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-[#C68A12]" />
                          <span>
                            {new Date(b.eventDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#756568]">
                          {b.startTime || "14:00"} – {b.endTime || "18:00"}
                        </div>
                      </td>

                      <td className="p-3.5">
                        {assigned ? (
                          <span className="font-semibold text-[#1E1416]">
                            Santa {assigned.displayName}
                          </span>
                        ) : (
                          <span className="text-[11px] font-mono text-[#756568]">
                            Unassigned
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 font-mono text-[11px]">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-1.5 py-0.5 rounded border text-[10px] ${
                              hasContract
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : "bg-amber-50 text-amber-800 border-amber-200"
                            }`}
                          >
                            {hasContract ? "MOA ✓" : "No MOA"}
                          </span>
                          <span className="text-[#4A3A3D]">
                            ₱{depositPaid.toLocaleString()} / ₱{contractAmt.toLocaleString()}
                          </span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${meta.badgeClass}`}
                        >
                          {meta.label}
                        </span>
                      </td>

                      <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                        <Link
                          href="/admin/crm"
                          className="inline-flex items-center px-2.5 py-1 rounded-md bg-white border border-[#D6C7C9] text-[#1E1416] font-semibold text-[11px] hover:border-[#9B1B30] transition"
                        >
                          CRM / Edit
                        </Link>
                        {!hasContract && (
                          <Link
                            href={`/admin/quotes?bookingId=${b.id}`}
                            className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#F9EBED] text-[#9B1B30] border border-[#F0D0D5] font-semibold text-[11px] hover:bg-[#F3DCE0] transition"
                          >
                            <FileCheck2 className="w-3 h-3 mr-1" />
                            Quote
                          </Link>
                        )}
                        <Link
                          href="/admin/calendar"
                          className="inline-flex items-center px-2.5 py-1 rounded-md bg-white border border-[#D6C7C9] text-[#1E1416] font-semibold text-[11px] hover:border-[#9B1B30] transition"
                        >
                          <ShieldCheck className="w-3 h-3 mr-1 text-[#9B1B30]" />
                          Calendar →
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
