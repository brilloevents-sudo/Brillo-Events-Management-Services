"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Tag,
  MapPin,
  Calculator,
  Phone,
} from "lucide-react";
import {
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
        <div className="p-16 text-center text-sm text-[#5C494E] font-body">
          Loading Official Brillo Events Quotation Calculator...
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
  const [consentAgreed] = useState(true);

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
    const tierParam = searchParams.get("tier");
    const typeParam = searchParams.get("type");
    const dateParam = searchParams.get("date");

    if (pkg === "provincial") setRateTerritory("OUT_OF_TOWN");
    if (pkg === "holiday") setRateTerritory("HOLIDAY");
    if (pkg === "fake" || tierParam === "FAKE_BEARD") setSantaTier("FAKE_BEARD");
    if (pkg === "elves" || tierParam === "SANTA_AND_ELVES") setSantaTier("SANTA_AND_ELVES");
    if (tierParam === "REAL_BEARD") setSantaTier("REAL_BEARD");

    if (typeParam === "private") {
      setBookingType("PRIVATE");
      setEventActivityTag("PRIVATE_PARTY");
    } else if (typeParam === "mall") {
      setEventActivityTag("CHRISTMAS_LAUNCH");
    }

    if (dateParam) {
      setEventDate(dateParam);
      if (dateParam.includes("-12-24") || dateParam.includes("-12-25")) {
        setRateTerritory("HOLIDAY");
      }
    }
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 space-y-6 font-body">
        <div className="p-6 sm:p-10 rounded-3xl bg-white border-2 border-[#D6B36A]/60 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E8DCD0]">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                  Quotation Logged • Synced to Brillo Desk
                </span>
                <h2 className="font-display text-3xl font-bold text-[#211619] mt-1">
                  Official Quotation Generated!
                </h2>
              </div>
            </div>
            <div className="sm:text-right">
              <span className="text-[10px] text-[#7A666B] uppercase tracking-wider block font-semibold">
                Reference ID
              </span>
              <span className="text-lg font-extrabold text-[#780D22] font-mono">
                {submittedQuote.bookingNumber}
              </span>
            </div>
          </div>

          {/* Tags Bar */}
          <div className="flex flex-wrap gap-2">
            {q.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-full bg-[#FFF8F0] border border-[#D6B36A]/50 text-[#780D22] text-[11px] font-bold"
              >
                {tag}
              </span>
            ))}
            <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold">
              Status: Inquiry Received • Availability Review
            </span>
          </div>

          {/* Breakdown Summary */}
          <div className="p-6 rounded-2xl bg-[#FFF8F0] border border-[#E8DCD0] space-y-3 text-xs">
            <div className="flex justify-between text-[#5C494E]">
              <span>Venue &amp; Event Date:</span>
              <strong className="text-[#211619]">
                {submittedQuote.venueName} • {submittedQuote.eventDate} ({startTime}–{endTime})
              </strong>
            </div>
            <div className="flex justify-between text-[#5C494E]">
              <span>Santa Experience &amp; Activity:</span>
              <strong className="text-[#780D22]">
                {q.santaTierLabel} • {q.eventActivityLabel}
              </strong>
            </div>
            <div className="flex justify-between text-[#5C494E]">
              <span>Base Package ({q.rateTerritoryLabel} — Min 3 Hrs):</span>
              <strong className="text-[#211619]">₱{q.baseRate.toLocaleString()}</strong>
            </div>
            {q.extraHours > 0 && (
              <div className="flex justify-between text-[#A61932]">
                <span>Additional Hours ({q.extraHours} hr × ₱3,000/hr):</span>
                <strong>+₱{q.extraHourCharge.toLocaleString()}</strong>
              </div>
            )}
            <div className="flex justify-between border-t border-[#E8DCD0] pt-3 text-base">
              <span className="font-bold text-[#211619]">Total Estimated Package:</span>
              <strong className="text-[#780D22] font-black text-xl">
                ₱{q.totalQuotedRate.toLocaleString()}
              </strong>
            </div>
            <div className="flex justify-between text-[11px] text-[#7A666B]">
              <span>50% Reservation Downpayment (upon confirmation):</span>
              <span className="text-[#211619] font-bold">
                ₱{q.depositRequired.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="text-[11px] uppercase tracking-wider text-[#7A666B] font-semibold">
              Next Steps &amp; Direct Links:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <Link
                href={submittedQuote.statusUrl}
                className="px-5 py-3.5 rounded-full bg-gradient-to-r from-[#780D22] to-[#B82038] hover:from-[#8C1028] hover:to-[#C92640] text-white font-bold text-center flex items-center justify-center space-x-2 shadow-lg transition uppercase tracking-wider"
              >
                <span>Open Client Quote &amp; Payment Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="tel:09278872343"
                className="px-5 py-3.5 rounded-full bg-[#FFF8F0] hover:bg-[#F5EBE0] border border-[#D6B36A] text-[#780D22] font-bold text-center flex items-center justify-center space-x-2 transition uppercase tracking-wider"
              >
                <Phone className="w-4 h-4" />
                <span>Call Desk: 0927 887 2343</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="font-body pb-16">
      {/* Luxury Deep Velvet Hero Header */}
      <section className="bg-gradient-to-b from-[#211619] via-[#590919] to-[#780D22] text-[#FFF8F0] py-14 sm:py-16 px-4 sm:px-6 border-b border-[#D6B36A]/30">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#211619]/60 text-[#D6B36A] border border-[#D6B36A]/40 text-[11px] font-bold uppercase tracking-[0.18em]">
            <Sparkles className="w-3.5 h-3.5" />
            Official Santa Quotation &amp; Availability Request
          </span>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#FFF8F0] leading-tight">
            Request Your Christmas Experience Quotation
          </h1>
          <p className="text-sm sm:text-base text-[#FFF8F0]/85 max-w-2xl mx-auto leading-relaxed">
            Choose your preferred Santa experience — Authentic Real-Beard Santa, Classic Santa, or our complete Santa &amp; Two Elves package. Limited holiday dates are confirmed upon booking.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-6 space-y-8">
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center space-x-2 shadow-md">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-700" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          {/* LEFT COLUMN (8 Cols): Structured Intake Form */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-8 p-6 sm:p-9 rounded-3xl bg-white border border-[#E8DCD0] shadow-xl space-y-7 text-xs"
          >
            {/* STEP 1: SANTA EXPERIENCE TIER SELECTOR */}
            <div className="space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="text-[#211619] font-bold text-sm flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-[#A61932]" />
                  <span>1. Choose Your Santa Experience *</span>
                </label>
                <span className="text-[11px] font-semibold text-[#780D22]">
                  Minimum 3 Hours • +₱3,000 per additional hour
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {/* Real-Beard Santa Card */}
                <button
                  type="button"
                  onClick={() => setSantaTier("REAL_BEARD")}
                  className={`p-4 rounded-2xl border-2 text-left transition flex flex-col justify-between ${
                    santaTier === "REAL_BEARD"
                      ? "bg-[#780D22] border-[#D6B36A] text-[#FFF8F0] shadow-lg"
                      : "bg-[#FFF8F0] border-[#E8DCD0] text-[#211619] hover:border-[#D6B36A]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          santaTier === "REAL_BEARD"
                            ? "bg-[#D6B36A]/20 text-[#F3D899]"
                            : "bg-[#780D22]/10 text-[#780D22]"
                        }`}
                      >
                        Limited Talents
                      </span>
                    </div>
                    <div className="font-display text-xl font-bold leading-snug">
                      Real-Beard Santa
                    </div>
                    <div
                      className={`space-y-1 text-[11px] mt-2.5 ${
                        santaTier === "REAL_BEARD" ? "text-[#FFF8F0]/90" : "text-[#5C494E]"
                      }`}
                    >
                      <div className="flex justify-between">
                        <span>Metro Manila:</span>
                        <strong>₱24,000</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Holiday Rate:</span>
                        <strong>₱26,000</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Out-of-Town:</span>
                        <strong>₱26,000</strong>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`mt-3 pt-2 border-t text-[10px] ${
                      santaTier === "REAL_BEARD"
                        ? "border-white/15 text-[#F3D899]"
                        : "border-[#E8DCD0] text-[#7A666B]"
                    }`}
                  >
                    Natural real beard • Min 3 hrs
                  </div>
                </button>

                {/* Classic Santa Card */}
                <button
                  type="button"
                  onClick={() => setSantaTier("FAKE_BEARD")}
                  className={`p-4 rounded-2xl border-2 text-left transition flex flex-col justify-between ${
                    santaTier === "FAKE_BEARD"
                      ? "bg-[#780D22] border-[#D6B36A] text-[#FFF8F0] shadow-lg"
                      : "bg-[#FFF8F0] border-[#E8DCD0] text-[#211619] hover:border-[#D6B36A]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          santaTier === "FAKE_BEARD"
                            ? "bg-[#D6B36A]/20 text-[#F3D899]"
                            : "bg-[#211619]/10 text-[#5C494E]"
                        }`}
                      >
                        Festive Option
                      </span>
                    </div>
                    <div className="font-display text-xl font-bold leading-snug">
                      Classic Santa
                    </div>
                    <div
                      className={`space-y-1 text-[11px] mt-2.5 ${
                        santaTier === "FAKE_BEARD" ? "text-[#FFF8F0]/90" : "text-[#5C494E]"
                      }`}
                    >
                      <div className="flex justify-between">
                        <span>Metro Manila:</span>
                        <strong>₱15,000</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Holiday Rate:</span>
                        <strong>₱18,000</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Out-of-Town:</span>
                        <strong>₱18,000</strong>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`mt-3 pt-2 border-t text-[10px] ${
                      santaTier === "FAKE_BEARD"
                        ? "border-white/15 text-[#F3D899]"
                        : "border-[#E8DCD0] text-[#7A666B]"
                    }`}
                  >
                    Traditional costume • Min 3 hrs
                  </div>
                </button>

                {/* Santa & Two Elves Card */}
                <button
                  type="button"
                  onClick={() => setSantaTier("SANTA_AND_ELVES")}
                  className={`p-4 rounded-2xl border-2 text-left transition flex flex-col justify-between ${
                    santaTier === "SANTA_AND_ELVES"
                      ? "bg-[#780D22] border-[#D6B36A] text-[#FFF8F0] shadow-lg"
                      : "bg-[#FFF8F0] border-[#E8DCD0] text-[#211619] hover:border-[#D6B36A]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          santaTier === "SANTA_AND_ELVES"
                            ? "bg-[#D6B36A]/20 text-[#F3D899]"
                            : "bg-[#D6B36A]/25 text-[#780D22]"
                        }`}
                      >
                        Full Cast
                      </span>
                    </div>
                    <div className="font-display text-xl font-bold leading-snug">
                      Santa &amp; Two Elves
                    </div>
                    <div
                      className={`space-y-1 text-[11px] mt-2.5 ${
                        santaTier === "SANTA_AND_ELVES" ? "text-[#FFF8F0]/90" : "text-[#5C494E]"
                      }`}
                    >
                      <div className="flex justify-between">
                        <span>Package Rate:</span>
                        <strong>₱32,000</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Performers:</span>
                        <strong>1 Santa + 2 Elves</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Extra Hours:</span>
                        <strong>+₱3,000/hr</strong>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`mt-3 pt-2 border-t text-[10px] ${
                      santaTier === "SANTA_AND_ELVES"
                        ? "border-white/15 text-[#F3D899]"
                        : "border-[#E8DCD0] text-[#7A666B]"
                    }`}
                  >
                    1 Santa + 2 Elves • Min 3 hrs
                  </div>
                </button>
              </div>
            </div>

            {/* STEP 2: EVENT ACTIVITY PACKAGE TAGS */}
            <div className="pt-5 border-t border-[#EFE5DA] space-y-3">
              <label className="text-[#211619] font-bold text-sm flex items-center space-x-2">
                <Tag className="w-4 h-4 text-[#A61932]" />
                <span>2. Event Format &amp; Occasion *</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {SANTA_EVENT_ACTIVITIES.map((act) => {
                  const active = eventActivityTag === act.id;
                  return (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => handleActivityChange(act.id)}
                      className={`p-3.5 rounded-xl border text-left transition ${
                        active
                          ? "bg-[#780D22] border-[#D6B36A] text-white shadow-md"
                          : "bg-[#FFF8F0] border-[#E8DCD0] text-[#211619] hover:border-[#D6B36A]"
                      }`}
                    >
                      <div className="font-bold text-xs">{act.label}</div>
                      <p
                        className={`text-[10px] mt-1 line-clamp-2 ${
                          active ? "text-[#FFF8F0]/80" : "text-[#7A666B]"
                        }`}
                      >
                        {act.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 3: TERRITORY RATE & DURATION HOURS */}
            <div className="pt-5 border-t border-[#EFE5DA] space-y-4">
              <label className="text-[#211619] font-bold text-sm flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-[#A61932]" />
                <span>3. Location Rate &amp; Appearance Duration *</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    id: "METRO_MANILA" as SantaRateTerritory,
                    title: "Metro Manila Rate",
                    price:
                      santaTier === "SANTA_AND_ELVES"
                        ? "₱32,000"
                        : santaTier === "REAL_BEARD"
                        ? "₱24,000"
                        : "₱15,000",
                    sub: "NCR malls, hotels & residences",
                  },
                  {
                    id: "HOLIDAY" as SantaRateTerritory,
                    title: "Holiday Rate",
                    price:
                      santaTier === "SANTA_AND_ELVES"
                        ? "₱32,000"
                        : santaTier === "REAL_BEARD"
                        ? "₱26,000"
                        : "₱18,000",
                    sub: "Peak Christmas / Holiday dates",
                  },
                  {
                    id: "OUT_OF_TOWN" as SantaRateTerritory,
                    title: "Out-of-Town Rate",
                    price:
                      santaTier === "SANTA_AND_ELVES"
                        ? "₱32,000*"
                        : santaTier === "REAL_BEARD"
                        ? "₱26,000"
                        : "₱18,000",
                    sub: "Provincial malls & resorts",
                  },
                ].map((rt) => (
                  <button
                    key={rt.id}
                    type="button"
                    onClick={() => setRateTerritory(rt.id)}
                    className={`p-3.5 rounded-xl border text-left transition ${
                      rateTerritory === rt.id
                        ? "bg-[#780D22] border-[#D6B36A] text-white shadow-sm"
                        : "bg-[#FFF8F0] border-[#E8DCD0] text-[#211619] hover:border-[#D6B36A]"
                    }`}
                  >
                    <div className="text-xs font-bold">{rt.title}</div>
                    <div
                      className={`text-base font-extrabold mt-0.5 ${
                        rateTerritory === rt.id ? "text-[#F3D899]" : "text-[#780D22]"
                      }`}
                    >
                      {rt.price}
                    </div>
                    <div
                      className={`text-[10px] mt-0.5 ${
                        rateTerritory === rt.id ? "text-[#FFF8F0]/80" : "text-[#7A666B]"
                      }`}
                    >
                      {rt.sub}
                    </div>
                  </button>
                ))}
              </div>

              {/* Duration Selector */}
              <div className="p-4 rounded-2xl bg-[#FFF8F0] border border-[#E8DCD0] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#211619]">
                    Booking Duration (Minimum 3 Hours — +₱3,000 per extra hour)
                  </span>
                  <span className="text-xs text-[#780D22] font-bold">
                    {durationHours} Hours Selected
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[3, 4, 5, 6, 8].map((hrs) => {
                    const extra = Math.max(0, hrs - 3) * 3000;
                    const active = durationHours === hrs;
                    return (
                      <button
                        key={hrs}
                        type="button"
                        onClick={() => setDurationHours(hrs)}
                        className={`py-2.5 px-2.5 rounded-xl border text-xs transition ${
                          active
                            ? "bg-[#780D22] border-[#D6B36A] text-white font-bold shadow-sm"
                            : "bg-white border-[#E8DCD0] text-[#5C494E] hover:border-[#D6B36A]"
                        }`}
                      >
                        <div>{hrs} Hours</div>
                        <div
                          className={`text-[10px] ${
                            active ? "text-[#F3D899]" : "text-[#A61932]"
                          }`}
                        >
                          {extra === 0 ? "Base 3 Hrs" : `+₱${extra.toLocaleString()}`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* STEP 4: CLIENT & CONTACT DETAILS */}
            <div className="pt-5 border-t border-[#EFE5DA] space-y-4">
              <label className="block text-[#211619] font-bold text-sm">
                4. Your Contact Details *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[#5C494E] font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Maria Clara Santos"
                    className="w-full px-3.5 py-2.5 bg-[#FFF8F0] border border-[#D8C9BA] rounded-xl text-[#211619] focus:outline-none focus:border-[#780D22]"
                  />
                </div>

                <div>
                  <label className="block text-[#5C494E] font-medium mb-1">
                    Company / Mall / Organization *
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. SM Supermalls / Ayala Malls / Private Host"
                    className="w-full px-3.5 py-2.5 bg-[#FFF8F0] border border-[#D8C9BA] rounded-xl text-[#211619] focus:outline-none focus:border-[#780D22]"
                  />
                </div>

                <div>
                  <label className="block text-[#5C494E] font-medium mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. events@company.ph"
                    className="w-full px-3.5 py-2.5 bg-[#FFF8F0] border border-[#D8C9BA] rounded-xl text-[#211619] focus:outline-none focus:border-[#780D22]"
                  />
                </div>

                <div>
                  <label className="block text-[#5C494E] font-medium mb-1">
                    Mobile / Viber Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 0917 123 4567"
                    className="w-full px-3.5 py-2.5 bg-[#FFF8F0] border border-[#D8C9BA] rounded-xl text-[#211619] focus:outline-none focus:border-[#780D22]"
                  />
                </div>
              </div>
            </div>

            {/* STEP 5: EVENT SCHEDULE & VENUE */}
            <div className="pt-5 border-t border-[#EFE5DA] space-y-4">
              <label className="block text-[#211619] font-bold text-sm">
                5. Event Date, Time &amp; Venue *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-[#5C494E] font-medium mb-1">Event Date *</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FFF8F0] border border-[#D8C9BA] rounded-xl text-[#211619] focus:outline-none focus:border-[#780D22]"
                  />
                </div>

                <div>
                  <label className="block text-[#5C494E] font-medium mb-1">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FFF8F0] border border-[#D8C9BA] rounded-xl text-[#211619] focus:outline-none focus:border-[#780D22]"
                  />
                </div>

                <div>
                  <label className="block text-[#5C494E] font-medium mb-1">
                    End Time ({durationHours} Hrs)
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FFF8F0] border border-[#D8C9BA] rounded-xl text-[#211619] focus:outline-none focus:border-[#780D22]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[#5C494E] font-medium mb-1">
                    Mall / Hotel / Venue Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    placeholder="e.g. SM Megamall / Shangri-La / Private Residence"
                    className="w-full px-3.5 py-2.5 bg-[#FFF8F0] border border-[#D8C9BA] rounded-xl text-[#211619] focus:outline-none focus:border-[#780D22]"
                  />
                </div>

                <div>
                  <label className="block text-[#5C494E] font-medium mb-1">
                    City / Province *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Makati / BGC / Clark, Pampanga / Cebu"
                    className="w-full px-3.5 py-2.5 bg-[#FFF8F0] border border-[#D8C9BA] rounded-xl text-[#211619] focus:outline-none focus:border-[#780D22]"
                  />
                </div>
              </div>
            </div>

            {/* STEP 6: SANTA PREFERENCE & NOTES */}
            <div className="pt-5 border-t border-[#EFE5DA] space-y-4">
              <label className="block text-[#211619] font-bold text-sm">
                6. Preferred Santa Performer &amp; Event Notes
              </label>
              <div>
                <select
                  value={talentPreferenceId}
                  onChange={(e) => setTalentPreferenceId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FFF8F0] border border-[#D8C9BA] rounded-xl text-[#211619] focus:outline-none focus:border-[#780D22]"
                >
                  <option value="">
                    Recommend best available performer for {liveQuote.santaTierLabel}
                  </option>
                  {talents.map((t) => (
                    <option key={t.id} value={t.id}>
                      Santa {t.displayName} ({t.nationality || "Real Beard"}, {t.height})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#5C494E] font-medium mb-1">
                  Event Program / Special Requests
                </label>
                <textarea
                  rows={3}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Tell us about your Christmas tree lighting, meet-and-greet setup, gift distribution, or photo shoot schedule..."
                  className="w-full px-3.5 py-2.5 bg-[#FFF8F0] border border-[#D8C9BA] rounded-xl text-[#211619] resize-none focus:outline-none focus:border-[#780D22]"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-5 border-t border-[#EFE5DA] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-[11px] text-[#7A666B]">
                Availability is confirmed upon booking. Travel &amp; lodging billed separately for provincial events.
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-xs uppercase tracking-[0.14em] text-white bg-gradient-to-r from-[#780D22] to-[#B82038] hover:from-[#8C1028] hover:to-[#C92640] shadow-xl transition transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                {submitting
                  ? "Submitting Inquiry..."
                  : `Request Official Quotation (₱${liveQuote.totalQuotedRate.toLocaleString()}) →`}
              </button>
            </div>
          </form>

          {/* RIGHT COLUMN (4 Cols): Sticky Live Rate Card & Quotation Summary */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-5">
            <div className="p-6 rounded-3xl bg-[#211619] text-[#FFF8F0] border-2 border-[#D6B36A]/50 shadow-2xl space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
                <div className="flex items-center space-x-2">
                  <Calculator className="w-4 h-4 text-[#D6B36A]" />
                  <h3 className="font-display text-xl font-bold text-[#FFF8F0]">
                    Live Quotation Estimate
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#780D22] border border-[#D6B36A]/50 text-[#F3D899] text-[10px] font-bold uppercase tracking-wider">
                  {santaTier === "REAL_BEARD"
                    ? "Real Beard"
                    : santaTier === "SANTA_AND_ELVES"
                    ? "Santa + 2 Elves"
                    : "Classic"}
                </span>
              </div>

              {/* Active Tags */}
              <div className="flex flex-wrap gap-1.5">
                {liveQuote.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/15 text-[#F3D899] text-[10px] font-semibold"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Line Items */}
              <div className="p-4 rounded-2xl bg-black/30 border border-white/10 space-y-2.5">
                <div className="flex justify-between text-[#FFF8F0]/75">
                  <span>Experience:</span>
                  <strong className="text-white">{liveQuote.santaTierLabel}</strong>
                </div>
                <div className="flex justify-between text-[#FFF8F0]/75">
                  <span>Event Format:</span>
                  <strong className="text-[#F3D899]">{liveQuote.eventActivityLabel}</strong>
                </div>
                <div className="flex justify-between text-[#FFF8F0]/75">
                  <span>Location Tier:</span>
                  <strong className="text-white">{liveQuote.rateTerritoryLabel}</strong>
                </div>
                <div className="flex justify-between text-[#FFF8F0]/75">
                  <span>Base Package (3 Hrs):</span>
                  <strong className="text-white">₱{liveQuote.baseRate.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between text-[#FFF8F0]/75">
                  <span>Extra Hours ({liveQuote.extraHours} hr × ₱3,000):</span>
                  <strong className="text-[#F3D899]">
                    +₱{liveQuote.extraHourCharge.toLocaleString()}
                  </strong>
                </div>

                <div className="pt-3 border-t border-white/10 flex justify-between items-baseline">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Estimated Total:
                  </span>
                  <span className="font-display text-3xl font-bold text-[#D6B36A]">
                    ₱{liveQuote.totalQuotedRate.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-[#FFF8F0]/70 pt-1">
                  <span>50% Reservation Downpayment:</span>
                  <span className="text-white font-bold">
                    ₱{liveQuote.depositRequired.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Official Rate Card Quick Reference */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5 text-[11px]">
                <div className="font-bold text-[#D6B36A] uppercase tracking-[0.14em] text-[10px]">
                  Official Starting Rates (Min 3 Hours)
                </div>
                <div className="space-y-1 text-[#FFF8F0]/85">
                  <div className="flex justify-between">
                    <span>Real-Beard Santa (MM):</span>
                    <strong>₱24,000</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Real-Beard (Holiday / Provincial):</span>
                    <strong>₱26,000</strong>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-white/10">
                    <span>Classic Santa (MM / Holiday):</span>
                    <strong>₱15,000 / ₱18,000</strong>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-white/10">
                    <span>Santa &amp; Two Elves Package:</span>
                    <strong>₱32,000</strong>
                  </div>
                  <div className="text-[10px] text-[#F3D899] pt-1">
                    Additional Hours: +₱3,000 per hour
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
