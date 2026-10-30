"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  Calendar,
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  ShieldCheck,
  ArrowRight,
  Tag,
  MapPin,
  Calculator,
} from "lucide-react";
import {
  SANTA_RATE_CARD,
  SANTA_EVENT_ACTIVITIES,
  calculateSantaPackageQuote,
  SantaBeardTier,
  SantaRateTerritory,
  SantaEventActivityTag,
} from "@/lib/costing";

export default function RequestQuotePage() {
  return (
    <Suspense
      fallback={
        <div className="p-16 text-center text-xs text-slate-400">
          Loading Official Quotation Calculator...
        </div>
      }
    >
      <RequestQuoteForm />
    </Suspense>
  );
}

function RequestQuoteForm() {
  const searchParams = useSearchParams();

  const [talents, setTalents] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedQuote, setSubmittedQuote] = useState<any | null>(null);

  // Rate Card Package States
  const [santaTier, setSantaTier] = useState<SantaBeardTier>("REAL_BEARD");
  const [eventActivityTag, setEventActivityTag] =
    useState<SantaEventActivityTag>("MEET_AND_GREET");
  const [rateTerritory, setRateTerritory] =
    useState<SantaRateTerritory>("METRO_MANILA");
  const [durationHours, setDurationHours] = useState<number>(3);

  // Client & Event Form States
  const [bookingType, setBookingType] = useState<"CORPORATE" | "PRIVATE">("CORPORATE");
  const [clientName, setClientName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("14:00");
  const [endTime, setEndTime] = useState("17:00");
  const [venueName, setVenueName] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [city, setCity] = useState("Metro Manila");
  const [audienceSize, setAudienceSize] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [talentPreferenceId, setTalentPreferenceId] = useState("");
  const [consentAgreed, setConsentAgreed] = useState(true);

  useEffect(() => {
    fetch("/api/talents?publicOnly=true")
      .then((res) => res.json())
      .then((d) => {
        if (d.talents) {
          setTalents(d.talents);
          const initialTalent = searchParams.get("talent");
          if (initialTalent) setTalentPreferenceId(initialTalent);
        }
      })
      .catch(() => {});

    const pkg = searchParams.get("package");
    if (pkg === "provincial") setRateTerritory("OUT_OF_TOWN");
    if (pkg === "fake") setSantaTier("FAKE_BEARD");
  }, [searchParams]);

  // Automatically sync endTime when startTime or durationHours changes
  useEffect(() => {
    const [hStr, mStr] = (startTime || "14:00").split(":");
    const startH = parseInt(hStr || "14", 10);
    const endH = (startH + durationHours) % 24;
    setEndTime(`${String(endH).padStart(2, "0")}:${mStr || "00"}`);
  }, [startTime, durationHours]);

  // Auto-switch to HOLIDAY rate if Dec 24, 25, 30, 31 is chosen
  const handleDateChange = (val: string) => {
    setEventDate(val);
    if (val) {
      const d = new Date(val);
      if (
        d.getMonth() === 11 &&
        (d.getDate() === 24 || d.getDate() === 25 || d.getDate() === 30 || d.getDate() === 31)
      ) {
        setRateTerritory("HOLIDAY");
      }
    }
  };

  // Sync bookingType when Private Party tag is chosen
  const handleActivityChange = (tag: SantaEventActivityTag) => {
    setEventActivityTag(tag);
    if (tag === "PRIVATE_PARTY") {
      setBookingType("PRIVATE");
    } else {
      setBookingType("CORPORATE");
    }
  };

  const liveQuote = calculateSantaPackageQuote({
    santaTier,
    rateTerritory,
    durationHours,
    eventActivityTag,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/public/request-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName,
          companyName: companyName || venueName || clientName,
          email,
          phone,
          bookingType,
          eventName: eventName || `${venueName} — ${liveQuote.eventActivityLabel}`,
          eventDate,
          startTime,
          endTime,
          durationHours: liveQuote.durationHours,
          venueName,
          mallOrVenue: venueName,
          venueAddress,
          city:
            rateTerritory === "OUT_OF_TOWN" && city === "Metro Manila"
              ? "Out of Town / Provincial"
              : city,
          isProvincial: rateTerritory === "OUT_OF_TOWN",
          santaTier: liveQuote.santaTier,
          rateTerritory: liveQuote.rateTerritory,
          eventActivityTag: liveQuote.eventActivityTag,
          clientQuotedAmount: liveQuote.totalQuotedRate,
          audienceSize,
          specialRequests,
          talentPreferenceId: talentPreferenceId || undefined,
          consentAgreed,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to submit quotation request.");

      setSubmittedQuote({
        ...data,
        venueName,
        eventDate,
        clientName,
        companyName: companyName || venueName,
        liveQuote,
      });
    } catch (err: any) {
      setError(err.message || "Failed to submit quote request.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submittedQuote) {
    const q: ReturnType<typeof calculateSantaPackageQuote> = submittedQuote.liveQuote;
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-6">
        <div className="p-6 sm:p-8 rounded-2xl bg-obsidian-900 border border-emerald-500/40 shadow-2xl space-y-6 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 font-mono text-[10px] font-bold uppercase">
                  QUOTATION LOGGED • SYNCED TO DASHBOARD, CALENDAR &amp; CRM
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                  Official Quotation Generated!
                </h2>
              </div>
            </div>
            <div className="sm:text-right font-mono">
              <span className="text-[10px] text-slate-400 uppercase block">Reference ID</span>
              <span className="text-lg font-black text-gold-400">
                {submittedQuote.bookingNumber}
              </span>
            </div>
          </div>

          {/* Tags Bar */}
          <div className="flex flex-wrap gap-2">
            {q.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-full bg-crimson-950/90 border border-crimson-700 text-gold-300 font-mono text-[11px] font-bold"
              >
                {tag}
              </span>
            ))}
            <span className="px-3 py-1 rounded-full bg-blue-950/80 border border-blue-700 text-blue-200 font-mono text-[11px] font-bold">
              Status: 1. Inquiry Received (Confirming)
            </span>
          </div>

          {/* Breakdown Summary */}
          <div className="p-5 rounded-xl bg-obsidian-950 border border-slate-800 space-y-3 font-mono">
            <div className="flex justify-between text-slate-300">
              <span>Venue &amp; Event Date:</span>
              <strong className="text-white">
                {submittedQuote.venueName} • {submittedQuote.eventDate} ({startTime}–{endTime})
              </strong>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Santa Category &amp; Activity:</span>
              <strong className="text-gold-400">
                {q.santaTierLabel} • {q.eventActivityLabel}
              </strong>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Base Rate ({q.rateTerritoryLabel} — Min 3 Hrs):</span>
              <strong className="text-white">₱{q.baseRate.toLocaleString()}</strong>
            </div>
            {q.extraHours > 0 && (
              <div className="flex justify-between text-amber-300">
                <span>
                  Additional Hours ({q.extraHours} hr × ₱3,000/hr):
                </span>
                <strong>+₱{q.extraHourCharge.toLocaleString()}</strong>
              </div>
            )}
            <div className="flex justify-between border-t border-slate-800 pt-3 text-base">
              <span className="font-bold text-white">Total Quoted Package:</span>
              <strong className="text-emerald-400 font-black">
                ₱{q.totalQuotedRate.toLocaleString()}
              </strong>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>50% Reservation Downpayment:</span>
              <span className="text-gold-300 font-bold">
                ₱{q.depositRequired.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Action Buttons to View Live Sync */}
          <div className="space-y-3 pt-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Next Step / Live Operations Links:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href={submittedQuote.statusUrl}
                className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-center flex items-center justify-center space-x-2 shadow-lg transition"
              >
                <span>Open Client Quote &amp; GCash Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/admin/crm"
                className="px-5 py-3 rounded-xl bg-crimson-700 hover:bg-crimson-600 text-white font-bold text-center flex items-center justify-center space-x-2 shadow-lg transition"
              >
                <span>View in Admin CRM Pipeline →</span>
              </Link>
              <Link
                href="/admin/calendar"
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-center transition"
              >
                View on Master Calendar &amp; Excel Sheet →
              </Link>
              <Link
                href="/admin"
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-center transition"
              >
                View on Executive Dashboard →
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="px-3 py-1 rounded-full bg-crimson-950 text-gold-400 border border-crimson-800 text-xs font-mono font-semibold">
          OFFICIAL RATE CARD &amp; QUOTATION ENGINE
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Request a Corporate or Private Santa Quotation
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
          Select your Santa tier (Real Beard vs. Fake Beard), event activity, territory rate, and hours. Every quotation request automatically syncs to the Executive Dashboard, Master Calendar, and CRM Pipeline.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (8 Cols): Structured Intake Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-8 p-6 sm:p-8 rounded-2xl bg-obsidian-900 border border-slate-800 shadow-xl space-y-6 text-xs"
        >
          {/* STEP 1: SANTA BEARD TIER SELECTOR (REAL BEARD VS FAKE BEARD) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-slate-200 font-bold text-sm flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-gold-400" />
                <span>1. Select Santa Claus Tier *</span>
              </label>
              <span className="text-[11px] font-mono text-gold-400">
                Minimum 3 HRS • +₱3,000 / extra hour
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Real Beard Santa Card */}
              <button
                type="button"
                onClick={() => setSantaTier("REAL_BEARD")}
                className={`p-4 rounded-xl border-2 text-left transition relative overflow-hidden ${
                  santaTier === "REAL_BEARD"
                    ? "bg-crimson-950/90 border-gold-400 text-white shadow-lg"
                    : "bg-obsidian-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-extrabold uppercase tracking-wide text-gold-400">
                    🎅 Real Beard Santa Claus
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/40 text-amber-300 font-mono text-[10px] font-bold">
                    Limited Talents
                  </span>
                </div>
                <div className="space-y-1 font-mono text-[11px] text-slate-300 mt-2">
                  <div className="flex justify-between">
                    <span>Metro Manila Rate:</span>
                    <strong className="text-white">PHP 24,000</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Holiday Rate:</span>
                    <strong className="text-gold-300">PHP 26,000</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Out of Town Rate:</span>
                    <strong className="text-gold-300">PHP 26,000.00</strong>
                  </div>
                </div>
                <div className="mt-2.5 pt-2 border-t border-white/10 text-[10px] text-slate-400">
                  Minimum 3 HRS • +PHP 3,000 each additional hour
                </div>
              </button>

              {/* Fake Beard Santa Card */}
              <button
                type="button"
                onClick={() => setSantaTier("FAKE_BEARD")}
                className={`p-4 rounded-xl border-2 text-left transition relative overflow-hidden ${
                  santaTier === "FAKE_BEARD"
                    ? "bg-crimson-950/90 border-gold-400 text-white shadow-lg"
                    : "bg-obsidian-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-extrabold uppercase tracking-wide text-white">
                    🎭 Fake Beard Santa Claus
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px] font-semibold">
                    Standard Roster
                  </span>
                </div>
                <div className="space-y-1 font-mono text-[11px] text-slate-300 mt-2">
                  <div className="flex justify-between">
                    <span>Metro Manila Rate:</span>
                    <strong className="text-white">PHP 15,000</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Holiday Rate:</span>
                    <strong className="text-gold-300">PHP 18,000</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Out of Town Rate:</span>
                    <strong className="text-gold-300">PHP 18,000.00</strong>
                  </div>
                </div>
                <div className="mt-2.5 pt-2 border-t border-white/10 text-[10px] text-slate-400">
                  Minimum 3 HRS • +PHP 3,000 each additional hour
                </div>
              </button>
            </div>
          </div>

          {/* STEP 2: EVENT ACTIVITY PACKAGE TAGS */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <label className="text-slate-200 font-bold text-sm flex items-center space-x-2">
              <Tag className="w-4 h-4 text-gold-400" />
              <span>2. Event Appearance Activity Tag (Minimum 3 Hours) *</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {SANTA_EVENT_ACTIVITIES.map((act) => {
                const active = eventActivityTag === act.id;
                return (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => handleActivityChange(act.id)}
                    className={`p-3 rounded-xl border text-left transition ${
                      active
                        ? "bg-crimson-950 border-crimson-500 text-white shadow-md"
                        : "bg-obsidian-950 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <div className="font-bold text-xs">{act.label}</div>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                      {act.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 3: TERRITORY RATE & DURATION HOURS (MIN 3 HRS + 3K/HR) */}
          <div className="pt-4 border-t border-slate-800 space-y-4">
            <label className="text-slate-200 font-bold text-sm flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gold-400" />
              <span>3. Rate Territory &amp; Appearance Duration *</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                {
                  id: "METRO_MANILA" as SantaRateTerritory,
                  title: "Metro Manila Rate",
                  price:
                    santaTier === "REAL_BEARD" ? "PHP 24,000" : "PHP 15,000",
                  sub: "NCR malls, hotels & venues",
                },
                {
                  id: "HOLIDAY" as SantaRateTerritory,
                  title: "Holiday Rate",
                  price:
                    santaTier === "REAL_BEARD" ? "PHP 26,000" : "PHP 18,000",
                  sub: "Peak Christmas / Holiday dates",
                },
                {
                  id: "OUT_OF_TOWN" as SantaRateTerritory,
                  title: "Out of Town Rate",
                  price:
                    santaTier === "REAL_BEARD" ? "PHP 26,000.00" : "PHP 18,000.00",
                  sub: "Provincial malls & destinations",
                },
              ].map((rt) => (
                <button
                  key={rt.id}
                  type="button"
                  onClick={() => setRateTerritory(rt.id)}
                  className={`p-3 rounded-xl border text-left transition ${
                    rateTerritory === rt.id
                      ? "bg-crimson-950 border-gold-400 text-white"
                      : "bg-obsidian-950 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <div className="text-xs font-bold">{rt.title}</div>
                  <div className="text-sm font-mono font-extrabold text-gold-400 mt-0.5">
                    {rt.price}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{rt.sub}</div>
                </button>
              ))}
            </div>

            {/* Duration Selector (Min 3 HRS + 3,000 each hour) */}
            <div className="p-3.5 rounded-xl bg-obsidian-950 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  Booking Duration (Minimum 3 Hours — Additional ₱3,000 / hour)
                </span>
                <span className="font-mono text-xs text-gold-400 font-bold">
                  {durationHours} Hours Selected
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[3, 4, 5, 6, 8].map((hrs) => {
                  const extra = Math.max(0, hrs - 3) * 3000;
                  return (
                    <button
                      key={hrs}
                      type="button"
                      onClick={() => setDurationHours(hrs)}
                      className={`py-2 px-2.5 rounded-lg border font-mono text-xs transition ${
                        durationHours === hrs
                          ? "bg-crimson-700 border-gold-400 text-white font-bold"
                          : "bg-obsidian-900 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      <div>{hrs} HRS</div>
                      <div className="text-[10px] text-gold-300">
                        {extra === 0 ? "Min Base" : `+₱${extra.toLocaleString()}`}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* STEP 4: CLIENT & CONTACT DETAILS */}
          <div className="pt-4 border-t border-slate-800 space-y-4">
            <label className="block text-slate-200 font-bold text-sm">
              4. Client &amp; Organization Contact *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Contact Person Name *</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Maria Clara Santos"
                  className="w-full px-3 py-2.5 bg-obsidian-950 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Company / Agency / Mall *</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. SM Supermalls / Ayala Malls / Private Host"
                  className="w-full px-3 py-2.5 bg-obsidian-950 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. events@company.ph"
                  className="w-full px-3 py-2.5 bg-obsidian-950 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Mobile / Viber Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 0917 123 4567"
                  className="w-full px-3 py-2.5 bg-obsidian-950 border border-slate-700 rounded-lg text-white"
                />
              </div>
            </div>
          </div>

          {/* STEP 5: EVENT SCHEDULE & VENUE */}
          <div className="pt-4 border-t border-slate-800 space-y-4">
            <label className="block text-slate-200 font-bold text-sm">
              5. Event Date, Time &amp; Venue *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Event Date *</label>
                <input
                  type="date"
                  required
                  value={eventDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full px-3 py-2.5 bg-obsidian-950 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2.5 bg-obsidian-950 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">
                  End Time ({durationHours} Hrs)
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2.5 bg-obsidian-950 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Mall / Venue Name *</label>
                <input
                  type="text"
                  required
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  placeholder="e.g. SM Megamall Mega Fashion Hall"
                  className="w-full px-3 py-2.5 bg-obsidian-950 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">City / Province *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Mandaluyong / Clark, Pampanga / Cebu"
                  className="w-full px-3 py-2.5 bg-obsidian-950 border border-slate-700 rounded-lg text-white"
                />
              </div>
            </div>
          </div>

          {/* STEP 6: SANTA PREFERENCE & NOTES */}
          <div className="pt-4 border-t border-slate-800 space-y-4">
            <label className="block text-slate-200 font-bold text-sm">
              6. Preferred Santa Performer &amp; Event Notes
            </label>
            <div>
              <select
                value={talentPreferenceId}
                onChange={(e) => setTalentPreferenceId(e.target.value)}
                className="w-full px-3 py-2.5 bg-obsidian-950 border border-slate-700 rounded-lg text-white"
              >
                <option value="">
                  No preference — Assign best matched available {liveQuote.santaTierLabel}
                </option>
                {talents.map((t) => (
                  <option key={t.id} value={t.id}>
                    Santa {t.displayName} ({t.nationality || "Real Beard"}, {t.height})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">
                Event Details / Run-of-Show Notes
              </label>
              <textarea
                rows={3}
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="e.g. Meet & Greet throne setup, Christmas launch countdown, photo shoot call time..."
                className="w-full px-3 py-2.5 bg-obsidian-950 border border-slate-700 rounded-lg text-white resize-none"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[11px] text-slate-400 font-mono">
              Automatically logs to Executive Dashboard, Calendar &amp; CRM
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-crimson-700 to-crimson-600 hover:from-crimson-600 hover:to-crimson-500 shadow-xl shadow-crimson-950 border border-crimson-500/50 transition transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              {submitting
                ? "Generating Official Quote..."
                : `Submit Quotation (₱${liveQuote.totalQuotedRate.toLocaleString()}) →`}
            </button>
          </div>
        </form>

        {/* RIGHT COLUMN (4 Cols): Sticky Live Rate Card & Quotation Summary */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
          <div className="p-5 rounded-2xl bg-obsidian-900 border-2 border-crimson-800/80 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Calculator className="w-4 h-4 text-gold-400" />
                <h3 className="text-sm font-extrabold text-white">
                  Live Quotation Summary
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-crimson-950 border border-crimson-700 text-gold-400 font-mono text-[10px] font-bold">
                {santaTier === "REAL_BEARD" ? "LIMITED TALENTS" : "STANDARD"}
              </span>
            </div>

            {/* Active Tags */}
            <div className="flex flex-wrap gap-1.5">
              {liveQuote.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2.5 py-0.5 rounded-full bg-obsidian-950 border border-slate-700 text-gold-300 font-mono text-[10px] font-semibold"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Line Items */}
            <div className="p-4 rounded-xl bg-obsidian-950 border border-slate-800 space-y-2.5 font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Santa Category:</span>
                <strong className="text-white">{liveQuote.santaTierLabel}</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Event Activity:</span>
                <strong className="text-gold-300">{liveQuote.eventActivityLabel}</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Territory Rate:</span>
                <strong className="text-white">{liveQuote.rateTerritoryLabel}</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Base Package (Min 3 HRS):</span>
                <strong className="text-white">
                  ₱{liveQuote.baseRate.toLocaleString()}
                </strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Extra Hours ({liveQuote.extraHours} hr × ₱3,000):</span>
                <strong className="text-amber-300">
                  +₱{liveQuote.extraHourCharge.toLocaleString()}
                </strong>
              </div>

              <div className="pt-2.5 border-t border-slate-800 flex justify-between items-baseline">
                <span className="text-xs font-bold text-white uppercase">
                  Total Quotation:
                </span>
                <span className="text-2xl font-black text-emerald-400">
                  ₱{liveQuote.totalQuotedRate.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                <span>50% Downpayment to Lock:</span>
                <span className="text-gold-400 font-bold">
                  ₱{liveQuote.depositRequired.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Official Rate Card Reference Table */}
            <div className="p-3.5 rounded-xl bg-obsidian-950/70 border border-slate-800/80 space-y-2 text-[11px]">
              <div className="font-bold text-gold-400 uppercase tracking-wider font-mono text-[10px]">
                Official Brillo Santa Rate Card
              </div>
              <div className="space-y-1 text-slate-300">
                <div className="font-semibold text-white">
                  🎅 Real Beard Santa (Limited Talents)
                </div>
                <div className="flex justify-between font-mono text-[10px] text-slate-400">
                  <span>Metro Manila (Min 3 Hrs):</span>
                  <span className="text-white">PHP 24,000</span>
                </div>
                <div className="flex justify-between font-mono text-[10px] text-slate-400">
                  <span>Holiday / Out of Town (Min 3 Hrs):</span>
                  <span className="text-white">PHP 26,000</span>
                </div>
              </div>
              <div className="space-y-1 text-slate-300 pt-1.5 border-t border-slate-800">
                <div className="font-semibold text-white">🎭 Fake Beard Santa</div>
                <div className="flex justify-between font-mono text-[10px] text-slate-400">
                  <span>Metro Manila (Min 3 Hrs):</span>
                  <span className="text-white">PHP 15,000</span>
                </div>
                <div className="flex justify-between font-mono text-[10px] text-slate-400">
                  <span>Holiday / Out of Town (Min 3 Hrs):</span>
                  <span className="text-white">PHP 18,000</span>
                </div>
              </div>
              <div className="pt-1.5 border-t border-slate-800 text-[10px] text-amber-300 font-mono">
                • Activities: Meet &amp; Greet, Christmas Launch, Photo Shoot, Private Party
                <br />• Additional PHP 3,000 for each hour beyond 3 hours
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
