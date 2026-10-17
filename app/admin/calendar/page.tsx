"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Building2,
  Users2,
  CheckCircle,
} from "lucide-react";
import { BOOKING_STATUS_CONFIG, BookingStatus } from "@/lib/booking-state";

export default function CalendarPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [currentMonth, setCurrentMonth] = useState<number>(11); // December 2026 default
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/bookings")
      .then((res) => res.json())
      .then((d) => {
        if (d.bookings) setBookings(d.bookings);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  // Group bookings by date string (YYYY-MM-DD)
  const bookingsByDate: Record<string, any[]> = {};
  bookings.forEach((b) => {
    const d = new Date(b.eventDate);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (!bookingsByDate[dateKey]) bookingsByDate[dateKey] = [];
    bookingsByDate[dateKey].push(b);
  });

  // Calculate calendar grid for currentMonth (0-indexed)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center">
            Master Deployment Calendar
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time schedule of real-beard Santa deployments across all mall branches and private venues.
          </p>
        </div>

        {/* Month Selector Controls */}
        <div className="flex items-center space-x-2 bg-obsidian-900 border border-slate-800 p-1 rounded-xl text-xs">
          <button
            onClick={() => {
              if (currentMonth === 0) {
                setCurrentMonth(11);
                setCurrentYear(currentYear - 1);
              } else {
                setCurrentMonth(currentMonth - 1);
              }
            }}
            className="p-1.5 rounded-lg hover:bg-obsidian-800 text-slate-400 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="font-mono font-bold text-white px-3 min-w-[140px] text-center">
            {monthNames[currentMonth]} {currentYear}
          </span>

          <button
            onClick={() => {
              if (currentMonth === 11) {
                setCurrentMonth(0);
                setCurrentYear(currentYear + 1);
              } else {
                setCurrentMonth(currentMonth + 1);
              }
            }}
            className="p-1.5 rounded-lg hover:bg-obsidian-800 text-slate-400 hover:text-white"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-xl bg-obsidian-900 border border-slate-800 overflow-hidden shadow-md">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b border-slate-800 bg-obsidian-950 text-center text-xs font-mono font-bold text-slate-400 uppercase py-2.5">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Grid Cells */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-800/60 min-h-[500px]">
          {calendarDays.map((day, idx) => {
            if (day === null) {
              return <div key={idx} className="bg-obsidian-950/40 p-2 min-h-[90px]" />;
            }

            const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayBookings = bookingsByDate[dateKey] || [];
            const isChristmas = currentMonth === 11 && (day === 24 || day === 25);

            return (
              <div
                key={idx}
                className={`p-2 min-h-[100px] flex flex-col justify-between transition hover:bg-obsidian-850/40 ${
                  isChristmas ? "bg-crimson-950/30 border border-crimson-800/40" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-mono font-bold ${
                      isChristmas
                        ? "text-gold-300 px-1.5 py-0.5 rounded bg-crimson-900"
                        : "text-slate-300"
                    }`}
                  >
                    {day}
                  </span>
                  {dayBookings.length > 0 && (
                    <span className="text-[10px] px-1 rounded-full bg-gold-950 text-gold-400 border border-gold-800 font-mono">
                      {dayBookings.length}
                    </span>
                  )}
                </div>

                <div className="space-y-1 mt-1 flex-1 overflow-y-auto max-h-24">
                  {dayBookings.map((b) => {
                    const statusMeta = BOOKING_STATUS_CONFIG[b.status as BookingStatus] || {
                      color: "bg-slate-800 text-slate-300",
                    };
                    const talent = b.talentAssignments[0]?.talent;

                    return (
                      <Link
                        key={b.id}
                        href={`/admin/bookings/${b.id}`}
                        className="block p-1 rounded bg-obsidian-950 border border-slate-800 hover:border-gold-500/50 text-[10px] transition group truncate"
                        title={`${b.mallOrVenue} - Santa ${talent ? talent.displayName : 'Unassigned'}`}
                      >
                        <div className="font-semibold text-white truncate">
                          {b.mallOrVenue}
                        </div>
                        <div className="text-gold-400/90 truncate font-mono text-[9px]">
                          {talent ? `Santa ${talent.displayName}` : "Unassigned"}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
