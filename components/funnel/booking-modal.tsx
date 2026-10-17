"use client";

import React, { useState } from "react";
import { X, Calendar, MapPin, Building2, User, Phone, CheckCircle2, ShieldCheck, Sparkles, Clock, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [clientName, setClientName] = useState("");
  const [mallOrVenue, setMallOrVenue] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("4:00 PM - 8:00 PM (Standard 4-Hr Block)");
  const [submitting, setSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Dynamic pricing calculations
  const baseRate = isProvincial ? 23400 : 18000;
  const depositAmount = baseRate * 0.5;
  const balanceAmount = baseRate * 0.5;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      // 1. Submit to Public Request Quote API (persisting lead and booking)
      const res = await fetch("/api/public/request-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: clientName || "Corporate Partner",
          contactPerson,
          email,
          phone,
          eventDate,
          mallOrVenue,
          locationCity: isProvincial ? "Provincial Venue" : "Metro Manila",
          isProvincial,
          clientQuotedAmount: baseRate,
          notes: `Slot: ${selectedSlot} | Source: Direct Response B2B Funnel`,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to create reservation");

      // 2. Trigger Documenso eSignature API Webhook
      await fetch("/api/webhooks/documenso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "calendar.slot_selected",
          data: {
            bookingId: data.bookingId,
            bookingNumber: data.bookingNumber,
            clientName,
            mallBranch: mallOrVenue,
            eventDate,
            contractRate: baseRate,
            depositAmount,
            clientRepresentative: contactPerson,
          },
        }),
      }).catch((err) => console.warn("Documenso webhook dispatch warning:", err));

      setSuccessResult(data);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-2xl bg-[#18181B] border border-[#27272A] rounded-2xl shadow-2xl overflow-hidden relative"
        >
          {/* Modal Header */}
          <div className="p-6 border-b border-[#27272A] flex items-center justify-between">
            <div>
              <div className="inline-flex items-center space-x-1.5 text-[11px] font-mono text-[#D4AF37] uppercase tracking-wider font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Cal.com Scheduling Pipeline</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-headline font-black text-white mt-0.5">
                Secure Your Corporate Santa Appearance
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {successResult ? (
            /* Success State */
            <div className="p-8 space-y-6 text-center">
              <div className="w-16 h-16 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-headline font-bold text-white">
                  24-Hour Temporary Hold Active!
                </h3>
                <p className="text-xs text-zinc-300 max-w-md mx-auto leading-relaxed">
                  Booking Reference: <strong className="font-mono text-[#D4AF37]">{successResult.bookingNumber}</strong>
                  <br />
                  Your slot has been temporarily reserved on our master calendar. The formal SM / Corporate Agreement is prepared.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] text-left text-xs font-mono space-y-1.5 max-w-md mx-auto">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Venue:</span>
                  <span className="text-white font-bold">{mallOrVenue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Investment:</span>
                  <span className="text-[#22C55E] font-bold">₱{baseRate.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">50% Deposit to Confirm:</span>
                  <span className="text-white font-bold">₱{depositAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Hold Window:</span>
                  <span className="text-[#D4AF37] font-bold">Expires in 24 Hours</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={`/request-status/${successResult.lookupToken}`}
                  className="px-6 py-3 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-zinc-950 font-headline font-bold text-xs uppercase tracking-wide transition shadow-electric-glow"
                >
                  Track Status &amp; Upload Deposit Slip →
                </a>
                <button
                  onClick={onClose}
                  className="px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs transition"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            /* Form State */
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
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
                      50% Deposit: ₱{depositAmount.toLocaleString()} • Balance: ₱{balanceAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Inputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
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

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 px-6 rounded-xl font-headline font-black text-sm uppercase tracking-wider text-zinc-950 bg-[#22C55E] hover:bg-[#16A34A] shadow-electric-glow transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <span>
                    {submitting ? "SECURING 24-HOUR CALENDAR HOLD..." : "LOCK 24-HOUR CALENDAR HOLD →"}
                  </span>
                </button>
                <p className="text-center text-[10px] text-zinc-500 font-mono mt-2">
                  Automatic Cal.com slot check • SM Supermalls Framework Agreement triggered
                </p>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
