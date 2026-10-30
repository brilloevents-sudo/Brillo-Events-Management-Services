"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Building2,
  Users2,
  CheckCircle2,
  Plus,
  Pencil,
  Trash2,
  Search,
  Table2,
  Grid3X3,
  UserCheck,
  AlertTriangle,
  Eye,
  EyeOff,
  FileText,
  Phone,
  MapPin,
  DollarSign,
  X,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { BOOKING_STATUS_CONFIG, BookingStatus } from "@/lib/booking-state";

// Enriched Santa Database & PA Directory from the live Google Sheet ("Santa database" tab)
const SANTA_PA_DIRECTORY: Record<
  string,
  {
    fullName: string;
    nationality: string;
    age: string;
    height: string;
    contact: string;
    address: string;
    paName: string;
    paContact: string;
  }
> = {
  Perry: {
    fullName: "Per Soerensen",
    nationality: "Danish",
    age: "67",
    height: "184cm (6'0\")",
    contact: "0945 180 1430",
    address: "BLK 20 Lot 30 Gold Street Summit, Ridgecrest Subd., Imus, Cavite",
    paName: "Merlina Aday Soerensen",
    paContact: "0955 716 0765",
  },
  Cedric: {
    fullName: "Cedric Bloc",
    nationality: "French",
    age: "52",
    height: "173cm (5'8\")",
    contact: "0949 885 4374",
    address: "BLK 10 LOT 7, Verde Royal Subd., Sapang Biabas, Mabalacat, Pampanga",
    paName: "Elf 01: Avrel Khane Bloc • Elf 02: Jerosa Lorono",
    paContact: "0968 131 6710 / 0965 746 5782",
  },
  "Bob Hamilton": {
    fullName: "Bob Hamilton",
    nationality: "American",
    age: "72",
    height: "6'1\"",
    contact: "0915 158 1344",
    address: "Limay, Bataan",
    paName: "Arlyn Alderson",
    paContact: "0927 113 1300",
  },
  Terry: {
    fullName: "Tery Allen Vest",
    nationality: "American",
    age: "71",
    height: "5'9\"",
    contact: "0956 995 4488",
    address: "031 Tayuntong Shelltex Duale, Limay, Bataan 2103",
    paName: "Maritez Vest",
    paContact: "0981 075 7980",
  },
  Peter: {
    fullName: "Peter Georgopoulos",
    nationality: "American",
    age: "64",
    height: "6'1\"",
    contact: "0928 899 0586",
    address: "Manila / Pasig",
    paName: "Princess Penaso",
    paContact: "0963 279 8603",
  },
  Vic: {
    fullName: "Victor Gary Jacobs",
    nationality: "American",
    age: "Classified",
    height: "6'1\"",
    contact: "0976 090 7976",
    address: "Phase 3 Oscar St., Matrix Vill. Subd., Camarin, Caloocan",
    paName: "Teresita Gelera Villanueva",
    paContact: "0976 635 0420",
  },
  Benito: {
    fullName: "Benedetto Cunila",
    nationality: "Italian",
    age: "72",
    height: "6'0\"",
    contact: "0998 290 6249",
    address: "9 Gumamela Rd., Pilar Village, Las Piñas City",
    paName: "Franco Cunial",
    paContact: "0967 851 9375",
  },
};

type CalendarViewMode = "GRID" | "EXCEL_SHEET" | "MATRIX" | "INDIVIDUAL_SANTA";

interface BookingFormState {
  id?: string;
  bookingNumber?: string;
  eventName: string;
  mallOrVenue: string;
  companyName: string;
  eventDate: string;
  callTime: string;
  startTime: string;
  endTime: string;
  status: string;
  talentId: string;
  agreedTalentFee: number;
  totalContractAmount: number;
  depositPaid: number;
  balanceDue: number;
  specialRequests: string; // Booking Details & Description
  venueNotes: string; // TF / Allowance / Cash Advance Notes
  internalNotes: string; // Internal Audit / Contract Notes
}

const DEFAULT_FORM_STATE: BookingFormState = {
  eventName: "",
  mallOrVenue: "",
  companyName: "SM Supermalls",
  eventDate: "2026-10-23",
  callTime: "13:00",
  startTime: "14:00",
  endTime: "18:00",
  status: "READY_FOR_DEPLOYMENT",
  talentId: "",
  agreedTalentFee: 12000,
  totalContractAmount: 18000,
  depositPaid: 9000,
  balanceDue: 9000,
  specialRequests: "",
  venueNotes: "",
  internalNotes: "",
};

