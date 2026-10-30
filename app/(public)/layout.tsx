import { PublicNav } from "@/components/public-nav";
import Link from "next/link";
import { Sparkles, Phone, Mail, Calendar } from "lucide-react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FFF8F0] text-[#211619] font-body flex flex-col selection:bg-[#A61932] selection:text-[#FFF8F0] pb-16 md:pb-0">
      <PublicNav />
      <main className="flex-1">{children}</main>

      {/* Luxury Footer (#211619 Midnight Black with Champagne Gold #D6B36A accents) */}
      <footer className="bg-[#211619] border-t border-[#D6B36A]/30 pt-14 pb-10 text-xs text-[#FFF8F0]/75">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#780D22] border border-[#D6B36A]/50 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#D6B36A]" />
                </div>
                <span className="font-brand font-bold text-base text-[#FFF8F0] tracking-[0.08em]">
                  BRILLO EVENTS
                </span>
              </div>
              <p className="text-[#FFF8F0]/70 leading-relaxed text-[12px]">
                More than Santa — we create the moments that make Christmas unforgettable. Authentic Santa Claus experiences for shopping malls, luxury hotels, corporate celebrations, and private families across the Philippines.
              </p>
            </div>

            {/* Santa Experiences & SEO Pages */}
            <div>
              <h4 className="font-semibold text-[#D6B36A] mb-3 uppercase tracking-[0.14em] text-[11px]">
                Santa Experiences
              </h4>
              <ul className="space-y-2 text-[12px]">
                <li>
                  <Link href="/real-beard-santa-for-hire" className="hover:text-[#D6B36A] transition">
                    Real-Beard Santa for Hire
                  </Link>
                </li>
                <li>
                  <Link href="/santa-and-elves" className="hover:text-[#D6B36A] transition">
                    Santa &amp; Two Elves Package
                  </Link>
                </li>
                <li>
                  <Link href="/santa-for-malls" className="hover:text-[#D6B36A] transition">
                    Santa for Shopping Malls
                  </Link>
                </li>
                <li>
                  <Link href="/santa-for-hotels-and-resorts" className="hover:text-[#D6B36A] transition">
                    Santa for Hotels &amp; Resorts
                  </Link>
                </li>
                <li>
                  <Link href="/santa-for-corporate-events" className="hover:text-[#D6B36A] transition">
                    Corporate Christmas Events
                  </Link>
                </li>
                <li>
                  <Link href="/private-christmas-parties" className="hover:text-[#D6B36A] transition">
                    Private &amp; Family Celebrations
                  </Link>
                </li>
              </ul>
            </div>

            {/* Planning & Booking */}
            <div>
              <h4 className="font-semibold text-[#D6B36A] mb-3 uppercase tracking-[0.14em] text-[11px]">
                Planning &amp; Rates
              </h4>
              <ul className="space-y-2 text-[12px]">
                <li>
                  <Link href="/santa-booking-prices" className="hover:text-[#D6B36A] transition">
                    Santa Booking Prices &amp; Packages
                  </Link>
                </li>
                <li>
                  <Link href="/how-booking-works" className="hover:text-[#D6B36A] transition">
                    How Booking Works
                  </Link>
                </li>
                <li>
                  <Link href="/availability" className="hover:text-[#D6B36A] transition">
                    Check Holiday Availability
                  </Link>
                </li>
                <li>
                  <Link
                    href="/request-quote"
                    className="font-semibold text-[#D6B36A] hover:underline"
                  >
                    Request a Formal Quotation →
                  </Link>
                </li>
                <li>
                  <Link href="/client-login" className="hover:text-[#D6B36A] transition">
                    Client &amp; Portal Login
                  </Link>
                </li>
              </ul>
            </div>

            {/* Direct Contact & Operating Integrity */}
            <div className="space-y-3">
              <h4 className="font-semibold text-[#D6B36A] mb-3 uppercase tracking-[0.14em] text-[11px]">
                Direct Inquiries
              </h4>
              <ul className="space-y-2 text-[12px]">
                <li className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-[#D6B36A]" />
                  <a href="tel:09278872343" className="hover:text-[#D6B36A]">
                    0927 887 2343
                  </a>
                </li>
                <li className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-[#D6B36A]" />
                  <a href="mailto:brilloevents@gmail.com" className="hover:text-[#D6B36A]">
                    brilloevents@gmail.com
                  </a>
                </li>
                <li className="text-[11px] text-[#FFF8F0]/60 pt-1">
                  Metro Manila &amp; Nationwide Inquiries
                </li>
              </ul>
              <p className="text-[11px] leading-relaxed text-[#FFF8F0]/55 pt-2 border-t border-white/10">
                All prices are indicative booking rates. Bookings are confirmed only upon mutual execution of a written booking agreement and verified payment.
              </p>
              <div className="flex space-x-3 pt-1 text-[11px] text-[#FFF8F0]/60">
                <Link href="/privacy" className="hover:text-[#D6B36A]">
                  Privacy Policy
                </Link>
                <span>•</span>
                <Link href="/terms" className="hover:text-[#D6B36A]">
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#FFF8F0]/55">
            <div>
              © {new Date().getFullYear()} Brillo Events Management Services. All rights reserved.
            </div>
            <div className="mt-2 sm:mt-0 tracking-wider uppercase text-[10px] text-[#D6B36A]/80">
              brilloevent.com • Christmas Entertainment &amp; Experiences
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Sticky Inquiry & Call Bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#211619]/95 backdrop-blur-md border-t border-[#D6B36A]/40 px-3 py-2.5 flex items-center gap-2 shadow-2xl">
        <a
          href="tel:09278872343"
          className="flex-1 py-2.5 px-3 rounded-xl border border-[#D6B36A]/50 text-[#D6B36A] text-xs font-semibold flex items-center justify-center space-x-1.5"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>0927 887 2343</span>
        </a>
        <Link
          href="/#inquiry-form"
          className="flex-[1.35] py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#A61932] to-[#B82038] text-[#FFF8F0] border border-[#D6B36A]/50 text-xs font-bold flex items-center justify-center space-x-1.5 shadow-crimson-glow"
        >
          <Calendar className="w-3.5 h-3.5 text-[#D6B36A]" />
          <span>Book Your Santa</span>
        </Link>
      </div>
    </div>
  );
}
