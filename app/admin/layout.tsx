"use client";

import { useState } from "react";
import { AdminNav } from "@/components/admin-nav";
import { QuickActionsDrawer } from "@/components/quick-actions-drawer";
import { usePathname } from "next/navigation";
import { Search, Bell, Sparkles, User, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();

  // Generate readable breadcrumbs from pathname
  const pathParts = pathname.split("/").filter(Boolean);
  const currentTitle = pathParts[pathParts.length - 1] || "Overview";
  const formattedTitle = currentTitle
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="flex h-screen bg-[#F6F3EC] text-[#252824] overflow-hidden antialiased">
      {/* 1. Master Dark Charcoal Sidebar */}
      <AdminNav onOpenQuickAction={() => setQuickActionOpen(true)} />

      {/* 2. Main Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F6F3EC]">
        {/* Top Operational Bar */}
        <header className="h-14 bg-[#FFFEFB] border-b border-[#E2DED4] px-6 flex items-center justify-between shrink-0 z-20">
          {/* Breadcrumb & Title */}
          <div className="flex items-center space-x-3 text-xs">
            <span className="text-[#6B706C] font-mono uppercase tracking-wider text-[11px]">Operations Hub</span>
            <span className="text-[#C5C0B4]">/</span>
            <span className="font-serif font-bold text-sm text-[#252824] tracking-wide">
              {formattedTitle === "Admin" ? "Executive Overview" : formattedTitle}
            </span>
          </div>

          {/* Search, Notifications & Profile */}
          <div className="flex items-center space-x-3.5">
            {/* Global Search Bar */}
            <div className="relative w-64 hidden md:block">
              <Search className="w-3.5 h-3.5 text-[#6B706C] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search bookings, talent, clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F6F3EC] border border-[#E2DED4] text-xs text-[#252824] placeholder-[#6B706C]/70 rounded-md pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#B99A5B] focus:border-[#B99A5B] transition"
              />
            </div>

            {/* Conflict Alert Shortcut */}
            <Link
              href="/admin/conflicts"
              className="p-1.5 rounded-md hover:bg-[#F6F3EC] text-[#A92F3A] hover:text-[#8E252F] relative transition"
              title="13 Source Conflicts Awaiting Triage"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#A92F3A] animate-pulse" />
            </Link>

            {/* Role Badge */}
            <div className="flex items-center space-x-2 pl-2 border-l border-[#E2DED4]">
              <div className="w-7 h-7 rounded-full bg-[#F6F3EC] border border-[#B99A5B]/40 flex items-center justify-center text-[#B99A5B]">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-xs font-semibold text-[#252824] block leading-tight">Admin User</span>
                <span className="text-[10px] text-[#B99A5B] font-mono uppercase tracking-wider block">Super Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Workspace Body */}
        <main className="flex-1 overflow-y-auto bg-[#F6F3EC]">
          {children}
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
