import Link from "next/link";
import { CheckCircle2, Clock, ShieldCheck, FileCheck2, Receipt, Sparkles } from "lucide-react";

export default function HowBookingWorksPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-12">
      <div className="text-center space-y-3">
        <span className="px-3 py-1 rounded-full bg-crimson-950 text-gold-400 border border-crimson-800 text-xs font-mono font-semibold">
          OPERATIONAL INTEGRITY
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Transparent Santa Booking Process
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          At Brillo Events Management Service, we operate with strict contractual clarity. Learn exactly what is required to secure your holiday date.
        </p>
      </div>

      <div className="space-y-6">
        {/* Step 1 */}
        <div className="p-6 rounded-2xl bg-obsidian-900 border border-slate-800 space-y-2">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-crimson-900/60 border border-crimson-700 text-gold-300 font-bold flex items-center justify-center text-sm">
              1
            </div>
            <h2 className="text-base font-bold text-white">Initial Request &amp; Availability Review</h2>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed pl-11">
            You submit your event details through our structured intake funnel. Submitting a request creates an unconfirmed lead. We immediately check live schedule availability and talent travel feasibility.
          </p>
        </div>

        {/* Step 2 */}
        <div className="p-6 rounded-2xl bg-obsidian-900 border border-slate-800 space-y-2">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-crimson-900/60 border border-crimson-700 text-gold-300 font-bold flex items-center justify-center text-sm">
              2
            </div>
            <h2 className="text-base font-bold text-white">Temporary 24-Hour Soft Hold</h2>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed pl-11">
            Upon verifying schedule viability, our desk places a 24-hour temporary hold on the master calendar. A soft hold reserves your time slot for 24 hours while you review the formal quotation. A soft hold is <strong className="text-slate-200">not a confirmed booking</strong> and automatically releases upon expiration unless secured.
          </p>
        </div>

        {/* Step 3 */}
        <div className="p-6 rounded-2xl bg-obsidian-900 border border-slate-800 space-y-2">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-crimson-900/60 border border-crimson-700 text-gold-300 font-bold flex items-center justify-center text-sm">
              3
            </div>
            <h2 className="text-base font-bold text-white">Service Agreement Execution &amp; 50% Downpayment</h2>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed pl-11">
            We issue the formal Brillo Events Booking Agreement specifying talent, venue, call time, and inclusions. Under standard terms, a <strong className="text-slate-200">50% reservation downpayment</strong> is required to lock the master calendar.
          </p>
        </div>

        {/* Step 4 */}
        <div className="p-6 rounded-2xl bg-obsidian-900 border border-slate-800 space-y-2">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-crimson-900/60 border border-crimson-700 text-gold-300 font-bold flex items-center justify-center text-sm">
              4
            </div>
            <h2 className="text-base font-bold text-white">Staff Verification &amp; Secured Status</h2>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed pl-11">
            Our finance team verifies the bank or cash payment evidence. Once both the signed contract and verified payment are satisfied, staff authorizes the booking as <strong className="text-emerald-400 font-semibold">SECURED</strong>. You receive an official confirmation notice and operational run-of-show briefing.
          </p>
        </div>
      </div>

      <div className="text-center pt-4">
        <Link
          href="/request-quote"
          className="inline-flex items-center px-8 py-3.5 rounded-xl font-bold text-xs text-white bg-crimson-700 hover:bg-crimson-600 shadow-xl transition"
        >
          Begin by Requesting a Quote →
        </Link>
      </div>
    </div>
  );
}
