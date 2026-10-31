"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/components/auth-context";

export default function DashboardLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#211619] flex items-center justify-center text-[#D6B36A] text-sm">
          Loading...
        </div>
      }
    >
      <DashboardLoginInner />
    </Suspense>
  );
}

function safeAdminNext(next: string | null): string {
  return next && next.startsWith("/admin") ? next : "/admin";
}

function DashboardLoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, refreshSession } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Already signed in -> go straight to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.replace(user.role === "CLIENT" ? "/portal" : safeAdminNext(searchParams.get("next")));
    }
  }, [loading, user, router, searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "ACCOUNT", email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid email address or password.");
      }
      if (data.user?.role === "CLIENT") {
        // Customers are not allowed into the dashboard
        await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
        await refreshSession();
        throw new Error(
          "This is a customer account. Please use the Customer Portal to track your booking."
        );
      }
      await refreshSession();
      router.replace(safeAdminNext(searchParams.get("next")));
    } catch (err: any) {
      setError(err?.message || "Sign-in failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#211619] via-[#3A0E18] to-[#780D22] flex flex-col items-center justify-center px-4 py-10 font-body">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[12px] text-[#FFF8F0]/70 hover:text-[#D6B36A] mb-6 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to brilloevent.com
        </Link>

        <div className="rounded-3xl bg-[#FFFDFB] border border-[#D6B36A]/60 shadow-2xl overflow-hidden">
          {/* Brand header */}
          <div className="bg-[#211619] px-8 py-7 text-center border-b border-[#D6B36A]/40">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-[#A61932] to-[#780D22] border border-[#D6B36A]/60 flex items-center justify-center mb-3">
              <Sparkles className="w-7 h-7 text-[#D6B36A]" />
            </div>
            <h1 className="font-brand text-xl font-bold tracking-[0.1em] text-[#FFF8F0]">
              BRILLO HUB
            </h1>
            <p className="text-[11px] text-[#D6B36A] tracking-[0.2em] uppercase font-semibold mt-1">
              Dashboard Login
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">
            <p className="text-[13px] text-[#5C494E] text-center">
              Sign in with your Creator or Admin account to open the Santa Operations dashboard.
            </p>

            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-[#FDECEE] border border-[#F0C2C9] px-3.5 py-3 text-[12px] text-[#8A1428]">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5C494E]">
                Email
              </span>
              <div className="relative mt-1.5">
                <Mail className="w-4 h-4 text-[#9A8A8C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@brilloevent.com"
                  className="w-full rounded-xl border border-[#D6C7C9] bg-white pl-10 pr-3 py-3 text-sm text-[#1E1416] focus:outline-none focus:border-[#9B1B30] focus:ring-2 focus:ring-[#9B1B30]/15"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5C494E]">
                Password
              </span>
              <div className="relative mt-1.5">
                <Lock className="w-4 h-4 text-[#9A8A8C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[#D6C7C9] bg-white pl-10 pr-11 py-3 text-sm text-[#1E1416] focus:outline-none focus:border-[#9B1B30] focus:ring-2 focus:ring-[#9B1B30]/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A8A8C] hover:text-[#9B1B30]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#9B1B30] to-[#780D22] hover:from-[#B82038] hover:to-[#9B1B30] text-[#FFF8F0] font-semibold text-sm py-3.5 border border-[#D6B36A]/50 shadow-lg transition disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Signing in...
                </>
              ) : (
                <>
                  Sign in to Dashboard <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="px-8 py-4 bg-[#FAF3EB] border-t border-[#E8DCD0] text-center text-[12px] text-[#5C494E]">
            Are you a customer?{" "}
            <Link href="/client-login" className="font-semibold text-[#9B1B30] hover:underline">
              Track your booking →
            </Link>
          </div>
        </div>

        <p className="text-center text-[11px] text-[#FFF8F0]/50 mt-6">
          © Brillo Events Management Services • Authorized staff only
        </p>
      </div>
    </div>
  );
}
