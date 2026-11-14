"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  Lock,
  ShieldCheck,
  User,
  Crown,
  KeyRound,
  ArrowRight,
  AlertTriangle,
  Ticket,
  Mail,
} from "lucide-react";
import { useAuth } from "@/components/auth-context";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="p-20 text-center text-sm text-[#5C494E] font-body">
          Loading Brillo Events Access Gateway...
        </div>
      }
    >
      <LoginGatewayInner />
    </Suspense>
  );
}

function LoginGatewayInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, refreshSession } = useAuth();

  const [portalTab, setPortalTab] = useState<"CLIENT" | "STAFF">("CLIENT");
  const [clientMode, setClientMode] = useState<"BOOKING_REF" | "ACCOUNT" | "REGISTER">(
    "BOOKING_REF"
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bookingReference, setBookingReference] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const nextPath = searchParams.get("next") || "";
    if (nextPath.startsWith("/admin")) {
      setPortalTab("STAFF");
    }
  }, [searchParams]);

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      const nextParam = searchParams.get("next");
      if (user.role === "CLIENT") {
        router.replace(nextParam?.startsWith("/portal") ? nextParam : "/portal");
      } else {
        router.replace(nextParam?.startsWith("/admin") ? nextParam : "/admin");
      }
    }
  }, [authLoading, user, router, searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const payload =
        portalTab === "STAFF"
          ? { mode: "ACCOUNT", email, password }
          : clientMode === "BOOKING_REF"
          ? { mode: "BOOKING_REF", email, bookingReference }
          : clientMode === "REGISTER"
          ? { mode: "CLIENT_REGISTER", name, email, password }
          : { mode: "ACCOUNT", email, password };

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Sign-in failed. Please verify your credentials.");
      }

      // Enforce portal tab separation: prevent Staff tab vs Client tab confusion cleanly
      if (portalTab === "CLIENT" && data.user?.role !== "CLIENT") {
        // Still allow valid staff credentials by routing them to their authorized /admin hub
        await refreshSession();
        router.replace("/admin");
        return;
      }

      if (portalTab === "STAFF" && data.user?.role === "CLIENT") {
        await refreshSession();
        router.replace("/portal");
        return;
      }

      await refreshSession();
      const nextParam = searchParams.get("next");
      if (data.user?.role === "CLIENT") {
        router.replace(nextParam?.startsWith("/portal") ? nextParam : "/portal");
      } else {
        router.replace(nextParam?.startsWith("/admin") ? nextParam : "/admin");
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="font-body pb-20">
      {/* Luxury Deep Velvet Hero Header */}
      <section className="bg-gradient-to-b from-[#211619] via-[#590919] to-[#780D22] text-[#FFF8F0] py-14 sm:py-16 px-4 sm:px-6 border-b border-[#D6B36A]/30">
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#211619]/70 text-[#D6B36A] border border-[#D6B36A]/40 text-[11px] font-bold uppercase tracking-[0.18em]">
            <Lock className="w-3.5 h-3.5" />
            Protected Client Booking Portal
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#FFF8F0] leading-tight">
            Customer Booking &amp; Quote Portal
          </h1>
          <p className="text-xs sm:text-sm text-[#FFF8F0]/80 max-w-xl mx-auto leading-relaxed">
            Track your official Santa quotation, reservation hold status, contracts, and verified payment receipts using your{" "}
            <strong className="text-[#F3D899]">Booking Reference #</strong> or{" "}
            <strong className="text-[#F3D899]">Client Account</strong>.
          </p>
        </div>
      </section>

      <div className="max-w-xl mx-auto px-4 sm:px-6 -mt-8">
        <div className="rounded-3xl bg-white border-2 border-[#D6B36A]/60 shadow-2xl overflow-hidden">
          <div className="p-6 sm:p-9 space-y-6 text-xs">
            {error && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#211619]">
                Access Your Event Booking
              </h2>
              <p className="text-[#5C494E] leading-relaxed">
                View your official Santa quotations, reservation hold status, contracts, and Xendit / GCash payment links.
              </p>
            </div>

            {/* Client Sub-Modes */}
            <div className="grid grid-cols-3 gap-1.5 bg-[#FFF8F0] p-1 rounded-xl border border-[#E8DCD0]">
              <button
                type="button"
                onClick={() => {
                  setClientMode("BOOKING_REF");
                  setError(null);
                }}
                className={`py-2 px-2 rounded-lg font-bold text-[11px] transition ${
                  clientMode === "BOOKING_REF"
                    ? "bg-white text-[#780D22] shadow-sm border border-[#D6B36A]/50"
                    : "text-[#7A666B] hover:text-[#211619]"
                }`}
              >
                Booking Ref #
              </button>
              <button
                type="button"
                onClick={() => {
                  setClientMode("ACCOUNT");
                  setError(null);
                }}
                className={`py-2 px-2 rounded-lg font-bold text-[11px] transition ${
                  clientMode === "ACCOUNT"
                    ? "bg-white text-[#780D22] shadow-sm border border-[#D6B36A]/50"
                    : "text-[#7A666B] hover:text-[#211619]"
                }`}
              >
                Client Password
              </button>
              <button
                type="button"
                onClick={() => {
                  setClientMode("REGISTER");
                  setError(null);
                }}
                className={`py-2 px-2 rounded-lg font-bold text-[11px] transition ${
                  clientMode === "REGISTER"
                    ? "bg-white text-[#780D22] shadow-sm border border-[#D6B36A]/50"
                    : "text-[#7A666B] hover:text-[#211619]"
                }`}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {clientMode === "REGISTER" && (
                <div>
                  <label className="block font-bold text-[#211619] mb-1.5">
                    Your Name / Company *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Maria Clara Santos / Ayala Malls"
                    className="w-full px-3.5 py-3 rounded-xl bg-[#FFF8F0] border border-[#D8C9BA] text-[#211619] focus:outline-none focus:border-[#780D22]"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-[#211619] mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#780D22]" />
                  <span>Client Email Address *</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter the email used on your quotation inquiry"
                  className="w-full px-3.5 py-3 rounded-xl bg-[#FFF8F0] border border-[#D8C9BA] text-[#211619] focus:outline-none focus:border-[#780D22]"
                />
              </div>

              {clientMode === "BOOKING_REF" ? (
                <div>
                  <label className="block font-bold text-[#211619] mb-1.5 flex items-center gap-1.5">
                    <Ticket className="w-3.5 h-3.5 text-[#780D22]" />
                    <span>Booking Reference # *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={bookingReference}
                    onChange={(e) => setBookingReference(e.target.value)}
                    placeholder="e.g. BR-2026-Q001"
                    className="w-full px-3.5 py-3 rounded-xl bg-[#FFF8F0] border border-[#D8C9BA] text-[#211619] font-mono focus:outline-none focus:border-[#780D22]"
                  />
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-[#211619] mb-1.5 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#780D22]" />
                    <span>
                      {clientMode === "REGISTER"
                        ? "Create Password (min 6 chars) *"
                        : "Password *"}
                    </span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-3 rounded-xl bg-[#FFF8F0] border border-[#D8C9BA] text-[#211619] focus:outline-none focus:border-[#780D22]"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-full bg-gradient-to-r from-[#780D22] to-[#B82038] hover:from-[#8C1028] hover:to-[#C92640] text-white font-bold uppercase tracking-[0.15em] shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>
                  {submitting
                    ? "Verifying Access..."
                    : clientMode === "REGISTER"
                    ? "Create Client Portal Account"
                    : "Enter Client Portal"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="pt-3 border-t border-[#EFE5DA] flex items-center justify-between text-[11px] text-[#7A666B]">
              <span>Don&apos;t have a quotation yet?</span>
              <Link
                href="/request-quote"
                className="font-bold text-[#780D22] hover:underline"
              >
                Request a Santa Quotation →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
