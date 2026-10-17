"use client";

import { useEffect, useState } from "react";
import {
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  PlusCircle,
  Clock,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";

export default function PaluwalPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [talents, setTalents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter
  const [selectedTalent, setSelectedTalent] = useState("");

  function loadLedger() {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedTalent) params.set("talentId", selectedTalent);

    fetch(`/api/paluwal?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.entries) setEntries(data.entries);
        if (data.summary) setSummary(data.summary);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetch("/api/talents")
      .then((res) => res.json())
      .then((d) => {
        if (d.talents) setTalents(d.talents);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadLedger();
  }, [selectedTalent]);

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gold-950 text-gold-300 border border-gold-800 font-mono">
              IMMUTABLE LEDGER
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center">
              Talent Advances &amp; Paluwal Ledger
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tracking pre-event cash advances, transport allowances, and net payout deductions. No fabricated deductions.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-obsidian-900 border border-slate-800">
          <span className="text-xs text-slate-400">Total Paluwal Released</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">
            ₱{Number(summary.totalAdvances || 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Cash advances provided for wardrobe &amp; transpo</p>
        </div>

        <div className="p-4 rounded-xl bg-obsidian-900 border border-slate-800">
          <span className="text-xs text-slate-400">Total Deductions Recovered</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            ₱{Number(summary.totalDeductions || 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Offset against completed booking fees</p>
        </div>

        <div className="p-4 rounded-xl bg-obsidian-900 border border-slate-800">
          <span className="text-xs text-slate-400">Net Outstanding Advances</span>
          <div className="text-2xl font-bold text-rose-400 mt-1">
            ₱{Number(summary.netPaluwalOutstanding || 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Active balance to be deducted on payout</p>
        </div>
      </div>

      {/* Talent Filter */}
      <div className="p-4 rounded-xl bg-obsidian-900 border border-slate-800 flex items-center space-x-3 text-xs">
        <label className="text-slate-400 font-medium">Filter Ledger by Santa:</label>
        <select
          value={selectedTalent}
          onChange={(e) => setSelectedTalent(e.target.value)}
          className="px-3 py-2 bg-obsidian-950 border border-slate-700 rounded-lg text-slate-200"
        >
          <option value="">All Santas</option>
          {talents.map((t) => (
            <option key={t.id} value={t.id}>
              Santa {t.displayName} ({t.canonicalId})
            </option>
          ))}
        </select>
      </div>

      {/* Ledger Table */}
      <div className="rounded-xl bg-obsidian-900 border border-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-400"></div>
          </div>
        ) : entries.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No Paluwal advance entries recorded for this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-obsidian-950/80 text-[10px] font-mono text-slate-400 uppercase">
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Talent</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Amount (₱)</th>
                  <th className="p-3.5">Reason / Operational Purpose</th>
                  <th className="p-3.5">Linked Booking</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {entries.map((e) => {
                  const isAdvance = e.entryType === "ADVANCE";

                  return (
                    <tr key={e.id} className="hover:bg-obsidian-850/40 transition">
                      <td className="p-3.5 text-slate-400">
                        {new Date(e.entryDate).toLocaleDateString()}
                      </td>

                      <td className="p-3.5 text-white font-sans font-bold">
                        Santa {e.talent?.displayName}
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isAdvance
                              ? "bg-amber-950 text-amber-300 border border-amber-800"
                              : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          }`}
                        >
                          {e.entryType}
                        </span>
                      </td>

                      <td className="p-3.5 font-bold text-white text-xs">
                        {isAdvance ? "-" : "+"}₱{Number(e.amount).toLocaleString()}
                      </td>

                      <td className="p-3.5 text-slate-300 font-sans max-w-xs">
                        {e.reason}
                      </td>

                      <td className="p-3.5 text-gold-400">
                        {e.booking ? `${e.booking.bookingNumber} (${e.booking.mallOrVenue})` : "General Advance"}
                      </td>

                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800">
                          {e.status}
                        </span>
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
