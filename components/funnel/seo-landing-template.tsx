import Link from "next/link";
import { CheckCircle2, Sparkles, Phone, Mail, ArrowRight } from "lucide-react";

export interface SeoLandingFeature {
  title: string;
  description: string;
}

export interface SeoLandingFaq {
  question: string;
  answer: string;
}

export interface SeoLandingProps {
  badge: string;
  headline: string;
  subheadline: string;
  heroImage: string;
  heroImageAlt: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  introHeading: string;
  introParagraphs: string[];
  featuresHeading: string;
  features: SeoLandingFeature[];
  galleryImages?: { src: string; caption: string }[];
  highlightTier?: "REAL_BEARD" | "FAKE_BEARD" | "SANTA_AND_ELVES" | "ALL";
  faqs: SeoLandingFaq[];
}

export function SeoLandingTemplate({
  badge,
  headline,
  subheadline,
  heroImage,
  heroImageAlt,
  primaryCtaLabel,
  primaryCtaHref,
  introHeading,
  introParagraphs,
  featuresHeading,
  features,
  galleryImages = [
    { src: "/talents/Bob/bob_photo_1.png", caption: "Authentic Real-Beard Mall Appearance" },
    { src: "/talents/Perry/perry_photo_1.jpg", caption: "Holiday Throne & Family Meet-and-Greet" },
    { src: "/talents/Terry/terry_photo_1.jpg", caption: "Grand Christmas Tree Lighting Launch" },
  ],
  highlightTier = "ALL",
  faqs,
}: SeoLandingProps) {
  return (
    <div className="font-body text-[#211619]">
      {/* 1. LUXURY VELVET HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#211619] via-[#590919] to-[#780D22] text-[#FFF8F0] py-16 sm:py-24 px-4 sm:px-6 border-b border-[#D6B36A]/30">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#211619]/70 border border-[#D6B36A]/50 text-[#F3D899] text-[11px] font-bold uppercase tracking-[0.18em]">
              <Sparkles className="w-3.5 h-3.5 text-[#D6B36A]" />
              {badge}
            </span>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-[62px] font-semibold leading-[1.06] text-[#FFF8F0]">
              {headline}
            </h1>

            <p className="text-sm sm:text-lg text-[#FFF8F0]/88 leading-relaxed max-w-2xl">
              {subheadline}
            </p>

            <div className="flex flex-wrap gap-3 text-xs text-[#F3D899] font-medium pt-1">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#D6B36A]" />
                Real-Beard &amp; Classic Santa Options
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#D6B36A]" />
                Professional Event Coordination
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#D6B36A]" />
                Metro Manila &amp; Nationwide
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3.5 pt-2">
              <Link
                href={primaryCtaHref}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-[#A61932] to-[#B82038] hover:from-[#B82038] hover:to-[#CC2842] border border-[#D6B36A]/60 text-white font-bold text-xs uppercase tracking-[0.15em] shadow-xl transition"
              >
                <span>{primaryCtaLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/#pricing"
                className="inline-flex items-center justify-center px-7 py-4 rounded-full bg-white/10 hover:bg-white/15 border border-[#D6B36A]/50 text-[#FFF8F0] font-bold text-xs uppercase tracking-[0.15em] transition"
              >
                View All Santa Packages
              </Link>
            </div>

            <p className="text-[11px] text-[#F3D899]/85 tracking-wide">
              Limited holiday dates. Availability is confirmed upon booking.
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="relative rounded-3xl overflow-hidden border-2 border-[#D6B36A]/60 shadow-2xl bg-[#211619]">
              <img
                src={heroImage}
                alt={heroImageAlt}
                className="w-full h-[380px] sm:h-[440px] object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#211619]/85 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-[#211619]/85 backdrop-blur-md border border-[#D6B36A]/40">
                <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#D6B36A]">
                  Brillo Events Philippines
                </div>
                <div className="font-display text-xl text-white font-semibold mt-0.5">
                  Authentic Christmas Entertainment &amp; Guest Moments
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. EDITORIAL STORY / POSITIONING */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-[#FFF8F0]">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <h2 className="font-display text-3xl sm:text-5xl font-semibold text-[#211619] leading-tight">
            {introHeading}
          </h2>
          <div className="w-16 h-0.5 bg-[#D6B36A] mx-auto" />
          <div className="space-y-4 text-sm sm:text-base text-[#5C494E] leading-relaxed">
            {introParagraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* 3. KEY FEATURES & INCLUSIONS */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-white border-y border-[#E8DCD0]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#A61932]">
              The Brillo Events Standard
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-semibold text-[#211619]">
              {featuresHeading}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="p-7 rounded-3xl bg-[#FFF8F0] border border-[#E8DCD0] space-y-3 hover:border-[#D6B36A] transition shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-[#780D22] text-[#F3D899] font-display text-xl font-bold flex items-center justify-center">
                  0{i + 1}
                </div>
                <h3 className="font-display text-2xl font-bold text-[#211619]">{f.title}</h3>
                <p className="text-xs sm:text-sm text-[#5C494E] leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>

          {/* Real Photography Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {galleryImages.map((img, idx) => (
              <div
                key={idx}
                className="rounded-3xl overflow-hidden border border-[#E8DCD0] bg-[#FFF8F0] shadow-md group"
              >
                <div className="h-64 overflow-hidden">
                  <img
                    src={img.src}
                    alt={img.caption}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-500"
                  />
                </div>
                <div className="p-4 text-center text-xs font-semibold text-[#5C494E]">
                  {img.caption}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. TRANSPARENT RECONCILED PRICING SNAPSHOT */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-[#FFF8F0]">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#A61932]">
              Transparent Starting Rates
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-semibold text-[#211619]">
              Official Santa Experience Packages
            </h2>
            <p className="text-xs sm:text-sm text-[#5C494E]">
              All packages include a minimum 3-hour booking. Additional hours are billed at +₱3,000 per hour. Travel and hotel accommodations for out-of-town events are arranged separately.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
            {/* Real-Beard Santa */}
            <div
              className={`p-8 rounded-3xl bg-white flex flex-col justify-between space-y-6 ${
                highlightTier === "REAL_BEARD" || highlightTier === "ALL"
                  ? "border-2 border-[#D6B36A] shadow-xl"
                  : "border border-[#E8DCD0] shadow-md"
              }`}
            >
              <div className="space-y-4">
                <span className="inline-block px-3 py-1 rounded-full bg-[#780D22] text-[#F3D899] text-[10px] font-bold uppercase tracking-widest">
                  Premium Experience • Limited Talents
                </span>
                <h3 className="font-display text-3xl font-bold text-[#211619]">
                  Real-Beard Santa
                </h3>
                <div className="space-y-2 text-xs bg-[#FFF8F0] p-4 rounded-2xl border border-[#E8DCD0]">
                  <div className="flex justify-between">
                    <span className="text-[#5C494E]">Metro Manila Rate:</span>
                    <strong className="text-[#780D22] text-base">₱24,000</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5C494E]">Holiday Rate:</span>
                    <strong className="text-[#211619]">₱26,000</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5C494E]">Out-of-Town Rate:</span>
                    <strong className="text-[#211619]">₱26,000</strong>
                  </div>
                  <div className="pt-2 border-t border-[#E8DCD0] text-[11px] text-[#7A666B]">
                    Minimum 3 Hours • +₱3,000 per extra hour
                  </div>
                </div>
              </div>
              <Link
                href="/request-quote?tier=REAL_BEARD"
                className="w-full py-3.5 rounded-full text-center font-bold text-xs uppercase tracking-[0.14em] bg-gradient-to-r from-[#780D22] to-[#B82038] text-white shadow-lg transition"
              >
                Book Real-Beard Santa →
              </Link>
            </div>

            {/* Classic Santa */}
            <div
              className={`p-8 rounded-3xl bg-white flex flex-col justify-between space-y-6 ${
                highlightTier === "FAKE_BEARD"
                  ? "border-2 border-[#D6B36A] shadow-xl"
                  : "border border-[#E8DCD0] shadow-md"
              }`}
            >
              <div className="space-y-4">
                <span className="inline-block px-3 py-1 rounded-full bg-[#FFF8F0] border border-[#E8DCD0] text-[#5C494E] text-[10px] font-bold uppercase tracking-widest">
                  Festive Experience
                </span>
                <h3 className="font-display text-3xl font-bold text-[#211619]">
                  Classic Santa Claus
                </h3>
                <div className="space-y-2 text-xs bg-[#FFF8F0] p-4 rounded-2xl border border-[#E8DCD0]">
                  <div className="flex justify-between">
                    <span className="text-[#5C494E]">Metro Manila Rate:</span>
                    <strong className="text-[#780D22] text-base">₱15,000</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5C494E]">Holiday Rate:</span>
                    <strong className="text-[#211619]">₱18,000</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5C494E]">Out-of-Town Rate:</span>
                    <strong className="text-[#211619]">₱18,000</strong>
                  </div>
                  <div className="pt-2 border-t border-[#E8DCD0] text-[11px] text-[#7A666B]">
                    Minimum 3 Hours • +₱3,000 per extra hour
                  </div>
                </div>
              </div>
              <Link
                href="/request-quote?tier=FAKE_BEARD"
                className="w-full py-3.5 rounded-full text-center font-bold text-xs uppercase tracking-[0.14em] bg-[#211619] hover:bg-[#780D22] text-white transition"
              >
                Book Classic Santa →
              </Link>
            </div>

            {/* Santa & Two Elves */}
            <div
              className={`p-8 rounded-3xl bg-white flex flex-col justify-between space-y-6 ${
                highlightTier === "SANTA_AND_ELVES"
                  ? "border-2 border-[#D6B36A] shadow-xl"
                  : "border border-[#E8DCD0] shadow-md"
              }`}
            >
              <div className="space-y-4">
                <span className="inline-block px-3 py-1 rounded-full bg-[#FFF8F0] border border-[#D6B36A] text-[#780D22] text-[10px] font-bold uppercase tracking-widest">
                  Complete Character Package
                </span>
                <h3 className="font-display text-3xl font-bold text-[#211619]">
                  Santa &amp; Two Elves
                </h3>
                <div className="space-y-2 text-xs bg-[#FFF8F0] p-4 rounded-2xl border border-[#E8DCD0]">
                  <div className="flex justify-between">
                    <span className="text-[#5C494E]">Package Rate:</span>
                    <strong className="text-[#780D22] text-base">₱32,000</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5C494E]">Performers Included:</span>
                    <strong className="text-[#211619]">1 Santa + 2 Elves</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5C494E]">Interactive Entertainment:</span>
                    <strong className="text-[#211619]">Included</strong>
                  </div>
                  <div className="pt-2 border-t border-[#E8DCD0] text-[11px] text-[#7A666B]">
                    Minimum 3 Hours • +₱3,000 per extra hour
                  </div>
                </div>
              </div>
              <Link
                href="/request-quote?tier=SANTA_AND_ELVES"
                className="w-full py-3.5 rounded-full text-center font-bold text-xs uppercase tracking-[0.14em] bg-[#211619] hover:bg-[#780D22] text-white transition"
              >
                Book Santa &amp; Elves →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TARGETED FAQ */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-white border-t border-[#E8DCD0]">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#A61932]">
              Planning Questions
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-semibold text-[#211619]">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#FFF8F0] border border-[#E8DCD0] space-y-2"
              >
                <h3 className="font-display text-xl sm:text-2xl font-bold text-[#211619]">
                  {faq.question}
                </h3>
                <p className="text-xs sm:text-sm text-[#5C494E] leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FINAL CONVERSION CTA */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gradient-to-br from-[#780D22] via-[#590919] to-[#211619] text-[#FFF8F0]">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="font-display text-4xl sm:text-5xl font-semibold text-[#FFF8F0]">
            Make This Christmas the One Your Guests Will Never Forget.
          </h2>
          <p className="text-sm sm:text-base text-[#FFF8F0]/85 max-w-2xl mx-auto">
            Holiday weekends and peak December dates fill early. Contact Brillo Events today to check performer availability and receive a tailored quotation.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/request-quote"
              className="px-9 py-4 rounded-full bg-[#D6B36A] hover:bg-[#E2C27E] text-[#211619] font-bold text-xs uppercase tracking-[0.16em] shadow-xl transition"
            >
              Book Your Santa Experience
            </Link>
            <a
              href="tel:09278872343"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-full border border-[#D6B36A]/60 text-[#FFF8F0] hover:bg-white/10 font-bold text-xs uppercase tracking-[0.14em] transition"
            >
              <Phone className="w-4 h-4 text-[#D6B36A]" />
              <span>0927 887 2343</span>
            </a>
            <a
              href="mailto:brilloevents@gmail.com"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-full border border-white/25 text-[#FFF8F0] hover:bg-white/10 font-bold text-xs uppercase tracking-[0.14em] transition"
            >
              <Mail className="w-4 h-4 text-[#D6B36A]" />
              <span>brilloevents@gmail.com</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
