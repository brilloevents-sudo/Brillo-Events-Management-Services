"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth-context";
import {
  LayoutDashboard,
  CalendarDays,
  Users2,
  FileSpreadsheet,
  Receipt,
  FileCheck2,
  Wallet,
  AlertTriangle,
  Settings,
  PlusCircle,
  FileText,
  Building2,
  DollarSign,
  History,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  KanbanSquare,
  ShieldCheck,
  Mail,
  Inbox,
} from "lucide-react";
import { BrilloLiquidEmblem } from "@/components/visual-effects/brillo-liquid-emblem";

interface AdminNavProps {
  onOpenQuickAction?: () => void;
}

export function AdminNav({ onOpenQuickAction }: AdminNavProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [showGovernance, setShowGovernance] = useState(false);
  const { permissions } = useAuth();

  // v3.0 Strict Chronological Lifecycle Navigation (4 Lifecycle Groups, Zero Number Prefixes)
  const navGroups: Array<{
    group: string;
    items: Array<{
      href: string;
      matchPaths?: string[];
      label: string;
      icon: any;
      badge?: string;
      badgeAlert?: string;
    }>;
  }> = [
    {
      group: "COMMAND CENTER",
      items: [
        { href: "/admin", label: "Executive Overview", icon: LayoutDashboard },
        { href: "/admin/calendar", label: "Master Calendar & Holds", icon: CalendarDays },
      ],
    },
    {
      group: "1. INQUIRIES & COMMERCIAL",
      items: [
        {
          href: "/admin/crm",
          matchPaths: ["/admin/crm", "/admin/leads", "/admin/pipeline"],
          label: "Leads & CRM Pipeline",
          icon: KanbanSquare,
        },
        { href: "/admin/quotes", label: "Quotes & Costing", icon: DollarSign },
        { href: "/admin/contracts", label: "Contracts & E-Sign", icon: FileCheck2 },
      ],
    },
    {
      group: "2. OPERATIONS & DISPATCH",
      items: [
        {
          href: "/admin/bookings",
          matchPaths: ["/admin/bookings", "/admin/individual-talent-bookings"],
          label: "Bookings & Signoff",
          icon: FileText,
          badgeAlert: "Signoff",
        },
        {
          href: "/admin/roster",
          matchPaths: ["/admin/roster", "/admin/talents", "/admin/pa-crew"],
          label: "Santa & Crew Roster",
          icon: Users2,
        },
        { href: "/admin/clients", label: "Clients & Agencies", icon: Building2 },
      ],
    },
    {
      group: "3. FINANCE & SETTLEMENT",
      items: [
        { href: "/admin/payments", label: "Payments & Receivables", icon: Receipt },
        {
          href: "/admin/expenses",
          matchPaths: ["/admin/expenses", "/admin/paluwal"],
          label: "Expenses & Paluwal Ledger",
          icon: Wallet,
        },
      ],
    },
    {
      group: "4. COMMUNICATION & INBOX",
      items: [
        {
          href: "/admin/emails",
          matchPaths: ["/admin/emails"],
          label: "Email Automation Center",
          icon: Mail,
          badgeAlert: "18 Auto",
        },
        {
          href: "/admin/inbox",
          matchPaths: ["/admin/inbox"],
          label: "Shared Client Inbox",
          icon: Inbox,
        },
      ],
    },
  ];

  const governanceItems = [
    { href: "/admin/conflicts", label: "Data & Conflict Audit", icon: AlertTriangle },
    { href: "/admin/import", label: "Excel Import Center", icon: FileSpreadsheet },
    { href: "/admin/audit-log", label: "Immutable Audit Log", icon: History },
    { href: "/admin/users", label: "RBAC Users & Roles", icon: ShieldCheck },
    { href: "/admin/settings", label: "System Settings", icon: Settings },
  ];

  const isRouteActive = (href: string, matchPaths?: string[]) => {
    if (href === "/admin") return pathname === "/admin";
    if (matchPaths && matchPaths.some((p) => pathname.startsWith(p))) return true;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside
      className={`${
        collapsed ? "w-16" : "w-64"
      } bg-[#181012] text-[#FAF7F5] border-r border-[#2E1F22] flex flex-col h-screen sticky top-0 transition-all duration-200 select-none z-30 shrink-0`}
    >
      {/* Brand Header with Liquid Metallic Emblem */}
      <div className="h-16 border-b border-[#2E1F22] flex items-center justify-between px-3">
        <Link href="/admin" className="flex items-center space-x-2.5 overflow-hidden">
          <BrilloLiquidEmblem />
          {!collapsed && (
            <div className="truncate">
              <span className="font-serif font-bold text-sm tracking-wide text-white block leading-tight">
                BRILLO HUB
              </span>
              <span className="text-[9px] text-[#E6B85C] uppercase tracking-widest block font-mono font-semibold">
                SANTA OPERATIONS
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-[#9A8A8C] hover:text-white p-1 rounded hover:bg-[#2B151A] transition"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Universal Quick Action CTA */}
      <div className="p-2.5 border-b border-[#2E1F22]">
        <button
          onClick={onOpenQuickAction}
          className={`w-full py-2 px-2.5 rounded-lg text-white font-semibold text-xs flex items-center justify-center transition active:scale-[0.99] btn-primary ${
            collapsed ? "px-0" : ""
          }`}
          title="Open Universal Quick Actions"
        >
          <PlusCircle className="w-4 h-4 text-[#F8E2A8] shrink-0" />
          {!collapsed && <span className="ml-2 tracking-wide">Quick Action</span>}
        </button>
      </div>

      {/* 4 Chronological Lifecycle Groups */}
      <nav className="flex-1 overflow-y-auto sidebar-scroll px-2.5 py-3 space-y-4">
        {navGroups.map((grp, idx) => (
          <div key={idx} className="space-y-0.5">
            {!collapsed && (
              <div className="px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-wider text-[#9A8A8C] font-mono">
                {grp.group}
              </div>
            )}
            {grp.items
              .filter((item) => permissions.canAccessPaluwal || item.href !== "/admin/expenses")
              .map((item) => {
              const Icon = item.icon;
              const active = isRouteActive(item.href, item.matchPaths);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition ${
                    active
                      ? "bg-[#2B151A] text-white border-l-2 border-[#9B1B30] font-semibold shadow-sm"
                      : "text-[#D6C7C9] hover:text-white hover:bg-[#2B151A]/55"
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        active ? "text-[#E6B85C]" : "text-[#9A8A8C]"
                      }`}
                    />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!collapsed && item.badgeAlert && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#9B1B30]/35 text-[#F9EBED] border border-[#9B1B30]/60 font-semibold font-mono">
                      {item.badgeAlert}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}

        {/* Discreet Collapsible Governance & Data Audit Section */}
        {permissions.canAccessGovernance && (
        <div className="pt-2 border-t border-[#2E1F22]/80">
          {!collapsed && (
            <button
              type="button"
              onClick={() => setShowGovernance(!showGovernance)}
              className="w-full px-2.5 py-1.5 flex items-center justify-between text-[9.5px] font-bold uppercase tracking-wider text-[#9A8A8C] hover:text-[#FAF7F5] font-mono transition"
            >
              <span>GOVERNANCE &amp; AUDIT</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  showGovernance ? "rotate-180" : ""
                }`}
              />
            </button>
          )}
          {(showGovernance || collapsed) && (
            <div className="space-y-0.5 mt-1">
              {governanceItems.map((g) => {
                const Icon = g.icon;
                const active = isRouteActive(g.href);
                return (
                  <Link
                    key={g.href}
                    href={g.href}
                    title={collapsed ? g.label : undefined}
                    className={`flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg text-xs transition ${
                      active
                        ? "bg-[#2B151A] text-white border-l-2 border-[#9B1B30] font-semibold"
                        : "text-[#B5A4A7] hover:text-white hover:bg-[#2B151A]/50"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? "text-[#E6B85C]" : "text-[#9A8A8C]"}`} />
                    {!collapsed && <span className="truncate">{g.label}</span>}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
        )}
      </nav>

      {/* Footer / Public Portal */}
      <div className="p-3 border-t border-[#2E1F22] bg-[#130C0E] flex items-center justify-between text-xs text-[#9A8A8C]">
        {!collapsed ? (
          <>
            <Link
              href="/"
              target="_blank"
              className="hover:text-[#E6B85C] text-[11px] flex items-center transition font-medium"
            >
              ↗ Public Funnel
            </Link>
            <span className="text-[10px] text-[#9A8A8C] font-mono">v3.0 Master</span>
          </>
        ) : (
          <Link
            href="/"
            target="_blank"
            className="mx-auto hover:text-[#E6B85C]"
            title="View Public Funnel"
          >
            ↗
          </Link>
        )}
      </div>
    </aside>
  );
}
