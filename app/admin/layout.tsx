"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-context";
import { isCreatorOnlyAdminPath } from "@/lib/auth-shared";
import { AdminNav } from "@/components/admin-nav";
import { QuickActionsDrawer } from "@/components/quick-actions-drawer";
import { usePathname } from "next/navigation";
import { Search, ShieldCheck, Crown, LogOut, Lock, Loader2 } from "lucide-react";
import Link from "next/link";
import { AdminNotificationsDropdown } from "@/components/admin-notifications-dropdown";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname() || "/admin";
  const router = useRouter();
  const { user, loading, permissions, logout } = useAuth();

  // Client-side guard (also required on static GitHub Pages where middleware does not run)
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    } else if (user.role === "CLIENT") {
      router.replace("/portal");
    }
  }, [loading, user, pathname, router]);

  if (loading || !user || user.role === "CLIENT") {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#211619] text-[#D6B36A] gap-3">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="text-xs tracking-[0.2em] uppercase">
          {loading ? "Checking your session..." : "Redirecting to login..."}
        </span>
      </div>
    );
  }

  const isCreator = user.role === "CREATOR";
  const blockedForAdmin = !isCreator && isCreatorOnlyAdminPath(pathname);

  // Generate readable breadcrumbs from pathname
  const pathParts = pathname.split("/").filter(Boolean);
  const currentTitle = pathParts[pathParts.length - 1] || "Overview";
  const formattedTitle = currentTitle
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="flex h-screen bg-[#FAF7F5] text-[#1E1416] overflow-hidden antialiased">
      {/* 1. Dark Velvet Espresso Sidebar */}
      <AdminNav onOpenQuickAction={() => setQuickActionOpen(true)} />

      {/* 2. Warm Alabaster Main Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#FAF7F5]">
        {/* Sticky Liquid-Glass Operational Header */}
        <header className="h-14 liquid-glass-header px-6 flex items-center justify-between shrink-0 z-20 sticky top-0">
          {/* Breadcrumb & Title */}
          <div className="flex items-center space-x-2.5 text-xs">
            <span className="text-[#756568] font-mono uppercase tracking-wider text-[11px]">
              Santa Operations Hub
            </span>
            <span className="text-[#D6C7C9]">/</span>
            <span className="font-serif font-bold text-sm text-[#1E1416] tracking-wide">
              {formattedTitle === "Admin"
                ? "Executive Overview"
                : formattedTitle === "Crm"
                ? "Leads & CRM Pipeline"
                : formattedTitle}
            </span>
          </div>

          {/* Search, Conflict Bell & RBAC Session Role */}
          <div className="flex items-center space-x-3.5">
            <div className="relative w-64 hidden md:block">
              <Search className="w-3.5 h-3.5 text-[#756568] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search bookings, Santa, venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#FCF9F8] border border-[#D6C7C9] text-xs text-[#1E1416] placeholder-[#9A8A8C] rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-[#9B1B30] transition"
              />
            </div>

            {/* System Notification Dropdown with Real-Time Badging */}
            <AdminNotificationsDropdown />

            {/* Locked session identity (role comes from signed-in account) */}
            <div className="flex items-center space-x-2 pl-3 border-l border-[#E8DFE0]">
              <div className="w-7 h-7 rounded-full bg-[#F9EBED] border border-[#F0D0D5] flex items-center justify-center text-[#9B1B30]">
                {isCreator ? <Crown className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-[11px] font-bold text-[#1E1416] block leading-tight max-w-[160px] truncate">
                  {user.name}
                </span>
                <span className="text-[10px] text-[#9B1B30] font-mono font-bold uppercase tracking-wider">
                  {isCreator ? "Master Creator" : "Operations Admin"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => logout()}
                className="ml-1 inline-flex items-center gap-1 text-[11px] font-semibold text-[#756568] hover:text-[#9B1B30] px-2 py-1 rounded-lg hover:bg-[#F4ECEE] transition"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Workspace Body */}
        <main className="admin-workspace flex-1 overflow-y-auto bg-[#FAF7F5] flex flex-col justify-between">
          <div className="flex-1">
            {blockedForAdmin ? (
              <div className="max-w-lg mx-auto mt-16 px-6">
                <div className="rounded-2xl bg-white border border-[#E8DFE0] p-8 text-center shadow-sm">
                  <div className="w-12 h-12 mx-auto rounded-full bg-[#F9EBED] flex items-center justify-center text-[#9B1B30] mb-4">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h2 className="font-serif text-lg font-bold text-[#1E1416]">
                    Master Creator Access Only
                  </h2>
                  <p className="text-xs text-[#756568] mt-2 leading-relaxed">
                    This section (finances, expenses, user management, imports, audit and settings)
                    is reserved for the Master Creator. Your Operations Admin account can manage
                    leads, calendar, bookings, contracts, payments and the Santa roster.
                  </p>
                  <Link
                    href="/admin"
                    className="inline-flex mt-5 px-4 py-2 rounded-lg bg-[#9B1B30] text-white text-xs font-semibold hover:bg-[#7E1526] transition"
                  >
                    Return to Operations Overview
                  </Link>
                </div>
              </div>
            ) : (
              children
            )}
          </div>

          {/* Discreet Telemetry Footer (Replaces header developer pills) */}
          <footer className="px-6 lg:px-8 py-3 border-t border-[#E8DFE0] bg-[#FAF7F5] text-[11px] text-[#756568] font-mono flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              Brillo Events Management Services • Santa Operations Hub v3.0 • PST (UTC+8)
            </span>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                <span>Xendit PH Gateway: GCash (0906 439 0028) Active</span>
              </span>
              <span className="inline-flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C68A12]" />
                <span>Outbox: Local Standby</span>
              </span>
            </div>
          </footer>
        </main>
      </div>

      {/* Universal Quick Actions Drawer */}
      <QuickActionsDrawer
        isOpen={quickActionOpen}
        onClose={() => setQuickActionOpen(false)}
        onActionComplete={() => {
          setQuickActionOpen(false);
          window.location.reload();
        }}
      />
    </div>
  );
}
