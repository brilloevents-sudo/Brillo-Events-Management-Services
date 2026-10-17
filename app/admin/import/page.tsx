"use client";

import { useEffect, useState } from "react";
import {
  FileSpreadsheet,
  Upload,
  CheckCircle,
  AlertTriangle,
  Play,
  Check,
  RefreshCw,
  Clock,
  ArrowRight,
} from "lucide-react";

export default function ImportCenterPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dryRunResult, setDryRunResult] = useState<any>(null);
  const [commitResult, setCommitResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  function loadBatches() {
    fetch("/api/import")
      .then((res) => res.json())
      .then((d) => {
        if (d.batches) setBatches(d.batches);
      })
      .catch(() => {});
  }

  useEffect(() => {
    loadBatches();
  }, []);

  async function handleDryRun() {
    setLoading(true);
    setError(null);
    setCommitResult(null);

    const formData = new FormData();
    formData.append("action", "dry_run");
    formData.append("useDefaultFile", "true");

    try {
      const res = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setDryRunResult(data.result);
    } catch (err: any) {
      setError(err.message || "Dry run failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCommit() {
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("action", "commit");
    formData.append("useDefaultFile", "true");

    try {
      const res = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setCommitResult(data.result);
      loadBatches();
    } catch (err: any) {
      setError(err.message || "Commit failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
              ALL 12 SHEETS
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center">
              12-Sheet Excel Import &amp; Audit Center
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Idempotent batch import of <strong className="text-slate-200">SANTA OPERATION TRACKER- 2026.xlsx</strong> with coordinate preservation and conflict queues.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleDryRun}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-obsidian-850 hover:bg-obsidian-800 border border-slate-700 text-slate-200 transition flex items-center disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 mr-1.5 text-gold-400" />
            1. Run Dry-Run Preview
          </button>
          <button
            onClick={handleCommit}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-crimson-700 to-crimson-600 hover:from-crimson-600 hover:to-crimson-500 text-white transition flex items-center shadow-md disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5 mr-1.5 text-gold-300" />
            2. Commit Import Batch
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Success Commit Banner */}
      {commitResult && (
        <div className="p-5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs space-y-2">
          <div className="flex items-center space-x-2 font-bold text-sm text-emerald-300">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span>Import Batch Committed Successfully (Batch ID: {commitResult.batchId})</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-900/60 font-mono text-[11px]">
            <div>Created Bookings: <strong className="text-white">{commitResult.createdBookingsCount}</strong></div>
            <div>Created Expenses: <strong className="text-white">{commitResult.createdExpensesCount}</strong></div>
            <div>Queued Conflicts: <strong className="text-gold-300">{commitResult.createdConflictsCount}</strong></div>
            <div>Skipped Empty Rows: <strong className="text-slate-400">{commitResult.skippedRowCount}</strong></div>
          </div>
        </div>
      )}

      {/* Dry Run Sheet Inventory */}
      {dryRunResult && (
        <div className="p-5 rounded-xl bg-obsidian-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">
                Inspection Preview: {dryRunResult.fileName}
              </h3>
              <p className="text-xs text-slate-400">
                Found {dryRunResult.summary.totalSheets} worksheets, {dryRunResult.summary.totalNonEmptyRows} populated rows across the tracker.
              </p>
            </div>
            <div className="text-right text-xs font-mono text-gold-400">
              Estimated: ~{dryRunResult.summary.estimatedBookingsToCreate} Bookings, ~{dryRunResult.summary.candidateConflictsToQueue} Discrepancies
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-obsidian-950/80 text-[10px] font-mono text-slate-400 uppercase">
                  <th className="p-2.5">Worksheet Name</th>
                  <th className="p-2.5">Range</th>
                  <th className="p-2.5">Populated Rows</th>
                  <th className="p-2.5">Detected Purpose</th>
                  <th className="p-2.5">Candidate Conflicts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {dryRunResult.sheets.map((s: any, idx: number) => (
                  <tr key={idx} className="hover:bg-obsidian-850/40">
                    <td className="p-2.5 font-bold font-mono text-white">
                      &apos;{s.sheetName}&apos;
                    </td>
                    <td className="p-2.5 font-mono text-slate-400">{s.declaredRange}</td>
                    <td className="p-2.5 font-mono text-emerald-400 font-semibold">{s.nonEmptyRows} / {s.totalRows}</td>
                    <td className="p-2.5 text-slate-300">{s.detectedPurpose}</td>
                    <td className="p-2.5">
                      {s.candidateConflictsCount > 0 ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
                          {s.candidateConflictsCount} Review Queue
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px] font-mono">0 clean</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Historical Batches Table */}
      <div className="rounded-xl bg-obsidian-900 border border-slate-800 overflow-hidden space-y-3 p-5">
        <h3 className="text-sm font-bold text-white flex items-center">
          <Clock className="w-4 h-4 mr-2 text-slate-400" />
          Import Batch Audit History
        </h3>

        {batches.length === 0 ? (
          <p className="text-xs text-slate-500 py-4">No import batches have been executed yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] font-mono text-slate-400 uppercase">
                  <th className="p-2.5">Batch ID</th>
                  <th className="p-2.5">Source File</th>
                  <th className="p-2.5">Imported Records</th>
                  <th className="p-2.5">Queued Conflicts</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {batches.map((b) => (
                  <tr key={b.id} className="hover:bg-obsidian-850/40">
                    <td className="p-2.5 text-gold-400 font-bold">{b.id}</td>
                    <td className="p-2.5 text-white">{b.fileName}</td>
                    <td className="p-2.5 text-emerald-400">{b.importedCount} records</td>
                    <td className="p-2.5 text-amber-400">{b.conflictCount} conflicts</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {b.status}
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-400">
                      {new Date(b.createdAt).toLocaleString()}
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
