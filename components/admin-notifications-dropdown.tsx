"use client";

import { useState, useEffect, useRef } from "react";
import {
  Bell,
  CheckCheck,
  Trash2,
  FileText,
  AlertTriangle,
  Mail,
  Calendar,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface SystemNotification {
  id: string;
  type: "QUOTATION" | "BOOKING" | "CONFLICT" | "EMAIL" | "PAYMENT";
  title: string;
  message: string;
  link: string;
  ref?: string;
  read: boolean;
  timestamp: string;
}

const STORAGE_KEY = "brillo_system_notifications_v3";

export const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: "notif_q122",
    type: "QUOTATION",
    title: "New Quotation Request: saay (BR-2026-Q122)",
    message: "Client saay requested quotation for Real-Beard Santa Claus on 2026-11-03 • Indicative Rate: ₱24,000",
    link: "/admin/crm",
    ref: "BR-2026-Q122",
    read: false,
    timestamp: new Date().toISOString(),
  },
  {
    id: "notif_conflicts",
    type: "CONFLICT",
    title: "Schedule & Source Conflicts (36 Items)",
    message: "36 source ledger conflicts registered across Venarao Dragon, Leona, and pending triage.",
    link: "/admin/conflicts",
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "notif_transporter",
    type: "EMAIL",
    title: "Namecheap Private Email Active",
    message: "bookings@brilloevent.com verified via SSL Port 465 & cPanel Exim MTA.",
    link: "/admin/emails",
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
];

export function addSystemNotification(item: Omit<SystemNotification, "id" | "timestamp" | "read">) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const existing: SystemNotification[] = raw ? JSON.parse(raw) : INITIAL_NOTIFICATIONS;
    const newEntry: SystemNotification = {
      ...item,
      id: `notif_${Date.now()}`,
      read: false,
      timestamp: new Date().toISOString(),
    };
    const updated = [newEntry, ...existing].slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("brillo-notification-update", { detail: updated }));
  } catch {}
}

export function AdminNotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const loadNotifications = () => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setNotifications(JSON.parse(raw));
      } else {
        setNotifications(INITIAL_NOTIFICATIONS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
      }
    } catch {
      setNotifications(INITIAL_NOTIFICATIONS);
    }
  };

  useEffect(() => {
    loadNotifications();

    const handleCustomEvent = (e: any) => {
      if (e.detail) {
        setNotifications(e.detail);
      } else {
        loadNotifications();
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        loadNotifications();
      }
    };

    window.addEventListener("brillo-notification-update", handleCustomEvent);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("brillo-notification-update", handleCustomEvent);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("brillo-notification-update", { detail: updated }));
    }
  };

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("brillo-notification-update", { detail: updated }));
    }
  };

  const clearAll = () => {
    setNotifications([]);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      window.dispatchEvent(new CustomEvent("brillo-notification-update", { detail: [] }));
    }
  };

  const formatTimeAgo = (iso: string) => {
    try {
      const diffMs = Date.now() - new Date(iso).getTime();
      const mins = Math.floor(diffMs / 60000);
      if (mins < 1) return "Just now";
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch {
      return "Recently";
    }
  };

  const renderIcon = (type: SystemNotification["type"]) => {
    switch (type) {
      case "QUOTATION":
        return <FileText className="w-4 h-4 text-[#780D22]" />;
      case "BOOKING":
        return <Calendar className="w-4 h-4 text-emerald-600" />;
      case "CONFLICT":
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case "EMAIL":
        return <Mail className="w-4 h-4 text-blue-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#D6B36A]" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-lg hover:bg-[#F4ECEE] text-[#9B1B30] relative transition flex items-center justify-center"
        title="System Notifications & Alerts"
        aria-label="System Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 ? (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#780D22] text-[#FFF8F0] border-2 border-white text-[9px] font-bold flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#D6B36A]" />
        )}
      </button>

      {/* Floating Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#E8DFE0] rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[500px] animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-[#780D22] to-[#590919] text-[#FFF8F0] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#D6B36A]" />
              <span className="font-serif font-bold text-sm">System Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-[#D6B36A] text-[#1E1416] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} New
                </span>
              )}
            </div>

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[11px] text-[#FAF3EB] hover:text-[#D6B36A] flex items-center gap-1 font-semibold transition"
                title="Mark all notifications as read"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark Read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#F0E6E8]">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-[#756568] space-y-1">
                <Bell className="w-8 h-8 mx-auto text-[#D6C7C9] mb-2" />
                <p className="text-xs font-semibold text-[#1E1416]">No new notifications</p>
                <p className="text-[11px] text-[#9A8A8C]">
                  Quotations, booking holds, and system events will appear here in real time.
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 flex items-start gap-3 transition hover:bg-[#FAF7F5] ${
                    !n.read ? "bg-[#FFF9F9]" : ""
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                      !n.read
                        ? "bg-[#FAF3EB] border-[#E6CA85]"
                        : "bg-[#F4ECEE] border-[#E8DFE0]"
                    }`}
                  >
                    {renderIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4
                        className={`text-xs font-bold truncate ${
                          !n.read ? "text-[#780D22]" : "text-[#1E1416]"
                        }`}
                      >
                        {n.title}
                      </h4>
                      <span className="text-[10px] text-[#9A8A8C] shrink-0 font-mono">
                        {formatTimeAgo(n.timestamp)}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#5C494E] line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      <Link
                        href={n.link}
                        onClick={() => {
                          markAsRead(n.id);
                          setIsOpen(false);
                        }}
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-[#780D22] hover:text-[#590919] hover:underline"
                      >
                        View Details <ExternalLink className="w-2.5 h-2.5" />
                      </Link>

                      {!n.read && (
                        <button
                          type="button"
                          onClick={() => markAsRead(n.id)}
                          className="text-[10px] text-[#756568] hover:text-[#1E1416]"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Quick Links */}
          <div className="p-2.5 bg-[#FAF7F5] border-t border-[#E8DFE0] flex items-center justify-between text-xs">
            <Link
              href="/admin/crm"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-bold text-[#780D22] hover:underline"
            >
              Leads &amp; CRM Pipeline →
            </Link>

            <Link
              href="/admin/conflicts"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-bold text-[#756568] hover:text-[#1E1416]"
            >
              Conflicts Register
            </Link>

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="text-[11px] text-gray-400 hover:text-red-600 transition"
                title="Clear all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
