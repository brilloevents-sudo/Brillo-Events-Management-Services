"use client";

import { useEffect, useState } from "react";
import { FileCheck2, Upload, FileText, CheckCircle, Clock, ShieldCheck, Eye } from "lucide-react";

export default function ContractsPage() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form state
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [templateType, setTemplateType] = useState("WITH_DP");
  const [signedFileUrl, setSignedFileUrl] = useState("");
  const [signerName, setSignerName] = useState("");
  const [generating, setGenerating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  function loadData() {
    setLoading(true);
    fetch("/api/bookings")
      .then((res) => res.json())
      .then((d) => {
        if (d.bookings) {
          setBookings(d.bookings);
          if (d.bookings.length > 0) setSelectedBookingId(d.bookings[0].id);

          // Extract all contracts from bookings
          const allContracts = d.bookings.flatMap((b: any) =>
            (b.contracts || []).map((c: any) => ({ ...c, booking: b }))
          );
          setContracts(allContracts);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreateContract(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedBookingId) return;

    setGenerating(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: selectedBookingId,
          templateType,
          signedFileUrl: signedFileUrl || null,
          signerName,
          isSigned: Boolean(signedFileUrl),
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setFeedback(`Contract ${data.contract.contractNumber} generated successfully!`);
      loadData();
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-950 text-purple-300 border border-purple-800 font-mono">
              E-SIGN &amp; ARCHIVE
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center">
              Contracts &amp; Agreement Archive
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Framework agreement generation, revisions, and manual signed document archival.
          </p>
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs">
          {feedback}
        </div>
      )}

      {/* Generator & Uploader Card */}
      <form onSubmit={handleCreateContract} className="p-5 rounded-xl bg-obsidian-900 border border-slate-800 space-y-4 text-xs">
        <h2 className="text-sm font-bold text-white flex items-center">
          <FileCheck2 className="w-4 h-4 mr-2 text-gold-400" />
          Generate Agreement or Archive Signed Document
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Select Booking *</label>
            <select
              required
              value={selectedBookingId}
              onChange={(e) => setSelectedBookingId(e.target.value)}
              className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded-lg text-white"
            >
              {bookings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.bookingNumber} • {b.mallOrVenue}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Agreement Framework Template *</label>
            <select
              value={templateType}
              onChange={(e) => setTemplateType(e.target.value)}
              className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded-lg text-white"
            >
              <option value="WITH_DP">Standard Framework (With 50% Downpayment)</option>
              <option value="NO_DP">Special Framework (No Downpayment Clause)</option>
              <option value="SM_CUSTOM">SM Supermalls Institutional MOA</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Client Signer Name</label>
            <input
              type="text"
              placeholder="e.g. Maria Santos (Marketing Director)"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded-lg text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-400 mb-1 font-medium">
            Manual Signed Document URL / Fallback Upload Evidence
          </label>
          <input
            type="text"
            placeholder="e.g. /proofs/signed-sm-pasig-contract.pdf"
            value={signedFileUrl}
            onChange={(e) => setSignedFileUrl(e.target.value)}
            className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded-lg text-white font-mono"
          />
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            type="submit"
            disabled={generating}
            className="px-5 py-2.5 rounded-lg bg-crimson-700 hover:bg-crimson-600 text-white font-semibold transition shadow-md disabled:opacity-50"
          >
            {generating ? "Processing..." : "Generate & Archive Contract"}
          </button>
        </div>
      </form>

      {/* Contracts Table */}
      <div className="rounded-xl bg-obsidian-900 border border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 text-xs font-mono font-bold text-slate-400">
          Executed &amp; Generated Agreements ({contracts.length})
        </div>

        {contracts.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No contracts generated yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-obsidian-950/80 text-[10px] font-mono text-slate-400 uppercase">
                  <th className="p-3.5">Contract Number</th>
                  <th className="p-3.5">Venue / Branch</th>
                  <th className="p-3.5">Template</th>
                  <th className="p-3.5">Signer</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Provider</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {contracts.map((c) => (
                  <tr key={c.id} className="hover:bg-obsidian-850/40 transition">
                    <td className="p-3.5 font-bold text-gold-400">{c.contractNumber}</td>
                    <td className="p-3.5 text-white font-sans font-medium">{c.booking?.mallOrVenue}</td>
                    <td className="p-3.5 text-slate-300">{c.templateType}</td>
                    <td className="p-3.5 text-slate-400">{c.signerName || "Awaiting Signer"}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {c.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400">{c.signProvider}</td>
                    <td className="p-3.5 text-right">
                      {c.signedFileUrl ? (
                        <a
                          href={c.signedFileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-gold-400 hover:text-gold-300 inline-flex items-center"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          View Signed PDF
                        </a>
                      ) : (
                        <span className="text-slate-500">Pending Execution</span>
                      )}
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
