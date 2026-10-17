import Link from "next/link";
import {
  Sparkles,
  Calendar,
  Building2,
  ShieldCheck,
  Star,
  Clock,
  ArrowRight,
  CheckCircle2,
  Users2,
} from "lucide-react";
import prisma from "@/lib/prisma";

export const revalidate = 60; // Refresh public page every minute

export default async function PublicHomePage() {
  // Query approved public talents only (zero unapproved talent leakage)
  const approvedTalents = await prisma.talent.findMany({
    where: {
      approvedForPublicDisplay: true,
      status: "ACTIVE",
    },
    include: {
      images: {
        where: { approvedForClient: true },
        take: 1,
      },
    },
    take: 6,
  });

  return (
    <div className="space-y-20 pb-20">
      {/* 1. Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden bg-gradient-to-b from-obsidian-900 via-obsidian-950 to-obsidian-950 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-crimson-950/80 border border-crimson-800/60 shadow-lg text-xs font-mono text-gold-300">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>2026 Season Booking Open • Verified Real-Beard Santa Roster</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-tight">
            The Pinnacle of Authentic Holiday Entertainment for Premier Malls &amp; Venues
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Brillo Events provides authenticated real-beard Santa Claus performers for flagship shopping malls, five-star hotel atriums, and high-profile corporate celebrations across the Philippines.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/request-quote"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-crimson-700 to-crimson-600 hover:from-crimson-600 hover:to-crimson-500 shadow-xl shadow-crimson-950/50 border border-crimson-500/40 transition transform hover:-translate-y-0.5"
            >
              Request a Corporate Quotation →
            </Link>
            <Link
              href="/availability"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-sm text-slate-200 bg-obsidian-900 hover:bg-obsidian-850 border border-slate-700 transition"
            >
              Check Live Date Availability
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-obsidian-900/60 border border-slate-800">
              <div className="text-gold-400 font-bold text-lg">100% Real Beard</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Natural authentic beards; no synthetic prosthetics</p>
            </div>
            <div className="p-4 rounded-xl bg-obsidian-900/60 border border-slate-800">
              <div className="text-gold-400 font-bold text-lg">Dedicated PA</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Every appearance includes an on-ground assistant</p>
            </div>
            <div className="p-4 rounded-xl bg-obsidian-900/60 border border-slate-800">
              <div className="text-gold-400 font-bold text-lg">Institutional Trust</div>
              <p className="text-[11px] text-slate-400 mt-0.5">SM Supermalls, Ayala, Megaworld partner roster</p>
            </div>
            <div className="p-4 rounded-xl bg-obsidian-900/60 border border-slate-800">
              <div className="text-gold-400 font-bold text-lg">24h Soft Holds</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Temporary calendar reservations for planning</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Target Offer Guidance (Playbook Rules) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Transparent Starting Investment Guidance
          </h2>
          <p className="text-xs text-slate-400">
            Quotation-first pricing. Displayed figures are standard planning benchmarks; formal quotes are issued upon scope confirmation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Package 1: Metro Manila */}
          <div className="p-6 rounded-2xl bg-obsidian-900 border border-slate-800 hover:border-gold-500/40 transition flex flex-col justify-between space-y-4">
            <div>
              <div className="text-xs font-mono font-bold text-gold-400 uppercase tracking-wider">
                Metro Manila Standard
              </div>
              <h3 className="text-xl font-bold text-white mt-1">Corporate 4-Hour Block</h3>
              <div className="text-3xl font-extrabold text-white font-mono mt-3">
                ₱18,000 <span className="text-xs font-sans text-slate-400 font-normal">/ 4 hours</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Ideal for mall centerpiece launches, hotel tree lightings, and premier corporate Christmas banquets.
              </p>
              <ul className="space-y-2 text-xs text-slate-300 pt-4 border-t border-slate-800">
                <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-400 shrink-0" /> Full 4-hour performance block</li>
                <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-400 shrink-0" /> Authenticated real-beard Santa talent</li>
                <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-400 shrink-0" /> Dedicated Production Assistant (PA)</li>
                <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-400 shrink-0" /> Standard 50% reservation deposit</li>
              </ul>
            </div>
            <Link
              href="/request-quote?package=metro_manila"
              className="w-full text-center py-2.5 rounded-lg text-xs font-semibold bg-obsidian-850 hover:bg-obsidian-800 border border-slate-700 text-white transition"
            >
              Request Metro Manila Quote →
            </Link>
          </div>

          {/* Package 2: Provincial Tour */}
          <div className="p-6 rounded-2xl bg-obsidian-900 border border-crimson-800/60 hover:border-crimson-600 transition flex flex-col justify-between space-y-4 shadow-lg shadow-crimson-950/40">
            <div>
              <div className="text-xs font-mono font-bold text-crimson-400 uppercase tracking-wider">
                Provincial &amp; Regional Tour
              </div>
              <h3 className="text-xl font-bold text-white mt-1">Provincial Out-of-Town</h3>
              <div className="text-3xl font-extrabold text-white font-mono mt-3">
                ₱23,400 <span className="text-xs font-sans text-slate-400 font-normal">starting guidance</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Calculated at +30% provincial factor. Route, transportation, and lodging terms confirmed in writing.
              </p>
              <ul className="space-y-2 text-xs text-slate-300 pt-4 border-t border-slate-800">
                <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-400 shrink-0" /> Luzon, Visayas &amp; Mindanao deployment</li>
                <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-400 shrink-0" /> Flight &amp; logistics coordination</li>
                <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-400 shrink-0" /> Dedicated travelling production crew</li>
                <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-400 shrink-0" /> Multi-day mall tour itineraries</li>
              </ul>
            </div>
            <Link
              href="/request-quote?package=provincial"
              className="w-full text-center py-2.5 rounded-lg text-xs font-semibold bg-crimson-700 hover:bg-crimson-600 text-white transition shadow-md"
            >
              Request Provincial Quote →
            </Link>
          </div>

          {/* Package 3: Dec 24 / 25 Peak Holiday */}
          <div className="p-6 rounded-2xl bg-obsidian-900 border border-slate-800 hover:border-gold-500/40 transition flex flex-col justify-between space-y-4">
            <div>
              <div className="text-xs font-mono font-bold text-gold-400 uppercase tracking-wider">
                Christmas Eve &amp; Christmas Day
              </div>
              <h3 className="text-xl font-bold text-white mt-1">Peak Prime Holiday Block</h3>
              <div className="text-3xl font-extrabold text-gold-300 font-mono mt-3">
                ₱23k – ₱30k <span className="text-xs font-sans text-slate-400 font-normal">range</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Quoted strictly based on selected talent and confirmed schedule availability for Dec 24 &amp; 25.
              </p>
              <ul className="space-y-2 text-xs text-slate-300 pt-4 border-t border-slate-800">
                <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-2 text-gold-400 shrink-0" /> Ultra-limited holiday availability</li>
                <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-2 text-gold-400 shrink-0" /> Luxury resort &amp; VIP flagship preference</li>
                <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-2 text-gold-400 shrink-0" /> Priority queue handling</li>
                <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-2 text-gold-400 shrink-0" /> Custom holiday run of show</li>
              </ul>
            </div>
            <Link
              href="/request-quote?package=holiday"
              className="w-full text-center py-2.5 rounded-lg text-xs font-semibold bg-obsidian-850 hover:bg-obsidian-800 border border-slate-700 text-white transition"
            >
              Request Dec 24/25 Quote →
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Featured Real Beard Santas Showcase (Real Extracted Photos) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-bold text-gold-400 uppercase tracking-wider">
              Authentic Holiday Talent
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
              Meet Our Real-Beard Santas
            </h2>
          </div>
          <Link
            href="/corporate"
            className="text-xs text-gold-400 hover:text-gold-300 font-medium flex items-center"
          >
            Learn about Santa casting &amp; wardrobe standards →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {approvedTalents.map((t) => {
            const photoUrl = t.images[0]?.publicUrl || "/talents/placeholder.jpg";

            return (
              <div
                key={t.id}
                className="rounded-2xl bg-obsidian-900 border border-slate-800 overflow-hidden shadow-md flex flex-col justify-between group hover:border-slate-700 transition"
              >
                <div className="relative h-64 bg-obsidian-950 overflow-hidden">
                  <img
                    src={photoUrl}
                    alt={t.displayName}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-mono text-gold-300 border border-slate-700">
                    Real Beard • {t.nationality || "International"}
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">Santa {t.displayName}</h3>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      Height: {t.height || "6ft"} {t.age && `• Age: ${t.age} yrs`}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {t.bio || "Senior professional Santa with extensive mall centerpiece and hotel tree-lighting experience."}
                  </p>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-emerald-400 font-medium">Available for Corporate Booking</span>
                    <Link
                      href={`/request-quote?talent=${t.id}`}
                      className="text-xs font-semibold text-gold-400 hover:text-gold-300"
                    >
                      Request Santa {t.displayName} →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. How Booking Works (Transparency) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            How Santa Booking Works
          </h2>
          <p className="text-xs text-slate-400">
            A controlled, professional 4-step pipeline ensuring zero calendar double-bookings and clear contractual certainty.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-obsidian-900 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-crimson-900/60 border border-crimson-700/60 flex items-center justify-center font-bold text-gold-300 text-sm">
              1
            </div>
            <h3 className="text-sm font-bold text-white">Inquiry &amp; Logistics Intake</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Submit event date, mall/venue location, call time, and special appearance parameters.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-obsidian-900 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-crimson-900/60 border border-crimson-700/60 flex items-center justify-center font-bold text-gold-300 text-sm">
              2
            </div>
            <h3 className="text-sm font-bold text-white">Availability &amp; 24h Soft Hold</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              We check the master calendar. An eligible slot may be placed on a 24-hour temporary hold.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-obsidian-900 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-crimson-900/60 border border-crimson-700/60 flex items-center justify-center font-bold text-gold-300 text-sm">
              3
            </div>
            <h3 className="text-sm font-bold text-white">Agreement &amp; 50% Deposit</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Review and sign the formal booking agreement. Submit the 50% reservation downpayment.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-obsidian-900 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-crimson-900/60 border border-crimson-700/60 flex items-center justify-center font-bold text-gold-300 text-sm">
              4
            </div>
            <h3 className="text-sm font-bold text-white">Staff Confirmation &amp; Delivery</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our team verifies payment, confirms the secured booking, and coordinates call times with your on-ground team.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Call To Action Footer Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-crimson-950 via-obsidian-900 to-obsidian-900 border border-crimson-800/80 text-center space-y-4 shadow-2xl">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Reserve Your Holiday Appearance Before Dates Close
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Real-beard Santa dates for November and December are booked on a strictly confirmed first-secured basis.
          </p>
          <div className="pt-2">
            <Link
              href="/request-quote"
              className="inline-flex items-center px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-crimson-700 hover:bg-crimson-600 shadow-xl shadow-crimson-950 border border-crimson-500/50 transition transform hover:-translate-y-0.5"
            >
              Start Your Booking Request Now →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
