"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  FileCheck2,
  Users2,
  Receipt,
  Wallet,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Mail,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  UserCheck,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  Inbox,
  Filter,
  RefreshCw,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = () => {
    setLoading(true);
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((d) => {
        if (d.success) setData(d);
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A92F3A]"></div>
          <span className="text-xs text-[#6B706C] font-mono uppercase tracking-wider">
            Loading Operations Overview...
          </span>
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const queues = data?.queues || {};

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* 1. Page Header (Codex Section 6) */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-6 border-b border-[#E2DED4]">
        <div>
          <div className="flex items-center space-x-2 text-[11px] font-mono uppercase tracking-widest text-[#B99A5B] font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Executive Command Center</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#252824] tracking-tight mt-1">
            Operations Overview
          </h1>
          <p className="text-xs text-[#6B706C] mt-1.5">
            Brillo Events Management Service • Philippine Standard Time (PST, UTC+8) • 2026 Master Operations
          </p>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="flex items-center space-x-2.5">
          <div className="px-3 py-1.5 rounded-lg bg-[#FFFEFB] border border-[#E2DED4] text-xs flex items-center space-x-2 shadow-sm">
            <span
              className={`w-2 h-2 rounded-full ${
                queues.emailConnectionStatus === "CONNECTED"
                  ? "bg-emerald-500"
                  : "bg-amber-500 animate-pulse"
              }`}
            />
            <span className="text-[#6B706C] font-mono text-[11px]">
              Mailbox: <strong className="text-[#252824]">{queues.emailConnectionStatus}</strong>
            </span>
          </div>

          <Link
            href="/admin/import"
            className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[#FFFEFB] hover:bg-[#F6F3EC] border border-[#E2DED4] text-[#252824] shadow-sm transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-[#B99A5B]" />
            Import Center
          </Link>

          <Link
            href="/admin/bookings"
            className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[#A92F3A] hover:bg-[#8E252F] text-white shadow-sm transition"
          >
            + New Booking
          </Link>
        </div>
      </div>

      {/* 2. Priority "Needs Attention" Queue (Codex Section 6) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-[#A92F3A]" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#252824]">
              Priority Action Items (Needs Attention Today)
            </h2>
          </div>
          <span className="text-[11px] text-[#6B706C]">Live operational triage</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Item 1: Pending Staff Approval */}
          <Link
            href="/admin/bookings?status=AWAITING_STAFF_APPROVAL"
            className="p-4 rounded-xl bg-[#FFFEFB] border border-[#E2DED4] hover:border-[#B99A5B] transition group shadow-sm block relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#6B706C] font-medium">Awaiting Staff Signoff</span>
              <span className="p-1.5 rounded-md bg-purple-50 text-purple-700">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl font-serif font-bold text-[#252824] mt-2">
              {queues.pendingStaffApprovalBookings || 0}
            </div>
            <p className="text-[11px] text-[#6B706C] mt-1">Dual-gate approval before roster lock</p>
            <div className="mt-3 flex items-center text-[11px] font-semibold text-[#A92F3A] group-hover:translate-x-0.5 transition">
              Review queue <ArrowRight className="w-3 h-3 ml-1" />
            </div>
          </Link>

          {/* Item 2: Active 24-Hour Holds */}
          <Link
            href="/admin/bookings?status=TEMPORARY_HOLD"
            className="p-4 rounded-xl bg-[#FFFEFB] border border-[#E2DED4] hover:border-amber-400 transition group shadow-sm block relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#6B706C] font-medium">Active 24h Holds</span>
              <span className="p-1.5 rounded-md bg-amber-50 text-amber-700">
                <Clock className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl font-serif font-bold text-amber-700 mt-2">
              {queues.activeTemporaryHolds || 0}
            </div>
            <p className="text-[11px] text-[#6B706C] mt-1">Calendar holds expiring without deposit</p>
            <div className="mt-3 flex items-center text-[11px] font-semibold text-amber-800 group-hover:translate-x-0.5 transition">
              Inspect holds <ArrowRight className="w-3 h-3 ml-1" />
            </div>
          </Link>

          {/* Item 3: Source Conflicts */}
          <Link
            href="/admin/conflicts"
            className="p-4 rounded-xl bg-[#FFFEFB] border border-[#E2DED4] hover:border-[#A92F3A] transition group shadow-sm block relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#6B706C] font-medium">Source Conflicts</span>
              <span className="p-1.5 rounded-md bg-rose-50 text-[#A92F3A]">
                <AlertTriangle className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl font-serif font-bold text-[#A92F3A] mt-2">
              {queues.unresolvedSourceConflicts || 0}
            </div>
            <p className="text-[11px] text-[#6B706C] mt-1">Date typos `20206`, debt notes, names</p>
            <div className="mt-3 flex items-center text-[11px] font-semibold text-[#A92F3A] group-hover:translate-x-0.5 transition">
              Triage conflicts <ArrowRight className="w-3 h-3 ml-1" />
            </div>
          </Link>

          {/* Item 4: Unread Inbox */}
          <Link
            href="/admin/inbox"
            className="p-4 rounded-xl bg-[#FFFEFB] border border-[#E2DED4] hover:border-blue-400 transition group shadow-sm block relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#6B706C] font-medium">Customer Inquiries</span>
              <span className="p-1.5 rounded-md bg-blue-50 text-blue-700">
                <Inbox className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl font-serif font-bold text-blue-700 mt-2">
              {queues.unreadInboxMessages || 0}
            </div>
            <p className="text-[11px] text-[#6B706C] mt-1">Incoming quote requests &amp; emails</p>
            <div className="mt-3 flex items-center text-[11px] font-semibold text-blue-800 group-hover:translate-x-0.5 transition">
              Open inbox <ArrowRight className="w-3 h-3 ml-1" />
            </div>
          </Link>
        </div>
      </div>

      {/* 3. Real Backend Metrics (Codex Section 6) */}
      <div className="space-y-3">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#252824]">
          Financial &amp; Roster Metrics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#FFFEFB] border border-[#E2DED4] shadow-sm">
            <span className="text-xs text-[#6B706C] font-medium">Total Bookings on Register</span>
            <div className="text-2xl font-serif font-bold text-[#252824] mt-1.5">
              {metrics.totalBookings || 0}
            </div>
            <div className="flex items-center space-x-2 mt-2 text-[11px] text-[#6B706C]">
              <span className="text-emerald-700 font-semibold">{metrics.securedBookings || 0} Secured</span>
              <span>•</span>
              <span>{metrics.completedBookings || 0} Delivered</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#FFFEFB] border border-[#E2DED4] shadow-sm">
            <span className="text-xs text-[#6B706C] font-medium">Verified Revenue Cleared</span>
            <div className="text-2xl font-serif font-bold text-emerald-800 mt-1.5">
              ₱{Number(metrics.totalVerifiedRevenue || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-[#6B706C] mt-2">
              Audited bank deposits only (unverified slips excluded)
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#FFFEFB] border border-[#E2DED4] shadow-sm">
            <span className="text-xs text-[#6B706C] font-medium">Outstanding Receivables</span>
            <div className="text-2xl font-serif font-bold text-[#A92F3A] mt-1.5">
              ₱{Number(metrics.totalOutstandingReceivables || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-[#6B706C] mt-2">
              Collectibles tied to executed booking contracts
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#FFFEFB] border border-[#E2DED4] shadow-sm">
            <span className="text-xs text-[#6B706C] font-medium">Paluwal (Talent Advances)</span>
            <div className="text-2xl font-serif font-bold text-[#B99A5B] mt-1.5">
              ₱{Number(metrics.totalPaluwalAdvances || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-[#6B706C] mt-2">
              Advances logged in immutable ledger
            </div>
          </div>
        </div>
      </div>

      {/* 4. Core Operational Workspaces Gateway */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Link
          href="/admin/individual-talent-bookings"
          className="p-6 rounded-xl bg-[#FFFEFB] border border-[#E2DED4] hover:border-[#B99A5B] transition group shadow-sm block"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-[#8C6207] border border-[#B99A5B]/30 font-mono">
                Mandatory Operational Module
              </span>
              <h3 className="text-lg font-serif font-bold text-[#252824] group-hover:text-[#A92F3A] transition">
                Individual Talent Bookings
              </h3>
              <p className="text-xs text-[#6B706C] leading-relaxed">
                Answer &quot;Who booked this Santa?&quot; across multi-day mall appearances, solo private bookings, and custom negotiated fee schedules.
              </p>
            </div>
            <div className="p-2 rounded-lg bg-[#F6F3EC] group-hover:bg-[#E2DED4] transition">
              <ArrowUpRight className="w-5 h-5 text-[#6B706C] group-hover:text-[#252824]" />
            </div>
          </div>
        </Link>

        <Link
          href="/admin/talents"
          className="p-6 rounded-xl bg-[#FFFEFB] border border-[#E2DED4] hover:border-[#A92F3A] transition group shadow-sm block"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-[#A92F3A] border border-[#A92F3A]/20 font-mono">
                Real Portrait Archives
              </span>
              <h3 className="text-lg font-serif font-bold text-[#252824] group-hover:text-[#A92F3A] transition">
                Santa Talent Roster &amp; Profiles
              </h3>
              <p className="text-xs text-[#6B706C] leading-relaxed">
                28 extracted portraits across 14 performers, costume measurements, beard authenticity, and public client display authorizations.
              </p>
            </div>
            <div className="p-2 rounded-lg bg-[#F6F3EC] group-hover:bg-[#E2DED4] transition">
              <ArrowUpRight className="w-5 h-5 text-[#6B706C] group-hover:text-[#252824]" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
