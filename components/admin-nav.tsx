"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  Users2,
  FileSpreadsheet,
  Receipt,
  FileCheck2,
  Wallet,
  AlertTriangle,
  Mail,
  Settings,
  PlusCircle,
  FileText,
  UserCheck,
  Building2,
  DollarSign,
  TrendingUp,
  History,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Inbox,
  KanbanSquare,
  Truck,
  ShieldAlert,
  UserCog,
} from "lucide-react";

interface AdminNavProps {
  onOpenQuickAction?: () => void;
}

export function AdminNav({ onOpenQuickAction }: AdminNavProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Exactly matching Section 5 of the Codex Master Prompt (22 items in order)
  const navGroups: Array<{
    group: string;
    items: Array<{
      href: string;
      label: string;
      icon: any;
      badge?: string;
      badgeAlert?: string;
    }>;
  }> = [
    {
      group: "PIPELINE & INQUIRIES",
      items: [
        { href: "/admin", label: "1. Overview", icon: LayoutDashboard },
        { href: "/admin/leads", label: "2. Leads & Inquiries", icon: Inbox },
        { href: "/admin/pipeline", label: "3. CRM Pipeline", icon: KanbanSquare },
        { href: "/admin/calendar", label: "4. Booking Calendar", icon: CalendarDays },
      ],
    },
    {
      group: "BOOKINGS & OPERATIONS",
      items: [
        { href: "/admin/bookings", label: "5. Bookings", icon: FileText },
        {
          href: "/admin/individual-talent-bookings",
          label: "6. Individual Talent Bookings",
          icon: UserCheck,
          badge: "Direct",
        },
        { href: "/admin/talents", label: "7. Santa Talent", icon: Users2 },
        { href: "/admin/pa-crew", label: "8. PA & Crew", icon: UserCog },
        { href: "/admin/clients", label: "9. Clients & Agencies", icon: Building2 },
      ],
    },
    {
      group: "COMMERCIAL & FINANCE",
      items: [
        { href: "/admin/quotes", label: "10. Quotes & Costing", icon: DollarSign },
        { href: "/admin/contracts", label: "11. Contracts & E-signatures", icon: FileCheck2 },
        { href: "/admin/payments", label: "12. Payments & Receivables", icon: Receipt },
        { href: "/admin/expenses", label: "13. Expenses", icon: Receipt },
        { href: "/admin/paluwal", label: "14. Talent Advances / Paluwal", icon: Wallet },
      ],
    },
    {
      group: "DISPATCH & COMMUNICATIONS",
      items: [
        { href: "/admin/deployment", label: "15. Event Deployment", icon: Truck },
        { href: "/admin/inbox", label: "16. Email Center", icon: Mail },
        { href: "/admin/import", label: "17. Excel Import Center", icon: FileSpreadsheet },
        { href: "/admin/conflicts", label: "18. Source Conflicts", icon: AlertTriangle, badgeAlert: "13" },
      ],
    },
    {
      group: "MANAGEMENT & GOVERNANCE",
      items: [
        { href: "/admin/reports", label: "19. Reports", icon: TrendingUp },
        { href: "/admin/audit-log", label: "20. Audit Log", icon: History },
        { href: "/admin/users", label: "21. Users & Roles", icon: ShieldCheck },
        { href: "/admin/settings", label: "22. Settings", icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={`${
        collapsed ? "w-16" : "w-64"
      } bg-[#171A18] text-[#FBF9F4] border-r border-[#2C312D] flex flex-col h-screen sticky top-0 transition-all duration-200 select-none z-30 shrink-0`}
    >
      {/* Brand Header */}
      <div className="h-16 border-b border-[#2C312D] flex items-center justify-between px-3">
        <Link href="/admin" className="flex items-center space-x-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded bg-[#8E252F] border border-[#B99A5B]/40 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-[#D4B473]" />
          </div>
          {!collapsed && (
            <div className="truncate">
              <span className="font-serif font-bold text-sm tracking-wide text-white block">
                BRILLO HUB
              </span>
              <span className="text-[9px] text-[#B99A5B] uppercase tracking-widest block font-mono">
                SANTA OPERATIONS
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-[#6B706C] hover:text-white p-1 rounded hover:bg-[#202421] transition"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Quick Action Button */}
      <div className="p-2.5 border-b border-[#2C312D]">
        <button
          onClick={onOpenQuickAction}
          className={`w-full py-2 px-2 rounded-lg bg-[#A92F3A] hover:bg-[#8E252F] text-white font-medium text-xs flex items-center justify-center shadow-sm border border-[#A92F3A]/40 transition active:scale-[0.99] ${
            collapsed ? "px-0" : ""
          }`}
          title="Open Universal Quick Actions"
        >
          <PlusCircle className="w-4 h-4 text-[#E7CE97] shrink-0" />
          {!collapsed && <span className="ml-2 font-medium tracking-wide">Quick Action</span>}
        </button>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto sidebar-scroll px-2 py-3 space-y-4">
        {navGroups.map((grp, idx) => (
          <div key={idx} className="space-y-0.5">
            {!collapsed && (
              <div className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[#6B706C] font-mono">
                {grp.group}
              </div>
            )}
            {grp.items.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition ${
                    active
                      ? "bg-[#202421] text-[#E7CE97] border-l-2 border-[#B99A5B] font-semibold"
                      : "text-[#C5C0B4] hover:text-white hover:bg-[#202421]/60"
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        active ? "text-[#D4B473]" : "text-[#6B706C] group-hover:text-white"
                      }`}
                    />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!collapsed && item.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#202421] text-[#D4B473] border border-[#B99A5B]/30 font-semibold uppercase">
                      {item.badge}
                    </span>
                  )}
                  {!collapsed && item.badgeAlert && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800/60 font-semibold font-mono">
                      {item.badgeAlert}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer / Public Link */}
      <div className="p-3 border-t border-[#2C312D] bg-[#101211] flex items-center justify-between text-xs text-[#6B706C]">
        {!collapsed ? (
          <>
            <Link href="/" target="_blank" className="hover:text-[#D4B473] text-[11px] flex items-center transition">
              ↗ Public Portal
            </Link>
            <span className="text-[10px] text-[#6B706C] font-mono">v2.0 (Codex)</span>
          </>
        ) : (
          <Link href="/" target="_blank" className="mx-auto hover:text-[#D4B473]" title="View Public Portal">
            ↗
          </Link>
        )}
      </div>
    </aside>
  );
}
