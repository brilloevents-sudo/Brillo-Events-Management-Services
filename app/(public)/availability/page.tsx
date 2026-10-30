"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Sparkles } from "lucide-react";

export default function AvailabilityPage() {
  const [selectedDate, setSelectedDate] = useState("");
  const [checked, setChecked] = useState(false);

  function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    if (selectedDate) setChecked(true);
  }

  const isPeakHoliday =
    selectedDate.includes("-12-24") ||
    selectedDate.includes("-12-25") ||
    selectedDate.includes("-12-30") ||
    selectedDate.includes("-12-31");

  return (
    <div className="font-body pb-20">
      <section className="bg-gradient-to-b from-[#211619] via-[#590919] to-[#780D22] text-[#FFF8F0] py-16 sm:py-20 px-4 sm:px-6 border-b border-[#D6B36A]/30">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#211619]/60 text-[#D6B36A] border border-[#D6B36A]/40 text-[11px] font-bold uppercase tracking-[0.18em]">
            <Sparkles className="w-3.5 h-3.5" />
            Holiday Date Check
          </span>
          <h1 className="font-display text-4xl sm:text-6xl font-semibold text-[#FFF8F0] leading-tight">
            Check Santa Calendar Availability
          </h1>
          <p className="text-sm sm:text-base text-[#FFF8F0]/85 max-w-xl mx-auto leading-relaxed">
            Select your preferred event date to check holiday booking guidance before submitting your formal inquiry.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 space-y-8">
        <form
          onSubmit={handleCheck}
          className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8DCD0] shadow-xl space-y-5 text-xs"
        >
          <div>
            <label className="block text-[#211619] font-bold text-sm mb-2">
              Select Desired Event Date *
            </label>
            <input
              type="date"
              required
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setChecked(false);
              }}
              className="w-full px-4 py-3.5 bg-[#FFF8F0] border border-[#D8C9BA] rounded-xl text-[#211619] text-sm focus:outline-none focus:border-[#780D22]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-full font-bold text-xs uppercase tracking-[0.15em] bg-gradient-to-r from-[#780D22] to-[#B82038] hover:from-[#8C1028] hover:to-[#C92640] text-white transition shadow-lg"
          >
            Check Date Availability →
          </button>
        </form>

        {checked && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-[#D6B36A] shadow-xl space-y-5 text-xs">
            <div className="flex items-start space-x-3.5">
              <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-display text-2xl font-bold text-[#211619]">
                  Inquiries Open for {new Date(selectedDate).toDateString()}
                </h3>
                <p className="text-[#5C494E] text-xs mt-1 leading-relaxed">
                  {isPeakHoliday
                    ? "Peak Christmas Holiday Date. Real-Beard Santa availability is highly limited and confirmed upon booking."
                    : "Holiday appearance windows are currently open for Metro Manila and nationwide inquiries. Availability is confirmed upon booking."}
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#FFF8F0] border border-[#E8DCD0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#7A666B]">
                  Starting Package Rates (Min 3 Hours):
                </span>
                <div className="font-bold text-[#780D22] text-sm">
                  {isPeakHoliday
                    ? "Real-Beard Santa: ₱26,000 • Classic Santa: ₱18,000 • Santa & 2 Elves: ₱32,000"
                    : "Real-Beard Santa: ₱24,000 • Classic Santa: ₱15,000 • Santa & 2 Elves: ₱32,000"}
                </div>
                <div className="text-[11px] text-[#5C494E]">
                  Out-of-town rate: ₱26,000 (Real-Beard) / ₱18,000 (Classic) • Extra hours: +₱3,000/hr
                </div>
              </div>

              <Link
                href={`/request-quote?date=${selectedDate}`}
                className="px-6 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-[#780D22] to-[#B82038] text-white transition shadow-md shrink-0"
              >
                Request Quotation →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
