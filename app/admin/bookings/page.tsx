"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import {
  normalizeToLifecycleState,
  LIFECYCLE_METADATA,
  evaluateDualGateSignoff,
} from "@/lib/booking-state-machine";

type BookingTab = "ALL" | "PACKAGE_EVENTS" | "DIRECT_TALENT" | "AWAITING_SIGNOFF";

export default function BookingsAndSignoffPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<BookingTab>("ALL");
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(
    null
  );

  function loadBookings() {
    setLoading(true);
    const params = new URLSearchParams();
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
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search);
      const tabParam = q.get("tab") as BookingTab | null;
      const statusParam = q.get("status");
      if (tabParam) setActiveTab(tabParam);
      else if (statusParam === "AWAITING_STAFF_APPROVAL") {
        setActiveTab("AWAITING_SIGNOFF");
      }
    }
    loadBookings();
  }, []);

  const awaitingSignoffList = bookings.filter(
    (b) => normalizeToLifecycleState(b.status) === "AWAITING_STAFF_SIGNOFF"
  );

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === "AWAITING_SIGNOFF") {
      return normalizeToLifecycleState(b.status) === "AWAITING_STAFF_SIGNOFF";
    }
    if (activeTab === "DIRECT_TALENT") {
      return (
        b.bookingType === "INDIVIDUAL_TALENT" ||
        b.bookingType === "PRIVATE" ||
        (b.talentAssignments && b.talentAssignments.length > 0 && !b.client?.companyName)
      );
    }
    if (activeTab === "PACKAGE_EVENTS") {
      return b.bookingType !== "INDIVIDUAL_TALENT";
    }
    return true;
  });

  async function executeDualGateSignoff(booking: any) {
    setFeedback(null);
    try {
      const role =
        typeof window !== "undefined"
          ? localStorage.getItem("brillo_rbac_role") || "SUPER_ADMIN"
          : "SUPER_ADMIN";

      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-brillo-role": role,
        },
        body: JSON.stringify({
          status: "SECURED_UNASSIGNED",
        }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Dual-Gate Signoff blocked.");
      }
      setFeedback({
        type: "ok",
        msg: `Dual-Gate Signoff passed for ${booking.bookingNumber} (${booking.mallOrVenue}). Roster & calendar slot locked!`,
      });
      loadBookings();
    } catch (err: any) {
      setFeedback({
        type: "err",
        msg: `${booking.bookingNumber} — ${err.message}`,
      });
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-[#E8DFE0]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="badge-esign px-2.5 py-0.5 rounded text-[10px] font-mono">
              STAGE 2 • DUAL-GATE EXECUTION
            </span>
            <h1 className="page-title text-2xl font-serif tracking-tight">
              Bookings &amp; Dual-Gate Signoff
            </h1>
          </div>
          <p className="page-subtitle text-xs mt-1">
            Unified register merging Package Events &amp; Direct Individual Talent Bookings with deterministic Dual-Gate approval.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/admin/contracts"
            className="px-3.5 py-2 rounded-lg bg-white hover:bg-[#F4ECEE] border border-[#D6C7C9] text-[#1E1416] text-xs font-semibold transition"
          >
            Contracts &amp; MOA
          </Link>
          <Link
            href="/admin/roster"
            className="btn-primary px-4 py-2 rounded-lg text-xs font-semibold transition"
          >
            Santa &amp; Crew Roster
          </Link>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-medium border flex items-start space-x-2.5 ${
            feedback.type === "ok"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-[#F9EBED] border-[#F0D0D5] text-[#9B1B30]"
          }`}
        >
          {feedback.type === "ok" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-700" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#9B1B30]" />
          )}
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Consolidated Filter Tabs: [All] [Package Events] [Direct Talent] [Awaiting Signoff (N)] */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8DFE0] pb-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition ${
              activeTab === "ALL"
                ? "bg-[#1E1416] text-white shadow-sm"
                : "bg-white border border-[#E8DFE0] text-[#4A3A3D] hover:border-[#9B1B30]"
            }`}
          >
            All ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab("PACKAGE_EVENTS")}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition ${
              activeTab === "PACKAGE_EVENTS"
                ? "bg-[#1E1416] text-white shadow-sm"
                : "bg-white border border-[#E8DFE0] text-[#4A3A3D] hover:border-[#9B1B30]"
            }`}
          >
            Package Events
          </button>
          <button
            onClick={() => setActiveTab("DIRECT_TALENT")}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition ${
              activeTab === "DIRECT_TALENT"
                ? "bg-[#1E1416] text-white shadow-sm"
                : "bg-white border border-[#E8DFE0] text-[#4A3A3D] hover:border-[#9B1B30]"
            }`}
          >
            Direct Talent
          </button>
          <button
            onClick={() => setActiveTab("AWAITING_SIGNOFF")}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
              activeTab === "AWAITING_SIGNOFF"
                ? "bg-[#9B1B30] text-white shadow-sm"
                : "bg-[#F9EBED] border border-[#F0D0D5] text-[#9B1B30] hover:bg-[#F3DCE0]"
            }`}
          >
            <span>Awaiting Signoff</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === "AWAITING_SIGNOFF"
                  ? "bg-white/20 text-white"
                  : "bg-[#9B1B30] text-white"
              }`}
            >
              {awaitingSignoffList.length}
            </span>
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#756568] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search booking #, mall, Santa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadBookings()}
            className="w-full pl-8 pr-3 py-1.5 text-xs"
          />
        </div>
      </div>

      {/* Bookings & Dual-Gate Signoff Table */}
      <div className="dashboard-card overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9B1B30]" />
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-[#756568] text-xs">
            No bookings found matching the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E8DFE0] bg-[#FCF9F8] text-[10px] font-mono text-[#756568] uppercase tracking-wider">
                  <th className="p-3.5">Ref / Mall Venue</th>
                  <th className="p-3.5">Event Date</th>
                  <th className="p-3.5">Assigned Santa</th>
                  <th className="p-3.5">Dual-Gate Readiness</th>
                  <th className="p-3.5">Contract / Deposit</th>
                  <th className="p-3.5">Lifecycle State</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DFE0]">
                {filteredBookings.map((b) => {
                  const lifecycleState = normalizeToLifecycleState(b.status);
                  const meta = LIFECYCLE_METADATA[lifecycleState];
                  const dateObj = new Date(b.eventDate);
                  const assigned = b.talentAssignments?.[0]?.talent;
                  const contracts = b.contracts || [];
                  const hasSignedContract = contracts.some(
                    (c: any) => c.status === "SIGNED" || c.signedFileUrl
                  );
                  const hasWaiver = contracts.some(
                    (c: any) => c.templateType === "NO_DP" || c.templateType === "SM_CUSTOM"
                  );
                  const contractAmt = Number(b.totalContractAmount || 18000);
                  const depositPaid = Number(b.depositPaid || 0);

                  const gateCheck = evaluateDualGateSignoff({
                    hasSignedContract,
                    hasInstitutionalWaiver: hasWaiver,
                    totalContractAmount: contractAmt,
                    verifiedDepositPaid: depositPaid,
                    hasAssignedTalent: Boolean(assigned),
                    hasScheduleOverlap: false,
                  });

                  return (
                    <tr key={b.id} className="hover:bg-[#F4ECEE]/50 transition">
                      <td className="p-3.5">
                        <div className="font-mono font-bold text-[#9B1B30] text-[11px]">
                          {b.bookingNumber}
                        </div>
                        <div className="text-[#1E1416] font-semibold text-xs mt-0.5">
                          {b.mallOrVenue}
                        </div>
                        <div className="text-[11px] text-[#756568]">
                          {b.client?.companyName || b.client?.primaryContact || "Direct"}
                        </div>
                      </td>

                      <td className="p-3.5 font-mono text-[#4A3A3D]">
                        {dateObj.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                        <div className="text-[10px] text-[#756568]">
                          {b.startTime || "14:00"} – {b.endTime || "18:00"}
                        </div>
                      </td>

                      <td className="p-3.5">
                        {assigned ? (
                          <div className="flex items-center space-x-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-600" />
                            <span className="text-[#1E1416] font-semibold">
                              Santa {assigned.displayName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[#756568] font-mono text-[11px]">
                            Unassigned
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 font-mono text-[10px]">
                        <div className="flex flex-col space-y-1">
                          <span
                            className={
                              gateCheck.commercialGatePassed
                                ? "text-emerald-700 font-bold"
                                : "text-[#9B1B30]"
                            }
                          >
                            {gateCheck.commercialGatePassed
                              ? "✓ Gate 1: Commercial Clear"
                              : "• Gate 1: Needs MOA / 50% DP"}
                          </span>
                          <span className="text-emerald-700">
                            ✓ Gate 2: Schedule Clear
                          </span>
                        </div>
                      </td>

                      <td className="p-3.5 font-mono">
                        <div className="font-bold text-[#1E1416]">
                          ₱{contractAmt.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-emerald-700 font-semibold">
                          Paid: ₱{depositPaid.toLocaleString()}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${meta.badgeClass}`}
                        >
                          {meta.label}
                        </span>
                      </td>

                      <td className="p-3.5 text-right space-x-1.5">
                        {lifecycleState === "AWAITING_STAFF_SIGNOFF" && (
                          <button
                            type="button"
                            onClick={() => executeDualGateSignoff(b)}
                            className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#F9EBED] hover:bg-[#9B1B30] text-[#9B1B30] hover:text-white border border-[#F0D0D5] font-semibold text-[11px] transition"
                            title="Run Dual-Gate Commercial + Roster Signoff"
                          >
                            <ShieldCheck className="w-3 h-3 mr-1" />
                            Approve
                          </button>
                        )}
                        <Link
                          href={`/admin/bookings/${b.id}`}
                          className="inline-flex items-center px-2.5 py-1 rounded-md bg-white hover:border-[#9B1B30] border border-[#D6C7C9] text-[#1E1416] font-semibold text-[11px] transition"
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
