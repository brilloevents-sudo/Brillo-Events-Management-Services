"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  Calendar,
  Building2,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

export default function RequestQuotePage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-xs text-slate-400">Loading form...</div>}>
      <RequestQuoteForm />
    </Suspense>
  );
}

function RequestQuoteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [talents, setTalents] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [clientName, setClientName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bookingType, setBookingType] = useState<"CORPORATE" | "PRIVATE">("CORPORATE");
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("14:00");
  const [endTime, setEndTime] = useState("18:00");
  const [durationHours, setDurationHours] = useState(4);
  const [venueName, setVenueName] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [city, setCity] = useState("Metro Manila");
  const [province, setProvince] = useState("");
  const [isProvincial, setIsProvincial] = useState(false);
  const [audienceSize, setAudienceSize] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [talentPreferenceId, setTalentPreferenceId] = useState("");
  const [consentAgreed, setConsentAgreed] = useState(false);

  useEffect(() => {
    // Load approved talents
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
    if (pkg === "provincial") setIsProvincial(true);
  }, [searchParams]);

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
          companyName,
          email,
          phone,
          bookingType,
          eventName,
          eventDate,
          startTime,
          endTime,
          durationHours,
          venueName,
          venueAddress,
          city,
          province,
          isProvincial,
          audienceSize,
          specialRequests,
          talentPreferenceId: talentPreferenceId || undefined,
          consentAgreed,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      // Redirect to client status tracking portal
      router.push(data.statusUrl);
    } catch (err: any) {
      setError(err.message || "Failed to submit quote request.");
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="px-3 py-1 rounded-full bg-crimson-950 text-gold-400 border border-crimson-800 text-xs font-mono font-semibold">
          STRUCTURED INTAKE FUNNEL
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Request a Corporate or Private Santa Quotation
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Submit your holiday event parameters. Our operations desk checks live calendar availability and generates your quotation within business hours.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Intake Form */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-2xl bg-obsidian-900 border border-slate-800 shadow-xl space-y-6 text-xs">
        {/* Booking Category Selector */}
        <div>
          <label className="block text-slate-300 font-semibold mb-2">1. Booking Category *</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setBookingType("CORPORATE")}
              className={`p-3 rounded-xl border text-left font-medium transition ${
                bookingType === "CORPORATE"
                  ? "bg-crimson-950 border-crimson-600 text-white shadow-sm"
                  : "bg-obsidian-950 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <Building2 className="w-4 h-4 mb-1 text-gold-400" />
              <div className="font-bold text-xs">Corporate, Mall or Hotel</div>
              <p className="text-[10px] text-slate-400 mt-0.5">Shopping centers, employee galas, tree lightings</p>
            </button>

            <button
              type="button"
              onClick={() => setBookingType("PRIVATE")}
              className={`p-3 rounded-xl border text-left font-medium transition ${
                bookingType === "PRIVATE"
                  ? "bg-crimson-950 border-crimson-600 text-white shadow-sm"
                  : "bg-obsidian-950 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <User className="w-4 h-4 mb-1 text-gold-400" />
              <div className="font-bold text-xs">Private Residence / Family</div>
              <p className="text-[10px] text-slate-400 mt-0.5">Intimate home visits, private estate gatherings</p>
            </button>
          </div>
        </div>

        {/* Client & Organization Contact */}
        <div className="pt-4 border-t border-slate-800 space-y-4">
          <label className="block text-slate-300 font-semibold">2. Client &amp; Contact Point *</label>
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
              <label className="block text-slate-400 mb-1">Company / Mall / Organization</label>
              <input
                type="text"
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
              <label className="block text-slate-400 mb-1">Mobile / Telephone Number *</label>
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

        {/* Event Schedule & Venue */}
        <div className="pt-4 border-t border-slate-800 space-y-4">
          <label className="block text-slate-300 font-semibold">3. Event Date &amp; Location *</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Event Date *</label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
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
              <label className="block text-slate-400 mb-1">End Time</label>
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
              <label className="block text-slate-400 mb-1">City / Region *</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Mandaluyong / Clark, Pampanga / Davao City"
                className="w-full px-3 py-2.5 bg-obsidian-950 border border-slate-700 rounded-lg text-white"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="provincialCheck"
              checked={isProvincial}
              onChange={(e) => setIsProvincial(e.target.checked)}
              className="rounded text-crimson-600 focus:ring-gold-500"
            />
            <label htmlFor="provincialCheck" className="text-slate-300 font-medium cursor-pointer">
              This appearance is outside Metro Manila (Applies provincial travel terms)
            </label>
          </div>
        </div>

        {/* Talent Preference */}
        <div className="pt-4 border-t border-slate-800 space-y-4">
          <label className="block text-slate-300 font-semibold">4. Santa Preference (Optional)</label>
          <div>
            <select
              value={talentPreferenceId}
              onChange={(e) => setTalentPreferenceId(e.target.value)}
              className="w-full px-3 py-2.5 bg-obsidian-950 border border-slate-700 rounded-lg text-white"
            >
              <option value="">No preference — Assign best matched available Santa</option>
              {talents.map((t) => (
                <option key={t.id} value={t.id}>
                  Santa {t.displayName} ({t.nationality || "Real Beard"}, {t.height})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Special Appearance Inclusions / Requests</label>
            <textarea
              rows={3}
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="e.g. Gift-giving ceremony, storytelling session, holding room coordination..."
              className="w-full px-3 py-2.5 bg-obsidian-950 border border-slate-700 rounded-lg text-white resize-none"
            />
          </div>
        </div>

        {/* Privacy & Legal Consent */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              id="consent"
              required
              checked={consentAgreed}
              onChange={(e) => setConsentAgreed(e.target.checked)}
              className="mt-0.5 rounded text-crimson-600 focus:ring-gold-500"
            />
            <label htmlFor="consent" className="text-slate-400 text-[11px] leading-relaxed cursor-pointer">
              I acknowledge that this inquiry is an estimate request and does not constitute a secured booking. Dates are confirmed only upon mutual execution of a booking agreement and verified downpayment. I consent to Brillo Events processing this information in accordance with privacy laws.
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 font-mono">
            Direct operations desk: 0927 887 2343
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-crimson-700 to-crimson-600 hover:from-crimson-600 hover:to-crimson-500 shadow-xl shadow-crimson-950 border border-crimson-500/50 transition transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {submitting ? "Submitting Inquiry..." : "Submit Inquiry & Get Reference →"}
          </button>
        </div>
      </form>
    </div>
  );
}
