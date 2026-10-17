"use client";

import { useEffect, useState } from "react";
import { Receipt, PlusCircle, Filter, DollarSign, Calendar } from "lucide-react";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");

  function loadExpenses() {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory) params.set("category", selectedCategory);

    fetch(`/api/expenses?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.expenses) {
          setExpenses(data.expenses);
          setTotalAmount(data.totalAmount || 0);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadExpenses();
  }, [selectedCategory]);

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-950 text-rose-300 border border-rose-800 font-mono">
              EXPENSE AUDIT
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center">
              Operational &amp; Direct Event Expenses
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tracking September and October 2026 operating costs, utility bills, wardrobe upkeep, and logistics.
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 font-mono">Total Recorded Outflow:</span>
          <div className="text-2xl font-bold text-rose-400 font-mono">
            ₱{Number(totalAmount).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setSelectedCategory("")}
          className={`px-3 py-1.5 rounded-lg font-medium transition ${
            selectedCategory === ""
              ? "bg-gold-500 text-obsidian-950 font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          All Categories ({expenses.length})
        </button>
        <button
          onClick={() => setSelectedCategory("OPERATIONAL")}
          className={`px-3 py-1.5 rounded-lg font-medium transition ${
            selectedCategory === "OPERATIONAL"
              ? "bg-rose-900 text-white font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Operational
        </button>
        <button
          onClick={() => setSelectedCategory("TALENT_TRANSPO")}
          className={`px-3 py-1.5 rounded-lg font-medium transition ${
            selectedCategory === "TALENT_TRANSPO"
              ? "bg-rose-900 text-white font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Transpo &amp; Gas
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-obsidian-900 border border-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-400"></div>
          </div>
        ) : expenses.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No expenses found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-obsidian-950/80 text-[10px] font-mono text-slate-400 uppercase">
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Payee / Item</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Amount (₱)</th>
                  <th className="p-3.5">Notes</th>
                  <th className="p-3.5">Linked Booking</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-obsidian-850/40 transition">
                    <td className="p-3.5 text-slate-400">
                      {new Date(e.expenseDate).toLocaleDateString()}
                    </td>
                    <td className="p-3.5 text-white font-sans font-bold text-xs">{e.payee}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-obsidian-950 text-slate-300 border border-slate-800">
                        {e.category}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-rose-400 text-xs">
                      ₱{Number(e.amount).toLocaleString()}
                    </td>
                    <td className="p-3.5 text-slate-400 font-sans">{e.notes || "—"}</td>
                    <td className="p-3.5 text-gold-400">
                      {e.booking ? `${e.booking.bookingNumber} (${e.booking.mallOrVenue})` : "General Overhead"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
