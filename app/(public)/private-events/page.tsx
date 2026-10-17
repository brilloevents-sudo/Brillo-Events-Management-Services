import Link from "next/link";
import { User, CheckCircle2, Heart, Sparkles } from "lucide-react";

export default function PrivateEventsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="px-3 py-1 rounded-full bg-crimson-950 text-gold-400 border border-crimson-800 text-xs font-mono font-semibold">
          PRIVATE RESIDENCES &amp; FAMILY GATHERINGS
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Intimate Real-Beard Santa Home Encounters
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          Create unforgettable Christmas memories for your family and guests with a bespoke, private visit from an authentic European or American real-beard Santa Claus.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div className="p-8 rounded-2xl bg-obsidian-900 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Private Estate Visit (2 Hours)</h2>
            <div className="text-2xl font-bold text-gold-400 font-mono mt-2">
              Custom Quote <span className="text-xs text-slate-400 font-normal">per private itinerary</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Tailored for luxury residences and gated communities. Santa arrives with his assistant to distribute gifts, take timeless family portraits, and share stories.
            </p>
            <ul className="space-y-2 text-xs text-slate-300 pt-4 border-t border-slate-800">
              <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-400" /> Natural real beard and theatrical warm personality</li>
              <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-400" /> Personalized gift delivery using names of children</li>
              <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-400" /> Discreet arrival and holding room coordination</li>
            </ul>
          </div>
          <Link
            href="/request-quote?type=private"
            className="w-full text-center py-3 rounded-xl font-bold text-xs bg-crimson-700 hover:bg-crimson-600 text-white transition shadow-md"
          >
            Inquire for Private Visit →
          </Link>
        </div>

        <div className="p-8 rounded-2xl bg-obsidian-900 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Christmas Eve &amp; Day VIP Visit</h2>
            <div className="text-2xl font-bold text-gold-400 font-mono mt-2">
              ₱23,000 – ₱30,000 <span className="text-xs text-slate-400 font-normal">range</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Prime holiday slot reservation on December 24 and 25. Extremely limited talent calendar.
            </p>
            <ul className="space-y-2 text-xs text-slate-300 pt-4 border-t border-slate-800">
              <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-2 text-gold-400" /> Christmas Eve evening or Christmas Day morning arrival</li>
              <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-2 text-gold-400" /> Unmatched authenticity and holiday warmth</li>
              <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-2 text-gold-400" /> Dedicated operations concierge</li>
            </ul>
          </div>
          <Link
            href="/request-quote?package=holiday"
            className="w-full text-center py-3 rounded-xl font-bold text-xs bg-obsidian-850 hover:bg-obsidian-800 border border-slate-700 text-white transition"
          >
            Inquire for Holiday Visit →
          </Link>
        </div>
      </div>
    </div>
  );
}
