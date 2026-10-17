import Link from "next/link";
import { Building2, ShieldCheck, CheckCircle2, Sparkles, Calendar } from "lucide-react";

export default function CorporatePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="px-3 py-1 rounded-full bg-crimson-950 text-gold-400 border border-crimson-800 text-xs font-mono font-semibold">
          SHOPPING MALLS &amp; CORPORATE ENTERTAINMENT
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Premier Santa Claus Appearances for Flagship Venues
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          From nationwide shopping mall centerpiece tours to five-star hotel tree lighting spectacles and grand corporate holiday galas.
        </p>
      </div>

      {/* Corporate Packages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 rounded-2xl bg-obsidian-900 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Mall Centerpiece Tour &amp; Launch</h2>
            <div className="text-2xl font-bold text-gold-400 font-mono mt-2">
              Starting at ₱18,000 <span className="text-xs text-slate-400 font-normal">/ 4-hr Metro Manila</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Designed for high-traffic commercial retail centers. Includes queue management flow, on-ground Production Assistant (PA), and continuous guest interaction.
            </p>
            <ul className="space-y-2 text-xs text-slate-300 pt-4 border-t border-slate-800">
              <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-400" /> Full 4-hour performance block with scheduled rest periods</li>
              <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-400" /> Bespoke European velvet wardrobe with genuine brass accoutrements</li>
              <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-400" /> PA queue host &amp; photographer coordination</li>
            </ul>
          </div>
          <Link
            href="/request-quote?type=mall"
            className="w-full text-center py-3 rounded-xl font-bold text-xs bg-crimson-700 hover:bg-crimson-600 text-white transition shadow-md"
          >
            Inquire for Mall Deployment →
          </Link>
        </div>

        <div className="p-8 rounded-2xl bg-obsidian-900 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Luxury Hotel &amp; Corporate Gala</h2>
            <div className="text-2xl font-bold text-gold-400 font-mono mt-2">
              Custom Quotation <span className="text-xs text-slate-400 font-normal">per event run</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Tailored specifically for corporate holiday galas, luxury hotel lobbies, VIP meet-and-greets, and brand ambassador holiday campaigns.
            </p>
            <ul className="space-y-2 text-xs text-slate-300 pt-4 border-t border-slate-800">
              <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-400" /> Grand entrance and program keynote stage moments</li>
              <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-400" /> Storytelling, executive gift distribution, and photo sessions</li>
              <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-400" /> Multi-day or nationwide tour coordination</li>
            </ul>
          </div>
          <Link
            href="/request-quote?type=hotel"
            className="w-full text-center py-3 rounded-xl font-bold text-xs bg-obsidian-850 hover:bg-obsidian-800 border border-slate-700 text-white transition"
          >
            Inquire for Hotel Gala →
          </Link>
        </div>
      </div>
    </div>
  );
}
