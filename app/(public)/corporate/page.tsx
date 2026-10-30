import Link from "next/link";
import { CheckCircle2, Sparkles, Phone } from "lucide-react";

export default function CorporatePage() {
  return (
    <div className="font-body pb-20">
      {/* Luxury Hero */}
      <section className="bg-gradient-to-b from-[#211619] via-[#590919] to-[#780D22] text-[#FFF8F0] py-16 sm:py-20 px-4 sm:px-6 border-b border-[#D6B36A]/30">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#211619]/60 text-[#D6B36A] border border-[#D6B36A]/40 text-[11px] font-bold uppercase tracking-[0.18em]">
            <Sparkles className="w-3.5 h-3.5" />
            Malls, Hotels &amp; Corporate Celebrations
          </span>
          <h1 className="font-display text-4xl sm:text-6xl font-semibold text-[#FFF8F0] leading-tight">
            Premier Santa Experiences for Flagship Venues
          </h1>
          <p className="text-sm sm:text-base text-[#FFF8F0]/85 max-w-2xl mx-auto leading-relaxed">
            From spectacular shopping mall tree lightings to five-star hotel celebrations and corporate holiday galas — professionally coordinated across Metro Manila and nationwide.
          </p>
        </div>
      </section>

      {/* Packages */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Real-Beard Santa */}
          <div className="p-8 rounded-3xl bg-white border-2 border-[#D6B36A] shadow-xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="inline-block px-3 py-1 rounded-full bg-[#780D22] text-[#F3D899] text-[10px] font-bold uppercase tracking-widest">
                Most Requested • Limited Talents
              </span>
              <h2 className="font-display text-3xl font-bold text-[#211619]">
                Authentic Real-Beard Santa
              </h2>
              <div className="space-y-1 text-xs text-[#5C494E] bg-[#FFF8F0] p-4 rounded-2xl border border-[#E8DCD0]">
                <div className="flex justify-between">
                  <span>Metro Manila Rate (Min 3 Hrs):</span>
                  <strong className="text-[#780D22] text-sm">₱24,000</strong>
                </div>
                <div className="flex justify-between">
                  <span>Holiday Rate:</span>
                  <strong className="text-[#211619]">₱26,000</strong>
                </div>
                <div className="flex justify-between">
                  <span>Out-of-Town Rate:</span>
                  <strong className="text-[#211619]">₱26,000</strong>
                </div>
                <div className="pt-1.5 border-t border-[#E8DCD0] text-[11px] text-[#7A666B]">
                  Additional Hours: +₱3,000 per hour
                </div>
              </div>
              <p className="text-xs text-[#5C494E] leading-relaxed">
                Designed for flagship shopping malls, luxury hotels, brand campaigns, and corporate Christmas tree lightings where authentic presence matters most.
              </p>
              <ul className="space-y-2.5 text-xs text-[#211619] pt-2 border-t border-[#EFE5DA]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#780D22] shrink-0" />
                  <span>Natural real-beard Santa Claus performer</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#780D22] shrink-0" />
                  <span>Meet-and-greet, stage countdowns &amp; photo opportunities</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#780D22] shrink-0" />
                  <span>Dedicated event coordination &amp; schedule management</span>
                </li>
              </ul>
            </div>
            <Link
              href="/request-quote?tier=REAL_BEARD&type=mall"
              className="w-full text-center py-3.5 rounded-full font-bold text-xs uppercase tracking-[0.14em] bg-gradient-to-r from-[#780D22] to-[#B82038] hover:from-[#8C1028] hover:to-[#C92640] text-white transition shadow-lg"
            >
              Book Real-Beard Santa →
            </Link>
          </div>

          {/* Santa & Two Elves */}
          <div className="p-8 rounded-3xl bg-white border border-[#E8DCD0] shadow-lg flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="inline-block px-3 py-1 rounded-full bg-[#FFF8F0] border border-[#D6B36A] text-[#780D22] text-[10px] font-bold uppercase tracking-widest">
                Complete Character Cast
              </span>
              <h2 className="font-display text-3xl font-bold text-[#211619]">
                Santa &amp; Two Elves
              </h2>
              <div className="space-y-1 text-xs text-[#5C494E] bg-[#FFF8F0] p-4 rounded-2xl border border-[#E8DCD0]">
                <div className="flex justify-between">
                  <span>Package Rate (Min 3 Hrs):</span>
                  <strong className="text-[#780D22] text-sm">₱32,000</strong>
                </div>
                <div className="flex justify-between">
                  <span>Cast Included:</span>
                  <strong className="text-[#211619]">1 Santa + 2 Elves</strong>
                </div>
                <div className="pt-1.5 border-t border-[#E8DCD0] text-[11px] text-[#7A666B]">
                  Additional Hours: +₱3,000 per hour
                </div>
              </div>
              <p className="text-xs text-[#5C494E] leading-relaxed">
                Bring festive color, energy, and interactive crowd flow to mall activations, family day celebrations, and grand holiday parades.
              </p>
              <ul className="space-y-2.5 text-xs text-[#211619] pt-2 border-t border-[#EFE5DA]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#780D22] shrink-0" />
                  <span>One Santa Claus performer + two Christmas Elves</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#780D22] shrink-0" />
                  <span>Group photo opportunities &amp; lively guest interaction</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#780D22] shrink-0" />
                  <span>Ideal for mall atriums &amp; employee family celebrations</span>
                </li>
              </ul>
            </div>
            <Link
              href="/request-quote?tier=SANTA_AND_ELVES&type=mall"
              className="w-full text-center py-3.5 rounded-full font-bold text-xs uppercase tracking-[0.14em] bg-[#211619] hover:bg-[#780D22] text-white transition shadow-md"
            >
              Book Santa &amp; Two Elves →
            </Link>
          </div>

          {/* Classic Santa */}
          <div className="p-8 rounded-3xl bg-white border border-[#E8DCD0] shadow-lg flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="inline-block px-3 py-1 rounded-full bg-[#FFF8F0] border border-[#E8DCD0] text-[#5C494E] text-[10px] font-bold uppercase tracking-widest">
                Festive Entertainment
              </span>
              <h2 className="font-display text-3xl font-bold text-[#211619]">
                Classic Santa Claus
              </h2>
              <div className="space-y-1 text-xs text-[#5C494E] bg-[#FFF8F0] p-4 rounded-2xl border border-[#E8DCD0]">
                <div className="flex justify-between">
                  <span>Metro Manila Rate (Min 3 Hrs):</span>
                  <strong className="text-[#780D22] text-sm">₱15,000</strong>
                </div>
                <div className="flex justify-between">
                  <span>Holiday Rate:</span>
                  <strong className="text-[#211619]">₱18,000</strong>
                </div>
                <div className="flex justify-between">
                  <span>Out-of-Town Rate:</span>
                  <strong className="text-[#211619]">₱18,000</strong>
                </div>
                <div className="pt-1.5 border-t border-[#E8DCD0] text-[11px] text-[#7A666B]">
                  Additional Hours: +₱3,000 per hour
                </div>
              </div>
              <p className="text-xs text-[#5C494E] leading-relaxed">
                A cheerful, traditional Santa Claus experience ideal for office Christmas parties, store activations, community events, and holiday photo shoots.
              </p>
              <ul className="space-y-2.5 text-xs text-[#211619] pt-2 border-t border-[#EFE5DA]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#780D22] shrink-0" />
                  <span>Traditional velvet Santa costume &amp; festive presence</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#780D22] shrink-0" />
                  <span>Gift distribution, photo sessions &amp; guest engagement</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#780D22] shrink-0" />
                  <span>Professional scheduling &amp; coordination</span>
                </li>
              </ul>
            </div>
            <Link
              href="/request-quote?tier=FAKE_BEARD&type=mall"
              className="w-full text-center py-3.5 rounded-full font-bold text-xs uppercase tracking-[0.14em] bg-[#FFF8F0] hover:bg-[#780D22] text-[#780D22] hover:text-white border border-[#780D22] transition"
            >
              Book Classic Santa →
            </Link>
          </div>
        </div>

        <div className="p-8 rounded-3xl bg-[#211619] text-[#FFF8F0] border border-[#D6B36A]/40 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="font-display text-2xl sm:text-3xl font-semibold text-[#FFF8F0]">
              Planning a Multi-Day Mall Tour or Nationwide Activation?
            </h3>
            <p className="text-xs text-[#FFF8F0]/80">
              Speak directly with our event coordination desk for custom run-of-show schedules and provincial arrangements.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <a
              href="tel:09278872343"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-[#D6B36A] text-[#F3D899] text-xs font-bold uppercase tracking-wider hover:bg-[#D6B36A]/15 transition"
            >
              <Phone className="w-4 h-4" />
              <span>0927 887 2343</span>
            </a>
            <Link
              href="/request-quote"
              className="inline-flex items-center px-6 py-3.5 rounded-full bg-gradient-to-r from-[#780D22] to-[#B82038] text-white text-xs font-bold uppercase tracking-wider shadow-lg transition"
            >
              Request Custom Quotation →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