function toDateInputString(dVal: any): string {
  const d = new Date(dVal);
  if (isNaN(d.getTime())) return "2026-10-23";
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(
    d.getUTCDate()
  ).padStart(2, "0")}`;
}

export default function CalendarPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [talents, setTalents] = useState<any[]>([]);
  const [currentMonth, setCurrentMonth] = useState<number>(9); // October 2026 default (9 = Oct)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [viewMode, setViewMode] = useState<CalendarViewMode>("GRID");
  const [showFinancials, setShowFinancials] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSantaFilter, setSelectedSantaFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  // Modal state for Create / Edit Booking Details & Description
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const [form, setForm] = useState<BookingFormState>(DEFAULT_FORM_STATE);

  // Day Drawer state when inspecting all bookings on a busy date
  const [inspectedDateKey, setInspectedDateKey] = useState<string | null>(null);

  const loadCalendarData = async () => {
    setLoading(true);
    try {
      const [bRes, tRes] = await Promise.all([
        fetch("/api/bookings").then((r) => r.json()),
        fetch("/api/talents").then((r) => r.json()),
      ]);
      if (bRes?.bookings) setBookings(bRes.bookings);
      if (tRes?.talents) setTalents(tRes.talents);
    } catch {
      // Handled by static fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalendarData();
  }, []);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Filter bookings by search & Santa filter
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const talent = b.talentAssignments?.[0]?.talent;
      if (selectedSantaFilter !== "ALL") {
        if (selectedSantaFilter === "UNASSIGNED") {
          if (talent) return false;
        } else if (talent?.id !== selectedSantaFilter && talent?.displayName !== selectedSantaFilter) {
          return false;
        }
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const mallMatch = (b.mallOrVenue || "").toLowerCase().includes(q);
      const eventMatch = (b.eventName || "").toLowerCase().includes(q);
      const clientMatch = (b.client?.companyName || "").toLowerCase().includes(q);
      const santaMatch = (talent?.displayName || "").toLowerCase().includes(q);
      const notesMatch =
        (b.internalNotes || "").toLowerCase().includes(q) ||
        (b.specialRequests || "").toLowerCase().includes(q) ||
        (b.venueNotes || "").toLowerCase().includes(q);
      return mallMatch || eventMatch || clientMatch || santaMatch || notesMatch;
    });
  }, [bookings, searchQuery, selectedSantaFilter]);

  // Group bookings by YYYY-MM-DD (using UTC date components because dates are stored at 12:00 UTC)
  const bookingsByDate = useMemo(() => {
    const map: Record<string, any[]> = {};
    filteredBookings.forEach((b) => {
      const dateKey = toDateInputString(b.eventDate);
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(b);
    });
    return map;
  }, [filteredBookings]);

  // Detect double-booked Santas on the same date (e.g. Vic on Dec 25 at SM Novaliches & SM Caloocan)
  const doubleBookedMap = useMemo(() => {
    const map: Record<string, string[]> = {}; // key: `${dateKey}_${talentName}` -> list of venues
    bookings.forEach((b) => {
      const dateKey = toDateInputString(b.eventDate);
      const tName = b.talentAssignments?.[0]?.talent?.displayName;
      if (!tName) return;
      const k = `${dateKey}_${tName}`;
      if (!map[k]) map[k] = [];
      map[k].push(b.mallOrVenue);
    });
    return map;
  }, [bookings]);

  // Current month bookings for summary KPIs & Excel view
  const currentMonthBookings = useMemo(() => {
    const prefix = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-`;
    return filteredBookings
      .filter((b) => toDateInputString(b.eventDate).startsWith(prefix))
      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
  }, [filteredBookings, currentYear, currentMonth]);

  const monthMetrics = useMemo(() => {
    let totalRevenue = 0;
    let totalDpPaid = 0;
    let totalCollectibles = 0;
    let totalTf = 0;
    let conflictsCount = 0;

    currentMonthBookings.forEach((b) => {
      const contract = Number(b.totalContractAmount || 18000);
      const dp = Number(b.depositPaid || 0);
      const bal = Number(b.balanceDue ?? Math.max(0, contract - dp));
      const tf = Number(b.talentAssignments?.[0]?.agreedTalentFee || b.totalDirectCost || 12000);
      totalRevenue += contract;
      totalDpPaid += dp;
      totalCollectibles += bal;
      totalTf += tf;

      const dateKey = toDateInputString(b.eventDate);
      const tName = b.talentAssignments?.[0]?.talent?.displayName;
      if (tName && (doubleBookedMap[`${dateKey}_${tName}`]?.length || 0) > 1) {
        conflictsCount++;
      }
    });

    return {
      count: currentMonthBookings.length,
      totalRevenue,
      totalDpPaid,
      totalCollectibles,
      totalTf,
      netProfit: totalRevenue - totalTf,
      conflictsCount,
    };
  }, [currentMonthBookings, doubleBookedMap]);

  // Open Modal to Create a New Booking
  const openCreateModal = (prefillDate?: string, prefillTalentId?: string) => {
    const defaultDate =
      prefillDate ||
      `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(15).padStart(2, "0")}`;
    const matchedTalent = prefillTalentId ? talents.find((t) => t.id === prefillTalentId) : null;
    setIsEditing(false);
    setFeedbackMsg(null);
    setForm({
      ...DEFAULT_FORM_STATE,
      eventDate: defaultDate,
      talentId: prefillTalentId || "",
      agreedTalentFee: matchedTalent ? Number(matchedTalent.baseTalentFee || 12000) : 12000,
    });
    setModalOpen(true);
  };

  // Open Modal to Edit an Existing Booking
  const openEditModal = (b: any) => {
    const assignment = b.talentAssignments?.[0];
    const contractAmt = Number(b.totalContractAmount || 18000);
    const dpAmt = Number(b.depositPaid || 0);
    const balAmt = Number(b.balanceDue ?? Math.max(0, contractAmt - dpAmt));
    setIsEditing(true);
    setFeedbackMsg(null);
    setForm({
      id: b.id,
      bookingNumber: b.bookingNumber,
      eventName: b.eventName || `${b.mallOrVenue} — Santa Appearance`,
      mallOrVenue: b.mallOrVenue || "",
      companyName: b.client?.companyName || "SM Supermalls",
      eventDate: toDateInputString(b.eventDate),
      callTime: b.callTime || "13:00",
      startTime: b.startTime || "14:00",
      endTime: b.endTime || "18:00",
      status: b.status || "READY_FOR_DEPLOYMENT",
      talentId: assignment?.talentId || assignment?.talent?.id || "",
      agreedTalentFee: Number(assignment?.agreedTalentFee || b.totalDirectCost || 12000),
      totalContractAmount: contractAmt,
      depositPaid: dpAmt,
      balanceDue: balAmt,
      specialRequests: b.specialRequests || "",
      venueNotes: b.venueNotes || "",
      internalNotes: b.internalNotes || "",
    });
    setModalOpen(true);
  };

  // Save Booking (Create or Edit)
  const handleSaveBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.mallOrVenue.trim()) {
      setFeedbackMsg({ type: "error", text: "Please enter a Mall or Venue name." });
      return;
    }

    setSaving(true);
    setFeedbackMsg(null);

    const payload = {
      ...form,
      eventName: form.eventName.trim() || `${form.mallOrVenue.trim()} — Santa Appearance`,
      mallOrVenue: form.mallOrVenue.trim(),
      companyName: form.companyName.trim() || "SM Supermalls",
      isCalendarDirectEdit: true,
      allowConflictOverride: true,
    };

    try {
      const url = isEditing && form.id ? `/api/bookings/${form.id}` : "/api/bookings";
      const method = isEditing && form.id ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-brillo-role": "SUPER_ADMIN",
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || data.success === false) {
        setFeedbackMsg({
          type: "error",
          text: data.error || "Could not save booking. Please check inputs.",
        });
        setSaving(false);
        return;
      }

      await loadCalendarData();
      setFeedbackMsg({
        type: "success",
        text: isEditing
          ? `Updated ${payload.mallOrVenue} booking details & description!`
          : `Created new booking for ${payload.mallOrVenue} on ${payload.eventDate}!`,
      });
      setTimeout(() => {
        setModalOpen(false);
        setFeedbackMsg(null);
      }, 650);
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err?.message || "Network error while saving." });
    } finally {
      setSaving(false);
    }
  };

  // Delete Booking
  const handleDeleteBooking = async () => {
    if (!isEditing || !form.id) return;
    setSaving(true);
    try {
      await fetch(`/api/bookings/${form.id}`, {
        method: "DELETE",
        headers: { "x-brillo-role": "SUPER_ADMIN" },
      });
      await loadCalendarData();
      setModalOpen(false);
    } catch {
      // Ignore
    } finally {
      setSaving(false);
    }
  };

  // Calendar Grid calculation for currentMonth (0-indexed)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  const allDaysOfMonth = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
      {/* Top Executive Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-5 border-b border-[#E8DFE0]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="badge-esign px-2.5 py-0.5 rounded-full text-[11px] uppercase tracking-wider">
              GOOGLE SHEET TRACKER SYNCED
            </span>
            <span className="text-xs font-mono text-[#6E5D5F]">
              {bookings.length} Total Season Deployments
            </span>
          </div>
          <h1 className="page-title text-2xl lg:text-3xl font-bold tracking-tight mt-1">
            Master Deployment Calendar & Excel Tracker
          </h1>
          <p className="page-subtitle text-sm mt-0.5">
            Create new bookings, edit descriptions & financial notes, and switch between the Wall Calendar, Excel Day-by-Day Sheet, Santa Matrix, and Individual Santa Schedules.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => openCreateModal()}
            className="btn-primary px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition hover:opacity-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create New Booking</span>
          </button>

          <button
            onClick={() => setShowFinancials(!showFinancials)}
            className="px-3.5 py-2.5 rounded-xl text-xs font-semibold border border-[#D6C7C9] bg-white text-[#3D2C2E] hover:bg-[#FAF7F5] flex items-center gap-1.5 transition"
          >
            {showFinancials ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showFinancials ? "Hide Financials" : "Show Financials"}</span>
          </button>
        </div>
      </div>

      {/* Month KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <div className="dashboard-card p-3.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6E5D5F]">
            {monthNames[currentMonth]} Deployments
          </div>
          <div className="text-2xl font-bold text-[#1E1416] font-mono mt-1">
            {monthMetrics.count}
          </div>
          <div className="text-[11px] text-[#6E5D5F] mt-0.5">Confirmed & active holds</div>
        </div>

        {showFinancials && (
          <>
            <div className="dashboard-card p-3.5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6E5D5F]">
                Contract Gross ({monthNames[currentMonth].slice(0, 3)})
              </div>
              <div className="text-xl font-bold text-[#1E1416] font-mono mt-1">
                ₱{monthMetrics.totalRevenue.toLocaleString()}
              </div>
              <div className="text-[11px] text-[#1E7E48] font-medium mt-0.5">
                DP Paid: ₱{monthMetrics.totalDpPaid.toLocaleString()}
              </div>
            </div>

            <div className="dashboard-card p-3.5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6E5D5F]">
                Client Collectibles
              </div>
              <div className="text-xl font-bold text-[#C68A12] font-mono mt-1">
                ₱{monthMetrics.totalCollectibles.toLocaleString()}
              </div>
              <div className="text-[11px] text-[#6E5D5F] mt-0.5">Remaining balance due</div>
            </div>

            <div className="dashboard-card p-3.5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6E5D5F]">
                Santa Talent Fees (TF)
              </div>
              <div className="text-xl font-bold text-[#3D2C2E] font-mono mt-1">
                ₱{monthMetrics.totalTf.toLocaleString()}
              </div>
              <div className="text-[11px] text-[#6E5D5F] mt-0.5">Allocated roster payout</div>
            </div>

            <div className="dashboard-card p-3.5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6E5D5F]">
                Projected Net Margin
              </div>
              <div className="text-xl font-bold text-[#1E7E48] font-mono mt-1">
                ₱{monthMetrics.netProfit.toLocaleString()}
              </div>
              <div className="text-[11px] text-[#6E5D5F] mt-0.5">Before overhead expenses</div>
            </div>
          </>
        )}

        <div className="dashboard-card p-3.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6E5D5F]">
            Double-Booking Alerts
          </div>
          <div
            className={`text-xl font-bold font-mono mt-1 flex items-center gap-1.5 ${
              monthMetrics.conflictsCount > 0 ? "text-[#B91C1C]" : "text-[#1E7E48]"
            }`}
          >
            {monthMetrics.conflictsCount > 0 && <AlertTriangle className="w-4 h-4" />}
            <span>{monthMetrics.conflictsCount}</span>
          </div>
          <div className="text-[11px] text-[#6E5D5F] mt-0.5">
            {monthMetrics.conflictsCount > 0
              ? "Same Santa on multiple malls"
              : "Zero schedule overlaps"}
          </div>
        </div>
      </div>

      {/* Controls Bar: View Switcher + Month Quick-Tabs + Search & Filter */}
      <div className="dashboard-card p-3.5 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
        {/* 4 View Mode Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#FAF7F5] p-1 rounded-xl border border-[#E8DFE0]">
          <button
            onClick={() => setViewMode("GRID")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              viewMode === "GRID"
                ? "bg-[#9B1B30] text-white shadow-sm"
                : "text-[#3D2C2E] hover:bg-white"
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>1. Monthly Calendar</span>
          </button>

          <button
            onClick={() => setViewMode("EXCEL_SHEET")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              viewMode === "EXCEL_SHEET"
                ? "bg-[#9B1B30] text-white shadow-sm"
                : "text-[#3D2C2E] hover:bg-white"
            }`}
          >
            <Table2 className="w-3.5 h-3.5" />
            <span>2. Excel Day-by-Day Sheet</span>
          </button>

          <button
            onClick={() => setViewMode("MATRIX")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              viewMode === "MATRIX"
                ? "bg-[#9B1B30] text-white shadow-sm"
                : "text-[#3D2C2E] hover:bg-white"
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5" />
            <span>3. Santa × Date Matrix</span>
          </button>

          <button
            onClick={() => setViewMode("INDIVIDUAL_SANTA")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              viewMode === "INDIVIDUAL_SANTA"
                ? "bg-[#9B1B30] text-white shadow-sm"
                : "text-[#3D2C2E] hover:bg-white"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>4. Individual Santa Schedule & PA</span>
          </button>
        </div>

        {/* Season Month Quick-Selector */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { label: "Sep 2026", m: 8 },
            { label: "Oct 2026", m: 9 },
            { label: "Nov 2026", m: 10 },
            { label: "Dec 2026", m: 11 },
          ].map((tab) => (
            <button
              key={tab.m}
              onClick={() => {
                setCurrentYear(2026);
                setCurrentMonth(tab.m);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition ${
                currentYear === 2026 && currentMonth === tab.m
                  ? "bg-[#F9EBED] text-[#9B1B30] border-[#9B1B30]"
                  : "bg-white text-[#3D2C2E] border-[#D6C7C9] hover:bg-[#FAF7F5]"
              }`}
            >
              {tab.label}
            </button>
          ))}

          <div className="flex items-center bg-[#FAF7F5] border border-[#D6C7C9] rounded-lg px-1 py-0.5 ml-1">
            <button
              onClick={() => {
                if (currentMonth === 0) {
                  setCurrentMonth(11);
                  setCurrentYear(currentYear - 1);
                } else {
                  setCurrentMonth(currentMonth - 1);
                }
              }}
              className="p-1 rounded hover:bg-white text-[#3D2C2E]"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono font-bold text-xs text-[#1E1416] px-2.5 min-w-[125px] text-center">
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
              className="p-1 rounded hover:bg-white text-[#3D2C2E]"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search & Santa Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-[#6E5D5F] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search mall, Santa, notes..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[#D6C7C9] bg-[#FAF7F5] text-[#1E1416]"
            />
          </div>

          <select
            value={selectedSantaFilter}
            onChange={(e) => setSelectedSantaFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-[#D6C7C9] bg-[#FAF7F5] text-[#1E1416] font-semibold"
          >
            <option value="ALL">All Santas ({talents.length})</option>
            <option value="UNASSIGNED">Unassigned Only</option>
            {talents.map((t) => (
              <option key={t.id} value={t.id}>
                Santa {t.displayName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* =====================================================================
          VIEW 1: MONTHLY WALL CALENDAR GRID (WITH EDIT & + ADD BUTTONS)
         ===================================================================== */}
      {viewMode === "GRID" && (
        <div className="dashboard-card overflow-hidden">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 border-b border-[#E8DFE0] bg-[#FAF7F5] text-center text-xs font-mono font-bold text-[#3D2C2E] uppercase py-3">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Calendar Cells */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-[#E8DFE0] min-h-[640px]">
            {calendarDays.map((day, idx) => {
              if (day === null) {
                return <div key={idx} className="bg-[#FAF7F5]/60 p-2 min-h-[135px]" />;
              }

              const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(
                day
              ).padStart(2, "0")}`;
              const dayBookings = bookingsByDate[dateKey] || [];
              const isChristmas = currentMonth === 11 && (day === 24 || day === 25);

              return (
                <div
                  key={idx}
                  className={`p-2 min-h-[145px] flex flex-col justify-between transition hover:bg-[#FAF7F5]/70 ${
                    isChristmas ? "bg-[#F9EBED]/40" : "bg-white"
                  }`}
                >
                  {/* Day Header Bar */}
                  <div className="flex items-center justify-between pb-1.5 border-b border-[#E8DFE0]/60">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                          isChristmas
                            ? "bg-[#9B1B30] text-white"
                            : dayBookings.length > 0
                            ? "bg-[#F9EBED] text-[#9B1B30]"
                            : "text-[#3D2C2E]"
                        }`}
                      >
                        {day}
                      </span>
                      {dayBookings.length > 0 && (
                        <button
                          onClick={() => setInspectedDateKey(dateKey)}
                          className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#FEF6E6] text-[#B87D14] border border-[#F2DEC0] font-mono font-bold hover:bg-[#F9EBED] hover:text-[#9B1B30] transition"
                          title="Click to inspect all deployments on this date"
                        >
                          {dayBookings.length} {dayBookings.length === 1 ? "gig" : "gigs"}
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => openCreateModal(dateKey)}
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded border border-[#D6C7C9] text-[#6E5D5F] hover:border-[#9B1B30] hover:text-[#9B1B30] hover:bg-[#F9EBED] flex items-center gap-0.5 transition"
                      title={`Add booking on ${monthNames[currentMonth]} ${day}, ${currentYear}`}
                    >
                      <Plus className="w-2.5 h-2.5" />
                      <span>Add</span>
                    </button>
                  </div>

                  {/* Bookings List in Cell */}
                  <div className="space-y-1.5 mt-1.5 flex-1 overflow-y-auto max-h-44 pr-0.5">
                    {dayBookings.map((b) => {
                      const talent = b.talentAssignments?.[0]?.talent;
                      const tName = talent?.displayName;
                      const isDoubleBooked =
                        tName && (doubleBookedMap[`${dateKey}_${tName}`]?.length || 0) > 1;
                      const descPreview =
                        b.specialRequests || b.venueNotes || b.internalNotes || "";

                      return (
                        <div
                          key={b.id}
                          onClick={() => openEditModal(b)}
                          className={`p-1.5 rounded-lg border text-[11px] cursor-pointer transition group relative ${
                            isDoubleBooked
                              ? "bg-[#FEF2F2] border-[#F87171] hover:border-[#B91C1C]"
                              : "bg-[#FAF7F5] border-[#E8DFE0] hover:border-[#9B1B30] hover:bg-white shadow-2xs"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div className="font-bold text-[#1E1416] leading-tight truncate">
                              {b.mallOrVenue}
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(b);
                              }}
                              className="shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-white border border-[#D6C7C9] text-[#9B1B30] hover:bg-[#9B1B30] hover:text-white transition"
                              title="Edit Booking Details & Description"
                            >
                              <Pencil className="w-2.5 h-2.5" />
                              <span>Edit</span>
                            </button>
                          </div>

                          <div className="flex items-center justify-between gap-1 mt-0.5">
                            <span className="font-mono text-[10px] font-semibold text-[#9B1B30] truncate">
                              {tName ? `Santa ${tName}` : "Unassigned"}
                            </span>
                            {showFinancials && (
                              <span className="font-mono text-[9px] text-[#6E5D5F]">
                                ₱{Number(b.totalContractAmount || 18000).toLocaleString()}
                              </span>
                            )}
                          </div>

                          {descPreview && (
                            <div className="text-[9px] text-[#6E5D5F] truncate mt-0.5 italic">
                              {descPreview}
                            </div>
                          )}

                          {isDoubleBooked && (
                            <div className="text-[9px] font-bold text-[#B91C1C] flex items-center gap-0.5 mt-0.5">
                              <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                              <span className="truncate">Double-booked: {tName}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          VIEW 2: EXCEL DAY-BY-DAY MASTER SHEET (REPLICA OF GOOGLE SHEET)
         ===================================================================== */}
      {viewMode === "EXCEL_SHEET" && (
        <div className="dashboard-card overflow-hidden">
          <div className="p-4 border-b border-[#E8DFE0] bg-[#FAF7F5] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-[#1E1416] flex items-center gap-2">
                <Table2 className="w-4 h-4 text-[#9B1B30]" />
                <span>
                  {monthNames[currentMonth].toUpperCase()} {currentYear} — MASTER EXCEL SCHEDULE LEDGER
                </span>
              </h2>
              <p className="text-xs text-[#6E5D5F]">
                Mirrors your Google Sheet day-by-day rows (Day 1 to Day {daysInMonth}) with merged multi-mall dates, receivables, talent fees, descriptions, and direct row editing.
              </p>
            </div>
            <button
              onClick={() => openCreateModal()}
              className="btn-primary px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Row to {monthNames[currentMonth]}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E8DFE0] bg-[#FAF7F5] text-[11px] font-mono uppercase text-[#3D2C2E]">
                  <th className="py-3 px-3 font-bold border-r border-[#E8DFE0] w-36">
                    Booking Date
                  </th>
                  <th className="py-3 px-3 font-bold">Agency / Company</th>
                  <th className="py-3 px-3 font-bold">Name of Mall / Venue</th>
                  <th className="py-3 px-3 font-bold">Status</th>
                  <th className="py-3 px-3 font-bold">Assigned Santa</th>
                  <th className="py-3 px-3 font-bold min-w-[220px]">
                    Booking Details / Description & Notes
                  </th>
                  {showFinancials && (
                    <>
                      <th className="py-3 px-3 font-bold text-right">Contract Total</th>
                      <th className="py-3 px-3 font-bold text-right">DP Paid</th>
                      <th className="py-3 px-3 font-bold text-right">Collectibles</th>
                      <th className="py-3 px-3 font-bold text-right">Talent Fee</th>
                      <th className="py-3 px-3 font-bold text-right">Net Profit</th>
                    </>
                  )}
                  <th className="py-3 px-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DFE0]">
                {allDaysOfMonth.map((day) => {
                  const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(
                    2,
                    "0"
                  )}-${String(day).padStart(2, "0")}`;
                  const dayBookings = bookingsByDate[dateKey] || [];
                  const dayOfWeek = new Date(currentYear, currentMonth, day).toLocaleDateString(
                    "en-US",
                    { weekday: "short" }
                  );

                  // Empty day row (just like Excel spacer rows so user sees open dates)
                  if (dayBookings.length === 0) {
                    return (
                      <tr
                        key={dateKey}
                        className="hover:bg-[#FAF7F5]/80 transition text-[#9A8A8C]"
                      >
                        <td className="py-2 px-3 font-mono text-[11px] font-semibold text-[#6E5D5F] border-r border-[#E8DFE0] bg-[#FAF7F5]/40">
                          {monthNames[currentMonth].slice(0, 3)} {day}, {currentYear} ({dayOfWeek})
                        </td>
                        <td
                          colSpan={showFinancials ? 10 : 5}
                          className="py-2 px-3 text-[11px] italic text-[#9A8A8C]"
                        >
                          Open Date — No deployments scheduled yet
                        </td>
                        <td className="py-2 px-3 text-right">
                          <button
                            onClick={() => openCreateModal(dateKey)}
                            className="px-2 py-1 rounded border border-[#D6C7C9] text-[10px] font-bold text-[#3D2C2E] hover:border-[#9B1B30] hover:text-[#9B1B30] hover:bg-[#F9EBED] inline-flex items-center gap-1 transition"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Booking</span>
                          </button>
                        </td>
                      </tr>
                    );
                  }

                  return dayBookings.map((b, bIdx) => {
                    const talent = b.talentAssignments?.[0]?.talent;
                    const tName = talent?.displayName;
                    const contractAmt = Number(b.totalContractAmount || 18000);
                    const dpAmt = Number(b.depositPaid || 0);
                    const collectiblesAmt = Number(
                      b.balanceDue ?? Math.max(0, contractAmt - dpAmt)
                    );
                    const tfAmt = Number(
                      b.talentAssignments?.[0]?.agreedTalentFee || b.totalDirectCost || 12000
                    );
                    const profitAmt = contractAmt - tfAmt;
                    const isDoubleBooked =
                      tName && (doubleBookedMap[`${dateKey}_${tName}`]?.length || 0) > 1;

                    return (
                      <tr
                        key={b.id}
                        className={`transition hover:bg-[#FAF7F5] ${
                          isDoubleBooked ? "bg-[#FEF2F2]/60" : "bg-white"
                        }`}
                      >
                        {bIdx === 0 && (
                          <td
                            rowSpan={dayBookings.length}
                            className="py-2.5 px-3 font-mono text-xs font-bold text-[#1E1416] border-r border-[#E8DFE0] bg-[#FAF7F5]/70 align-top"
                          >
                            <div>
                              {monthNames[currentMonth].slice(0, 3)} {day}, {currentYear}
                            </div>
                            <div className="text-[10px] font-normal text-[#6E5D5F]">
                              {dayOfWeek} • {dayBookings.length}{" "}
                              {dayBookings.length === 1 ? "Mall" : "Malls"}
                            </div>
                            <button
                              onClick={() => openCreateModal(dateKey)}
                              className="mt-1.5 text-[10px] font-bold text-[#9B1B30] hover:underline flex items-center gap-0.5"
                            >
                              <Plus className="w-2.5 h-2.5" />
                              <span>Add on {monthNames[currentMonth].slice(0, 3)} {day}</span>
                            </button>
                          </td>
                        )}

                        <td className="py-2.5 px-3 font-medium text-[#3D2C2E]">
                          {b.client?.companyName || "SM Supermalls"}
                        </td>

                        <td className="py-2.5 px-3 font-bold text-[#1E1416]">
                          <div>{b.mallOrVenue}</div>
                          <div className="text-[10px] font-mono text-[#6E5D5F]">
                            {b.bookingNumber}
                          </div>
                        </td>

                        <td className="py-2.5 px-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F5EE] text-[#1E7E48] border border-[#C3E6D1]">
                            {b.status === "READY_FOR_DEPLOYMENT" ? "Confirmed" : b.status}
                          </span>
                        </td>

                        <td className="py-2.5 px-3">
                          <div className="font-bold text-[#9B1B30]">
                            {tName ? `Santa ${tName}` : "Unassigned"}
                          </div>
                          {tName && SANTA_PA_DIRECTORY[tName] && (
                            <div className="text-[10px] text-[#6E5D5F]">
                              PA: {SANTA_PA_DIRECTORY[tName].paName}
                            </div>
                          )}
                          {isDoubleBooked && (
                            <div className="text-[10px] font-bold text-[#B91C1C] flex items-center gap-1 mt-0.5">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Conflict on {monthNames[currentMonth].slice(0, 3)} {day}</span>
                            </div>
                          )}
                        </td>

                        <td className="py-2.5 px-3 text-[#3D2C2E] max-w-xs">
                          {b.specialRequests && (
                            <div className="font-semibold text-[#1E1416]">
                              {b.specialRequests}
                            </div>
                          )}
                          {b.venueNotes && (
                            <div className="text-[11px] text-[#9B1B30]">
                              TF/Transpo: {b.venueNotes}
                            </div>
                          )}
                          {b.internalNotes && (
                            <div className="text-[11px] text-[#6E5D5F] line-clamp-2">
                              {b.internalNotes}
                            </div>
                          )}
                          {!b.specialRequests && !b.venueNotes && !b.internalNotes && (
                            <span className="text-[11px] italic text-[#9A8A8C]">
                              Click Edit to add description...
                            </span>
                          )}
                        </td>

                        {showFinancials && (
                          <>
                            <td className="py-2.5 px-3 font-mono font-bold text-right text-[#1E1416]">
                              ₱{contractAmt.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-right text-[#1E7E48]">
                              ₱{dpAmt.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-right text-[#C68A12]">
                              ₱{collectiblesAmt.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-right text-[#3D2C2E]">
                              ₱{tfAmt.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-right text-[#1E7E48]">
                              ₱{profitAmt.toLocaleString()}
                            </td>
                          </>
                        )}

                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => openEditModal(b)}
                            className="px-2.5 py-1 rounded-lg bg-[#F9EBED] text-[#9B1B30] border border-[#F0D0D5] hover:bg-[#9B1B30] hover:text-white text-xs font-bold inline-flex items-center gap-1 transition"
                          >
                            <Pencil className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                        </td>
                      </tr>
                    );
                  });
                })}
              </tbody>
              {showFinancials && (
                <tfoot>
                  <tr className="border-t-2 border-[#9B1B30] bg-[#FAF7F5] font-mono text-xs font-bold text-[#1E1416]">
                    <td colSpan={6} className="py-3 px-3 text-right uppercase">
                      {monthNames[currentMonth]} {currentYear} Master Sheet Totals ({monthMetrics.count} Bookings):
                    </td>
                    <td className="py-3 px-3 text-right">
                      ₱{monthMetrics.totalRevenue.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right text-[#1E7E48]">
                      ₱{monthMetrics.totalDpPaid.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right text-[#C68A12]">
                      ₱{monthMetrics.totalCollectibles.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      ₱{monthMetrics.totalTf.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right text-[#1E7E48]">
                      ₱{monthMetrics.netProfit.toLocaleString()}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      {/* =====================================================================
          VIEW 3: SANTA × DATE AVAILABILITY & CONFLICT MATRIX
         ===================================================================== */}
      {viewMode === "MATRIX" && (
        <div className="dashboard-card overflow-hidden">
          <div className="p-4 border-b border-[#E8DFE0] bg-[#FAF7F5] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-[#1E1416] flex items-center gap-2">
                <Grid3X3 className="w-4 h-4 text-[#9B1B30]" />
                <span>
                  SANTA × DATE AVAILABILITY MATRIX — {monthNames[currentMonth].toUpperCase()}{" "}
                  {currentYear}
                </span>
              </h2>
              <p className="text-xs text-[#6E5D5F]">
                Click any booked cell to edit that booking, or click any empty cell to assign that Santa on that date. Red cells indicate double-booked conflicts.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr className="bg-[#FAF7F5] border-b border-[#E8DFE0] font-mono text-[#3D2C2E]">
                  <th className="py-2.5 px-3 text-left font-bold sticky left-0 bg-[#FAF7F5] z-10 border-r border-[#E8DFE0] min-w-[170px]">
                    Santa Talent (PA)
                  </th>
                  {allDaysOfMonth.map((d) => (
                    <th
                      key={d}
                      className="py-2 px-1.5 text-center font-bold border-r border-[#E8DFE0] min-w-[68px]"
                    >
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DFE0]">
                {talents.map((t) => {
                  const paInfo = SANTA_PA_DIRECTORY[t.displayName];
                  return (
                    <tr key={t.id} className="hover:bg-[#FAF7F5]/60">
                      <td className="py-2 px-3 font-bold text-[#1E1416] sticky left-0 bg-white z-10 border-r border-[#E8DFE0]">
                        <div className="text-xs text-[#9B1B30]">Santa {t.displayName}</div>
                        <div className="text-[10px] font-normal text-[#6E5D5F] truncate max-w-[155px]">
                          {paInfo ? `PA: ${paInfo.paName}` : `Base TF: ₱${Number(t.baseTalentFee || 12000).toLocaleString()}`}
                        </div>
                      </td>
                      {allDaysOfMonth.map((d) => {
                        const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(
                          2,
                          "0"
                        )}-${String(d).padStart(2, "0")}`;
                        const dayBookings = (bookingsByDate[dateKey] || []).filter(
                          (b) =>
                            b.talentAssignments?.[0]?.talent?.id === t.id ||
                            b.talentAssignments?.[0]?.talent?.displayName === t.displayName
                        );

                        if (dayBookings.length === 0) {
                          return (
                            <td
                              key={d}
                              onClick={() => openCreateModal(dateKey, t.id)}
                              className="p-1 border-r border-[#E8DFE0] text-center cursor-pointer hover:bg-[#F9EBED]/50 group transition"
                              title={`Click to book Santa ${t.displayName} on ${monthNames[currentMonth]} ${d}`}
                            >
                              <span className="opacity-0 group-hover:opacity-100 text-[9px] font-bold text-[#9B1B30]">
                                + Book
                              </span>
                            </td>
                          );
                        }

                        const isConflict = dayBookings.length > 1;
                        return (
                          <td
                            key={d}
                            onClick={() => openEditModal(dayBookings[0])}
                            className={`p-1 border-r border-[#E8DFE0] cursor-pointer transition ${
                              isConflict
                                ? "bg-[#FEF2F2] hover:bg-[#FEE2E2]"
                                : "bg-[#E8F5EE] hover:bg-[#D1FAE5]"
                            }`}
                            title={dayBookings
                              .map((b) => `${b.mallOrVenue} (Click to Edit)`)
                              .join(" & ")}
                          >
                            {dayBookings.map((b) => (
                              <div
                                key={b.id}
                                className={`text-[9px] font-bold leading-tight truncate px-1 py-0.5 rounded ${
                                  isConflict ? "text-[#B91C1C]" : "text-[#1E7E48]"
                                }`}
                              >
                                {b.mallOrVenue.replace(/^SM\s+/i, "SM ")}
                              </div>
                            ))}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================================
          VIEW 4: INDIVIDUAL SANTA SCHEDULE & PA DIRECTORY ("Invidual Booking")
         ===================================================================== */}
      {viewMode === "INDIVIDUAL_SANTA" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {talents.map((t) => {
            const paInfo = SANTA_PA_DIRECTORY[t.displayName];
            const santaBookings = bookings
              .filter(
                (b) =>
                  b.talentAssignments?.[0]?.talent?.id === t.id ||
                  b.talentAssignments?.[0]?.talent?.displayName === t.displayName
              )
              .sort(
                (a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
              );
            const totalTf = santaBookings.reduce(
              (s, b) =>
                s +
                Number(
                  b.talentAssignments?.[0]?.agreedTalentFee ||
                    b.totalDirectCost ||
                    t.baseTalentFee ||
                    12000
                ),
              0
            );

            return (
              <div key={t.id} className="dashboard-card overflow-hidden flex flex-col">
                <div className="p-4 border-b border-[#E8DFE0] bg-[#FAF7F5] flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-[#1E1416]">
                        Santa {t.displayName}
                      </h3>
                      <span className="badge-esign px-2 py-0.5 rounded-full text-[10px]">
                        {santaBookings.length} Appearances
                      </span>
                    </div>
                    {paInfo ? (
                      <div className="text-xs text-[#3D2C2E] mt-1 space-y-0.5">
                        <div>
                          <span className="font-semibold">Full Name:</span> {paInfo.fullName} (
                          {paInfo.nationality}, {paInfo.height}) •{" "}
                          <span className="font-mono">{paInfo.contact}</span>
                        </div>
                        <div className="text-[#9B1B30] font-semibold">
                          Assigned PA / Elf: {paInfo.paName} ({paInfo.paContact})
                        </div>
                        <div className="text-[11px] text-[#6E5D5F]">
                          Address: {paInfo.address}
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-[#6E5D5F] mt-1">
                        {t.nationality || "International"} • Base TF: ₱
                        {Number(t.baseTalentFee || 12000).toLocaleString()}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => openCreateModal(undefined, t.id)}
                    className="btn-primary px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Gig</span>
                  </button>
                </div>

                <div className="flex-1 overflow-x-auto">
                  {santaBookings.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#6E5D5F]">
                      No bookings assigned to Santa {t.displayName} yet.
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-[#E8DFE0] bg-white text-[10px] font-mono uppercase text-[#6E5D5F]">
                          <th className="py-2 px-3">Booking Date</th>
                          <th className="py-2 px-3">Venue / Mall</th>
                          <th className="py-2 px-3">Notes / Description</th>
                          {showFinancials && <th className="py-2 px-3 text-right">Talent Fee</th>}
                          <th className="py-2 px-3 text-right">Edit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E8DFE0]">
                        {santaBookings.map((b) => {
                          const tf = Number(
                            b.talentAssignments?.[0]?.agreedTalentFee ||
                              b.totalDirectCost ||
                              t.baseTalentFee ||
                              12000
                          );
                          return (
                            <tr key={b.id} className="hover:bg-[#FAF7F5]">
                              <td className="py-2 px-3 font-mono font-semibold text-[#1E1416]">
                                {toDateInputString(b.eventDate)}
                              </td>
                              <td className="py-2 px-3 font-bold text-[#1E1416]">
                                {b.mallOrVenue}
                              </td>
                              <td className="py-2 px-3 text-[11px] text-[#6E5D5F] max-w-[180px] truncate">
                                {b.specialRequests || b.venueNotes || b.internalNotes || "—"}
                              </td>
                              {showFinancials && (
                                <td className="py-2 px-3 font-mono text-right text-[#1E7E48] font-bold">
                                  ₱{tf.toLocaleString()}
                                </td>
                              )}
                              <td className="py-2 px-3 text-right">
                                <button
                                  onClick={() => openEditModal(b)}
                                  className="px-2 py-0.5 rounded bg-[#F9EBED] text-[#9B1B30] hover:bg-[#9B1B30] hover:text-white text-[10px] font-bold inline-flex items-center gap-1 transition"
                                >
                                  <Pencil className="w-2.5 h-2.5" />
                                  <span>Edit</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      {showFinancials && (
                        <tfoot>
                          <tr className="border-t border-[#E8DFE0] bg-[#FAF7F5] font-mono text-xs font-bold">
                            <td colSpan={3} className="py-2 px-3 text-right text-[#3D2C2E]">
                              Total Season Talent Fee ({santaBookings.length} gigs):
                            </td>
                            <td className="py-2 px-3 text-right text-[#1E7E48]">
                              ₱{totalTf.toLocaleString()}
                            </td>
                            <td />
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =====================================================================
          INSPECT DAY MODAL (WHEN CLICKING "X GIGS" BADGE ON A BUSY DATE)
         ===================================================================== */}
      {inspectedDateKey && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="dashboard-card w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden bg-white">
            <div className="p-4 border-b border-[#E8DFE0] bg-[#FAF7F5] flex items-center justify-between">
              <div>
                <span className="badge-esign px-2 py-0.5 rounded-full text-[10px] uppercase">
                  Daily Deployment Schedule
                </span>
                <h3 className="text-lg font-bold text-[#1E1416] mt-0.5">
                  All Bookings on {inspectedDateKey} (
                  {(bookingsByDate[inspectedDateKey] || []).length})
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const dk = inspectedDateKey;
                    setInspectedDateKey(null);
                    openCreateModal(dk);
                  }}
                  className="btn-primary px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Booking on {inspectedDateKey}</span>
                </button>
                <button
                  onClick={() => setInspectedDateKey(null)}
                  className="p-1.5 rounded-lg border border-[#D6C7C9] text-[#3D2C2E] hover:bg-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
              {(bookingsByDate[inspectedDateKey] || []).map((b) => {
                const talent = b.talentAssignments?.[0]?.talent;
                return (
                  <div
                    key={b.id}
                    className="p-3 rounded-xl border border-[#E8DFE0] bg-[#FAF7F5] flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-sm text-[#1E1416]">{b.mallOrVenue}</div>
                      <div className="text-xs font-semibold text-[#9B1B30]">
                        {talent ? `Santa ${talent.displayName}` : "Unassigned"} •{" "}
                        <span className="text-[#6E5D5F]">
                          {b.client?.companyName || "SM Supermalls"}
                        </span>
                      </div>
                      {(b.specialRequests || b.venueNotes || b.internalNotes) && (
                        <div className="text-xs text-[#3D2C2E] bg-white p-2 rounded border border-[#E8DFE0]">
                          {b.specialRequests && (
                            <div>
                              <strong>Description:</strong> {b.specialRequests}
                            </div>
                          )}
                          {b.venueNotes && (
                            <div>
                              <strong>TF / Allowance Notes:</strong> {b.venueNotes}
                            </div>
                          )}
                          {b.internalNotes && (
                            <div className="text-[11px] text-[#6E5D5F]">{b.internalNotes}</div>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setInspectedDateKey(null);
                        openEditModal(b);
                      }}
                      className="btn-primary px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit Details</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          CREATE / EDIT BOOKING DETAILS & DESCRIPTION MODAL
         ===================================================================== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="dashboard-card w-full max-w-2xl bg-white overflow-hidden my-8">
            <div className="p-5 border-b border-[#E8DFE0] bg-[#FAF7F5] flex items-center justify-between">
              <div>
                <span className="badge-esign px-2.5 py-0.5 rounded-full text-[10px] uppercase">
                  {isEditing
                    ? `Editing ${form.bookingNumber || "Booking"}`
                    : "New Calendar Deployment"}
                </span>
                <h2 className="text-xl font-bold text-[#1E1416] mt-1">
                  {isEditing
                    ? `Edit Booking Details & Description — ${form.mallOrVenue}`
                    : "Create New Booking Details & Description"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-lg border border-[#D6C7C9] text-[#3D2C2E] hover:bg-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBooking} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {feedbackMsg && (
                <div
                  className={`p-3 rounded-lg text-xs font-bold border ${
                    feedbackMsg.type === "success"
                      ? "bg-[#E8F5EE] text-[#1E7E48] border-[#C3E6D1]"
                      : "bg-[#FEF2F2] text-[#B91C1C] border-[#F87171]"
                  }`}
                >
                  {feedbackMsg.text}
                </div>
              )}

              {/* Row 1: Mall/Venue & Agency/Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">
                    Name of Mall or Venue *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.mallOrVenue}
                    onChange={(e) => setForm({ ...form, mallOrVenue: e.target.value })}
                    placeholder="e.g. SM Megamall, One Ayala, Amanpulo"
                    className="w-full px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">
                    Agency / Client Company
                  </label>
                  <input
                    type="text"
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    placeholder="e.g. SM Supermalls, Entcars, Madison, SAGA"
                    className="w-full px-3 py-2 text-xs"
                  />
                </div>
              </div>

              {/* Row 2: Event Title & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">
                    Event Title / Appearance Package
                  </label>
                  <input
                    type="text"
                    value={form.eventName}
                    onChange={(e) => setForm({ ...form, eventName: e.target.value })}
                    placeholder="e.g. SM Megamall — Holiday Santa Appearance"
                    className="w-full px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Booking Date *</label>
                  <input
                    type="date"
                    required
                    value={form.eventDate}
                    onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Row 3: Assigned Santa & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">
                    Assigned Real-Beard Santa
                  </label>
                  <select
                    value={form.talentId}
                    onChange={(e) => {
                      const tId = e.target.value;
                      const found = talents.find((t) => t.id === tId);
                      setForm({
                        ...form,
                        talentId: tId,
                        agreedTalentFee: found
                          ? Number(found.baseTalentFee || 12000)
                          : form.agreedTalentFee,
                      });
                    }}
                    className="w-full px-3 py-2 text-xs font-semibold"
                  >
                    <option value="">-- Unassigned / To Be Assigned --</option>
                    {talents.map((t) => (
                      <option key={t.id} value={t.id}>
                        Santa {t.displayName} (Base TF: ₱
                        {Number(t.baseTalentFee || 12000).toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Booking Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-semibold"
                  >
                    <option value="READY_FOR_DEPLOYMENT">Confirmed / Ready for Deployment</option>
                    <option value="SECURED_UNASSIGNED">Secured (Unassigned)</option>
                    <option value="TEMPORARY_HOLD">24-Hour Calendar Hold</option>
                    <option value="AWAITING_STAFF_APPROVAL">Pending Decision / Approval</option>
                    <option value="EVENT_COMPLETED">Event Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Booking Details & Description (Highlighted for User Request) */}
              <div>
                <label className="block text-xs font-bold mb-1">
                  Booking Details & Event Description (Schedule, Program, Client Instructions)
                </label>
                <textarea
                  rows={3}
                  value={form.specialRequests}
                  onChange={(e) => setForm({ ...form, specialRequests: e.target.value })}
                  placeholder="Enter full booking description, parade/meet-and-greet schedule, client contact person, or hold notes (e.g., '3-4 hrs roaming • Client deciding between Mickeyver & Vic • Remind Sir Miguel for payment')..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#D6C7C9] bg-[#FAF7F5] text-[#1E1416] focus:border-[#9B1B30] focus:outline-none"
                />
              </div>

              {/* Row 5: Talent Fee / Cash Advance / Transpo Allowance Notes */}
              <div>
                <label className="block text-xs font-bold mb-1">
                  Talent Fee, Cash Advance (Paluwal) & Transpo Allowance Notes
                </label>
                <input
                  type="text"
                  value={form.venueNotes}
                  onChange={(e) => setForm({ ...form, venueNotes: e.target.value })}
                  placeholder="e.g. -4k cash advance Bob, add 2k for transpo allowance - paid, cash on day of event"
                  className="w-full px-3 py-2 text-xs"
                />
              </div>

              {/* Row 6: Time Slot */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Call Time</label>
                  <input
                    type="time"
                    value={form.callTime}
                    onChange={(e) => setForm({ ...form, callTime: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Start Time</label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">End Time</label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Row 7: Financials (Contract Total, Downpayment, Collectibles, Talent Fee) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-[#E8DFE0]">
                <div>
                  <label className="block text-xs font-bold mb-1">Contract Total (₱)</label>
                  <input
                    type="number"
                    value={form.totalContractAmount}
                    onChange={(e) => {
                      const total = Number(e.target.value || 0);
                      setForm({
                        ...form,
                        totalContractAmount: total,
                        balanceDue: Math.max(0, total - form.depositPaid),
                      });
                    }}
                    className="w-full px-3 py-1.5 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">DP Paid (₱)</label>
                  <input
                    type="number"
                    value={form.depositPaid}
                    onChange={(e) => {
                      const dp = Number(e.target.value || 0);
                      setForm({
                        ...form,
                        depositPaid: dp,
                        balanceDue: Math.max(0, form.totalContractAmount - dp),
                      });
                    }}
                    className="w-full px-3 py-1.5 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Collectibles (₱)</label>
                  <input
                    type="number"
                    value={form.balanceDue}
                    onChange={(e) =>
                      setForm({ ...form, balanceDue: Number(e.target.value || 0) })
                    }
                    className="w-full px-3 py-1.5 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Talent Fee (₱)</label>
                  <input
                    type="number"
                    value={form.agreedTalentFee}
                    onChange={(e) =>
                      setForm({ ...form, agreedTalentFee: Number(e.target.value || 0) })
                    }
                    className="w-full px-3 py-1.5 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#E8DFE0]">
                <div className="flex items-center gap-2">
                  {isEditing && form.id && (
                    <>
                      <button
                        type="button"
                        onClick={handleDeleteBooking}
                        disabled={saving}
                        className="px-3 py-2 rounded-lg border border-[#F87171] bg-[#FEF2F2] text-[#B91C1C] hover:bg-[#FEE2E2] text-xs font-bold inline-flex items-center gap-1 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                      <Link
                        href={`/admin/bookings/${form.id}`}
                        className="px-3 py-2 rounded-lg border border-[#D6C7C9] bg-[#FAF7F5] text-[#3D2C2E] hover:bg-white text-xs font-bold inline-flex items-center gap-1 transition"
                      >
                        <span>Full Dossier</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-[#D6C7C9] bg-white text-[#3D2C2E] text-xs font-semibold hover:bg-[#FAF7F5]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary px-5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {saving
                        ? "Saving..."
                        : isEditing
                        ? "Save Booking Changes"
                        : "Create Booking on Calendar"}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
