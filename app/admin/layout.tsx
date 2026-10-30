"use client";

import { useState, useEffect } from "react";
import { AdminNav } from "@/components/admin-nav";
import { QuickActionsDrawer } from "@/components/quick-actions-drawer";
import { usePathname } from "next/navigation";
import { Search, Bell, ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { AdminRole } from "@/lib/security";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeRole, setActiveRole] = useState<AdminRole>("SUPER_ADMIN");
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedRole = localStorage.getItem("brillo_rbac_role") as AdminRole | null;
      if (savedRole) setActiveRole(savedRole);
    }
  }, []);

  const handleRoleChange = (role: AdminRole) => {
    setActiveRole(role);
    if (typeof window !== "undefined") {
      localStorage.setItem("brillo_rbac_role", role);
    }
  };

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

            <Link
              href="/admin/conflicts"
              className="p-1.5 rounded-lg hover:bg-[#F4ECEE] text-[#9B1B30] relative transition"
              title="Data & Schedule Conflict Triage"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#9B1B30]" />
            </Link>

            {/* RBAC Active Session Badge */}
            <div className="flex items-center space-x-2 pl-3 border-l border-[#E8DFE0]">
              <div className="w-7 h-7 rounded-full bg-[#F9EBED] border border-[#F0D0D5] flex items-center justify-center text-[#9B1B30]">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-[11px] font-bold text-[#1E1416] block leading-tight">
                  Executive Session
                </span>
                <select
                  aria-label="RBAC Role"
                  value={activeRole}
                  onChange={(e) => handleRoleChange(e.target.value as AdminRole)}
                  className="text-[10px] text-[#9B1B30] font-mono font-bold uppercase tracking-wider bg-transparent border-none p-0 focus:outline-none cursor-pointer"
                >
                  <option value="SUPER_ADMIN">SUPER ADMIN</option>
                  <option value="OPS_ADMIN">OPS MANAGER</option>
                  <option value="FINANCE_ADMIN">FINANCE ADMIN</option>
                  <option value="VIEWER">VIEWER (READ-ONLY)</option>
                </select>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Workspace Body */}
        <main className="admin-workspace flex-1 overflow-y-auto bg-[#FAF7F5] flex flex-col justify-between">
          <div className="flex-1">{children}</div>

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
