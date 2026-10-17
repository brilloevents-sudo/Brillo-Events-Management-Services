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
} from "lucide-react";

export default function SharedInboxPage() {
  const [threads, setThreads] = useState<any[]>([]);
  const [providerStatus, setProviderStatus] = useState<any>(null);
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
        if (data.threads) {
          setThreads(data.threads);
          if (data.threads.length > 0 && !selectedThreadId) {
            setSelectedThreadId(data.threads[0].id);
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
          if (data.thread) setActiveThread(data.thread);
        })
        .catch(() => {});
    }
  }, [selectedThreadId]);

  async function handleSendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText || !activeThread) return;

    setSending(true);
    try {
      const recipient =
        activeThread.client?.email ||
        activeThread.messages[0]?.sender ||
        "client@events.local";

      const res = await fetch("/api/inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: recipient,
          subject: `Re: ${activeThread.subject}`,
          bodyText: replyText,
          threadId: activeThread.id,
          bookingId: activeThread.bookingId,
          clientId: activeThread.clientId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setReplyText("");
        // Reload active thread
        const reloadRes = await fetch(`/api/inbox?threadId=${activeThread.id}`);
        const reloadData = await reloadRes.json();
        if (reloadData.thread) setActiveThread(reloadData.thread);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full h-[calc(100vh-2rem)] flex flex-col">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800 shrink-0">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-950 text-blue-300 border border-blue-800 font-mono">
              SHARED MAILBOX
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center">
              Shared Inbox &amp; Email Communications
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Sender: <strong className="text-slate-200">brilloevents@gmail.com</strong> • Linked to client CRM accounts and bookings.
          </p>
        </div>

        {/* Provider Connection Indicator */}
        <div className="px-3 py-1.5 rounded-lg bg-obsidian-900 border border-slate-800 text-xs flex items-center space-x-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              providerStatus?.connected ? "bg-emerald-400" : "bg-amber-400 animate-pulse"
            }`}
          />
          <span className="text-slate-300 font-mono text-[11px]">
            {providerStatus?.statusMessage || "Checking provider..."}
          </span>
        </div>
      </div>

      {/* Main Mailbox Two-Column Layout */}
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left Column: Threads List (4 cols) */}
        <div className="md:col-span-4 bg-obsidian-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden">
          <div className="p-3 border-b border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between">
            <span>Conversations ({threads.length})</span>
            <button
              onClick={loadThreads}
              className="text-gold-400 hover:text-gold-300 text-[11px]"
            >
              Refresh
            </button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
            {threads.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No email conversations recorded yet. Outbound notices and client inquiries will appear here.
              </div>
            ) : (
              threads.map((t) => {
                const isSelected = selectedThreadId === t.id;
                const lastMsg = t.messages[0];

                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedThreadId(t.id)}
                    className={`w-full p-3.5 text-left transition flex flex-col space-y-1 ${
                      isSelected
                        ? "bg-obsidian-800 border-l-2 border-gold-400"
                        : "hover:bg-obsidian-850"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white truncate max-w-[180px]">
                        {t.client?.companyName || t.client?.primaryContact || "Client Inquiry"}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(t.lastActivityAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="text-xs font-medium text-slate-200 truncate">
                      {t.subject}
                    </div>

                    {lastMsg && (
                      <p className="text-[11px] text-slate-400 line-clamp-1">
                        {lastMsg.bodyText}
                      </p>
                    )}

                    {t.booking && (
                      <div className="pt-1 flex items-center space-x-1 text-[10px] text-gold-400/90 font-mono">
                        <Calendar className="w-3 h-3" />
                        <span>{t.booking.bookingNumber} • {t.booking.mallOrVenue}</span>
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Thread View & Reply (8 cols) */}
        <div className="md:col-span-8 bg-obsidian-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden">
          {activeThread ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-slate-800 bg-obsidian-950/60 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">{activeThread.subject}</h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Participant:{" "}
                    <strong className="text-slate-200">
                      {activeThread.client?.primaryContact} ({activeThread.client?.email})
                    </strong>
                  </div>
                </div>

                {activeThread.booking && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-obsidian-900 border border-slate-700 text-gold-300">
                    Linked: {activeThread.booking.bookingNumber}
                  </span>
                )}
              </div>

              {/* Message History */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeThread.messages?.map((msg: any) => {
                  const isOutbound = msg.direction === "OUTBOUND";

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        isOutbound ? "items-end" : "items-start"
                      }`}
                    >
                      <div className="text-[10px] font-mono text-slate-500 mb-1 flex items-center space-x-1.5">
                        <span>{msg.sender}</span>
                        <span>•</span>
                        <span>{new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isOutbound && (
                          <span className="text-emerald-400">({msg.deliveryStatus})</span>
                        )}
                      </div>

                      <div
                        className={`p-3.5 rounded-xl text-xs max-w-xl whitespace-pre-line leading-relaxed shadow-sm ${
                          isOutbound
                            ? "bg-crimson-950 text-slate-100 border border-crimson-900"
                            : "bg-obsidian-950 text-slate-200 border border-slate-800"
                        }`}
                      >
                        {msg.bodyText}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Composer */}
              <form
                onSubmit={handleSendReply}
                className="p-3 border-t border-slate-800 bg-obsidian-950 flex flex-col space-y-2"
              >
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type official reply from brilloevents@gmail.com..."
                  className="w-full px-3 py-2 bg-obsidian-900 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500 focus:border-gold-500 resize-none"
                />

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono">
                    Official correspondence archived into client history
                  </span>
                  <button
                    type="submit"
                    disabled={sending || !replyText.trim()}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-crimson-700 hover:bg-crimson-600 text-white flex items-center space-x-1.5 disabled:opacity-50 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{sending ? "Sending..." : "Send Reply"}</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-500 text-xs">
              Select an email thread from the left pane to view correspondence.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
