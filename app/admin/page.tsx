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
} from "lucide-react";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((d) => {
        if (d.success) setData(d);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-400"></div>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const queues = data?.queues || {};

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Top Welcome & Quick Summary */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center">
            Operations &amp; Executive Command Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Brillo Events Management Service • 2026 Master Holiday Deployment
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-3 py-1.5 rounded-lg bg-obsidian-900 border border-slate-800 text-xs flex items-center space-x-2">
            <span
              className={`w-2 h-2 rounded-full ${
                queues.emailConnectionStatus === "CONNECTED"
                  ? "bg-emerald-400"
                  : "bg-amber-400 animate-pulse"
              }`}
            />
            <span className="text-slate-300 font-mono text-[11px]">
              Mailbox: {queues.emailConnectionStatus}
            </span>
          </div>

          <Link
            href="/admin/import"
            className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-obsidian-850 hover:bg-obsidian-800 border border-slate-700 text-slate-200 transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-gold-400" />
            12-Sheet Excel Center
          </Link>
        </div>
      </div>

      {/* Critical Action Queues (Section F) */}
      <div className="space-y-2">
        <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
          Priority Operational Queues
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Queue 1: Pending Approvals */}
          <Link
            href="/admin/bookings?status=AWAITING_STAFF_APPROVAL"
            className="p-3.5 rounded-lg bg-obsidian-900 border border-gold-800/40 hover:border-gold-500/80 transition group block"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Pending Staff Approval</span>
              <CheckCircle2 className="w-4 h-4 text-gold-400" />
            </div>
            <div className="text-2xl font-bold text-gold-300 mt-1">
              {queues.pendingStaffApprovalBookings || 0}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Signed contracts needing verification</p>
          </Link>

          {/* Queue 2: Active Holds */}
          <Link
            href="/admin/bookings?status=TEMPORARY_HOLD"
            className="p-3.5 rounded-lg bg-obsidian-900 border border-amber-800/40 hover:border-amber-500/80 transition group block"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Active 24h Holds</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-300 mt-1">
              {queues.activeTemporaryHolds || 0}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Auto-release upon expiration</p>
          </Link>

          {/* Queue 3: Source Conflicts */}
          <Link
            href="/admin/conflicts"
            className="p-3.5 rounded-lg bg-obsidian-900 border border-crimson-800/40 hover:border-crimson-500/80 transition group block"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Source Conflicts</span>
              <AlertTriangle className="w-4 h-4 text-crimson-400" />
            </div>
            <div className="text-2xl font-bold text-crimson-300 mt-1">
              {queues.unresolvedSourceConflicts || 0}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Data reconciliation register</p>
          </Link>

          {/* Queue 4: Unread Inbox */}
          <Link
            href="/admin/inbox"
            className="p-3.5 rounded-lg bg-obsidian-900 border border-blue-800/40 hover:border-blue-500/80 transition group block"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Unread Messages</span>
              <Mail className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-blue-300 mt-1">
              {queues.unreadInboxMessages || 0}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Client inquiries &amp; threads</p>
          </Link>
        </div>
      </div>

      {/* Financial & Operational KPI Cards */}
      <div className="space-y-2 pt-2">
        <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
          Financial &amp; Deployment Summary
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-obsidian-900 border border-slate-800 shadow-sm">
            <span className="text-xs text-slate-400">Total Bookings on Register</span>
            <div className="text-2xl font-bold text-white mt-1">{metrics.totalBookings || 0}</div>
            <div className="flex items-center space-x-2 mt-2 text-[11px] text-slate-500">
              <span className="text-emerald-400 font-medium">
                {metrics.securedBookings || 0} Secured
              </span>
              <span>•</span>
              <span>{metrics.completedBookings || 0} Delivered</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-obsidian-900 border border-slate-800 shadow-sm">
            <span className="text-xs text-slate-400">Verified Cash Received</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              ₱{Number(metrics.totalVerifiedRevenue || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-2">
              From approved bank &amp; GCash receipts
            </div>
          </div>

          <div className="p-4 rounded-xl bg-obsidian-900 border border-slate-800 shadow-sm">
            <span className="text-xs text-slate-400">Outstanding Balance Due</span>
            <div className="text-2xl font-bold text-rose-400 mt-1">
              ₱{Number(metrics.totalOutstandingReceivables || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-2">
              Collectibles linked to signed agreements
            </div>
          </div>

          <div className="p-4 rounded-xl bg-obsidian-900 border border-slate-800 shadow-sm">
            <span className="text-xs text-slate-400">Paluwal (Talent Advances)</span>
            <div className="text-2xl font-bold text-gold-400 mt-1">
              ₱{Number(metrics.totalPaluwalAdvances || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-2">
              Advances logged in immutable ledger
            </div>
          </div>
        </div>
      </div>

      {/* Core Workflow Gateways */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <Link
          href="/admin/individual-talent-bookings"
          className="p-5 rounded-xl bg-gradient-to-br from-obsidian-900 to-obsidian-850 border border-slate-800 hover:border-gold-500/50 transition group shadow-md"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-gold-950 text-gold-300 border border-gold-800">
                Core Module
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-gold-300 transition">
                Individual Talent Bookings
              </h3>
              <p className="text-xs text-slate-400">
                Answer &quot;Who booked this Santa?&quot; with complete historical timelines, custom fees, and client provenance.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-gold-400 group-hover:translate-x-1 transition" />
          </div>
        </Link>

        <Link
          href="/admin/talents"
          className="p-5 rounded-xl bg-gradient-to-br from-obsidian-900 to-obsidian-850 border border-slate-800 hover:border-crimson-500/50 transition group shadow-md"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-crimson-950 text-crimson-300 border border-crimson-800">
                Extracted Photos
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-crimson-300 transition">
                Talent Roster &amp; Real Photos
              </h3>
              <p className="text-xs text-slate-400">
                Manage 13 real-beard Santas, 28 extracted portraits from DOCX archives, public approval flags, and rate cards.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-crimson-400 group-hover:translate-x-1 transition" />
          </div>
        </Link>
      </div>
    </div>
  );
}
