"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Lock,
  Smartphone,
  Copy,
  Check,
  ExternalLink,
  ArrowLeft,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XENDIT_PH_CHANNELS,
  XenditChannelConfig,
  XenditInvoiceResult,
  OWNER_GCASH_NUMBER,
  OWNER_GCASH_RAW,
} from "@/lib/xendit";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLocation?: "METRO_MANILA" | "PROVINCIAL";
}

export function BookingModal({
  isOpen,
  onClose,
  defaultLocation = "METRO_MANILA",
}: BookingModalProps) {
  const [isProvincial, setIsProvincial] = useState(defaultLocation === "PROVINCIAL");
  const [mallOrVenue, setMallOrVenue] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("4:00 PM - 8:00 PM (Standard 4-Hr Block)");

  // Xendit Payment Gateway State
  const [paymentOption, setPaymentOption] = useState<"DEPOSIT_50" | "FULL_100">("DEPOSIT_50");
  const [selectedChannel, setSelectedChannel] =
    useState<XenditChannelConfig["code"]>("GCASH");
  const [submitting, setSubmitting] = useState(false);
  const [bookingData, setBookingData] = useState<any | null>(null);
  const [xenditInvoice, setXenditInvoice] = useState<XenditInvoiceResult | null>(null);
  const [settlingPayment, setSettlingPayment] = useState(false);
  const [settledReceipt, setSettledReceipt] = useState<any | null>(null);
  const [payerReference, setPayerReference] = useState("");
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [customAccounts, setCustomAccounts] = useState<Record<string, string>>({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("brillo_xendit_accounts");
        if (saved) setCustomAccounts(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, [isOpen]);

  // Dynamic pricing calculations
  const baseRate = isProvincial ? 23400 : 18000;
  const depositAmount = baseRate * 0.5;
  const balanceAmount = baseRate * 0.5;
  const activePayableAmount = paymentOption === "FULL_100" ? baseRate : depositAmount;

  const activeChannelObj =
    XENDIT_PH_CHANNELS.find((c) => c.code === selectedChannel) || XENDIT_PH_CHANNELS[0];

  const displayAccountNumber =
    customAccounts[selectedChannel] || OWNER_GCASH_NUMBER;
  const displayAccountName =
    customAccounts.ACCOUNT_NAME || activeChannelObj.settlementAccountName;

  const handleCopyAccount = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(OWNER_GCASH_RAW);
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      // 1. Submit to Public Request Quote API
      const res = await fetch("/api/public/request-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: mallOrVenue || "Corporate Partner",
          contactPerson,
          email,
          phone,
          eventDate,
          mallOrVenue,
          locationCity: isProvincial ? "Provincial Venue" : "Metro Manila",
          isProvincial,
          clientQuotedAmount: baseRate,
          notes: `Slot: ${selectedSlot} | Xendit Gateway: ${selectedChannel} -> GCash ${OWNER_GCASH_NUMBER} (${paymentOption})`,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to create reservation");

      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(
            "brillo_last_booking",
            JSON.stringify({
              bookingId: data.bookingId,
              bookingNumber: data.bookingNumber,
              lookupToken: data.lookupToken,
              mallOrVenue,
              eventDate,
              baseRate,
            })
          );
        } catch {
          // ignore
        }
      }

      // 2. Trigger Documenso eSignature API Webhook
      fetch("/api/webhooks/documenso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "calendar.slot_selected",
          data: {
            bookingId: data.bookingId,
            bookingNumber: data.bookingNumber,
            clientName: mallOrVenue,
            mallBranch: mallOrVenue,
            eventDate,
            contractRate: baseRate,
            depositAmount,
            clientRepresentative: contactPerson,
          },
        }),
      }).catch((err) => console.warn("Documenso webhook dispatch warning:", err));

      // 3. Create Xendit Automatic Payment Gateway Invoice for GCash 0906 439 0028
      const storedSecretKey =
        typeof window !== "undefined"
          ? localStorage.getItem("brillo_xendit_secret_key") || undefined
          : undefined;

      const xenRes = await fetch("/api/xendit/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: data.bookingId,
          bookingNumber: data.bookingNumber,
          amount: activePayableAmount,
          payerEmail: email,
          payerName: contactPerson,
          payerPhone: phone,
          mallOrVenue,
          eventDate,
          preferredChannel: selectedChannel,
          paymentOption,
          secretKey: storedSecretKey,
        }),
      });

      const xenData = await xenRes.json();
      if (!xenData.success) {
        throw new Error(xenData.error || "Failed to initialize Xendit Payment Gateway");
      }

      setBookingData(data);
      setXenditInvoice(xenData.invoice);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSettleXenditPayment = async () => {
    if (!bookingData || !xenditInvoice) return;
    setSettlingPayment(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/xendit/checkout", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: bookingData.bookingId,
          bookingNumber: bookingData.bookingNumber,
          invoiceId: xenditInvoice.invoiceId,
          externalId: xenditInvoice.externalId,
          amount: activePayableAmount,
          channelCode: selectedChannel,
          paymentOption,
          payerReference: payerReference.trim() || undefined,
          mallOrVenue,
          payerName: contactPerson,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Payment verification failed");

      setSettledReceipt(data);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSettlingPayment(false);
    }
  };

  const handleResetAndClose = () => {
    setBookingData(null);
    setXenditInvoice(null);
    setSettledReceipt(null);
    setPayerReference("");
    onClose();
  };

  if (!isOpen) return null;

  const statusPortalUrl = bookingData
    ? `/request-status?token=${encodeURIComponent(
        bookingData.lookupToken
      )}&booking=${encodeURIComponent(bookingData.bookingNumber)}&amount=${baseRate}&venue=${encodeURIComponent(
        mallOrVenue
      )}`
    : "/request-status";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-2xl bg-[#18181B] border border-[#27272A] rounded-2xl shadow-2xl overflow-hidden relative my-auto"
        >
          {/* Modal Header */}
          <div className="p-5 sm:p-6 border-b border-[#27272A] flex items-center justify-between bg-[#121215]">
            <div>
              <div className="inline-flex items-center space-x-2 text-[11px] font-mono text-[#D4AF37] uppercase tracking-wider font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Xendit PH Gateway • Auto-GCash ({OWNER_GCASH_NUMBER})</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-headline font-black text-white mt-0.5">
                {settledReceipt
                  ? "GCash / Xendit Payment Verified!"
                  : xenditInvoice
                  ? `Automatic Payment to GCash (${OWNER_GCASH_NUMBER})`
                  : "Secure Your Corporate Santa Appearance"}
              </h2>
            </div>
            <button
              onClick={handleResetAndClose}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* STEP 3: SETTLED RECEIPT & CONFIRMED BOOKING */}
          {settledReceipt && bookingData ? (
            <div className="p-6 sm:p-8 space-y-6 text-center">
              <div className="w-16 h-16 rounded-full bg-[#22C55E]/15 border border-[#22C55E]/40 text-[#22C55E] flex items-center justify-center mx-auto shadow-electric-glow">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1.5">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] text-[11px] font-mono font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>PAID TO GCASH {OWNER_GCASH_NUMBER} • SLOT LOCKED</span>
                </div>
                <h3 className="text-2xl font-headline font-black text-white">
                  Corporate Santa Slot Officially Locked!
                </h3>
                <p className="text-xs text-zinc-300 max-w-md mx-auto leading-relaxed">
                  Booking Reference:{" "}
                  <strong className="font-mono text-[#D4AF37]">{bookingData.bookingNumber}</strong>
                  <br />
                  Payment settled via <strong className="text-white">{activeChannelObj.name}</strong>{" "}
                  directly to GCash <strong className="text-[#22C55E]">{OWNER_GCASH_NUMBER}</strong>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] text-left text-xs font-mono space-y-2 max-w-lg mx-auto">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Xendit Transaction Ref:</span>
                  <span className="text-[#22C55E] font-bold">{settledReceipt.referenceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Receiving GCash Account:</span>
                  <span className="text-[#22C55E] font-bold">{OWNER_GCASH_NUMBER}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Venue &amp; Date:</span>
                  <span className="text-white font-bold">
                    {mallOrVenue} • {eventDate}
                  </span>
                </div>
                <div className="flex justify-between border-t border-zinc-800 pt-2">
                  <span className="text-zinc-400">Amount Paid Now:</span>
                  <span className="text-base text-[#22C55E] font-bold">
                    ₱{activePayableAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Remaining Balance:</span>
                  <span className="text-[#D4AF37] font-bold">
                    ₱{(baseRate - activePayableAmount).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={statusPortalUrl}
                  className="px-6 py-3 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-zinc-950 font-headline font-bold text-xs uppercase tracking-wide transition shadow-electric-glow"
                >
                  Open Booking &amp; Payment Receipt Portal →
                </a>
                <button
                  onClick={handleResetAndClose}
                  className="px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs transition"
                >
                  Done &amp; Return to Page
                </button>
              </div>
            </div>
          ) : xenditInvoice && bookingData ? (
            /* STEP 2: ACTIVE XENDIT AUTOMATIC PAYMENT GATEWAY CHECKOUT (0906 439 0028) */
            <div className="p-5 sm:p-6 space-y-5">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-[#E11D48]/10 border border-[#E11D48]/30 text-[#E11D48] text-xs">
                  {errorMsg}
                </div>
              )}

              {/* Top Xendit Invoice Summary Bar */}
              <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-[#007DFE]/20 border border-[#007DFE]/40 text-blue-300 font-mono text-[10px] font-bold uppercase">
                      Auto-GCash: {OWNER_GCASH_NUMBER}
                    </span>
                    <span className="text-xs font-mono text-zinc-400">
                      Ref: <strong className="text-white">{xenditInvoice.externalId}</strong>
                    </span>
                  </div>
                  <div className="text-xs text-zinc-300 mt-1">
                    {mallOrVenue} •{" "}
                    <span className="text-[#D4AF37] font-mono">{bookingData.bookingNumber}</span>
                  </div>
                </div>
                <div className="sm:text-right font-mono">
                  <span className="text-[10px] text-zinc-400 uppercase block">
                    {paymentOption === "FULL_100" ? "100% Full Settlement" : "50% Downpayment"}
                  </span>
                  <span className="text-2xl font-black text-[#22C55E]">
                    ₱{activePayableAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Channel Switcher Tabs */}
              <div className="space-y-2">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                  Select Payment App (All Settle Automatically to GCash {OWNER_GCASH_NUMBER})
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {XENDIT_PH_CHANNELS.map((ch) => {
                    const isSelected = selectedChannel === ch.code;
                    return (
                      <button
                        key={ch.code}
                        type="button"
                        onClick={() => setSelectedChannel(ch.code)}
                        className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                          isSelected
                            ? "bg-zinc-900 border-[#22C55E] ring-1 ring-[#22C55E]"
                            : "bg-[#09090B] border-[#27272A] hover:border-zinc-700"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs font-headline font-bold text-white">
                            {ch.shortLabel}
                          </span>
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: ch.accentColor }}
                          />
                        </div>
                        <span className="text-[10px] text-zinc-400 mt-1 truncate">
                          → {OWNER_GCASH_NUMBER}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Channel Payment Panel */}
              <div className="p-4 sm:p-5 rounded-xl bg-[#09090B] border-2 border-[#007DFE]/60 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-headline font-black text-xs shrink-0"
                      style={{ backgroundColor: activeChannelObj.accentColor }}
                    >
                      {activeChannelObj.shortLabel.slice(0, 4).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-headline font-bold text-white">
                        {activeChannelObj.name}
                      </h4>
                      <p className="text-[11px] text-emerald-400 font-mono">
                        Receiving GCash Account: {OWNER_GCASH_NUMBER}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-[10px] font-mono text-[#D4AF37] font-bold self-start sm:self-center">
                    {OWNER_GCASH_NUMBER}
                  </span>
                </div>

                {/* QR Ph + Direct GCash 0906 439 0028 Details */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  {/* Left: Interactive QR Ph / GCash Scan Box */}
                  <div className="sm:col-span-5 flex flex-col items-center justify-center p-3.5 rounded-xl bg-white text-zinc-950 space-y-2 shadow-lg">
                    <div className="flex items-center justify-between w-full px-1">
                      <span className="text-[10px] font-mono font-extrabold tracking-tight text-[#007DFE]">
                        GCASH • QR Ph
                      </span>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {OWNER_GCASH_NUMBER}
                      </span>
                    </div>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                        xenditInvoice.qrPhPayload
                      )}`}
                      alt="Xendit GCash 0906 439 0028 QR Code"
                      className="w-32 h-32 object-contain rounded"
                    />
                    <div className="text-center">
                      <div className="text-[11px] font-extrabold text-zinc-900">
                        GCash: {OWNER_GCASH_NUMBER}
                      </div>
                      <div className="text-[9px] font-mono text-zinc-600">
                        Amount: ₱{activePayableAmount.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Right: Direct Settlement Account & Instructions */}
                  <div className="sm:col-span-7 space-y-3 text-xs">
                    <div className="p-3 rounded-lg bg-zinc-900/90 border border-zinc-800 space-y-1.5 font-mono">
                      <div className="text-[10px] text-zinc-400 uppercase">
                        Direct GCash Number (Send via GCash / BPI / BDO InstaPay):
                      </div>
                      <div className="flex items-center justify-between bg-[#09090B] px-3 py-2 rounded border border-[#007DFE]/50">
                        <div>
                          <div className="text-base font-black text-[#22C55E] tracking-wider">
                            {OWNER_GCASH_NUMBER}
                          </div>
                          <div className="text-[10px] text-zinc-400">{displayAccountName}</div>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyAccount}
                          className="px-2.5 py-1.5 rounded bg-[#007DFE] hover:bg-blue-600 text-white text-[10px] font-bold flex items-center space-x-1 transition"
                        >
                          {copiedAccount ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy {OWNER_GCASH_RAW}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <a
                      href="gcash://"
                      onClick={() => handleCopyAccount()}
                      className="w-full py-2.5 px-3 rounded-lg bg-[#007DFE] hover:bg-blue-600 text-white font-headline font-bold text-[11px] uppercase tracking-wider flex items-center justify-center space-x-1.5 transition"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Open GCash App &amp; Copy {OWNER_GCASH_NUMBER}</span>
                    </a>

                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">
                        Enter {activeChannelObj.shortLabel} Reference # (or click Confirm below):
                      </label>
                      <input
                        type="text"
                        placeholder={`e.g. GCash / ${activeChannelObj.shortLabel} Ref #`}
                        value={payerReference}
                        onChange={(e) => setPayerReference(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs font-mono placeholder-zinc-600 focus:outline-none focus:border-[#22C55E]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  disabled={settlingPayment}
                  onClick={handleSettleXenditPayment}
                  className="w-full py-4 px-6 rounded-xl font-headline font-black text-sm uppercase tracking-wider text-zinc-950 bg-[#22C55E] hover:bg-[#16A34A] shadow-electric-glow transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>
                    {settlingPayment
                      ? `VERIFYING PAYMENT TO ${OWNER_GCASH_NUMBER}...`
                      : `CONFIRM PAYMENT TO ${OWNER_GCASH_NUMBER} (₱${activePayableAmount.toLocaleString()}) →`}
                  </span>
                </button>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setXenditInvoice(null)}
                    className="inline-flex items-center space-x-1 text-zinc-400 hover:text-white transition"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Booking Details</span>
                  </button>

                  <a
                    href={statusPortalUrl}
                    className="text-[#D4AF37] hover:underline font-mono text-[11px]"
                  >
                    Open Full-Page Payment &amp; Status Portal →
                  </a>
                </div>
              </div>
            </div>
          ) : (
            /* STEP 1: BOOKING DETAILS + XENDIT CHANNEL SELECTION */
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-[#E11D48]/10 border border-[#E11D48]/30 text-[#E11D48] text-xs">
                  {errorMsg}
                </div>
              )}

              {/* Custom Tailwind Toggle Switch: Metro Manila vs Provincial */}
              <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-headline font-bold text-white block">
                      Select Deployment Territory
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      Provincial locations apply standard +30% logistics factor
                    </span>
                  </div>

                  {/* Toggle Switch */}
                  <div className="flex items-center p-1 rounded-xl bg-zinc-900 border border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setIsProvincial(false)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-headline font-bold transition ${
                        !isProvincial
                          ? "bg-[#22C55E] text-zinc-950 shadow-sm"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      Metro Manila
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsProvincial(true)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-headline font-bold transition ${
                        isProvincial
                          ? "bg-[#22C55E] text-zinc-950 shadow-sm"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      Provincial (+30%)
                    </button>
                  </div>
                </div>

                {/* Dynamic Price Display */}
                <div className="flex items-baseline justify-between pt-2 border-t border-zinc-800/80 text-xs font-mono">
                  <span className="text-zinc-400">Appearance Investment:</span>
                  <div className="text-right">
                    <span className="text-xl font-bold text-white">
                      ₱{baseRate.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-zinc-400 block">
                      50% Deposit: ₱{depositAmount.toLocaleString()} • Balance: ₱
                      {balanceAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Inputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">
                    Mall Branch or Company *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SM City Megamall"
                    value={mallOrVenue}
                    onChange={(e) => setMallOrVenue(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-[#09090B] border border-[#27272A] text-white placeholder-zinc-600 focus:outline-none focus:border-[#22C55E] transition"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">
                    Event Target Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#22C55E] transition"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">
                    Authorized Point Person *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Marketing Manager"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-[#09090B] border border-[#27272A] text-white placeholder-zinc-600 focus:outline-none focus:border-[#22C55E] transition"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">
                    Corporate Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="manager@smsupermalls.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-[#09090B] border border-[#27272A] text-white placeholder-zinc-600 focus:outline-none focus:border-[#22C55E] transition"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">
                    Mobile / Viber Hotline *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0917 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-[#09090B] border border-[#27272A] text-white placeholder-zinc-600 focus:outline-none focus:border-[#22C55E] transition"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">
                    Performance Time Slot
                  </label>
                  <select
                    value={selectedSlot}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#22C55E] transition"
                  >
                    <option>4:00 PM - 8:00 PM (Standard 4-Hr Block)</option>
                    <option>1:00 PM - 5:00 PM (Afternoon Shift)</option>
                    <option>5:00 PM - 9:00 PM (Evening Tree Lighting)</option>
                    <option>Full-Day Two-Shift (Custom Invoiced)</option>
                  </select>
                </div>
              </div>

              {/* Xendit Automatic Payment Gateway Selector */}
              <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <Lock className="w-3.5 h-3.5 text-[#22C55E]" />
                    <span className="text-xs font-headline font-bold text-white">
                      Automatic Payment Gateway → GCash ({OWNER_GCASH_NUMBER})
                    </span>
                  </div>

                  {/* 50% Deposit vs 100% Full Payment Toggle */}
                  <div className="inline-flex rounded-lg bg-zinc-900 p-0.5 border border-zinc-800 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setPaymentOption("DEPOSIT_50")}
                      className={`px-2.5 py-1 rounded-md font-mono font-bold transition ${
                        paymentOption === "DEPOSIT_50"
                          ? "bg-[#22C55E] text-zinc-950"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      50% Deposit (₱{depositAmount.toLocaleString()})
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentOption("FULL_100")}
                      className={`px-2.5 py-1 rounded-md font-mono font-bold transition ${
                        paymentOption === "FULL_100"
                          ? "bg-[#22C55E] text-zinc-950"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      100% Full (₱{baseRate.toLocaleString()})
                    </button>
                  </div>
                </div>

                {/* Payment Channel Pills: GCash, BPI, BDO, UnionBank, Maya, QR Ph, Card */}
                <div className="grid grid-cols-3 sm:grid-cols-7 gap-1.5">
                  {XENDIT_PH_CHANNELS.map((ch) => {
                    const active = selectedChannel === ch.code;
                    return (
                      <button
                        key={ch.code}
                        type="button"
                        onClick={() => setSelectedChannel(ch.code)}
                        className={`py-2 px-2 rounded-lg border text-center transition flex flex-col items-center justify-center ${
                          active
                            ? "bg-zinc-900 border-[#22C55E] text-white shadow-sm"
                            : "bg-zinc-950/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                        }`}
                      >
                        <span
                          className="w-2 h-2 rounded-full mb-1"
                          style={{ backgroundColor: ch.accentColor }}
                        />
                        <span className="text-[11px] font-headline font-bold leading-tight">
                          {ch.shortLabel.split(" ")[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 px-6 rounded-xl font-headline font-black text-sm uppercase tracking-wider text-zinc-950 bg-[#22C55E] hover:bg-[#16A34A] shadow-electric-glow transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <span>
                    {submitting
                      ? `OPENING ${activeChannelObj.shortLabel.toUpperCase()} GATEWAY (${OWNER_GCASH_NUMBER})...`
                      : `PAY VIA ${activeChannelObj.shortLabel.toUpperCase()} TO ${OWNER_GCASH_NUMBER} (₱${activePayableAmount.toLocaleString()}) →`}
                  </span>
                </button>
                <p className="text-center text-[10px] text-zinc-500 font-mono mt-2">
                  Automatic Xendit PH Payment to GCash ({OWNER_GCASH_NUMBER}), BPI &amp; Banks • Instant Slot Lock
                </p>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
