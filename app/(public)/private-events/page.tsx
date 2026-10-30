import Link from "next/link";
import { CheckCircle2, Sparkles } from "lucide-react";

export default function PrivateEventsPage() {
  return (
    <div className="font-body pb-20">
      {/* Luxury Hero */}
      <section className="bg-gradient-to-b from-[#211619] via-[#590919] to-[#780D22] text-[#FFF8F0] py-16 sm:py-20 px-4 sm:px-6 border-b border-[#D6B36A]/30">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#211619]/60 text-[#D6B36A] border border-[#D6B36A]/40 text-[11px] font-bold uppercase tracking-[0.18em]">
            <Sparkles className="w-3.5 h-3.5" />
            Private Homes, Villages &amp; Family Celebrations
          </span>
          <h1 className="font-display text-4xl sm:text-6xl font-semibold text-[#FFF8F0] leading-tight">
            Magical Santa Visits for Private Family Gatherings
          </h1>
          <p className="text-sm sm:text-base text-[#FFF8F0]/85 max-w-2xl mx-auto leading-relaxed">
            Give your children, grandchildren, and guests more than a photo with Santa — give them an intimate Christmas memory filled with warmth, storytelling, and personal gift-giving.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-3xl bg-white border-2 border-[#D6B36A] shadow-xl space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="inline-block px-3 py-1 rounded-full bg-[#780D22] text-[#F3D899] text-[10px] font-bold uppercase tracking-widest">
                Signature Family Experience
              </span>
              <h2 className="font-display text-3xl font-bold text-[#211619]">
                Real-Beard Santa Home Visit
              </h2>
              <div className="space-y-1 text-xs text-[#5C494E] bg-[#FFF8F0] p-4 rounded-2xl border border-[#E8DCD0]">
                <div className="flex justify-between">
                  <span>Metro Manila (Min 3 Hrs):</span>
                  <strong className="text-[#780D22] text-sm">₱24,000</strong>
                </div>
                <div className="flex justify-between">
                  <span>Peak Holiday &amp; Out-of-Town:</span>
                  <strong className="text-[#211619]">₱26,000</strong>
                </div>
                <div className="pt-1.5 border-t border-[#E8DCD0] text-[11px] text-[#7A666B]">
                  Additional Hours: +₱3,000 per hour
                </div>
              </div>
              <p className="text-xs text-[#5C494E] leading-relaxed">
                Tailored for private residences, exclusive village clubhouses, and intimate family reunions. Our authentic real-beard Santa arrives ready to greet children by name, hand out gifts, and capture heirloom family portraits.
              </p>
              <ul className="space-y-2.5 text-xs text-[#211619] pt-2 border-t border-[#EFE5DA]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#780D22] shrink-0" />
                  <span>Authentic real-beard Santa Claus performer</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#780D22] shrink-0" />
                  <span>Personalized gift distribution &amp; warm storytelling</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#780D22] shrink-0" />
                  <span>Discreet arrival &amp; cue coordination with hosts</span>
                </li>
              </ul>
            </div>
            <Link
              href="/request-quote?tier=REAL_BEARD&type=private"
              className="w-full text-center py-3.5 rounded-full font-bold text-xs uppercase tracking-[0.14em] bg-gradient-to-r from-[#780D22] to-[#B82038] text-white transition shadow-lg"
            >
              Inquire for Real-Beard Visit →
            </Link>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-[#E8DCD0] shadow-lg space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="inline-block px-3 py-1 rounded-full bg-[#FFF8F0] border border-[#D6B36A] text-[#780D22] text-[10px] font-bold uppercase tracking-widest">
                Festive Party Options
              </span>
              <h2 className="font-display text-3xl font-bold text-[#211619]">
                Classic Santa or Santa &amp; Elves
              </h2>
              <div className="space-y-1 text-xs text-[#5C494E] bg-[#FFF8F0] p-4 rounded-2xl border border-[#E8DCD0]">
                <div className="flex justify-between">
                  <span>Classic Santa (Metro Manila / Holiday):</span>
                  <strong className="text-[#780D22] text-sm">₱15,000 / ₱18,000</strong>
                </div>
                <div className="flex justify-between">
                  <span>Santa &amp; Two Elves Package:</span>
                  <strong className="text-[#211619]">₱32,000</strong>
                </div>
                <div className="pt-1.5 border-t border-[#E8DCD0] text-[11px] text-[#7A666B]">
                  Minimum 3 Hours • +₱3,000 per extra hour
                </div>
              </div>
              <p className="text-xs text-[#5C494E] leading-relaxed">
                Choose our cheerful Classic Santa for intimate home parties or upgrade to our lively Santa &amp; Two Elves trio for large family Christmas celebrations and village gatherings.
              </p>
              <ul className="space-y-2.5 text-xs text-[#211619] pt-2 border-t border-[#EFE5DA]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#780D22] shrink-0" />
                  <span>Family photo sessions &amp; interactive games</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#780D22] shrink-0" />
                  <span>Christmas Eve &amp; Peak December holiday slots available</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#780D22] shrink-0" />
                  <span>Professional Brillo Events coordination</span>
                </li>
              </ul>
            </div>
            <Link
              href="/request-quote?type=private"
              className="w-full text-center py-3.5 rounded-full font-bold text-xs uppercase tracking-[0.14em] bg-[#211619] hover:bg-[#780D22] text-white transition shadow-md"
            >
              Customize Private Party Quote →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
