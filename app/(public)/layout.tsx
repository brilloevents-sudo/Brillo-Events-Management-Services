import { PublicNav } from "@/components/public-nav";
import Link from "next/link";
import { Sparkles, Phone, Mail, ShieldCheck } from "lucide-react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 flex flex-col selection:bg-crimson-600 selection:text-white">
      <PublicNav />
      <main className="flex-1">{children}</main>
      <footer className="bg-obsidian-900 border-t border-slate-800/80 pt-12 pb-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded bg-crimson-800 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-gold-400" />
                </div>
                <span className="font-bold text-sm text-white tracking-tight">
                  BRILLO EVENTS
                </span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                The premier Philippine talent management agency for authentic real-beard Santa Claus appearances in premier shopping malls, five-star hotels, and corporate holiday centerpieces.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-white mb-3 uppercase tracking-wider text-[11px] font-mono">
                Booking Services
              </h4>
              <ul className="space-y-2">
                <li><Link href="/corporate" className="hover:text-gold-300">Mall &amp; Corporate Centerpieces</Link></li>
                <li><Link href="/private-events" className="hover:text-gold-300">Private &amp; Luxury Residences</Link></li>
                <li><Link href="/how-booking-works" className="hover:text-gold-300">How Booking Works</Link></li>
                <li><Link href="/availability" className="hover:text-gold-300">Check Date Availability</Link></li>
                <li><Link href="/request-quote" className="hover:text-gold-300 font-semibold text-gold-400">Request a Formal Quote →</Link></li>
              </ul>
            </div>

            {/* Inquiries & Verification */}
            <div>
              <h4 className="font-semibold text-white mb-3 uppercase tracking-wider text-[11px] font-mono">
                Contact &amp; Operations
              </h4>
              <ul className="space-y-2 font-mono text-[11px]">
                <li className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-gold-400" />
                  <span>0927 887 2343</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-gold-400" />
                  <span>brilloevents@gmail.com</span>
                </li>
                <li className="text-[10px] text-slate-500 pt-1">
                  Metro Manila &amp; Provincial Deployment
                </li>
              </ul>
            </div>

            {/* Legal & Compliance Notice */}
            <div className="space-y-2">
              <h4 className="font-semibold text-white mb-3 uppercase tracking-wider text-[11px] font-mono">
                Operating Integrity
              </h4>
              <p className="text-[11px] leading-relaxed text-slate-500">
                All appearances require an executed booking agreement and verified downpayment. Starting figures are quotation guidance and not binding final offers.
              </p>
              <div className="flex space-x-3 pt-2 text-[10px] font-mono text-slate-500">
                <Link href="/privacy" className="hover:text-slate-300">Privacy Policy</Link>
                <span>•</span>
                <Link href="/terms" className="hover:text-slate-300">Terms of Service</Link>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800/60 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
            <div>© {new Date().getFullYear()} Brillo Events Management Service. All rights reserved.</div>
            <div className="mt-2 sm:mt-0 font-mono text-[10px]">
              Confidential Talent Management Platform
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
