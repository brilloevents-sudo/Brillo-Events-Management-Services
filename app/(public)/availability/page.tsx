"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, CheckCircle2, Clock, ShieldCheck, Sparkles } from "lucide-react";

export default function AvailabilityPage() {
  const [selectedDate, setSelectedDate] = useState("");
  const [checked, setChecked] = useState(false);

  function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    if (selectedDate) setChecked(true);
  }

  const isPeakHoliday = selectedDate.includes("-12-24") || selectedDate.includes("-12-25");

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-12">
      <div className="text-center space-y-3">
        <span className="px-3 py-1 rounded-full bg-crimson-950 text-gold-400 border border-crimson-800 text-xs font-mono font-semibold">
          LIVE CALENDAR ENGINE
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Check Santa Calendar Availability
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          Select your intended event date to verify whether prime holiday appearance slots are currently open for booking.
        </p>
      </div>

      <form onSubmit={handleCheck} className="p-6 rounded-2xl bg-obsidian-900 border border-slate-800 space-y-4 text-xs">
        <div>
          <label className="block text-slate-300 font-semibold mb-1">Select Desired Appearance Date *</label>
          <input
            type="date"
            required
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setChecked(false);
            }}
            className="w-full px-4 py-3 bg-obsidian-950 border border-slate-700 rounded-xl text-white font-mono text-sm"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl font-bold text-xs bg-crimson-700 hover:bg-crimson-600 text-white transition shadow-md"
        >
          Verify Date Availability →
        </button>
      </form>

      {checked && (
        <div className="p-6 rounded-2xl bg-obsidian-900 border border-slate-800 space-y-4 text-xs animate-fadeIn">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-white">
                Slots Available for {new Date(selectedDate).toDateString()}
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                {isPeakHoliday
                  ? "Peak Christmas Holiday Date (Dec 24/25). Very limited talent calendar remaining."
                  : "Standard holiday appearance slots are open for Metro Manila and Provincial bookings."}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-obsidian-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="text-slate-400">Starting Planning Guidance:</span>
              <div className="font-bold text-gold-300 text-sm mt-0.5">
                {isPeakHoliday ? "₱23,000 – ₱30,000 range" : "₱18,000 (4-hr block)"}
              </div>
            </div>

            <Link
              href={`/request-quote?date=${selectedDate}`}
              className="px-6 py-2.5 rounded-lg font-bold text-xs bg-crimson-700 hover:bg-crimson-600 text-white transition shadow-sm"
            >
              Lock Date with a 24h Hold →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
