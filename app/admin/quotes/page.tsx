"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Receipt,
  Calculator,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Tag,
  Clock,
} from "lucide-react";
import {
  calculateCosting,
  calculateSantaPackageQuote,
  SANTA_EVENT_ACTIVITIES,
  SantaBeardTier,
  SantaRateTerritory,
  SantaEventActivityTag,
} from "@/lib/costing";

export default function QuotesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-[#756568]">
          Loading Costing &amp; Quotation Engine...
        </div>
      }
    >
      <QuotesBuilderInner />
    </Suspense>
  );
}

function QuotesBuilderInner() {
  const searchParams = useSearchParams();
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState("");

  // Official Rate Card Package Controls
  const [santaTier, setSantaTier] = useState<SantaBeardTier>("REAL_BEARD");
  const [rateTerritory, setRateTerritory] =
    useState<SantaRateTerritory>("METRO_MANILA");
  const [eventActivityTag, setEventActivityTag] =
    useState<SantaEventActivityTag>("MEET_AND_GREET");
  const [durationHours, setDurationHours] = useState<number>(3);

  // Costing inputs
  const [clientQuotedAmount, setClientQuotedAmount] = useState<number>(24000);
  const [internalTalentFee, setInternalTalentFee] = useState<number>(12000);
  const [internalPaFee, setInternalPaFee] = useState<number>(1500);
  const [transportAllowance, setTransportAllowance] = useState<number>(0);
  const [wardrobeAllowance, setWardrobeAllowance] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const applyBookingToCalculator = (b: any) => {
    if (!b) return;
    let meta: any = b.ledgerMeta || {};
    if (
      !b.ledgerMeta &&
      typeof b.internalNotes === "string" &&
      b.internalNotes.includes("||LEDGER_META:")
    ) {
      try {
        meta = JSON.parse(b.internalNotes.split("||LEDGER_META:")[1]);
      } catch {}
    }

    const tier: SantaBeardTier =
      meta.santaTier === "SANTA_AND_ELVES"
        ? "SANTA_AND_ELVES"
        : meta.santaTier === "FAKE_BEARD"
        ? "FAKE_BEARD"
        : "REAL_BEARD";
    const territory: SantaRateTerritory =
      meta.rateTerritory ||
      (b.isHoliday ? "HOLIDAY" : b.isProvincial ? "OUT_OF_TOWN" : "METRO_MANILA");
    const activity: SantaEventActivityTag =
      meta.eventActivityTag || "MEET_AND_GREET";
    const hrs = Number(meta.durationHours || b.durationHours || 3);

    setSantaTier(tier);
    setRateTerritory(territory);
    setEventActivityTag(activity);
    setDurationHours(hrs);

    const pkg = calculateSantaPackageQuote({
      santaTier: tier,
      rateTerritory: territory,
      durationHours: hrs,
      eventActivityTag: activity,
    });

    setClientQuotedAmount(
      Number(b.totalContractAmount || b.clientQuotedAmount || pkg.totalQuotedRate)
    );
    setInternalTalentFee(
      Number(
        b.talentAssignments?.[0]?.agreedTalentFee ||
          b.totalDirectCost ||
          pkg.defaultInternalTalentFee
      )
    );
  };

  useEffect(() => {
    fetch("/api/bookings")
      .then((res) => res.json())
      .then((d) => {
        if (d.bookings && d.bookings.length > 0) {
          setBookings(d.bookings);
          const paramId = searchParams.get("bookingId");
          const initial =
            (paramId && d.bookings.find((b: any) => b.id === paramId)) ||
            d.bookings[0];
          if (initial) {
            setSelectedBookingId(initial.id);
            applyBookingToCalculator(initial);
          }
        }
      })
      .catch(() => {});
  }, [searchParams]);

  const handleSelectBooking = (id: string) => {
    setSelectedBookingId(id);
    const found = bookings.find((b) => b.id === id);
    if (found) applyBookingToCalculator(found);
  };

  const applyRateCardPreset = (
    nextTier: SantaBeardTier,
    nextTerritory: SantaRateTerritory,
    nextHours: number,
    nextActivity: SantaEventActivityTag
  ) => {
    setSantaTier(nextTier);
    setRateTerritory(nextTerritory);
    setDurationHours(nextHours);
    setEventActivityTag(nextActivity);

    const pkg = calculateSantaPackageQuote({
      santaTier: nextTier,
      rateTerritory: nextTerritory,
      durationHours: nextHours,
      eventActivityTag: nextActivity,
    });
    setClientQuotedAmount(pkg.totalQuotedRate);
    setInternalTalentFee(pkg.defaultInternalTalentFee);
  };

  const livePkg = calculateSantaPackageQuote({
    santaTier,
    rateTerritory,
    durationHours,
    eventActivityTag,
  });

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
          ledgerMeta: {
            santaTier: livePkg.santaTier,
            santaTierLabel: livePkg.santaTierLabel,
            rateTerritory: livePkg.rateTerritory,
            rateTerritoryLabel: livePkg.rateTerritoryLabel,
            eventActivityTag: livePkg.eventActivityTag,
            eventActivityLabel: livePkg.eventActivityLabel,
            durationHours: livePkg.durationHours,
            extraHours: livePkg.extraHours,
            extraHourCharge: livePkg.extraHourCharge,
            baseRate: livePkg.baseRate,
            tags: livePkg.tags,
          },
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setFeedback(
        `Official Quotation ${data.quote.quoteNumber} generated (₱${calc.netClientAmount.toLocaleString()}) and synced to CRM & Master Calendar!`
      );
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-[#E8DFE0]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="badge-esign px-2.5 py-0.5 rounded text-[10px] font-mono">
              OFFICIAL RATE CARD &amp; COSTING ENGINE
            </span>
            <h1 className="page-title text-2xl font-serif tracking-tight flex items-center">
              Quotes &amp; Cost Estimation Builder
            </h1>
          </div>
          <p className="page-subtitle text-xs mt-1">
            Real Beard (₱24k/₱26k) &amp; Fake Beard (₱15k/₱18k) rate modeling, minimum 3 hours + ₱3,000/hr overtime, and gross margin calculator.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/admin/crm"
            className="px-3.5 py-2 rounded-lg bg-white border border-[#D6C7C9] text-xs font-semibold text-[#1E1416] hover:border-[#9B1B30]"
          >
            ← Back to CRM Pipeline
          </Link>
          <Link
            href="/admin/calendar"
            className="btn-primary px-3.5 py-2 rounded-lg text-xs font-semibold"
          >
            Open Master Calendar →
          </Link>
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Main Builder Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-xs">
        {/* Form Inputs (7 cols) */}
        <form onSubmit={handleCreateQuote} className="md:col-span-7 space-y-4">
          <div className="dashboard-card p-5 space-y-5">
            <h2 className="text-sm font-bold text-[#1E1416] flex items-center">
              <Calculator className="w-4 h-4 mr-2 text-[#9B1B30]" />
              1. Link Booking &amp; Apply Official Santa Rate Card
            </h2>

            <div>
              <label className="block mb-1">Link to CRM Lead / Booking *</label>
              <select
                required
                value={selectedBookingId}
                onChange={(e) => handleSelectBooking(e.target.value)}
                className="w-full px-3 py-2"
              >
                {bookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.bookingNumber} • {b.mallOrVenue} ({b.eventName})
                  </option>
                ))}
              </select>
            </div>

            {/* Santa Tier Selector: Real Beard, Classic, or Santa + 2 Elves */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#E8DFE0]">
              <button
                type="button"
                onClick={() =>
                  applyRateCardPreset("REAL_BEARD", rateTerritory, durationHours, eventActivityTag)
                }
                className={`p-3.5 rounded-xl border text-left transition ${
                  santaTier === "REAL_BEARD"
                    ? "bg-[#F9EBED] border-[#9B1B30] text-[#1E1416] shadow-sm"
                    : "bg-[#FAF7F5] border-[#D6C7C9] text-[#6E5D5F]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <strong className="text-xs text-[#9B1B30]">
                    🎅 Real-Beard Santa
                  </strong>
                </div>
                <div className="font-mono text-[10px] mt-1.5 space-y-0.5">
                  <div>MM: PHP 24,000</div>
                  <div>Hol / OOT: PHP 26,000</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  applyRateCardPreset("FAKE_BEARD", rateTerritory, durationHours, eventActivityTag)
                }
                className={`p-3.5 rounded-xl border text-left transition ${
                  santaTier === "FAKE_BEARD"
                    ? "bg-[#F9EBED] border-[#9B1B30] text-[#1E1416] shadow-sm"
                    : "bg-[#FAF7F5] border-[#D6C7C9] text-[#6E5D5F]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <strong className="text-xs text-[#1E1416]">
                    🎭 Classic (Fake Beard)
                  </strong>
                </div>
                <div className="font-mono text-[10px] mt-1.5 space-y-0.5">
                  <div>MM: PHP 15,000</div>
                  <div>Hol / OOT: PHP 18,000</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  applyRateCardPreset("SANTA_AND_ELVES", rateTerritory, durationHours, eventActivityTag)
                }
                className={`p-3.5 rounded-xl border text-left transition ${
                  santaTier === "SANTA_AND_ELVES"
                    ? "bg-[#F9EBED] border-[#9B1B30] text-[#1E1416] shadow-sm"
                    : "bg-[#FAF7F5] border-[#D6C7C9] text-[#6E5D5F]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <strong className="text-xs text-[#9B1B30]">
                    🎅🧝 Santa + 2 Elves
                  </strong>
                </div>
                <div className="font-mono text-[10px] mt-1.5 space-y-0.5">
                  <div>Package Rate: PHP 32,000</div>
                  <div>1 Santa + 2 Elves (3h)</div>
                </div>
              </button>
            </div>

            {/* Territory, Activity Tag & Duration Hours */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block mb-1">Rate Territory</label>
                <select
                  value={rateTerritory}
                  onChange={(e) =>
                    applyRateCardPreset(
                      santaTier,
                      e.target.value as SantaRateTerritory,
                      durationHours,
                      eventActivityTag
                    )
                  }
                  className="w-full px-3 py-2"
                >
                  <option value="METRO_MANILA">
                    Metro Manila (₱{santaTier === "REAL_BEARD" ? "24,000" : "15,000"})
                  </option>
                  <option value="HOLIDAY">
                    Holiday Rate (₱{santaTier === "REAL_BEARD" ? "26,000" : "18,000"})
                  </option>
                  <option value="OUT_OF_TOWN">
                    Out of Town (₱{santaTier === "REAL_BEARD" ? "26,000" : "18,000"})
                  </option>
                </select>
              </div>

              <div>
                <label className="block mb-1">Event Activity Tag</label>
                <select
                  value={eventActivityTag}
                  onChange={(e) =>
                    applyRateCardPreset(
                      santaTier,
                      rateTerritory,
                      durationHours,
                      e.target.value as SantaEventActivityTag
                    )
                  }
                  className="w-full px-3 py-2"
                >
                  {SANTA_EVENT_ACTIVITIES.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1">Duration (Min 3 Hrs + ₱3k/hr)</label>
                <select
                  value={durationHours}
                  onChange={(e) =>
                    applyRateCardPreset(
                      santaTier,
                      rateTerritory,
                      Number(e.target.value),
                      eventActivityTag
                    )
                  }
                  className="w-full px-3 py-2 font-mono"
                >
                  <option value={3}>3 Hours (Minimum Base)</option>
                  <option value={4}>4 Hours (+₱3,000)</option>
                  <option value={5}>5 Hours (+₱6,000)</option>
                  <option value={6}>6 Hours (+₱9,000)</option>
                  <option value={8}>8 Hours (+₱15,000)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#E8DFE0]">
              <div>
                <label className="block mb-1">Client Quoted Amount (₱) *</label>
                <input
                  type="number"
                  required
                  value={clientQuotedAmount}
                  onChange={(e) =>
                    setClientQuotedAmount(parseFloat(e.target.value) || 0)
                  }
                  className="w-full px-3 py-2 font-mono font-bold text-sm"
                />
              </div>

              <div>
                <label className="block mb-1">Client Discount (₱)</label>
                <input
                  type="number"
                  value={discountAmount}
                  onChange={(e) =>
                    setDiscountAmount(parseFloat(e.target.value) || 0)
                  }
                  className="w-full px-3 py-2 font-mono"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8DFE0] space-y-3">
              <span className="text-[10px] font-mono uppercase text-[#756568] font-semibold tracking-wider">
                Direct Cost Deductions (Internal Margin Check)
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Internal Talent Fee (₱)</label>
                  <input
                    type="number"
                    value={internalTalentFee}
                    onChange={(e) =>
                      setInternalTalentFee(parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block mb-1">Production Assistant (₱)</label>
                  <input
                    type="number"
                    value={internalPaFee}
                    onChange={(e) =>
                      setInternalPaFee(parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">
                    Transport / Gas Allowance (₱)
                  </label>
                  <input
                    type="number"
                    value={transportAllowance}
                    onChange={(e) =>
                      setTransportAllowance(parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block mb-1">Wardrobe / Styling (₱)</label>
                  <input
                    type="number"
                    value={wardrobeAllowance}
                    onChange={(e) =>
                      setWardrobeAllowance(parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8DFE0] flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary px-6 py-2.5 rounded-lg font-semibold text-xs transition disabled:opacity-50"
              >
                {saving
                  ? "Generating Quote..."
                  : "Save & Sync Quotation to CRM & Calendar"}
              </button>
            </div>
          </div>
        </form>

        {/* Live Calculation Preview (5 cols) */}
        <div className="md:col-span-5 space-y-4">
          <div className="dashboard-card p-5 space-y-4">
            <h2 className="text-sm font-bold text-[#1E1416] flex items-center">
              <Receipt className="w-4 h-4 mr-2 text-[#9B1B30]" />
              Live Rate Breakdown &amp; Profit Preview
            </h2>

            {/* Active Package Tags */}
            <div className="flex flex-wrap gap-1.5">
              {livePkg.tags.map((t, i) => (
                <span
                  key={i}
                  className="badge-esign px-2.5 py-0.5 rounded-full text-[10px] font-mono"
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-[#FAF7F5] border border-[#E8DFE0] space-y-2.5 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-[#6E5D5F]">Base Rate (Min 3 Hrs):</span>
                <span className="font-bold text-[#1E1416]">
                  ₱{livePkg.baseRate.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6E5D5F]">
                  Extra Hours ({livePkg.extraHours} hr × ₱3,000):
                </span>
                <span className="font-bold text-[#9B1B30]">
                  +₱{livePkg.extraHourCharge.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-t border-[#E8DFE0] pt-2">
                <span className="text-[#6E5D5F]">Net Client Price:</span>
                <span className="font-bold text-[#1E1416]">
                  ₱{calc.netClientAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-[#6E5D5F]">
                <span>Total Direct Costs:</span>
                <span className="text-amber-700 font-semibold">
                  -₱{calc.totalDirectCost.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-t border-[#E8DFE0] pt-2 text-sm font-bold">
                <span className="text-[#1E1416]">Projected Gross Profit:</span>
                <span className="text-emerald-700">
                  ₱{calc.grossProfit.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-[#6E5D5F]">Gross Margin:</span>
                <span className="text-emerald-700 font-bold">
                  {calc.grossMarginPercent}%
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF7F5] border border-[#E8DFE0] space-y-2 font-mono text-xs">
              <div className="text-[10px] text-[#756568] uppercase font-semibold">
                Standard 50% Reservation Schedule
              </div>
              <div className="flex justify-between">
                <span className="text-[#6E5D5F]">
                  Required Downpayment (50%):
                </span>
                <span className="font-bold text-[#9B1B30]">
                  ₱{calc.depositAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6E5D5F]">Remaining Balance:</span>
                <span className="font-bold text-[#1E1416]">
                  ₱{calc.balanceAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
