"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowRight,
  LogOut,
  Plus,
  ShieldCheck,
  FileCheck2,
  CreditCard,
} from "lucide-react";
import { useAuth } from "@/components/auth-context";

function getClientStageStep(status?: string): number {
  const s = String(status || "").toUpperCase();
  if (
    s.includes("READY") ||
    s.includes("CONFIRMED") ||
    s.includes("SECURED") ||
    s.includes("SETTLED") ||
    s.includes("COMPLETED")
  ) {
    return 4;
  }
  if (s.includes("CONTRACT") || s.includes("SIGNOFF")) return 3;
  if (s.includes("HOLD") || s.includes("QUOTE")) return 2;
  return 1;
}

export default function ClientPortalPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/client-login?next=/portal");
      return;
    }
    if (user.role === "CREATOR" || user.role === "ADMIN") {
      router.replace("/admin");
      return;
    }

    fetch("/api/portal/my-bookings", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.bookings)) {
          setBookings(d.bookings);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingBookings(false));
  }, [authLoading, user, router]);

  if (authLoading || !user || user.role !== "CLIENT") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center font-body text-sm text-[#5C494E]">
        Verifying your private Customer Portal session...
      </div>
    );
  }

  return (
    <div className="font-body pb-20">
      {/* Luxury Customer Portal Header */}
      <section className="bg-gradient-to-b from-[#211619] via-[#590919] to-[#780D22] text-[#FFF8F0] py-12 sm:py-16 px-4 sm:px-6 border-b border-[#D6B36A]/30">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#211619]/70 border border-[#D6B36A]/45 text-[#F3D899] text-[10px] font-bold uppercase tracking-[0.18em]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D6B36A]" />
              Verified Customer Portal • Private Client View
            </span>
            <h1 className="font-display text-3xl sm:text-5xl font-semibold text-[#FFF8F0]">
              Welcome, {user.name}
            </h1>
            <p className="text-xs sm:text-sm text-[#FFF8F0]/80">
              Signed in as <strong className="text-[#F3D899]">{user.email}</strong> — showing only your authorized event quotations and reservations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/request-quote"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#D6B36A] hover:bg-[#E2C27E] text-[#211619] font-bold text-xs uppercase tracking-[0.14em] shadow-lg transition"
            >
              <Plus className="w-4 h-4" />
              <span>New Santa Quotation</span>
            </Link>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-5 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 text-[#FFF8F0] font-semibold text-xs uppercase tracking-wider transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </section>

      {/* Customer Bookings List */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        {loadingBookings ? (
          <div className="p-12 rounded-3xl bg-white border border-[#E8DCD0] text-center text-xs text-[#5C494E]">
            Loading your Santa event quotations...
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-10 sm:p-14 rounded-3xl bg-white border border-[#E8DCD0] shadow-lg text-center space-y-5 max-w-2xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-[#FFF8F0] border border-[#D6B36A]/50 text-[#780D22] flex items-center justify-center mx-auto">
              <Sparkles className="w-7 h-7" />
            </div>
            <h2 className="font-display text-3xl font-bold text-[#211619]">
              No Active Quotations Linked to {user.email} Yet
            </h2>
            <p className="text-xs sm:text-sm text-[#5C494E] leading-relaxed">
              Submit your Christmas event details using this email address ({user.email}) and your official quotation, calendar status, and payment portal will appear right here automatically.
            </p>
            <Link
              href="/request-quote"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-[#780D22] to-[#B82038] text-white font-bold text-xs uppercase tracking-[0.15em] shadow-xl transition"
            >
              <span>Request Your First Santa Quotation</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#211619]">
                Your Event Quotations &amp; Bookings ({bookings.length})
              </h2>
              <span className="text-xs text-[#7A666B]">
                Need schedule adjustments? Call <strong>0927 887 2343</strong>
              </span>
            </div>

            {bookings.map((b) => {
              const stageStep = getClientStageStep(b.status);
              const isConfirmed = stageStep >= 4;
              const isPaidDp = Number(b.depositPaid || 0) >= Number(b.depositRequired || 1);

              return (
                <div
                  key={b.id}
                  className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-[#E8DCD0] hover:border-[#D6B36A] shadow-lg transition space-y-6"
                >
                  {/* Top Row */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#EFE5DA]">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-[#780D22] text-[#F3D899] font-mono text-xs font-bold">
                          {b.bookingNumber}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-bold border ${
                            isConfirmed
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-amber-50 text-amber-800 border-amber-200"
                          }`}
                        >
                          {isConfirmed
                            ? "Confirmed • Date Locked"
                            : "In Progress • Availability & Confirmation"}
                        </span>
                      </div>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#211619] pt-1">
                        {b.mallOrVenue} — {b.eventName}
                      </h3>
                    </div>

                    <div className="md:text-right">
                      <span className="text-[11px] uppercase tracking-wider text-[#7A666B] font-semibold block">
                        Quoted Package Total
                      </span>
                      <span className="font-display text-3xl font-bold text-[#780D22]">
                        ₱{Number(b.totalContractAmount || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* 4-Step Visual Progress Tracker */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    {[
                      { step: 1, label: "1. Inquiry Logged" },
                      { step: 2, label: "2. Quote & 24h Hold" },
                      { step: 3, label: "3. Agreement & 50% DP" },
                      { step: 4, label: "4. Confirmed & Ready" },
                    ].map((st) => {
                      const done = stageStep >= st.step;
                      return (
                        <div
                          key={st.step}
                          className={`p-3 rounded-2xl border flex items-center gap-2 font-semibold ${
                            done
                              ? "bg-[#FFF8F0] border-[#D6B36A] text-[#780D22]"
                              : "bg-stone-50 border-stone-200 text-stone-400"
                          }`}
                        >
                          {done ? (
                            <CheckCircle2 className="w-4 h-4 text-[#780D22] shrink-0" />
                          ) : (
                            <Clock className="w-4 h-4 shrink-0" />
                          )}
                          <span>{st.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Event Details + Financial Summary */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center text-xs">
                    <div className="lg:col-span-7 p-5 rounded-2xl bg-[#FFF8F0] border border-[#E8DCD0] space-y-2.5">
                      <div className="flex items-center gap-2 text-[#211619] font-semibold">
                        <Calendar className="w-4 h-4 text-[#780D22]" />
                        <span>
                          {new Date(b.eventDate).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}{" "}
                          • {b.startTime || "14:00"} – {b.endTime || "17:00"} ({b.durationHours} Hours)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[#5C494E]">
                        <MapPin className="w-4 h-4 text-[#780D22]" />
                        <span>
                          {b.mallOrVenue} ({b.city || "Metro Manila"})
                        </span>
                      </div>
                      {b.assignedSanta && (
                        <div className="flex items-center gap-3 pt-2 border-t border-[#E8DCD0]">
                          <img
                            src={b.assignedSanta.photoUrl}
                            alt={b.assignedSanta.displayName}
                            className="w-10 h-10 rounded-full object-cover object-top border border-[#D6B36A]"
                          />
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-[#7A666B] font-bold">
                              Assigned / Preferred Performer
                            </div>
                            <div className="font-bold text-[#211619]">
                              Santa {b.assignedSanta.displayName}
                            </div>
                          </div>
                        </div>
                      )}
                      {b.specialRequests && (
                        <p className="text-[11px] text-[#5C494E] pt-1 italic">
                          {b.specialRequests}
                        </p>
                      )}
                    </div>

                    <div className="lg:col-span-5 p-5 rounded-2xl bg-[#211619] text-[#FFF8F0] border border-[#D6B36A]/40 space-y-3">
                      <div className="flex justify-between text-[#FFF8F0]/80">
                        <span>50% Reservation Downpayment:</span>
                        <strong className="text-[#F3D899]">
                          ₱{Number(b.depositRequired || 0).toLocaleString()}
                        </strong>
                      </div>
                      <div className="flex justify-between text-[#FFF8F0]/80">
                        <span>Amount Paid to Date:</span>
                        <strong className="text-emerald-400">
                          ₱{Number(b.depositPaid || 0).toLocaleString()}
                        </strong>
                      </div>
                      <div className="flex justify-between border-t border-white/15 pt-2">
                        <span>Remaining Balance:</span>
                        <strong className="text-white text-sm">
                          ₱{Number(b.balanceDue || 0).toLocaleString()}
                        </strong>
                      </div>
                      {b.latestContract && (
                        <div className="flex items-center gap-1.5 text-[11px] text-[#F3D899]">
                          <FileCheck2 className="w-3.5 h-3.5" />
                          <span>
                            Service Agreement: {b.latestContract.contractNumber} ({b.latestContract.status})
                          </span>
                        </div>
                      )}

                      <Link
                        href={b.statusPortalUrl}
                        className="w-full py-3 rounded-full bg-gradient-to-r from-[#A61932] to-[#B82038] hover:from-[#B82038] hover:to-[#CC2842] border border-[#D6B36A]/50 text-white font-bold uppercase tracking-wider text-[11px] flex items-center justify-center gap-2 shadow-lg transition mt-2"
                      >
                        <CreditCard className="w-4 h-4 text-[#F3D899]" />
                        <span>
                          {isPaidDp
                            ? "View Payment Receipt & Status Portal"
                            : "Pay 50% Downpayment via GCash / Xendit"}
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
