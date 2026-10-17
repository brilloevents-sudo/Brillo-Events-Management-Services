"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Clock,
  Filter,
  Check,
  X,
  FileSpreadsheet,
} from "lucide-react";

export default function ConflictsPage() {
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("PENDING_REVIEW");

  function loadConflicts() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterCategory) params.set("category", filterCategory);
    if (filterStatus) params.set("status", filterStatus);

    fetch(`/api/conflicts?${params.toString()}`)
      .then((res) => res.json())
      .then((d) => {
        if (d.conflicts) setConflicts(d.conflicts);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadConflicts();
  }, [filterCategory, filterStatus]);

  async function resolveConflict(conflictId: string, resolution: string) {
    try {
      await fetch("/api/conflicts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conflictId,
          status: "RESOLVED",
          resolvedResolution: resolution,
        }),
      });
      loadConflicts();
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
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-crimson-950 text-crimson-300 border border-crimson-800 font-mono">
              ZERO SILENT NORMALIZATION
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center">
              Source Data Conflict &amp; Reconciliation Register
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Mandatory review queue for source spelling discrepancies, ambiguous rate cells, date typos, and unverified debt notes.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-obsidian-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-obsidian-950 border border-slate-700 rounded-lg text-slate-200"
          >
            <option value="PENDING_REVIEW">Pending Staff Review</option>
            <option value="RESOLVED">Resolved Decisions</option>
            <option value="ALL">All Records</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 bg-obsidian-950 border border-slate-700 rounded-lg text-slate-200"
          >
            <option value="">All Categories</option>
            <option value="TALENT_NAME_MISMATCH">Talent Name Mismatches</option>
            <option value="RATE_CONFLICT">Rate &amp; Pricing Conflicts</option>
            <option value="AMBIGUOUS_CELL">Ambiguous Sheet Cells</option>
            <option value="DATE_TYPO">Historical Date Typos</option>
            <option value="UNVERIFIED_DEBT">Unverified Debt Notes (Dept)</option>
          </select>
        </div>

        <span className="text-xs font-mono text-slate-400">
          Showing {conflicts.length} registered conflicts
        </span>
      </div>

      {/* Conflicts List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 flex justify-center bg-obsidian-900 border border-slate-800 rounded-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-400"></div>
          </div>
        ) : conflicts.length === 0 ? (
          <div className="p-12 text-center bg-obsidian-900 border border-slate-800 rounded-xl text-slate-400 text-xs">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
            <div className="font-semibold text-white">No pending conflicts in queue</div>
            <div className="text-[11px] text-slate-500 mt-1">
              All imported cells are reconciled or no import batch has been executed yet.
            </div>
          </div>
        ) : (
          conflicts.map((c) => {
            const isResolved = c.status === "RESOLVED";

            return (
              <div
                key={c.id}
                className={`p-4 rounded-xl border transition space-y-3 ${
                  isResolved
                    ? "bg-obsidian-950 border-slate-800/80 opacity-75"
                    : "bg-obsidian-900 border-amber-800/50 hover:border-amber-700"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
                      {c.category}
                    </span>
                    <span className="font-mono text-gold-400 text-xs font-semibold">
                      {c.sourceCoordinates}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      isResolved
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                        : "bg-crimson-950 text-crimson-300 border border-crimson-800"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-mono text-[10px] uppercase">
                      Raw Source Value:
                    </span>
                    <div className="mt-1 p-2 rounded bg-obsidian-950 border border-slate-800 font-mono text-white break-words">
                      {c.rawText}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 font-mono text-[10px] uppercase">
                      Discrepancy Analysis:
                    </span>
                    <p className="mt-1 text-slate-300 leading-relaxed">
                      {c.description}
                    </p>
                  </div>
                </div>

                {/* Resolution / Action Footer */}
                <div className="pt-2 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  {isResolved ? (
                    <div className="text-emerald-400 font-mono text-[11px]">
                      Resolved: {c.resolvedResolution} (by {c.resolvedBy || "Staff"})
                    </div>
                  ) : (
                    <div className="text-slate-400 text-[11px] font-mono">
                      Suggested: {c.suggestedResolution || "Review with operations supervisor"}
                    </div>
                  )}

                  {!isResolved && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          resolveConflict(
                            c.id,
                            c.suggestedResolution || "Approved staff normalization"
                          )
                        }
                        className="px-3 py-1 rounded bg-emerald-800 hover:bg-emerald-700 text-white font-medium text-xs flex items-center transition"
                      >
                        <Check className="w-3.5 h-3.5 mr-1" />
                        Apply Suggested Resolution
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
