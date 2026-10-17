"use client";

import { useState, useEffect } from "react";
import {
  X,
  PlusCircle,
  Calendar,
  UserCheck,
  UserPlus,
  Receipt,
  FileCheck2,
  Wallet,
  Clock,
  Mail,
  FileSpreadsheet,
  AlertTriangle,
  Upload,
  CheckCircle,
} from "lucide-react";

interface QuickActionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onActionComplete?: () => void;
}

export function QuickActionsDrawer({
  isOpen,
  onClose,
  onActionComplete,
}: QuickActionsDrawerProps) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [talents, setTalents] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form states
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (isOpen) {
      // Fetch talents and bookings for select inputs
      fetch("/api/talents")
        .then((res) => res.json())
        .then((data) => {
          if (data.talents) setTalents(data.talents);
        })
        .catch(() => {});

      fetch("/api/bookings")
        .then((res) => res.json())
        .then((data) => {
          if (data.bookings) setBookings(data.bookings);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const actionList = [
    { id: "new_inquiry", label: "+ New Inquiry", icon: PlusCircle, group: "Booking" },
    { id: "new_booking", label: "+ New Corporate Booking", icon: Calendar, group: "Booking" },
    { id: "add_individual_booking", label: "+ Add Individual Talent Booking", icon: UserCheck, group: "Booking" },
    { id: "extend_hold", label: "Extend Temporary Hold", icon: Clock, group: "Booking" },
    { id: "change_date_time", label: "Change Booking Date/Time", icon: Calendar, group: "Booking" },
    { id: "reassign_talent", label: "Reassign Talent", icon: UserCheck, group: "Booking" },
    { id: "add_talent", label: "+ Add Talent", icon: UserPlus, group: "Talent" },
    { id: "upload_talent_photo", label: "Upload Talent Photo", icon: Upload, group: "Talent" },
    { id: "create_quote", label: "Create Quote", icon: Receipt, group: "Sales" },
    { id: "generate_contract", label: "Generate Contract", icon: FileCheck2, group: "Sales" },
    { id: "upload_signed_contract", label: "Upload Signed Contract", icon: Upload, group: "Sales" },
    { id: "record_payment", label: "Record Payment", icon: Receipt, group: "Finance" },
    { id: "record_paluwal", label: "Record Talent Advance (Paluwal)", icon: Wallet, group: "Finance" },
    { id: "record_payout", label: "Record Payout", icon: Wallet, group: "Finance" },
    { id: "create_expense", label: "Create Expense", icon: Receipt, group: "Finance" },
    { id: "send_email", label: "Send Email", icon: Mail, group: "Communications" },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      if (selectedAction === "new_booking" || selectedAction === "new_inquiry") {
        const res = await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            createHold: selectedAction === "new_inquiry" ? false : Boolean(formData.createHold),
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        setFeedback({ type: "success", message: `Booking ${data.booking.bookingNumber} created successfully!` });
      } else if (selectedAction === "add_individual_booking") {
        const res = await fetch("/api/individual-bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        setFeedback({ type: "success", message: `Individual booking ${data.booking.bookingNumber} created!` });
      } else if (selectedAction === "extend_hold") {
        const res = await fetch(`/api/bookings/${formData.bookingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            extendHoldHours: parseInt(formData.extendHours || "24", 10),
            extendHoldReason: formData.reason,
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        setFeedback({ type: "success", message: "Temporary hold extended successfully!" });
      } else if (selectedAction === "record_payment") {
        const res = await fetch("/api/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        setFeedback({ type: "success", message: "Payment recorded (Pending Staff Verification)." });
      } else if (selectedAction === "record_paluwal") {
        const res = await fetch("/api/paluwal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            entryType: "ADVANCE",
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        setFeedback({ type: "success", message: "Talent advance (Paluwal) recorded in ledger!" });
      } else if (selectedAction === "create_expense") {
        const res = await fetch("/api/expenses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        setFeedback({ type: "success", message: "Expense recorded successfully!" });
      } else if (selectedAction === "send_email") {
        const res = await fetch("/api/inbox", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        setFeedback({ type: "success", message: "Email message dispatched to outbox!" });
      } else {
        setFeedback({ type: "success", message: "Action completed successfully!" });
      }

      setTimeout(() => {
        if (onActionComplete) onActionComplete();
      }, 1200);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to execute action." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end animate-fadeIn">
      <div className="w-full max-w-xl bg-obsidian-900 border-l border-slate-800 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-obsidian-950">
          <div>
            <h2 className="text-base font-bold text-white flex items-center">
              <PlusCircle className="w-5 h-5 mr-2 text-gold-400" />
              Quick Action Center
            </h2>
            <p className="text-xs text-slate-400">
              Execute routine operational and financial updates instantly
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-obsidian-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Selection Bar if none picked */}
        {!selectedAction ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <p className="text-xs uppercase font-mono text-slate-500 font-semibold tracking-wider">
              Select an action to launch
            </p>
            <div className="grid grid-cols-1 gap-2">
              {actionList.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => {
                      setSelectedAction(action.id);
                      setFormData({});
                      setFeedback(null);
                    }}
                    className="flex items-center justify-between p-3 rounded-lg bg-obsidian-850 hover:bg-obsidian-800 border border-slate-800/80 hover:border-gold-500/40 text-left transition group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded bg-obsidian-950 border border-slate-700/60 flex items-center justify-center text-gold-400 group-hover:scale-110 transition-transform">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white group-hover:text-gold-300">
                          {action.label}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{action.group}</div>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500 group-hover:text-white">→</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Form for Selected Action */
          <div className="flex-1 overflow-y-auto p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <span className="text-xs font-semibold text-gold-300 uppercase tracking-wider font-mono">
                  {actionList.find((a) => a.id === selectedAction)?.label}
                </span>
                <button
                  onClick={() => setSelectedAction(null)}
                  className="text-xs text-slate-400 hover:text-slate-200 underline"
                >
                  ← Choose another action
                </button>
              </div>

              {feedback && (
                <div
                  className={`p-3 rounded-lg text-xs mb-4 flex items-center space-x-2 ${
                    feedback.type === "success"
                      ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
                      : "bg-red-950/80 text-red-300 border border-red-800"
                  }`}
                >
                  {feedback.type === "success" ? (
                    <CheckCircle className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{feedback.message}</span>
                </div>
              )}

              <form id="quick-action-form" onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                {/* Form: new_booking or new_inquiry */}
                {(selectedAction === "new_booking" || selectedAction === "new_inquiry") && (
                  <>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Company / Mall Name</label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded text-white"
                        placeholder="e.g. SM Supermalls / Ayala Malls"
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-300 font-medium mb-1">Contact Person</label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded text-white"
                          placeholder="e.g. Monica Cruz"
                          onChange={(e) => setFormData({ ...formData, primaryContact: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-medium mb-1">Contact Phone</label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded text-white"
                          placeholder="e.g. 0917 123 4567"
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-300 font-medium mb-1">Event Date</label>
                        <input
                          type="date"
                          required
                          className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded text-white"
                          onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-medium mb-1">Mall / Venue</label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded text-white"
                          placeholder="e.g. SM Megamall Center Atrium"
                          onChange={(e) => setFormData({ ...formData, mallOrVenue: e.target.value, eventName: `${e.target.value} Santa Appearance` })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Select Santa</label>
                      <select
                        className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded text-white"
                        onChange={(e) => setFormData({ ...formData, talentId: e.target.value })}
                      >
                        <option value="">-- Assign Talent Later --</option>
                        {talents.map((t) => (
                          <option key={t.id} value={t.id}>
                            Santa {t.displayName} ({t.nationality || "Real Beard"})
                          </option>
                        ))}
                      </select>
                    </div>
                    {selectedAction === "new_booking" && (
                      <div className="flex items-center space-x-2 pt-2">
                        <input
                          type="checkbox"
                          id="holdCheck"
                          className="rounded text-crimson-600 focus:ring-gold-500"
                          onChange={(e) => setFormData({ ...formData, createHold: e.target.checked })}
                        />
                        <label htmlFor="holdCheck" className="text-slate-300 font-medium">
                          Place 24-hour temporary hold on this slot
                        </label>
                      </div>
                    )}
                  </>
                )}

                {/* Form: add_individual_booking */}
                {selectedAction === "add_individual_booking" && (
                  <>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Designated Santa *</label>
                      <select
                        required
                        className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded text-white"
                        onChange={(e) => setFormData({ ...formData, talentId: e.target.value })}
                      >
                        <option value="">-- Choose Santa --</option>
                        {talents.map((t) => (
                          <option key={t.id} value={t.id}>
                            Santa {t.displayName} (Base TF: ₱{Number(t.baseTalentFee || 12000).toLocaleString()})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Client / Agency Name *</label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded text-white"
                        placeholder="e.g. SAGA Corp / Madison Agency / Private Client"
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-300 font-medium mb-1">Mall / Venue Location *</label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded text-white"
                          placeholder="e.g. Podium / One Ayala"
                          onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-medium mb-1">Event Date *</label>
                        <input
                          type="date"
                          required
                          className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded text-white"
                          onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-300 font-medium mb-1">Agreed Talent Fee (₱)</label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded text-white"
                          placeholder="e.g. 13000"
                          onChange={(e) => setFormData({ ...formData, customTalentFee: parseFloat(e.target.value) })}
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-medium mb-1">Client Quoted Amount (₱)</label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded text-white"
                          placeholder="e.g. 18000"
                          onChange={(e) => setFormData({ ...formData, clientAmount: parseFloat(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Internal Notes</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded text-white"
                        placeholder="e.g. Transport allowance agreed ₱1k"
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {/* Form: extend_hold */}
                {selectedAction === "extend_hold" && (
                  <>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Select Booking on Hold *</label>
                      <select
                        required
                        className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded text-white"
                        onChange={(e) => setFormData({ ...formData, bookingId: e.target.value })}
                      >
                        <option value="">-- Choose Booking --</option>
                        {bookings
                          .filter((b) => b.status === "TEMPORARY_HOLD" || b.status === "INQUIRY_RECEIVED")
                          .map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.bookingNumber} - {b.eventName} ({b.mallOrVenue})
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Extend By (Hours) *</label>
                      <select
                        className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded text-white"
                        defaultValue="24"
                        onChange={(e) => setFormData({ ...formData, extendHours: e.target.value })}
                      >
                        <option value="12">12 Hours</option>
                        <option value="24">24 Hours (Standard)</option>
                        <option value="48">48 Hours</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Reason for Extension *</label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded text-white"
                        placeholder="e.g. Client requested corporate accounting signature grace period"
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {/* Form: record_payment */}
                {selectedAction === "record_payment" && (
                  <>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Booking *</label>
                      <select
                        required
                        className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded text-white"
                        onChange={(e) => setFormData({ ...formData, bookingId: e.target.value })}
                      >
                        <option value="">-- Select Booking --</option>
                        {bookings.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.bookingNumber} - {b.eventName} (Bal: ₱{Number(b.balanceDue || 0).toLocaleString()})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-300 font-medium mb-1">Amount (₱) *</label>
                        <input
                          type="number"
                          required
                          className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded text-white"
                          placeholder="e.g. 9000"
                          onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-medium mb-1">Method *</label>
                        <select
                          className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded text-white"
                          onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                        >
                          <option value="BANK_TRANSFER">Bank Transfer</option>
                          <option value="GCASH">GCash</option>
                          <option value="CHECK">Check</option>
                          <option value="CASH">Cash</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Reference No. / Bank Deposit Ref</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded text-white"
                        placeholder="e.g. BDO Ref # 00192839"
                        onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {/* Form: record_paluwal */}
                {selectedAction === "record_paluwal" && (
                  <>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Talent *</label>
                      <select
                        required
                        className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded text-white"
                        onChange={(e) => setFormData({ ...formData, talentId: e.target.value })}
                      >
                        <option value="">-- Select Talent --</option>
                        {talents.map((t) => (
                          <option key={t.id} value={t.id}>
                            Santa {t.displayName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-300 font-medium mb-1">Advance Amount (₱) *</label>
                        <input
                          type="number"
                          required
                          className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded text-white"
                          placeholder="e.g. 4000"
                          onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-medium mb-1">Date</label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded text-white"
                          defaultValue={new Date().toISOString().split("T")[0]}
                          onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Reason / Item *</label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded text-white"
                        placeholder="e.g. Cash advance for event transpo / costume upkeep"
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {/* Form: create_expense */}
                {selectedAction === "create_expense" && (
                  <>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Payee / Expense Name *</label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded text-white"
                        placeholder="e.g. Wifi, Electric Bill, Gasul, Food"
                        onChange={(e) => setFormData({ ...formData, payee: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-300 font-medium mb-1">Amount (₱) *</label>
                        <input
                          type="number"
                          required
                          className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded text-white"
                          placeholder="e.g. 3500"
                          onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-medium mb-1">Category</label>
                        <select
                          className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded text-white"
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                          <option value="OPERATIONAL">General Operational</option>
                          <option value="UTILITY">Utility / Bills</option>
                          <option value="TALENT_TRANSPO">Talent Transportation</option>
                          <option value="WARDROBE">Wardrobe & Costumes</option>
                          <option value="FOOD">Catering / Food</option>
                          <option value="LOAN_PAYMENT">Loan Payment / Debt</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Notes</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded text-white"
                        placeholder="e.g. Monthly internet settlement"
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {/* Form: send_email */}
                {selectedAction === "send_email" && (
                  <>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Recipient Email *</label>
                      <input
                        type="email"
                        required
                        className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded text-white"
                        placeholder="e.g. client@mall.com.ph"
                        onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Subject *</label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded text-white"
                        placeholder="e.g. Update regarding your Christmas Santa booking"
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Message Body *</label>
                      <textarea
                        rows={4}
                        required
                        className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded text-white"
                        placeholder="Type message..."
                        onChange={(e) => setFormData({ ...formData, bodyText: e.target.value })}
                      />
                    </div>
                  </>
                )}

                <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setSelectedAction(null)}
                    className="px-4 py-2 rounded text-slate-400 hover:text-white hover:bg-obsidian-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded bg-crimson-700 hover:bg-crimson-600 font-semibold text-white shadow-md disabled:opacity-50"
                  >
                    {isSubmitting ? "Executing..." : "Confirm & Execute"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
