"use client";

import { useEffect, useState } from "react";
import {
  Mail,
  Send,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Building2,
  Calendar,
  Sparkles,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Paperclip,
  Phone,
  BadgeDollarSign,
  ExternalLink,
} from "lucide-react";

export default function SharedInboxPage() {
  const [threads, setThreads] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<"ALL" | "QUOTES" | "BOOKED" | "INBOUND" | "OUTBOUND">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [providerStatus, setProviderStatus] = useState<any>({
    connected: true,
    provider: "Namecheap Private Email",
    senderAddress: "bookings@brilloevent.com",
    statusMessage: "Connected (mail.privateemail.com:465 SSL Active)",
  });
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [activeThread, setActiveThread] = useState<any>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  function loadThreads() {
    setLoading(true);
    fetch("/api/inbox")
      .then((res) => res.json())
      .then((data) => {
        if (data.threads && Array.isArray(data.threads)) {
          setThreads(data.threads);
          if (data.threads.length > 0) {
            setSelectedThreadId((prev) => prev || data.threads[0].id);
          }
        }
        if (data.providerStatus) {
          setProviderStatus(data.providerStatus);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadThreads();
  }, []);

  useEffect(() => {
    if (selectedThreadId) {
      fetch(`/api/inbox?threadId=${selectedThreadId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.thread) {
            setActiveThread(data.thread);
          } else {
            const found = threads.find((t) => t.id === selectedThreadId);
            if (found) setActiveThread(found);
          }
        })
        .catch(() => {
          const found = threads.find((t) => t.id === selectedThreadId);
          if (found) setActiveThread(found);
        });
    }
  }, [selectedThreadId, threads]);

  async function handleSendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim() || !activeThread) return;

    setSending(true);
    try {
      const recipient =
        activeThread.client?.email ||
        activeThread.messages?.[0]?.sender ||
        "client@events.local";

      const res = await fetch("/api/inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: recipient,
          subject: activeThread.subject.startsWith("Re:")
            ? activeThread.subject
            : `Re: ${activeThread.subject}`,
          bodyText: replyText,
          threadId: activeThread.id,
          bookingId: activeThread.bookingId,
          clientId: activeThread.clientId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setReplyText("");
        loadThreads();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  }

  function isThreadBooked(t: any) {
    if (t.bookingStatus === "BOOKED") return true;
    const status = (t.booking?.status || "").toUpperCase();
    return ["BOOKED", "SECURED", "CONFIRMED", "SECURED_CONFIRMED", "CONTRACT_SIGNED", "CONTRACT_SIGNED_PAID", "READY_FOR_DEPLOYMENT"].includes(status);
  }

  function isThreadQuote(t: any) {
    if (t.bookingStatus === "QUOTATION_REQUEST") return true;
    const status = (t.booking?.status || "").toUpperCase();
    return (
      ["QUOTATION_REQUEST", "INQUIRY_RECEIVED", "NEW_INQUIRY", "HOLD_24H_ACTIVE", "TEMPORARY_HOLD", "QUOTE_ISSUED", "QUOTED"].includes(status) ||
      !isThreadBooked(t)
    );
  }

  const quotesCount = threads.filter(isThreadQuote).length;
  const bookedCount = threads.filter(isThreadBooked).length;

  const filteredThreads = threads.filter((t) => {
    const matchesSearch =
      (t.subject || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.client?.companyName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.client?.primaryContact || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.client?.contactPerson || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.booking?.bookingNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.booking?.mallOrVenue || "").toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === "QUOTES") {
      return isThreadQuote(t);
    }
    if (filterType === "BOOKED") {
      return isThreadBooked(t);
    }
    if (filterType === "INBOUND") {
      const last = t.messages?.[t.messages.length - 1];
      return last?.direction === "INBOUND";
    }
    if (filterType === "OUTBOUND") {
      const last = t.messages?.[t.messages.length - 1];
      return last?.direction === "OUTBOUND";
    }

    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto w-full h-[calc(100vh-4rem)] flex flex-col space-y-4 font-body text-[#1E1416]">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-[#E8DFE0] shrink-0">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#780D22] text-[#FFF8F0] tracking-wider uppercase font-mono shadow-sm">
              Shared Client Mailbox
            </span>
            <h1 className="text-2xl font-serif font-bold text-[#1E1416] tracking-tight">
              Shared Inbox &amp; Email Communications
            </h1>
          </div>
          <p className="text-xs text-[#5C494E] mt-1">
            Sender: <strong className="text-[#780D22]">bookings@brilloevent.com</strong> (Replies to: info@brilloevent.com) • Live Synced with Quotations &amp; CRM Bookings
          </p>
        </div>

        {/* Namecheap Provider Connection Indicator */}
        <div className="px-4 py-2 rounded-xl bg-white border border-[#D6B36A]/60 shadow-sm text-xs flex items-center space-x-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-emerald-800">
              Namecheap Private Email: Connected
            </span>
            <span className="text-[10px] text-[#756568] font-mono">
              mail.privateemail.com:465 (SSL Encrypted)
            </span>
          </div>
        </div>
      </div>

      {/* Main Mailbox Two-Column Layout */}
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left Column: Threads List (4 cols) */}
        <div className="md:col-span-4 bg-white border border-[#E8DFE0] rounded-2xl flex flex-col overflow-hidden shadow-sm">
          {/* Search & Filters */}
          <div className="p-3 border-b border-[#E8DFE0] space-y-2 bg-[#FAF7F5]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#756568] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search clients, contact person, ref..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#D6C7C9] text-xs text-[#1E1416] placeholder-[#9A8A8C] rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-[#780D22]"
              />
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                <button
                  onClick={() => setFilterType("ALL")}
                  className={`px-2 py-0.5 rounded-md font-semibold transition shrink-0 ${
                    filterType === "ALL"
                      ? "bg-[#780D22] text-white"
                      : "text-[#5C494E] hover:bg-[#E8DFE0]"
                  }`}
                >
                  All ({threads.length})
                </button>
                <button
                  onClick={() => setFilterType("QUOTES")}
                  className={`px-2 py-0.5 rounded-md font-semibold transition shrink-0 ${
                    filterType === "QUOTES"
                      ? "bg-amber-700 text-white"
                      : "text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200"
                  }`}
                >
                  Quotes ({quotesCount})
                </button>
                <button
                  onClick={() => setFilterType("BOOKED")}
                  className={`px-2 py-0.5 rounded-md font-semibold transition shrink-0 ${
                    filterType === "BOOKED"
                      ? "bg-emerald-700 text-white"
                      : "text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200"
                  }`}
                >
                  Booked ({bookedCount})
                </button>
                <button
                  onClick={() => setFilterType("INBOUND")}
                  className={`px-2 py-0.5 rounded-md font-semibold transition shrink-0 ${
                    filterType === "INBOUND"
                      ? "bg-[#780D22] text-white"
                      : "text-[#5C494E] hover:bg-[#E8DFE0]"
                  }`}
                >
                  Inbound
                </button>
                <button
                  onClick={() => setFilterType("OUTBOUND")}
                  className={`px-2 py-0.5 rounded-md font-semibold transition shrink-0 ${
                    filterType === "OUTBOUND"
                      ? "bg-[#780D22] text-white"
                      : "text-[#5C494E] hover:bg-[#E8DFE0]"
                  }`}
                >
                  Sent Auto
                </button>
              </div>

              <button
                onClick={loadThreads}
                className="text-[#780D22] hover:underline font-bold text-[10px] shrink-0 ml-1"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Conversations Thread List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#E8DFE0]">
            {filteredThreads.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#9A8A8C] space-y-2">
                <Mail className="w-8 h-8 mx-auto text-[#D6C7C9]" />
                <p>No conversations found matching filters.</p>
              </div>
            ) : (
              filteredThreads.map((t) => {
                const isSelected = selectedThreadId === t.id;
                const lastMsg = t.messages?.[t.messages.length - 1] || t.messages?.[0];
                const isInbound = lastMsg?.direction === "INBOUND";
                const isBooked = isThreadBooked(t);
                const kausapName =
                  t.client?.primaryContact ||
                  t.client?.contactPerson ||
                  t.client?.companyName ||
                  "Valued Client";

                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedThreadId(t.id)}
                    className={`w-full p-3.5 text-left transition flex flex-col space-y-1.5 ${
                      isSelected
                        ? "bg-[#FAF3EB] border-l-4 border-[#780D22]"
                        : "hover:bg-[#FCF9F8]"
                    }`}
                  >
                    {/* Top Row: Status Badges & Timestamp */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isBooked ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                            BOOKED / SECURED
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            QUOTATION REQUEST
                          </span>
                        )}

                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                            isInbound
                              ? "bg-rose-100 text-rose-900 border border-rose-200"
                              : "bg-gray-100 text-gray-700 border border-gray-200"
                          }`}
                        >
                          {isInbound ? "INBOUND" : "SENT"}
                        </span>
                      </div>

                      <span className="text-[10px] text-[#756568] font-mono shrink-0">
                        {new Date(t.lastActivityAt || Date.now()).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    {/* Sino Kausap (Contact Person Highlight) */}
                    <div className="flex items-center space-x-1.5 pt-0.5">
                      <div className="w-5 h-5 rounded-full bg-[#780D22]/10 border border-[#780D22]/20 flex items-center justify-center text-[#780D22] text-[10px] font-bold shrink-0">
                        <User className="w-3 h-3" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[9px] uppercase font-bold tracking-wider text-[#780D22] leading-none">
                          Sino Kausap:
                        </div>
                        <span className="font-bold text-xs text-[#1E1416] truncate block leading-tight">
                          {kausapName}
                        </span>
                      </div>
                    </div>

                    {/* Company / Venue & Subject */}
                    <div className="text-[11px] text-[#5C494E] truncate flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-[#A67C2E] shrink-0" />
                      <span className="font-semibold text-[#1E1416] truncate">
                        {t.client?.companyName || t.booking?.mallOrVenue || "Corporate Client"}
                      </span>
                    </div>

                    <div className="text-[11px] font-medium text-[#211619] truncate">
                      {t.subject}
                    </div>

                    {/* Message Preview Snippet */}
                    {lastMsg && (
                      <p className="text-[11px] text-[#756568] line-clamp-1 truncate">
                        {lastMsg.bodyText}
                      </p>
                    )}

                    {/* Booking Reference, Venue & Quoted Amount */}
                    {t.booking && (
                      <div className="pt-1 flex items-center justify-between text-[10px] text-[#8F620E] font-mono border-t border-[#E8DFE0]/60 mt-1">
                        <div className="flex items-center space-x-1 truncate max-w-[190px]">
                          <Calendar className="w-3 h-3 text-[#A67C2E] shrink-0" />
                          <span className="truncate">
                            {t.booking.bookingNumber} • {t.booking.mallOrVenue || "Venue"}
                          </span>
                        </div>
                        {t.booking.totalContractAmount && (
                          <span className="font-bold text-emerald-800 shrink-0">
                            ₱{Number(t.booking.totalContractAmount).toLocaleString()}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Thread Conversation View & Reply (8 cols) */}
        <div className="md:col-span-8 bg-white border border-[#E8DFE0] rounded-2xl flex flex-col overflow-hidden shadow-sm">
          {activeThread ? (
            <>
              {/* Thread Header & Complete Client Dossier */}
              <div className="p-4 border-b border-[#E8DFE0] bg-[#FAF7F5] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isThreadBooked(activeThread)
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                            : "bg-amber-100 text-amber-900 border border-amber-300"
                        }`}
                      >
                        {isThreadBooked(activeThread) ? "Booked / Secured Event" : "Quotation Request"}
                      </span>
                      {activeThread.booking?.bookingNumber && (
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#FAF3EB] border border-[#D6B36A] text-[#8F620E]">
                          Ref: {activeThread.booking.bookingNumber}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold font-serif text-[#1E1416] mt-1">
                      {activeThread.subject}
                    </h3>
                  </div>

                  {/* Navigation Shortcuts */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href="/admin/crm"
                      className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#FAF3EB] border border-[#D6C7C9] text-[11px] font-bold text-[#780D22] flex items-center space-x-1 shadow-sm transition"
                    >
                      <span>CRM Pipeline</span>
                      <ArrowRight className="w-3 h-3" />
                    </a>
                    <a
                      href="/admin/calendar"
                      className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#FAF3EB] border border-[#D6C7C9] text-[11px] font-bold text-[#5C494E] flex items-center space-x-1 shadow-sm transition"
                    >
                      <Calendar className="w-3 h-3" />
                      <span>Calendar</span>
                    </a>
                  </div>
                </div>

                {/* Sino Kausap & Client Dossier Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-white border border-[#E8DFE0] text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-[#780D22] tracking-wider flex items-center gap-1">
                      <User className="w-3 h-3 text-[#780D22]" /> Sino Kausap:
                    </span>
                    <p className="font-bold text-[#1E1416] truncate">
                      {activeThread.client?.primaryContact || activeThread.client?.contactPerson || "Valued Client"}
                    </p>
                    <p className="text-[10px] text-[#756568] truncate">
                      {activeThread.client?.companyName || "Direct Client"}
                    </p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-[#756568] tracking-wider flex items-center gap-1">
                      <Mail className="w-3 h-3" /> Email &amp; Contact:
                    </span>
                    <p className="truncate">
                      <a
                        href={`mailto:${activeThread.client?.email}`}
                        className="text-[#780D22] font-semibold hover:underline truncate block"
                      >
                        {activeThread.client?.email || "events@client.local"}
                      </a>
                    </p>
                    <p className="text-[10px] text-[#756568] truncate">
                      Mobile:{" "}
                      <a href={`tel:${activeThread.client?.phone}`} className="font-mono hover:underline">
                        {activeThread.client?.phone || "N/A"}
                      </a>
                    </p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-[#756568] tracking-wider flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Event Details:
                    </span>
                    <p className="font-semibold text-[#1E1416] truncate">
                      {activeThread.booking?.eventDate
                        ? new Date(activeThread.booking.eventDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Nov 2026"}
                    </p>
                    <p className="text-[10px] text-[#756568] truncate">
                      {activeThread.booking?.mallOrVenue || "Metro Manila"}
                    </p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-[#756568] tracking-wider flex items-center gap-1">
                      <BadgeDollarSign className="w-3 h-3 text-emerald-600" /> Package / Rate:
                    </span>
                    <p className="font-bold text-emerald-800 text-sm">
                      ₱{Number(activeThread.booking?.totalContractAmount || 24000).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-[#756568]">
                      50% DP: ₱{Math.round(Number(activeThread.booking?.totalContractAmount || 24000) * 0.5).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Message History Feed */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#FCFBF9]">
                {activeThread.messages?.map((msg: any) => {
                  const isOutbound = msg.direction === "OUTBOUND";

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isOutbound ? "items-end" : "items-start"}`}
                    >
                      <div className="text-[10px] font-mono text-[#756568] mb-1 flex items-center space-x-1.5">
                        <span className="font-semibold text-[#1E1416]">{msg.sender}</span>
                        <span>•</span>
                        <span>
                          {new Date(msg.sentAt || Date.now()).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {isOutbound && (
                          <span className="inline-flex items-center gap-0.5 text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            <CheckCircle className="w-2.5 h-2.5 text-emerald-600" /> DELIVERED
                          </span>
                        )}
                      </div>

                      <div
                        className={`p-4 rounded-2xl text-xs max-w-xl whitespace-pre-line leading-relaxed shadow-sm ${
                          isOutbound
                            ? "bg-gradient-to-br from-[#780D22] to-[#590919] text-[#FFF8F0] border border-[#D6B36A]/40 rounded-tr-none"
                            : "bg-white text-[#1E1416] border border-[#E8DFE0] rounded-tl-none"
                        }`}
                      >
                        {msg.bodyText}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Template Fillers */}
              <div className="px-4 py-2 border-t border-[#E8DFE0] bg-[#FAF7F5] flex items-center gap-2 overflow-x-auto text-[11px]">
                <span className="text-[#756568] font-bold text-[10px] uppercase shrink-0">
                  Quick Insert:
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setReplyText((prev) =>
                      prev +
                      "\n\nHere is your official proposal link: https://brilloevent.com/portal\nKindly review and e-sign to lock your preferred date."
                    )
                  }
                  className="px-2.5 py-1 rounded bg-white hover:bg-[#FAF3EB] border border-[#D6C7C9] text-[#780D22] font-semibold shrink-0 transition"
                >
                  + Proposal Link
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setReplyText((prev) =>
                      prev +
                      "\n\nTo lock your Santa performer, please settle the 50% downpayment via GCash:\nAccount: Brillo Events Management\nNumber: 0906 439 0028"
                    )
                  }
                  className="px-2.5 py-1 rounded bg-white hover:bg-[#FAF3EB] border border-[#D6C7C9] text-[#780D22] font-semibold shrink-0 transition"
                >
                  + GCash Payment Info
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setReplyText((prev) =>
                      prev +
                      "\n\nSanta Call Sheet Confirmed: Santa Bob will arrive 1 hour prior to call time for staging and sound check."
                    )
                  }
                  className="px-2.5 py-1 rounded bg-white hover:bg-[#FAF3EB] border border-[#D6C7C9] text-[#780D22] font-semibold shrink-0 transition"
                >
                  + Call Sheet Note
                </button>
              </div>

              {/* Reply Composer */}
              <form
                onSubmit={handleSendReply}
                className="p-4 border-t border-[#E8DFE0] bg-white flex flex-col space-y-2.5"
              >
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type official reply dispatched from bookings@brilloevent.com..."
                  className="w-full px-3 py-2.5 bg-[#FCF9F8] border border-[#D6C7C9] rounded-xl text-xs text-[#1E1416] placeholder-[#9A8A8C] focus:border-[#780D22] focus:bg-white focus:outline-none resize-none leading-relaxed"
                />

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#756568]">
                    Dispatched through <strong className="text-[#1E1416]">Namecheap Private Email (mail.privateemail.com:465)</strong>
                  </span>
                  <button
                    type="submit"
                    disabled={sending || !replyText.trim()}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-[#780D22] hover:bg-[#590919] text-[#FFF8F0] flex items-center space-x-2 disabled:opacity-50 transition shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{sending ? "Sending..." : "Send Official Reply"}</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#756568] text-xs space-y-2">
              <Mail className="w-10 h-10 text-[#D6C7C9]" />
              <p className="font-semibold text-[#1E1416]">Select an email conversation</p>
              <p>Choose any client thread from the left pane to view correspondence and dispatch replies.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
