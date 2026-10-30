import Link from "next/link";
import { Sparkles } from "lucide-react";

const STEPS = [
  {
    num: "01",
    title: "Submit Your Event Inquiry",
    desc: "Share your preferred event date, venue location, celebration type, and chosen Santa experience through our online inquiry form or direct concierge line.",
  },
  {
    num: "02",
    title: "Availability Check & Package Recommendation",
    desc: "Our coordination desk reviews live performer schedules and recommends the ideal Real-Beard Santa, Classic Santa, or Santa & Two Elves package for your program.",
  },
  {
    num: "03",
    title: "Formal Quotation & Temporary 24-Hour Hold",
    desc: "You receive a transparent quotation detailing your 3-hour base rate, any extra hours (+₱3,000/hr), and out-of-town travel arrangements if applicable, alongside a temporary 24-hour calendar hold.",
  },
  {
    num: "04",
    title: "Service Agreement & 50% Reservation Downpayment",
    desc: "To officially lock your date on our master calendar, we execute the Brillo Events Service Agreement and verify the standard 50% reservation downpayment.",
  },
  {
    num: "05",
    title: "Event Coordination & Magical Santa Arrival",
    desc: "Before your event, our team finalizes call times, holding room needs, photo flow, and special cues so Santa's entrance feels seamless and unforgettable.",
  },
];

export default function HowBookingWorksPage() {
  return (
    <div className="font-body pb-20">
      <section className="bg-gradient-to-b from-[#211619] via-[#590919] to-[#780D22] text-[#FFF8F0] py-16 sm:py-20 px-4 sm:px-6 border-b border-[#D6B36A]/30">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#211619]/60 text-[#D6B36A] border border-[#D6B36A]/40 text-[11px] font-bold uppercase tracking-[0.18em]">
            <Sparkles className="w-3.5 h-3.5" />
            Simple, Clear &amp; Professionally Managed
          </span>
          <h1 className="font-display text-4xl sm:text-6xl font-semibold text-[#FFF8F0] leading-tight">
            How Booking Your Santa Experience Works
          </h1>
          <p className="text-sm sm:text-base text-[#FFF8F0]/85 leading-relaxed">
            From your initial date inquiry to Santa&apos;s grand entrance, Brillo Events handles every detail with clarity and care.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-6">
        {STEPS.map((s) => (
          <div
            key={s.num}
            className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8DCD0] shadow-md flex flex-col sm:flex-row gap-5 items-start"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#780D22] text-[#F3D899] font-display text-2xl font-bold flex items-center justify-center shrink-0 border border-[#D6B36A]/50">
              {s.num}
            </div>
            <div className="space-y-1.5">
              <h2 className="font-display text-2xl font-bold text-[#211619]">{s.title}</h2>
              <p className="text-xs sm:text-sm text-[#5C494E] leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}

        <div className="text-center pt-6">
          <Link
            href="/request-quote"
            className="inline-flex items-center px-9 py-4 rounded-full font-bold text-xs uppercase tracking-[0.15em] text-white bg-gradient-to-r from-[#780D22] to-[#B82038] hover:from-[#8C1028] hover:to-[#C92640] shadow-xl transition"
          >
            Book Your Santa Experience →
          </Link>
        </div>
      </div>
    </div>
  );
}
