"use client";

import { useEffect, useState } from "react";
import { Receipt, Calculator, FileText, CheckCircle, PlusCircle, ArrowRight } from "lucide-react";
import { calculateCosting } from "@/lib/costing";

export default function QuotesPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState("");

  // Costing inputs
  const [clientQuotedAmount, setClientQuotedAmount] = useState<number>(18000);
  const [internalTalentFee, setInternalTalentFee] = useState<number>(12000);
  const [internalPaFee, setInternalPaFee] = useState<number>(1500);
  const [transportAllowance, setTransportAllowance] = useState<number>(0);
  const [wardrobeAllowance, setWardrobeAllowance] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/bookings")
      .then((res) => res.json())
      .then((d) => {
        if (d.bookings) {
          setBookings(d.bookings);
          if (d.bookings.length > 0) setSelectedBookingId(d.bookings[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const calc = calculateCosting({
    clientQuotedAmount,
    internalTalentFee,
    internalPaFee,
    transportAllowance,
    wardrobeAllowance,
    discountAmount,
    depositPercentage: 50,
  });

  async function handleCreateQuote(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedBookingId) return;

    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: selectedBookingId,
          clientQuotedAmount,
          internalTalentFee,
          internalPaFee,
          transportAllowance,
          wardrobeAllowance,
          discountAmount,
          depositPercentage: 50,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setFeedback(`Quote ${data.quote.quoteNumber} created and saved successfully!`);
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
              COSTING ENGINE
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center">
              Quotes &amp; Cost Estimation Builder
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time direct cost modeling, gross margin calculation, and quotation generation.
          </p>
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs">
          {feedback}
        </div>
      )}

      {/* Main Builder Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-xs">
        {/* Form Inputs (7 cols) */}
        <form onSubmit={handleCreateQuote} className="md:col-span-7 space-y-4">
          <div className="p-5 rounded-xl bg-obsidian-900 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center">
              <Calculator className="w-4 h-4 mr-2 text-gold-400" />
              Quotation Line Items
            </h2>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Link to Booking *</label>
              <select
                required
                value={selectedBookingId}
                onChange={(e) => setSelectedBookingId(e.target.value)}
                className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded-lg text-white"
              >
                {bookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.bookingNumber} • {b.mallOrVenue} ({b.eventName})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Client Quoted Amount (₱) *</label>
                <input
                  type="number"
                  required
                  value={clientQuotedAmount}
                  onChange={(e) => setClientQuotedAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded-lg text-white font-mono font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Client Discount (₱)</label>
                <input
                  type="number"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded-lg text-slate-300 font-mono"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-3">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold tracking-wider">
                Direct Cost Deductions (Internal)
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Internal Talent Fee (₱)</label>
                  <input
                    type="number"
                    value={internalTalentFee}
                    onChange={(e) => setInternalTalentFee(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded-lg text-emerald-400 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Production Assistant (₱)</label>
                  <input
                    type="number"
                    value={internalPaFee}
                    onChange={(e) => setInternalPaFee(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Transport / Gas Allowance (₱)</label>
                  <input
                    type="number"
                    value={transportAllowance}
                    onChange={(e) => setTransportAllowance(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Wardrobe / Styling (₱)</label>
                  <input
                    type="number"
                    value={wardrobeAllowance}
                    onChange={(e) => setWardrobeAllowance(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-lg bg-crimson-700 hover:bg-crimson-600 text-white font-semibold text-xs transition shadow-md disabled:opacity-50"
              >
                {saving ? "Generating Quote..." : "Save & Generate Quotation"}
              </button>
            </div>
          </div>
        </form>

        {/* Live Calculation Preview (5 cols) */}
        <div className="md:col-span-5 space-y-4">
          <div className="p-5 rounded-xl bg-obsidian-900 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center">
              <Receipt className="w-4 h-4 mr-2 text-gold-400" />
              Live Margin &amp; Profit Preview
            </h2>

            <div className="p-4 rounded-xl bg-obsidian-950 border border-slate-800/80 space-y-3 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Net Client Price:</span>
                <span className="font-bold text-white">₱{calc.netClientAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Direct Costs:</span>
                <span className="text-amber-400">-₱{calc.totalDirectCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-2 text-sm font-bold">
                <span className="text-gold-400">Projected Gross Profit:</span>
                <span className="text-emerald-400">₱{calc.grossProfit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Gross Margin:</span>
                <span className="text-emerald-300 font-bold">{calc.grossMarginPercent}%</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-obsidian-950 border border-slate-800/80 space-y-2 font-mono text-xs">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Standard 50% Schedule</div>
              <div className="flex justify-between">
                <span className="text-slate-400">Required Downpayment (50%):</span>
                <span className="font-bold text-gold-300">₱{calc.depositAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Remaining Balance:</span>
                <span className="font-bold text-slate-200">₱{calc.balanceAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
