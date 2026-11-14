"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Sparkles,
  MapPin,
  Calendar,
  Clock,
  X,
  Star,
  AlertCircle,
  ArrowRight,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";
import {
  EvaluatedSantaAvailability,
  AvailabilityEvaluationSummary,
  QUICK_LOCATION_PILLS,
  evaluateSantaAvailabilityForDate,
  formatShortHolidayDate,
  formatFullHolidayDate,
} from "@/lib/santa-availability";
import {
  loadAllTalentsFromStorage,
  subscribeToTalentUpdates,
} from "@/lib/talent-storage";

export default function AvailabilityPage() {
  const [selectedDate, setSelectedDate] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<
    "ALL" | "NEARBY" | "AVAILABLE" | "BOOKED"
  >("ALL");

  const [rawTalents, setRawTalents] = useState<any[]>([]);
  const [santas, setSantas] = useState<EvaluatedSantaAvailability[]>([]);
  const [summary, setSummary] = useState<AvailabilityEvaluationSummary | null>(
    null
  );

  // Quick photo preview lightbox state
  const [previewSanta, setPreviewSanta] =
    useState<EvaluatedSantaAvailability | null>(null);
  const [previewPhotoIndex, setPreviewPhotoIndex] = useState(0);

  async function fetchAndMergeTalents() {
    try {
      const res = await fetch("/api/talents?publicOnly=true", {
        cache: "no-store",
      });
      const data = await res.json();
      const apiTalents = Array.isArray(data?.talents) ? data.talents : [];
      const storedMap: Record<string, any> = await loadAllTalentsFromStorage().catch(
        () => ({})
      );

      const merged = apiTalents
        .map((t: any) => {
          const override =
            storedMap[t.id] ||
            (t.canonicalId ? storedMap[t.canonicalId] : null);
          if (!override) return t;
          return {
            ...t,
            ...override,
            images:
              Array.isArray(override.images) &&
              (override.images.length > 0 || override.explicitlyClearedImages)
                ? override.images
                : t.images,
            publicSchedule: t.publicSchedule || override.publicSchedule || [],
            assignments:
              Array.isArray(t.assignments) && t.assignments.length > 0
                ? t.assignments
                : override.assignments || [],
          };
        })
        .filter((t: any) => Boolean(t.approvedForPublicDisplay));

      setRawTalents(merged);
      return merged;
    } catch {
      return rawTalents;
    }
  }

  useEffect(() => {
    fetchAndMergeTalents();
    const unsub = subscribeToTalentUpdates(() => {
      fetchAndMergeTalents();
    });
    return () => unsub();
  }, []);

  // Re-evaluate whenever rawTalents, selectedDate, or locationQuery changes while checked
  useEffect(() => {
    if (!selectedDate || rawTalents.length === 0) return;
    const evaluation = evaluateSantaAvailabilityForDate(
      rawTalents,
      selectedDate,
      locationQuery
    );
    setSantas(evaluation.santas);
    setSummary(evaluation.summary);
  }, [rawTalents, selectedDate, locationQuery]);

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDate) return;

    setLoading(true);
    try {
      const mergedTalents = await fetchAndMergeTalents();
      const res = await fetch(
        `/api/public/availability?date=${encodeURIComponent(
          selectedDate
        )}&location=${encodeURIComponent(locationQuery)}`,
        { cache: "no-store" }
      );
      const data = await res.json();

      if (data?.success && Array.isArray(data.santas) && mergedTalents.length === 0) {
        setSantas(data.santas);
        setSummary(data.summary);
      } else {
        const evaluation = evaluateSantaAvailabilityForDate(
          mergedTalents.length > 0 ? mergedTalents : data?.santas || [],
          selectedDate,
          locationQuery
        );
        setSantas(evaluation.santas);
        setSummary(evaluation.summary);
      }
      setActiveFilter("ALL");
      setChecked(true);
      setIsModalOpen(true);
    } catch {
      const evaluation = evaluateSantaAvailabilityForDate(
        rawTalents,
        selectedDate,
        locationQuery
      );
      setSantas(evaluation.santas);
      setSummary(evaluation.summary);
      setActiveFilter("ALL");
      setChecked(true);
      setIsModalOpen(true);
    } finally {
      setLoading(false);
    }
  }

  function handleSwitchDate(newDate: string) {
    setSelectedDate(newDate);
    setChecked(true);
    setActiveFilter("ALL");
    const evaluation = evaluateSantaAvailabilityForDate(
      rawTalents,
      newDate,
      locationQuery
    );
    setSantas(evaluation.santas);
    setSummary(evaluation.summary);
    setIsModalOpen(true);
  }

  const isPeakHoliday =
    selectedDate.includes("-12-24") ||
    selectedDate.includes("-12-25") ||
    selectedDate.includes("-12-30") ||
    selectedDate.includes("-12-31");

  const filteredSantas = santas.filter((santa) => {
    if (activeFilter === "NEARBY") {
      return santa.locationMatch.isNearClient;
    }
    if (activeFilter === "AVAILABLE") {
      return santa.isAvailableOnDate;
    }
    if (activeFilter === "BOOKED") {
      return !santa.isAvailableOnDate;
    }
    return true;
  });

  const nearbyTotalCount = santas.filter(
    (s) => s.locationMatch.isNearClient
  ).length;
  const availableCount = summary?.availableCount ?? santas.filter((s) => s.isAvailableOnDate).length;
  const bookedCount = summary?.bookedCount ?? santas.filter((s) => !s.isAvailableOnDate).length;
  const nearbyAvailableCount =
    summary?.nearbyAvailableCount ??
    santas.filter((s) => s.isAvailableOnDate && s.locationMatch.isNearClient)
      .length;

  return (
    <div className="font-body pb-20">
      <section className="bg-gradient-to-b from-[#211619] via-[#590919] to-[#780D22] text-[#FFF8F0] py-16 sm:py-20 px-4 sm:px-6 border-b border-[#D6B36A]/30">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#211619]/60 text-[#D6B36A] border border-[#D6B36A]/40 text-[11px] font-bold uppercase tracking-[0.18em]">
            <Sparkles className="w-3.5 h-3.5" />
            Holiday Date &amp; Location Matcher
          </span>
          <h1 className="font-display text-4xl sm:text-6xl font-semibold text-[#FFF8F0] leading-tight">
            Check Santa Calendar Availability
          </h1>
          <p className="text-sm sm:text-base text-[#FFF8F0]/85 max-w-xl mx-auto leading-relaxed">
            Select your preferred event date and city/venue to view our live Santa roster availability, booked schedules, and recommended Santas nearest to your location.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        <form
          onSubmit={handleCheck}
          className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8DCD0] shadow-xl space-y-6 text-xs"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[#211619] font-bold text-sm mb-2 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#780D22]" />
                <span>Select Desired Event Date *</span>
              </label>
              <input
                type="date"
                required
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                }}
                className="w-full px-4 py-3.5 bg-[#FFF8F0] border border-[#D8C9BA] rounded-xl text-[#211619] text-sm focus:outline-none focus:border-[#780D22]"
              />
            </div>

            <div>
              <label className="block text-[#211619] font-bold text-sm mb-2 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#780D22]" />
                <span>Your Event Location / City / Venue</span>
              </label>
              <input
                type="text"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="e.g. Makati, BGC, Megamall, Quezon City, Clark..."
                className="w-full px-4 py-3.5 bg-[#FFF8F0] border border-[#D8C9BA] rounded-xl text-[#211619] text-sm focus:outline-none focus:border-[#780D22]"
              />
            </div>
          </div>

          {/* Quick Location Pills */}
          <div className="space-y-2">
            <div className="text-[11px] font-semibold text-[#6E5D5F] flex items-center justify-between">
              <span>Quick-Select Event Area (Recommends Nearest Available Santas):</span>
              {locationQuery && (
                <button
                  type="button"
                  onClick={() => setLocationQuery("")}
                  className="text-[#780D22] hover:underline font-bold"
                >
                  Clear Location
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_LOCATION_PILLS.map((pill) => {
                const isSelected =
                  locationQuery.toLowerCase().trim() === pill.toLowerCase();
                return (
                  <button
                    key={pill}
                    type="button"
                    onClick={() =>
                      setLocationQuery(isSelected ? "" : pill)
                    }
                    className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition ${
                      isSelected
                        ? "bg-[#780D22] text-white border-[#D6B36A] shadow-sm"
                        : "bg-[#FFF8F0] text-[#5C494E] border-[#E8DCD0] hover:border-[#780D22]"
                    }`}
                  >
                    📍 {pill}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-full font-bold text-xs uppercase tracking-[0.15em] bg-gradient-to-r from-[#780D22] to-[#B82038] hover:from-[#8C1028] hover:to-[#C92640] text-white transition shadow-lg disabled:opacity-60"
          >
            {loading
              ? "Checking Live Santa Roster Schedule..."
              : "Check Date Availability & View Santa List →"}
          </button>
        </form>

        {checked && selectedDate && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-[#D6B36A] shadow-xl space-y-6 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFE5DA] pb-5">
              <div className="flex items-start space-x-3.5">
                <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-display text-2xl font-bold text-[#211619]">
                    Inquiries Open for {formatFullHolidayDate(selectedDate)}
                  </h3>
                  <p className="text-[#5C494E] text-xs mt-1 leading-relaxed">
                    {isPeakHoliday
                      ? "Peak Christmas Holiday Date. Real-Beard Santa availability is highly limited and confirmed upon booking."
                      : "Holiday appearance windows are open for Metro Manila and nationwide bookings."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-5 py-3 rounded-full font-bold text-xs uppercase tracking-wider bg-[#211619] hover:bg-[#3A252B] text-[#F3D899] border border-[#D6B36A]/60 transition shadow-md shrink-0 flex items-center gap-2"
              >
                <Users className="w-4 h-4 text-[#D6B36A]" />
                <span>
                  Open Santa Availability Popup ({availableCount} Available)
                </span>
              </button>
            </div>

            {/* Live Status Summary Counters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                    Available Santas
                  </div>
                  <div className="font-display text-2xl font-bold text-emerald-900 mt-0.5">
                    {availableCount} Available
                  </div>
                  <div className="text-[11px] text-emerald-700">
                    Ready for {formatShortHolidayDate(selectedDate)}
                  </div>
                </div>
                <CheckCircle2 className="w-8 h-8 text-emerald-600/80" />
              </div>

              <div className="p-4 rounded-2xl bg-[#FFF8F0] border border-[#D6B36A]/60 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#780D22]">
                    {locationQuery
                      ? `Recommended Near ${locationQuery}`
                      : "Location Match"}
                  </div>
                  <div className="font-display text-2xl font-bold text-[#211619] mt-0.5">
                    {locationQuery
                      ? `${nearbyAvailableCount} Nearby Free`
                      : "All NCR & PH"}
                  </div>
                  <div className="text-[11px] text-[#5C494E]">
                    {locationQuery
                      ? "Closest available performers"
                      : "Enter a city above to rank nearest"}
                  </div>
                </div>
                <MapPin className="w-8 h-8 text-[#780D22]/80" />
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
                    Already Booked on Date
                  </div>
                  <div className="font-display text-2xl font-bold text-amber-950 mt-0.5">
                    {bookedCount} Booked
                  </div>
                  <div className="text-[11px] text-amber-800">
                    Next open dates listed in popup
                  </div>
                </div>
                <Clock className="w-8 h-8 text-amber-600/80" />
              </div>
            </div>

            {/* Quick Preview of Top Available Santas */}
            {santas.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#211619]">
                    {locationQuery
                      ? `Top Recommended Santas for ${formatShortHolidayDate(
                          selectedDate
                        )} (${locationQuery})`
                      : `Santa Roster Overview for ${formatShortHolidayDate(
                          selectedDate
                        )}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="text-xs font-bold text-[#780D22] hover:underline flex items-center gap-1"
                  >
                    <span>View All {santas.length} Santas in Popup</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {santas.slice(0, 3).map((santa) => (
                    <div
                      key={santa.id}
                      onClick={() => setIsModalOpen(true)}
                      className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center gap-3 ${
                        santa.isAvailableOnDate && santa.locationMatch.isNearClient
                          ? "bg-[#FFF8F0] border-[#D6B36A] shadow-sm"
                          : santa.isAvailableOnDate
                          ? "bg-white border-[#E8DCD0] hover:border-[#D6B36A]"
                          : "bg-stone-50 border-stone-200 opacity-85"
                      }`}
                    >
                      <img
                        src={santa.primaryImageUrl}
                        alt={`Santa ${santa.displayName}`}
                        className="w-14 h-14 rounded-xl object-cover border border-[#D6B36A]/40 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-[#211619] text-sm truncate">
                            Santa {santa.displayName}
                          </span>
                        </div>
                        <div className="mt-0.5 flex flex-wrap gap-1">
                          {santa.isAvailableOnDate ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              ✓ Available
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                              ● Booked
                            </span>
                          )}
                          {santa.locationMatch.isNearClient && (
                            <span className="px-2 py-0.5 rounded-full bg-[#780D22] text-[#F3D899] text-[10px] font-bold">
                              ★ Near You
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[#6E5D5F] truncate mt-1">
                          📍 {santa.baseCity}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-5 rounded-2xl bg-[#FFF8F0] border border-[#E8DCD0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#7A666B]">
                  Starting Package Rates (Min 3 Hours):
                </span>
                <div className="font-bold text-[#780D22] text-sm">
                  {isPeakHoliday
                    ? "Real-Beard Santa: ₱26,000 • Classic Santa: ₱18,000 • Santa & 2 Elves: ₱32,000"
                    : "Real-Beard Santa: ₱24,000 • Classic Santa: ₱15,000 • Santa & 2 Elves: ₱32,000"}
                </div>
                <div className="text-[11px] text-[#5C494E]">
                  Out-of-town rate: ₱26,000 (Real-Beard) / ₱18,000 (Classic) • Extra hours: +₱3,000/hr
                </div>
              </div>

              <Link
                href={`/request-quote?date=${encodeURIComponent(
                  selectedDate
                )}${
                  locationQuery
                    ? `&city=${encodeURIComponent(locationQuery)}`
                    : ""
                }`}
                className="px-6 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-[#780D22] to-[#B82038] text-white transition shadow-md shrink-0"
              >
                Request Quotation →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* =====================================================================
          SANTA AVAILABILITY & LOCATION MATCH POPUP MODAL
         ===================================================================== */}
      {isModalOpen && selectedDate && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-[#FAF7F5] border-2 border-[#D6B36A] rounded-3xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#211619] via-[#4A0B17] to-[#780D22] text-[#FFF8F0] px-5 sm:px-7 py-5 border-b border-[#D6B36A]/40 shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/30 border border-[#D6B36A]/40 text-[#F3D899] text-[10px] font-bold uppercase tracking-widest">
                    <Sparkles className="w-3 h-3" />
                    <span>Live Santa Availability &amp; Location Matcher</span>
                  </div>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                    Santa Roster for {formatFullHolidayDate(selectedDate)}
                  </h2>
                  <p className="text-xs text-[#FFF8F0]/80">
                    Showing all Publicly Approved Santas, their live booking status on{" "}
                    <strong className="text-[#F3D899]">
                      {formatShortHolidayDate(selectedDate)}
                    </strong>
                    , recommended performers nearest to your venue, and next available dates.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition shrink-0"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Controls inside Modal Header: Date Switcher + Live Location Input + Filter Tabs */}
              <div className="mt-4 pt-4 border-t border-white/15 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                <div className="md:col-span-4 relative">
                  <Calendar className="w-3.5 h-3.5 text-[#D6B36A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      if (e.target.value) handleSwitchDate(e.target.value);
                    }}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/35 border border-[#D6B36A]/40 text-white text-xs focus:outline-none focus:border-[#D6B36A]"
                  />
                </div>

                <div className="md:col-span-8 relative">
                  <Search className="w-3.5 h-3.5 text-[#D6B36A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    placeholder="Filter by your Event City / Mall / Venue (e.g. Makati, BGC, Megamall, Quezon City, Clark)..."
                    className="w-full pl-9 pr-20 py-2 rounded-xl bg-black/35 border border-[#D6B36A]/40 text-white placeholder:text-white/50 text-xs focus:outline-none focus:border-[#D6B36A]"
                  />
                  {locationQuery && (
                    <button
                      type="button"
                      onClick={() => setLocationQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#F3D899] hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveFilter("ALL")}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                    activeFilter === "ALL"
                      ? "bg-[#D6B36A] text-[#211619] shadow"
                      : "bg-white/10 text-white/85 hover:bg-white/20"
                  }`}
                >
                  All Santas ({santas.length})
                </button>

                {locationQuery && (
                  <button
                    type="button"
                    onClick={() => setActiveFilter("NEARBY")}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1 ${
                      activeFilter === "NEARBY"
                        ? "bg-[#D6B36A] text-[#211619] shadow"
                        : "bg-white/10 text-[#F3D899] hover:bg-white/20"
                    }`}
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>
                      Near &ldquo;{locationQuery}&rdquo; ({nearbyTotalCount})
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setActiveFilter("AVAILABLE")}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                    activeFilter === "AVAILABLE"
                      ? "bg-emerald-500 text-white shadow"
                      : "bg-white/10 text-emerald-300 hover:bg-white/20"
                  }`}
                >
                  ✓ Available on {formatShortHolidayDate(selectedDate)} (
                  {availableCount})
                </button>

                <button
                  type="button"
                  onClick={() => setActiveFilter("BOOKED")}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                    activeFilter === "BOOKED"
                      ? "bg-amber-500 text-[#211619] shadow"
                      : "bg-white/10 text-amber-300 hover:bg-white/20"
                  }`}
                >
                  ● Already Booked ({bookedCount})
                </button>
              </div>
            </div>

            {/* Modal Body: Santa Cards */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
              {locationQuery && nearbyAvailableCount > 0 && activeFilter !== "BOOKED" && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#FFF8F0] to-[#FDF2E9] border border-[#D6B36A] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-[#211619]">
                    <MapPin className="w-4 h-4 text-[#780D22] shrink-0" />
                    <span>
                      We found{" "}
                      <strong className="text-[#780D22]">
                        {nearbyAvailableCount} Available Santa
                        {nearbyAvailableCount === 1 ? "" : "s"}
                      </strong>{" "}
                      covering{" "}
                      <strong className="underline decoration-[#D6B36A]">
                        {locationQuery}
                      </strong>{" "}
                      on {formatShortHolidayDate(selectedDate)}! Recommended matches are ranked first below.
                    </span>
                  </div>
                </div>
              )}

              {filteredSantas.length === 0 ? (
                <div className="p-10 text-center rounded-2xl bg-white border border-[#E8DCD0] space-y-3">
                  <AlertCircle className="w-8 h-8 text-[#780D22] mx-auto" />
                  <div className="font-display text-xl font-bold text-[#211619]">
                    No Santas Match This Filter
                  </div>
                  <p className="text-xs text-[#6E5D5F] max-w-md mx-auto">
                    Try switching to &ldquo;All Santas&rdquo; or clearing the location filter to view nationwide Santa availability.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveFilter("ALL");
                      setLocationQuery("");
                    }}
                    className="px-4 py-2 rounded-full bg-[#780D22] text-white text-xs font-bold"
                  >
                    Show All Public Santas
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredSantas.map((santa) => {
                    const isNearbyAvailable =
                      santa.isAvailableOnDate && santa.locationMatch.isNearClient;

                    return (
                      <div
                        key={santa.id}
                        className={`rounded-2xl border-2 p-4 sm:p-5 transition flex flex-col justify-between gap-4 ${
                          isNearbyAvailable
                            ? "bg-white border-[#D6B36A] shadow-lg ring-1 ring-[#D6B36A]/40"
                            : santa.isAvailableOnDate
                            ? "bg-white border-[#E8DCD0] hover:border-[#D6B36A] shadow-sm"
                            : "bg-[#F5F0EC] border-[#DFD3C8]"
                        }`}
                      >
                        <div className="space-y-3.5">
                          {/* Top Row: Portrait + Identity + Status Badges */}
                          <div className="flex items-start gap-4">
                            <div className="relative group shrink-0">
                              <img
                                src={santa.primaryImageUrl}
                                alt={`Santa ${santa.displayName}`}
                                onClick={() => {
                                  setPreviewSanta(santa);
                                  setPreviewPhotoIndex(0);
                                }}
                                className="w-20 h-24 sm:w-24 sm:h-28 rounded-2xl object-cover border-2 border-[#D6B36A]/60 cursor-pointer shadow-md group-hover:brightness-95 transition"
                              />
                              {santa.images.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPreviewSanta(santa);
                                    setPreviewPhotoIndex(0);
                                  }}
                                  className="absolute bottom-1.5 inset-x-1.5 py-1 px-1.5 rounded-lg bg-black/75 text-white text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-[#780D22] transition"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>Photos ({santa.images.length})</span>
                                </button>
                              )}
                            </div>

                            <div className="flex-1 min-w-0 space-y-1.5">
                              {/* Status & Location Recommendation Badges */}
                              <div className="flex flex-wrap items-center gap-1.5">
                                {santa.isAvailableOnDate ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-[10px] font-extrabold uppercase tracking-wider">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                                    <span>
                                      Available on{" "}
                                      {formatShortHolidayDate(selectedDate)}
                                    </span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-950 text-[10px] font-extrabold uppercase tracking-wider">
                                    <Clock className="w-3 h-3 text-amber-800" />
                                    <span>
                                      Already Booked on{" "}
                                      {formatShortHolidayDate(selectedDate)}
                                    </span>
                                  </span>
                                )}

                                {santa.locationMatch.isNearClient && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#780D22] text-[#F3D899] border border-[#D6B36A]/60 text-[10px] font-bold">
                                    <Star className="w-2.5 h-2.5 fill-current" />
                                    <span>
                                      {santa.locationMatch.badgeText ||
                                        "Recommended Near You"}
                                    </span>
                                  </span>
                                )}
                              </div>

                              <div className="flex items-baseline justify-between gap-2">
                                <h3 className="font-display text-xl sm:text-2xl font-bold text-[#211619] truncate">
                                  Santa {santa.displayName}
                                </h3>
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#FFF8F0] border border-[#E8DCD0] text-[#780D22] shrink-0">
                                  {santa.talentType === "REAL_BEARD"
                                    ? "Real Beard"
                                    : "Classic"}
                                </span>
                              </div>

                              <div className="text-[11px] text-[#5C494E] font-medium">
                                {[
                                  santa.nationality || "Authentic Holiday Performer",
                                  santa.height ? `Height: ${santa.height}` : null,
                                  santa.age ? `Age: ${santa.age}` : null,
                                ]
                                  .filter(Boolean)
                                  .join(" • ")}
                              </div>

                              {/* Location Coverage Badge */}
                              <div className="pt-1 flex items-start gap-1.5 text-[11px] text-[#211619]">
                                <MapPin className="w-3.5 h-3.5 text-[#780D22] shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-bold text-[#780D22]">
                                    Nearby Area / Coverage:
                                  </span>{" "}
                                  <span className="text-[#5C494E]">
                                    {santa.coverageArea}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Schedule / Availability Detail Box */}
                          {santa.isAvailableOnDate ? (
                            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-1.5 text-[11px]">
                              <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                                <span>
                                  Open Time Slots on{" "}
                                  {formatShortHolidayDate(selectedDate)}:
                                </span>
                              </div>
                              <div className="text-emerald-800 pl-5">
                                {santa.openWindowsLabel}
                              </div>

                              {santa.upcomingBookedDates.length > 0 && (
                                <div className="pt-1.5 mt-1.5 border-t border-emerald-200/70 pl-5 text-[10px] text-[#5C494E]">
                                  <span className="font-semibold text-[#211619]">
                                    Already Reserved Holiday Dates:{" "}
                                  </span>
                                  {santa.upcomingBookedDates
                                    .map((d) => d.shortLabel)
                                    .join(" • ")}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200 space-y-2 text-[11px]">
                              <div className="font-bold text-amber-950 flex items-center gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                                <span>
                                  Booked Schedule on{" "}
                                  {formatShortHolidayDate(selectedDate)}:
                                </span>
                              </div>
                              <div className="text-amber-900 pl-5 font-medium">
                                {santa.bookedSlots
                                  .map(
                                    (s) =>
                                      `${s.timeRangeLabel} (${s.durationHours} hrs Confirmed Deployment)`
                                  )
                                  .join(" • ")}
                              </div>

                              {santa.nextAvailableDates.length > 0 && (
                                <div className="pt-1.5 border-t border-amber-200/80 pl-5 space-y-1.5">
                                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#780D22]">
                                    Next Available Dates for Santa{" "}
                                    {santa.displayName} (Click to Check):
                                  </div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {santa.nextAvailableDates.map((nd) => (
                                      <button
                                        key={nd.date}
                                        type="button"
                                        onClick={() => handleSwitchDate(nd.date)}
                                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#780D22] text-[#211619] hover:text-white border border-[#D6B36A] text-[10px] font-bold transition shadow-xs"
                                      >
                                        📅 {nd.shortLabel}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Card Footer Actions */}
                        <div className="pt-3 border-t border-[#EFE5DA] flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewSanta(santa);
                              setPreviewPhotoIndex(0);
                            }}
                            className="px-3 py-2 rounded-xl border border-[#D8C9BA] bg-[#FFF8F0] hover:border-[#780D22] text-[#211619] text-[11px] font-bold transition flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#780D22]" />
                            <span>View Profile &amp; Photos</span>
                          </button>

                          {santa.isAvailableOnDate ? (
                            <Link
                              href={`/request-quote?date=${encodeURIComponent(
                                selectedDate
                              )}&talent=${encodeURIComponent(santa.id)}${
                                locationQuery
                                  ? `&city=${encodeURIComponent(locationQuery)}`
                                  : ""
                              }`}
                              className="px-4 py-2.5 rounded-full font-bold text-[11px] uppercase tracking-wider bg-gradient-to-r from-[#780D22] to-[#B82038] hover:from-[#8C1028] hover:to-[#C92640] text-white transition shadow-md flex items-center gap-1.5"
                            >
                              <span>Book Santa {santa.displayName}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              {santa.nextAvailableDates[0] && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleSwitchDate(
                                      santa.nextAvailableDates[0].date
                                    )
                                  }
                                  className="px-3.5 py-2 rounded-full font-bold text-[11px] bg-[#211619] hover:bg-[#3A252B] text-[#F3D899] transition"
                                >
                                  Try {santa.nextAvailableDates[0].shortLabel} →
                                </button>
                              )}
                              <Link
                                href={`/request-quote?date=${encodeURIComponent(
                                  selectedDate
                                )}&talent=${encodeURIComponent(santa.id)}${
                                  locationQuery
                                    ? `&city=${encodeURIComponent(locationQuery)}`
                                    : ""
                                }`}
                                className="px-3 py-2 rounded-full font-semibold text-[10px] border border-[#D8C9BA] bg-white hover:border-[#780D22] text-[#5C494E]"
                              >
                                Other Time Slot
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 sm:px-7 py-4 bg-white border-t border-[#E8DCD0] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 text-xs">
              <div className="text-[#5C494E]">
                Need help matching multiple Santas or a custom mall tour schedule?{" "}
                <strong className="text-[#211619]">
                  {availableCount} of {santas.length} Public Santas
                </strong>{" "}
                are currently open on {formatShortHolidayDate(selectedDate)}.
              </div>
              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-full border border-[#D8C9BA] text-[#5C494E] font-bold hover:text-[#211619]"
                >
                  Close Window
                </button>
                <Link
                  href={`/request-quote?date=${encodeURIComponent(
                    selectedDate
                  )}${
                    locationQuery
                      ? `&city=${encodeURIComponent(locationQuery)}`
                      : ""
                  }`}
                  className="px-5 py-2.5 rounded-full font-bold uppercase tracking-wider bg-gradient-to-r from-[#780D22] to-[#B82038] text-white shadow-md"
                >
                  Proceed to Quotation Calculator →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          QUICK PHOTO & PROFILE LIGHTBOX MODAL
         ===================================================================== */}
      {previewSanta && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewSanta(null)}
        >
          <div
            className="bg-[#211619] text-[#FFF8F0] border-2 border-[#D6B36A] rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-white/15 flex items-center justify-between">
              <div>
                <h3 className="font-display text-2xl font-bold text-white">
                  Santa {previewSanta.displayName}
                </h3>
                <p className="text-xs text-[#F3D899]">
                  📍 {previewSanta.coverageArea}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewSanta(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {(() => {
                const gallery =
                  previewSanta.images.length > 0
                    ? previewSanta.images
                    : [
                        {
                          id: "default",
                          publicUrl: previewSanta.primaryImageUrl,
                          caption: `Santa ${previewSanta.displayName}`,
                        },
                      ];
                const safeIdx = Math.min(previewPhotoIndex, gallery.length - 1);
                const currentMedia = gallery[safeIdx] || gallery[0];
                const isVideo =
                  /\.(mp4|webm|mov|m4v)(\?|$)/i.test(currentMedia.publicUrl) ||
                  String(currentMedia.publicUrl).startsWith("data:video/");

                return (
                  <div className="space-y-3">
                    <div className="relative rounded-2xl overflow-hidden bg-black/50 border border-white/15 h-72 sm:h-80 flex items-center justify-center">
                      {isVideo ? (
                        <video
                          src={currentMedia.publicUrl}
                          controls
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <img
                          src={currentMedia.publicUrl}
                          alt={
                            currentMedia.caption ||
                            `Santa ${previewSanta.displayName}`
                          }
                          className="max-h-full max-w-full object-contain"
                        />
                      )}

                      {gallery.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewPhotoIndex(
                                (safeIdx - 1 + gallery.length) % gallery.length
                              )
                            }
                            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 hover:bg-[#780D22] text-white"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewPhotoIndex(
                                (safeIdx + 1) % gallery.length
                              )
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 hover:bg-[#780D22] text-white"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>

                    {gallery.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {gallery.map((img, idx) => (
                          <button
                            key={img.id || idx}
                            type="button"
                            onClick={() => setPreviewPhotoIndex(idx)}
                            className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 ${
                              idx === safeIdx
                                ? "border-[#D6B36A]"
                                : "border-transparent opacity-60 hover:opacity-100"
                            }`}
                          >
                            <img
                              src={img.publicUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {previewSanta.bio && (
                <p className="text-xs text-[#FFF8F0]/85 leading-relaxed">
                  {previewSanta.bio}
                </p>
              )}

              <div className="pt-3 border-t border-white/15 flex items-center justify-between gap-3">
                <div className="text-xs">
                  {previewSanta.isAvailableOnDate ? (
                    <span className="text-emerald-400 font-bold">
                      ✓ Available on {formatShortHolidayDate(selectedDate)}
                    </span>
                  ) : (
                    <span className="text-amber-400 font-bold">
                      ● Already Booked on {formatShortHolidayDate(selectedDate)}
                    </span>
                  )}
                </div>

                <Link
                  href={`/request-quote?date=${encodeURIComponent(
                    selectedDate
                  )}&talent=${encodeURIComponent(previewSanta.id)}${
                    locationQuery
                      ? `&city=${encodeURIComponent(locationQuery)}`
                      : ""
                  }`}
                  className="px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-[#780D22] to-[#B82038] text-white shadow-lg"
                >
                  Book Santa {previewSanta.displayName} →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
