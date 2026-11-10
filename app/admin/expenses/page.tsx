"use client";

import { useEffect, useState } from "react";
import { Wallet, Receipt } from "lucide-react";

type LedgerTab = "ALL" | "EXPENSES" | "PALUWAL";

export default function UnifiedExpensesAndPaluwalPage() {
  const [activeTab, setActiveTab] = useState<LedgerTab>("ALL");
  const [expenses, setExpenses] = useState<any[]>([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [paluwalEntries, setPaluwalEntries] = useState<any[]>([]);
  const [paluwalSummary, setPaluwalSummary] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/expenses").then((r) => r.json()).catch(() => ({ expenses: [] })),
      fetch("/api/paluwal").then((r) => r.json()).catch(() => ({ entries: [], summary: {} })),
    ])
      .then(([expData, palData]) => {
        if (expData?.expenses) {
          setExpenses(expData.expenses);
          setTotalExpenses(Number(expData.totalAmount || 0));
        }
        if (palData?.entries) setPaluwalEntries(palData.entries);
        if (palData?.summary) setPaluwalSummary(palData.summary);
      })
      .finally(() => setLoading(false));
  }, []);

  const paluwalOutstanding = Number(paluwalSummary.netPaluwalOutstanding || 0);
  const paluwalReleased = Number(paluwalSummary.totalAdvances || 0);

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-[#E8DFE0]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="badge-esign px-2.5 py-0.5 rounded text-[10px] font-mono">
              STAGE 3 • IMMUTABLE LEDGER
            </span>
            <h1 className="page-title text-2xl font-serif tracking-tight">
              Expenses &amp; Cash Advances Ledger
            </h1>
          </div>
          <p className="page-subtitle text-xs mt-1">
            Append-only operational expenses, logistics outflows, and Santa pre-event cash advances.
          </p>
        </div>

        {/* View Toggle */}
        <div className="inline-flex rounded-lg bg-white border border-[#D6C7C9] p-0.5 shadow-sm text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("ALL")}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              activeTab === "ALL" ? "bg-[#9B1B30] text-white" : "text-[#4A3A3D]"
            }`}
          >
            Unified View
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("EXPENSES")}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              activeTab === "EXPENSES" ? "bg-[#9B1B30] text-white" : "text-[#4A3A3D]"
            }`}
          >
            Event Expenses ({expenses.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("PALUWAL")}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              activeTab === "PALUWAL" ? "bg-[#9B1B30] text-white" : "text-[#4A3A3D]"
            }`}
          >
            Cash Advances ({paluwalEntries.length})
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="dashboard-card p-4">
          <span className="text-xs text-[#4A3A3D] font-semibold">
            Recorded Event &amp; Ops Expenses
          </span>
          <div className="text-2xl font-serif font-bold text-[#9B1B30] mt-1">
            ₱{totalExpenses.toLocaleString()}
          </div>
          <p className="text-[11px] text-[#756568] mt-1">
            Logistics, utilities, wardrobe upkeep &amp; transport
          </p>
        </div>

        <div className="dashboard-card p-4">
          <span className="text-xs text-[#4A3A3D] font-semibold">
            Total Cash Advances Released
          </span>
          <div className="text-2xl font-serif font-bold text-[#C68A12] mt-1">
            ₱{paluwalReleased.toLocaleString()}
          </div>
          <p className="text-[11px] text-[#756568] mt-1">
            Pre-event Santa cash advances logged with provenance
          </p>
        </div>

        <div className="dashboard-card p-4">
          <span className="text-xs text-[#4A3A3D] font-semibold">
            Net Outstanding Cash Advances (To Offset)
          </span>
          <div className="text-2xl font-serif font-bold text-[#1E1416] mt-1">
            ₱{paluwalOutstanding.toLocaleString()}
          </div>
          <p className="text-[11px] text-[#756568] mt-1">
            Deducted automatically upon final talent payout
          </p>
        </div>
      </div>

      {loading ? (
        <div className="dashboard-card p-12 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9B1B30]" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Event & Operational Expenses Table */}
          {(activeTab === "ALL" || activeTab === "EXPENSES") && (
            <div className="dashboard-card overflow-hidden">
              <div className="p-4 border-b border-[#E8DFE0] flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#1E1416] flex items-center">
                  <Receipt className="w-4 h-4 mr-2 text-[#9B1B30]" />
                  Operational &amp; Direct Event Expenses ({expenses.length})
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#E8DFE0] bg-[#FCF9F8] text-[10px] font-mono text-[#756568] uppercase">
                      <th className="p-3.5">Date</th>
                      <th className="p-3.5">Payee / Item</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Amount (₱)</th>
                      <th className="p-3.5">Notes</th>
                      <th className="p-3.5">Linked Booking</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8DFE0] font-mono text-[11px]">
                    {expenses.map((e) => (
                      <tr key={e.id} className="hover:bg-[#F4ECEE]/50 transition">
                        <td className="p-3.5 text-[#756568]">
                          {new Date(e.expenseDate).toLocaleDateString()}
                        </td>
                        <td className="p-3.5 text-[#1E1416] font-sans font-bold text-xs">
                          {e.payee}
                        </td>
                        <td className="p-3.5">
                          <span className="badge-esign px-2 py-0.5 rounded text-[10px]">
                            {e.category}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-[#9B1B30] text-xs">
                          ₱{Number(e.amount).toLocaleString()}
                        </td>
                        <td className="p-3.5 text-[#4A3A3D] font-sans">{e.notes || "—"}</td>
                        <td className="p-3.5 text-[#C68A12] font-semibold">
                          {e.booking
                            ? `${e.booking.bookingNumber} (${e.booking.mallOrVenue})`
                            : "General Overhead"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Talent Cash Advances Immutable Ledger Table */}
          {(activeTab === "ALL" || activeTab === "PALUWAL") && (
            <div className="dashboard-card overflow-hidden">
              <div className="p-4 border-b border-[#E8DFE0] flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#1E1416] flex items-center">
                  <Wallet className="w-4 h-4 mr-2 text-[#C68A12]" />
                  Talent Cash Advances Immutable Ledger ({paluwalEntries.length})
                </span>
              </div>
              {paluwalEntries.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#756568]">
                  No cash advance entries recorded.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#E8DFE0] bg-[#FCF9F8] text-[10px] font-mono text-[#756568] uppercase">
                        <th className="p-3.5">Date</th>
                        <th className="p-3.5">Santa Performer</th>
                        <th className="p-3.5">Entry Type</th>
                        <th className="p-3.5">Amount (₱)</th>
                        <th className="p-3.5">Operational Purpose</th>
                        <th className="p-3.5">Linked Booking</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8DFE0] font-mono text-[11px]">
                      {paluwalEntries.map((p) => {
                        const isAdvance = p.entryType === "ADVANCE";
                        return (
                          <tr key={p.id} className="hover:bg-[#F4ECEE]/50 transition">
                            <td className="p-3.5 text-[#756568]">
                              {new Date(p.entryDate).toLocaleDateString()}
                            </td>
                            <td className="p-3.5 text-[#1E1416] font-sans font-bold">
                              Santa {p.talent?.displayName || "Performer"}
                            </td>
                            <td className="p-3.5">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  isAdvance
                                    ? "badge-gold"
                                    : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                }`}
                              >
                                {p.entryType}
                              </span>
                            </td>
                            <td className="p-3.5 font-bold text-[#1E1416] text-xs">
                              {isAdvance ? "-" : "+"}₱{Number(p.amount).toLocaleString()}
                            </td>
                            <td className="p-3.5 text-[#4A3A3D] font-sans">{p.reason}</td>
                            <td className="p-3.5 text-[#9B1B30] font-semibold">
                              {p.booking
                                ? `${p.booking.bookingNumber} (${p.booking.mallOrVenue})`
                                : "General Advance"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
