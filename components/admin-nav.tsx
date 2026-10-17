"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Clock,
  Sparkles,
} from "lucide-react";

interface AdminNavProps {
  onOpenQuickAction?: () => void;
}

export function AdminNav({ onOpenQuickAction }: AdminNavProps) {
  const pathname = usePathname();

  const navSections = [
    {
      title: "OPERATIONS",
      items: [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        {
          href: "/admin/individual-talent-bookings",
          label: "Individual Talent Bookings",
          icon: UserCheck,
          badge: "Mandatory",
        },
        { href: "/admin/bookings", label: "Bookings & Pipeline", icon: FileText },
        { href: "/admin/calendar", label: "Deployment Calendar", icon: CalendarDays },
      ],
    },
    {
      title: "ROSTER & TALENT",
      items: [
        { href: "/admin/talents", label: "Talent Roster & Photos", icon: Users2 },
      ],
    },
    {
      title: "SALES & CONTRACTS",
      items: [
        { href: "/admin/quotes", label: "Quotes & Costing", icon: Receipt },
        { href: "/admin/contracts", label: "Contracts & Signatures", icon: FileCheck2 },
      ],
    },
    {
      title: "FINANCE & LEDGER",
      items: [
        { href: "/admin/payments", label: "Payments & Verification", icon: Receipt },
        { href: "/admin/paluwal", label: "Paluwal (Advance Ledger)", icon: Wallet },
        { href: "/admin/expenses", label: "Expenses", icon: Receipt },
      ],
    },
    {
      title: "SYSTEM & DATA",
      items: [
        { href: "/admin/inbox", label: "Shared Mailbox", icon: Mail },
        { href: "/admin/import", label: "12-Sheet Excel Import", icon: FileSpreadsheet },
        { href: "/admin/conflicts", label: "Source Conflicts", icon: AlertTriangle },
        { href: "/admin/settings", label: "Audit Log & Settings", icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-obsidian-900 border-r border-slate-800 flex flex-col h-screen sticky top-0">
      {/* Brand Header */}
      <div className="h-16 border-b border-slate-800 flex items-center justify-between px-4">
        <Link href="/admin" className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded bg-crimson-800 border border-crimson-600/40 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-gold-400" />
          </div>
          <div>
            <span className="font-bold text-sm text-white block">BRILLO HUB</span>
            <span className="text-[10px] text-gold-400 uppercase tracking-widest block font-mono">
              STAFF CRM
            </span>
          </div>
        </Link>
        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
          Admin
        </span>
      </div>

      {/* Quick Action Button */}
      <div className="p-3 border-b border-slate-800/80">
        <button
          onClick={onOpenQuickAction}
          className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-crimson-700 to-crimson-800 hover:from-crimson-600 hover:to-crimson-700 text-white font-medium text-xs flex items-center justify-center shadow-md shadow-crimson-950 border border-crimson-600/40 transition active:scale-[0.99]"
        >
          <PlusCircle className="w-4 h-4 mr-2 text-gold-300" />
          + Quick Action
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
        {navSections.map((sec, i) => (
          <div key={i} className="space-y-1">
            <div className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500 font-mono">
              {sec.title}
            </div>
            {sec.items.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                    active
                      ? "bg-crimson-900/30 text-gold-300 border border-crimson-800/50 shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-obsidian-800"
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <Icon className={`w-4 h-4 ${active ? "text-gold-400" : "text-slate-400"}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-gold-950 text-gold-400 border border-gold-800/60 font-semibold uppercase">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer / Public Link */}
      <div className="p-3 border-t border-slate-800 bg-obsidian-950/60 flex items-center justify-between text-xs text-slate-400">
        <Link href="/" target="_blank" className="hover:text-gold-300 text-[11px] flex items-center">
          ↗ View Public Site
        </Link>
        <span className="text-[10px] text-slate-500 font-mono">v1.0.0</span>
      </div>
    </aside>
  );
}
