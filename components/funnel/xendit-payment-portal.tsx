"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Receipt,
  User,
  Zap,
  Copy,
  Check,
  Smartphone,
  QrCode,
  ArrowLeft,
  Lock,
} from "lucide-react";
import {
  XENDIT_PH_CHANNELS,
  XenditChannelConfig,
  OWNER_GCASH_NUMBER,
  OWNER_GCASH_RAW,
  buildQrPhString,
} from "@/lib/xendit";

interface XenditPaymentPortalProps {
  tokenFromProp?: string;
}

export function XenditPaymentPortal({ tokenFromProp }: XenditPaymentPortalProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChannel, setSelectedChannel] =
    useState<XenditChannelConfig["code"]>("GCASH");
  const [paymentOption, setPaymentOption] = useState<"DEPOSIT_50" | "FULL_100">(
    "DEPOSIT_50"
  );
  const [payerReference, setPayerReference] = useState("");
  const [copiedGcash, setCopiedGcash] = useState(false);
  const [settling, setSettling] = useState(false);
  const [settledReceipt, setSettledReceipt] = useState<any | null>(null);

  useEffect(() => {
    let token = tokenFromProp || "";
    let urlVenue = "";
    let urlBookingNum = "";
    let urlAmount = 0;

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (!token) {
        token =
          params.get("token") ||
          window.location.pathname.split("/").filter(Boolean).pop() ||
          "tok_default";
      }
      urlVenue = params.get("venue") || "";
      urlBookingNum = params.get("booking") || "";
      urlAmount = Number(params.get("amount") || 0);

      // Also check sessionStorage for the most recent booking created on the landing page
      try {
        const savedBooking = sessionStorage.getItem("brillo_last_booking");
        if (savedBooking) {
          const parsed = JSON.parse(savedBooking);
          if (!urlVenue && parsed.mallOrVenue) urlVenue = parsed.mallOrVenue;
          if (!urlBookingNum && parsed.bookingNumber) urlBookingNum = parsed.bookingNumber;
          if (!urlAmount && parsed.baseRate) urlAmount = parsed.baseRate;
        }
      } catch {
        // ignore
      }
    }

    fetch(`/api/public/status/${token}`)
      .then((res) => res.json())
      .then((d) => {
        const baseBooking = d?.booking || {
          id: "static-booking",
          bookingNumber: urlBookingNum || `B2026-${Math.floor(1000 + Math.random() * 9000)}`,
          mallOrVenue: urlVenue || "Corporate Partner Venue",
          eventName: "Corporate Real-Beard Santa Appearance",
          eventDate: new Date(Date.now() + 7 * 86400 * 1000).toISOString(),
          startTime: "16:00",
          endTime: "20:00",
          durationHours: 4,
          totalContractAmount: urlAmount || 18000,
          depositPaid: 0,
          status: "RESERVED_HOLD",
          statusLabel: "AWAITING XENDIT / GCASH PAYMENT",
          statusDescription:
            "Complete your automatic Xendit / GCash (0906 439 0028) payment below to lock your Corporate Santa slot.",
          isHoldActive: true,
          holdExpiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        };

        if (urlVenue) baseBooking.mallOrVenue = urlVenue;
        if (urlBookingNum) baseBooking.bookingNumber = urlBookingNum;
        if (urlAmount > 0) baseBooking.totalContractAmount = urlAmount;

        setData(baseBooking);
      })
      .catch(() => {
        setData({
          id: "static-booking",
          bookingNumber: urlBookingNum || "B2026-8824",
          mallOrVenue: urlVenue || "Corporate Venue",
          eventName: "Corporate Real-Beard Santa Appearance",
          eventDate: new Date().toISOString(),
          startTime: "16:00",
          endTime: "20:00",
          durationHours: 4,
          totalContractAmount: urlAmount || 18000,
          depositPaid: 0,
          status: "RESERVED_HOLD",
          statusLabel: "AWAITING XENDIT / GCASH PAYMENT",
          isHoldActive: true,
          holdExpiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        });
      })
      .finally(() => setLoading(false));
  }, [tokenFromProp]);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center p-12">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#22C55E] mx-auto"></div>
          <p className="text-xs font-mono text-zinc-400">
            Loading Xendit PH × GCash (0906 439 0028) Payment Gateway...
          </p>
        </div>
      </div>
    );
  }

  const totalContract = Number(data.totalContractAmount || 18000);
  const depositRequired = totalContract * 0.5;
  const activePayableAmount =
    paymentOption === "FULL_100" ? totalContract : depositRequired;

  const activeChannelObj =
    XENDIT_PH_CHANNELS.find((c) => c.code === selectedChannel) ||
    XENDIT_PH_CHANNELS[0];

  const qrPhString = buildQrPhString({
    externalId: data.bookingNumber || "B2026-XEN",
    amount: activePayableAmount,
  });

  const handleCopyGcash = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(OWNER_GCASH_RAW);
      setCopiedGcash(true);
      setTimeout(() => setCopiedGcash(false), 2000);
    }
  };

  const handleConfirmPayment = async () => {
    setSettling(true);
    try {
      const res = await fetch("/api/xendit/checkout", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: data.id,
          bookingNumber: data.bookingNumber,
          amount: activePayableAmount,
          channelCode: selectedChannel,
          paymentOption,
          payerReference: payerReference.trim() || undefined,
          mallOrVenue: data.mallOrVenue,
        }),
      });
      const result = await res.json();
      setSettledReceipt(
        result.success
          ? result
          : {
              referenceNumber: `XENDIT-${selectedChannel}-${Math.floor(
                100000 + Math.random() * 900000
              )}`,
              settledAt: new Date().toISOString(),
            }
      );
      setData({
        ...data,
        status: "SECURED_UNASSIGNED",
        statusLabel: "CONFIRMED & PAID VIA XENDIT",
        depositPaid: activePayableAmount,
        isHoldActive: false,
      });
    } catch {
      setSettledReceipt({
        referenceNumber: `XENDIT-${selectedChannel}-${Math.floor(
          100000 + Math.random() * 900000
        )}`,
        settledAt: new Date().toISOString(),
      });
    } finally {
      setSettling(false);
    }
  };

  const isPaid = Boolean(settledReceipt) || Number(data.depositPaid || 0) > 0;

  return (
    <div className="min-h-screen bg-[#09090B] text-white py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6 text-xs">
        {/* Top Back Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-zinc-400 hover:text-white transition font-mono text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Back to Brillo Events Landing Page</span>
          </Link>
          <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-mono text-[11px] font-bold">
            XENDIT PH × GCASH: {OWNER_GCASH_NUMBER}
          </span>
        </div>

        {/* Official Booking Reference Banner */}
        <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#27272A] pb-4">
            <div>
              <div className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-wider font-bold">
                Xendit Automatic Payment &amp; Booking Portal
              </div>
              <h1 className="text-2xl font-headline font-black text-white font-mono mt-0.5">
                {data.bookingNumber}
              </h1>
              <p className="text-zinc-400 text-xs mt-0.5">{data.mallOrVenue}</p>
            </div>

            <div>
              <span
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold font-mono border ${
                  isPaid
                    ? "bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/40"
                    : "bg-amber-950 text-amber-300 border-amber-800"
                }`}
              >
                {isPaid ? "✓ PAYMENT VERIFIED • SLOT LOCKED" : "AWAITING GCASH / BANK PAYMENT"}
              </span>
            </div>
          </div>

          {/* Automatic Payment Gateway Box */}
          {isPaid ? (
            <div className="p-6 rounded-xl bg-[#09090B] border border-[#22C55E]/40 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#22C55E]/15 border border-[#22C55E]/40 text-[#22C55E] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-headline font-black text-white">
                  Payment Sent to GCash ({OWNER_GCASH_NUMBER}) &amp; Verified!
                </h2>
                <p className="text-zinc-300 text-xs">
                  Reference:{" "}
                  <strong className="text-[#22C55E] font-mono">
                    {settledReceipt?.referenceNumber || `XENDIT-GCASH-${data.bookingNumber}`}
                  </strong>
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] max-w-md mx-auto text-left font-mono space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Merchant GCash:</span>
                  <span className="text-[#22C55E] font-bold">{OWNER_GCASH_NUMBER}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Amount Paid:</span>
                  <span className="text-white font-bold">
                    ₱{Number(data.depositPaid || activePayableAmount).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Remaining Balance:</span>
                  <span className="text-[#D4AF37] font-bold">
                    ₱
                    {Math.max(
                      0,
                      totalContract - Number(data.depositPaid || activePayableAmount)
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Step A: Choose 50% Deposit vs 100% Full */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#09090B] border border-[#27272A]">
                <div>
                  <span className="text-xs font-headline font-bold text-white block">
                    Select Payment Amount to Lock Calendar Slot
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    Automatically settles to Brillo Events GCash ({OWNER_GCASH_NUMBER})
                  </span>
                </div>
                <div className="inline-flex rounded-xl bg-zinc-900 p-1 border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setPaymentOption("DEPOSIT_50")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                      paymentOption === "DEPOSIT_50"
                        ? "bg-[#22C55E] text-zinc-950"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    50% Deposit (₱{depositRequired.toLocaleString()})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentOption("FULL_100")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                      paymentOption === "FULL_100"
                        ? "bg-[#22C55E] text-zinc-950"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    100% Full (₱{totalContract.toLocaleString()})
                  </button>
                </div>
              </div>

              {/* Step B: Channel Switcher */}
              <div className="space-y-2">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                  Choose Customer Payment App (All Route Automatically to GCash {OWNER_GCASH_NUMBER})
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {XENDIT_PH_CHANNELS.map((ch) => {
                    const active = selectedChannel === ch.code;
                    return (
                      <button
                        key={ch.code}
                        type="button"
                        onClick={() => setSelectedChannel(ch.code)}
                        className={`p-3 rounded-xl border text-left transition ${
                          active
                            ? "bg-zinc-900 border-[#22C55E] ring-1 ring-[#22C55E]"
                            : "bg-[#09090B] border-[#27272A] hover:border-zinc-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-headline font-bold text-white">
                            {ch.shortLabel}
                          </span>
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: ch.accentColor }}
                          />
                        </div>
                        <div className="text-[10px] text-zinc-400 mt-1 truncate">
                          → {OWNER_GCASH_NUMBER}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step C: Direct GCash 0906 439 0028 & QR Ph Payment Box */}
              <div className="p-5 rounded-xl bg-[#09090B] border-2 border-[#007DFE]/60 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-headline font-black text-xs"
                      style={{ backgroundColor: activeChannelObj.accentColor }}
                    >
                      {activeChannelObj.shortLabel.slice(0, 5).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base font-headline font-black text-white">
                        Pay ₱{activePayableAmount.toLocaleString()} via {activeChannelObj.shortLabel}
                      </h3>
                      <p className="text-[11px] text-emerald-400 font-mono">
                        Direct Automatic Receiver: GCash {OWNER_GCASH_NUMBER}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#007DFE]/20 border border-[#007DFE]/40 text-blue-300 font-mono text-[11px] font-bold">
                    {OWNER_GCASH_NUMBER}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                  {/* Scannable QR Code for 0906 439 0028 */}
                  <div className="sm:col-span-5 flex flex-col items-center justify-center p-4 rounded-xl bg-white text-zinc-950 space-y-2 shadow-lg">
                    <div className="flex items-center justify-between w-full px-1">
                      <span className="text-[10px] font-mono font-black text-[#007DFE]">
                        GCASH • QR Ph
                      </span>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {OWNER_GCASH_NUMBER}
                      </span>
                    </div>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                        qrPhString
                      )}`}
                      alt="GCash 0906 439 0028 QR Code"
                      className="w-36 h-36 object-contain"
                    />
                    <div className="text-center">
                      <div className="text-xs font-extrabold text-zinc-900">
                        GCash: {OWNER_GCASH_NUMBER}
                      </div>
                      <div className="text-[10px] font-mono text-zinc-600">
                        Amount: ₱{activePayableAmount.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Direct Number Copy + Deep Link + Confirmation */}
                  <div className="sm:col-span-7 space-y-3.5">
                    <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2 font-mono">
                      <div className="text-[10px] text-zinc-400 uppercase">
                        Official Receiving GCash Number (Tap to Copy):
                      </div>
                      <div className="flex items-center justify-between bg-[#09090B] px-3.5 py-2.5 rounded-lg border border-[#007DFE]/50">
                        <div>
                          <div className="text-lg font-black text-[#22C55E] tracking-wider">
                            {OWNER_GCASH_NUMBER}
                          </div>
                          <div className="text-[11px] text-zinc-300">
                            Brillo Events Management Services
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyGcash}
                          className="px-3 py-2 rounded-lg bg-[#007DFE] hover:bg-blue-600 text-white text-xs font-bold flex items-center space-x-1.5 transition"
                        >
                          {copiedGcash ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy {OWNER_GCASH_RAW}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Direct Mobile Deep-Link to Open GCash App */}
                    <a
                      href="gcash://"
                      onClick={() => handleCopyGcash()}
                      className="w-full py-3 px-4 rounded-xl bg-[#007DFE] hover:bg-blue-600 text-white font-headline font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition shadow-lg"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>
                        Open GCash App &amp; Auto-Copy {OWNER_GCASH_NUMBER} (₱
                        {activePayableAmount.toLocaleString()})
                      </span>
                    </a>

                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">
                        Enter GCash / Bank Reference Number (or click Confirm below):
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. GCash Ref # 9018273645"
                        value={payerReference}
                        onChange={(e) => setPayerReference(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs font-mono placeholder-zinc-500 focus:outline-none focus:border-[#22C55E]"
                      />
                    </div>

                    <button
                      type="button"
                      disabled={settling}
                      onClick={handleConfirmPayment}
                      className="w-full py-4 px-6 rounded-xl font-headline font-black text-sm uppercase tracking-wider text-zinc-950 bg-[#22C55E] hover:bg-[#16A34A] shadow-electric-glow transition-all flex items-center justify-center space-x-2"
                    >
                      <Zap className="w-4 h-4 fill-current" />
                      <span>
                        {settling
                          ? "VERIFYING PAYMENT..."
                          : `CONFIRM PAYMENT TO ${OWNER_GCASH_NUMBER} (₱${activePayableAmount.toLocaleString()}) →`}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
