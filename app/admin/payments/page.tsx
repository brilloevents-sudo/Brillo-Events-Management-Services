"use client";

import { useEffect, useState } from "react";
import {
  Receipt,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
  Building2,
  Calendar,
  Eye,
} from "lucide-react";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");

  function loadPayments() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterStatus) params.set("status", filterStatus);

    fetch(`/api/payments?${params.toString()}`)
      .then((res) => res.json())
      .then((d) => {
        if (d.payments) setPayments(d.payments);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadPayments();
  }, [filterStatus]);

  async function updatePaymentStatus(paymentId: string, status: "VERIFIED" | "REJECTED") {
    try {
      const res = await fetch("/api/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId,
          status,
          verificationNotes: `Marked ${status} by finance staff`,
        }),
      });
      const data = await res.json();
      if (data.success) loadPayments();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
              FINANCE GATE
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center">
              Payments &amp; Deposit Verification Center
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manual staff verification of downpayments and final collections. <strong className="text-slate-200">Uploading proof is NOT verification.</strong>
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setFilterStatus("")}
          className={`px-3 py-1.5 rounded-lg font-medium transition ${
            filterStatus === ""
              ? "bg-gold-500 text-obsidian-950 font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          All Payments ({payments.length})
        </button>
        <button
          onClick={() => setFilterStatus("PENDING_VERIFICATION")}
          className={`px-3 py-1.5 rounded-lg font-medium transition ${
            filterStatus === "PENDING_VERIFICATION"
              ? "bg-amber-800 text-white font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Pending Verification
        </button>
        <button
          onClick={() => setFilterStatus("VERIFIED")}
          className={`px-3 py-1.5 rounded-lg font-medium transition ${
            filterStatus === "VERIFIED"
              ? "bg-emerald-800 text-white font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Verified
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-obsidian-900 border border-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-400"></div>
          </div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No payment records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-obsidian-950/80 text-[10px] font-mono text-slate-400 uppercase">
                  <th className="p-3.5">Booking / Client</th>
                  <th className="p-3.5">Payment Type</th>
                  <th className="p-3.5">Amount (₱)</th>
                  <th className="p-3.5">Method &amp; Ref</th>
                  <th className="p-3.5">Proof</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {payments.map((p) => {
                  const isPending = p.status === "PENDING_VERIFICATION";
                  const isVerified = p.status === "VERIFIED";

                  return (
                    <tr key={p.id} className="hover:bg-obsidian-850/40 transition">
                      <td className="p-3.5">
                        <div className="font-mono text-gold-400 font-semibold text-[11px]">
                          {p.booking?.bookingNumber}
                        </div>
                        <div className="text-white font-medium text-xs mt-0.5">
                          {p.booking?.client?.companyName || p.booking?.client?.primaryContact}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {p.booking?.mallOrVenue}
                        </div>
                      </td>

                      <td className="p-3.5 font-medium text-slate-300">
                        {p.paymentType}
                      </td>

                      <td className="p-3.5 font-mono font-bold text-emerald-400 text-sm">
                        ₱{Number(p.amount).toLocaleString()}
                      </td>

                      <td className="p-3.5 font-mono text-slate-300">
                        <div>{p.paymentMethod}</div>
                        <div className="text-[10px] text-slate-500">
                          {p.referenceNumber || "No ref recorded"}
                        </div>
                      </td>

                      <td className="p-3.5">
                        {p.proofFileUrl ? (
                          <a
                            href={p.proofFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-gold-400 hover:text-gold-300 font-mono text-[11px]"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            View Receipt
                          </a>
                        ) : (
                          <span className="text-slate-600 font-mono text-[11px]">No proof file</span>
                        )}
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                            isVerified
                              ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                              : isPending
                              ? "bg-amber-950 text-amber-300 border-amber-800"
                              : "bg-red-950 text-red-300 border-red-800"
                          }`}
                        >
                          {p.status}
                        </span>
                        {p.verifiedAt && (
                          <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                            Verified {new Date(p.verifiedAt).toLocaleDateString()}
                          </div>
                        )}
                      </td>

                      <td className="p-3.5 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => updatePaymentStatus(p.id, "VERIFIED")}
                              className="px-2.5 py-1 rounded bg-emerald-800 hover:bg-emerald-700 text-white font-medium text-[11px] flex items-center transition"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verify
                            </button>
                            <button
                              onClick={() => updatePaymentStatus(p.id, "REJECTED")}
                              className="px-2 py-1 rounded bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 text-[11px] transition"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-mono">
                            {isVerified ? "Verified Gate Satisfied" : "Payment Rejected"}
                          </span>
                        )}
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
