"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  ArrowRight,
  X,
  List,
  KanbanSquare,
  Calendar,
  Pencil,
  Trash2,
  Tag,
  Clock,
  CheckCircle2,
  Sparkles,
  Calculator,
  ExternalLink,
} from "lucide-react";
import {
  normalizeToLifecycleState,
  LIFECYCLE_METADATA,
} from "@/lib/booking-state-machine";
import {
  SANTA_EVENT_ACTIVITIES,
  calculateSantaPackageQuote,
  SantaBeardTier,
  SantaRateTerritory,
  SantaEventActivityTag,
} from "@/lib/costing";

function extractLeadTagsAndMeta(lead: any) {
  let meta: any = lead.ledgerMeta || {};
  if (
    !lead.ledgerMeta &&
    typeof lead.internalNotes === "string" &&
    lead.internalNotes.includes("||LEDGER_META:")
  ) {
    try {
      meta = JSON.parse(lead.internalNotes.split("||LEDGER_META:")[1]);
    } catch {}
  }

  const santaTier: SantaBeardTier =
    meta.santaTier === "FAKE_BEARD" ||
    (lead.specialRequests || "").toLowerCase().includes("fake beard")
      ? "FAKE_BEARD"
      : "REAL_BEARD";

  let rateTerritory: SantaRateTerritory = meta.rateTerritory || "METRO_MANILA";
  if (!meta.rateTerritory) {
    if (lead.isHoliday) rateTerritory = "HOLIDAY";
    else if (lead.isProvincial) rateTerritory = "OUT_OF_TOWN";
  }

  const eventActivityTag: SantaEventActivityTag =
    meta.eventActivityTag ||
    ((lead.bookingType || "").toUpperCase().includes("PRIVATE")
      ? "PRIVATE_PARTY"
      : (lead.eventName || "").toLowerCase().includes("photo")
      ? "PHOTO_SHOOT"
      : (lead.eventName || "").toLowerCase().includes("launch")
      ? "CHRISTMAS_LAUNCH"
      : "MEET_AND_GREET");

  const durationHours = Number(meta.durationHours || lead.durationHours || 3);
  const pkg = calculateSantaPackageQuote({
    santaTier,
    rateTerritory,
    durationHours,
    eventActivityTag,
  });

  const quotedAmount = Number(
    lead.totalContractAmount || lead.clientQuotedAmount || pkg.totalQuotedRate
  );

  return {
    meta,
    santaTier,
    santaTierLabel: pkg.santaTierLabel,
    rateTerritory,
    rateTerritoryLabel: pkg.rateTerritoryLabel,
    eventActivityTag,
    eventActivityLabel: pkg.eventActivityLabel,
    durationHours: pkg.durationHours,
    extraHours: pkg.extraHours,
    extraHourCharge: pkg.extraHourCharge,
    baseRate: pkg.baseRate,
    quotedAmount,
    tags: meta.tags || pkg.tags,
  };
}

const CRM_STAGE_OPTIONS = [
  {
    value: "INQUIRY_RECEIVED",
    step: "Stage 1",
    label: "1. Inquiry Received (New Lead)",
    calendarStatus: "Confirming",
  },
  {
    value: "HOLD_24H_ACTIVE",
    step: "Stage 2",
    label: "2. 24h Calendar Hold Active",
    calendarStatus: "Confirming (24h Hold)",
  },
  {
    value: "QUOTE_ISSUED",
    step: "Stage 3",
    label: "3. Official Quote Issued",
    calendarStatus: "Confirming (Quoted)",
  },
  {
    value: "CONTRACT_SENT",
    step: "Stage 3B",
    label: "3B. Contract & E-Sign Sent",
    calendarStatus: "Confirming (Contract Sent)",
  },
  {
    value: "AWAITING_STAFF_SIGNOFF",
    step: "Stage 4",
    label: "4. Awaiting Dual-Gate Signoff",
    calendarStatus: "Confirming (Signoff)",
  },
  {
    value: "READY_FOR_DEPLOYMENT",
    step: "Stage 5",
    label: "5. Confirmed • Roster Locked & Dispatched",
    calendarStatus: "Confirmed",
  },
  {
    value: "FINANCIALLY_SETTLED",
    step: "Stage 6",
    label: "6. Financially Settled & Closed",
    calendarStatus: "Confirmed • Settled",
  },
  {
    value: "CANCELLED",
    step: "Closed",
    label: "Cancelled / Released",
    calendarStatus: "Cancelled",
  },
];

export default function UnifiedCrmPipelinePage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [talents, setTalents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"LIST" | "KANBAN">("LIST");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Create / Edit Quotation Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Modal Form Fields
  const [formSantaTier, setFormSantaTier] = useState<SantaBeardTier>("REAL_BEARD");
  const [formRateTerritory, setFormRateTerritory] =
    useState<SantaRateTerritory>("METRO_MANILA");
  const [formActivityTag, setFormActivityTag] =
    useState<SantaEventActivityTag>("MEET_AND_GREET");
  const [formDurationHours, setFormDurationHours] = useState<number>(3);
  const [formAutoCalculatePrice, setFormAutoCalculatePrice] = useState<boolean>(true);
  const [formQuotedAmount, setFormQuotedAmount] = useState<number>(24000);
  const [formDepositPaid, setFormDepositPaid] = useState<number>(0);
  const [formStatus, setFormStatus] = useState<string>("INQUIRY_RECEIVED");
  const [formCompanyName, setFormCompanyName] = useState<string>("");
  const [formContactPerson, setFormContactPerson] = useState<string>("");
  const [formEmail, setFormEmail] = useState<string>("");
  const [formPhone, setFormPhone] = useState<string>("");
  const [formVenue, setFormVenue] = useState<string>("");
  const [formCity, setFormCity] = useState<string>("Metro Manila");
  const [formEventName, setFormEventName] = useState<string>("");
  const [formEventDate, setFormEventDate] = useState<string>("2026-11-15");
  const [formStartTime, setFormStartTime] = useState<string>("14:00");
  const [formEndTime, setFormEndTime] = useState<string>("17:00");
  const [formTalentId, setFormTalentId] = useState<string>("");
  const [formAgreedTf, setFormAgreedTf] = useState<number>(12000);
  const [formNotes, setFormNotes] = useState<string>("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const fetchCrmData = () => {
    setLoading(true);
    Promise.all([
      fetch(`/api/leads?filter=${activeFilter}&search=${encodeURIComponent(search)}`).then(
        (res) => res.json()
      ),
      fetch("/api/talents").then((res) => res.json()).catch(() => ({ talents: [] })),
    ])
      .then(([d, tData]) => {
        if (d.success && d.leads) setLeads(d.leads);
        if (tData?.talents) setTalents(tData.talents);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCrmData();
  }, [activeFilter, search]);

  // Live rate card calculation inside modal
  const modalLivePkg = calculateSantaPackageQuote({
    santaTier: formSantaTier,
    rateTerritory: formRateTerritory,
    durationHours: formDurationHours,
    eventActivityTag: formActivityTag,
  });

  useEffect(() => {
    if (formAutoCalculatePrice) {
      setFormQuotedAmount(modalLivePkg.totalQuotedRate);
    }
  }, [
    formSantaTier,
    formRateTerritory,
    formDurationHours,
    formActivityTag,
    formAutoCalculatePrice,
    modalLivePkg.totalQuotedRate,
  ]);

  const openNewInquiryModal = () => {
    setEditingLeadId(null);
    setFormSantaTier("REAL_BEARD");
    setFormRateTerritory("METRO_MANILA");
    setFormActivityTag("MEET_AND_GREET");
    setFormDurationHours(3);
    setFormAutoCalculatePrice(true);
    setFormQuotedAmount(24000);
    setFormDepositPaid(0);
    setFormStatus("INQUIRY_RECEIVED");
    setFormCompanyName("");
    setFormContactPerson("");
    setFormEmail("");
    setFormPhone("");
    setFormVenue("");
    setFormCity("Metro Manila");
    setFormEventName("");
    setFormEventDate("2026-11-15");
    setFormStartTime("14:00");
    setFormEndTime("17:00");
    setFormTalentId("");
    setFormAgreedTf(12000);
    setFormNotes("");
    setIsModalOpen(true);
  };

  const openEditLeadModal = (lead: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const info = extractLeadTagsAndMeta(lead);
    const dObj = new Date(lead.eventDate);
    const dateStr = !isNaN(dObj.getTime())
      ? `${dObj.getUTCFullYear()}-${String(dObj.getUTCMonth() + 1).padStart(2, "0")}-${String(
          dObj.getUTCDate()
        ).padStart(2, "0")}`
      : "2026-11-15";

    setEditingLeadId(lead.id);
    setFormSantaTier(info.santaTier);
    setFormRateTerritory(info.rateTerritory);
    setFormActivityTag(info.eventActivityTag);
    setFormDurationHours(info.durationHours);
    setFormAutoCalculatePrice(false);
    setFormQuotedAmount(info.quotedAmount);
    setFormDepositPaid(Number(lead.depositPaid || 0));
    setFormStatus(lead.status || "INQUIRY_RECEIVED");
    setFormCompanyName(lead.client?.companyName || "");
    setFormContactPerson(
      lead.client?.primaryContact || lead.client?.contactPerson || ""
    );
    setFormEmail(lead.client?.email || "");
    setFormPhone(lead.client?.phone || "");
    setFormVenue(lead.mallOrVenue || "");
    setFormCity(lead.city || lead.locationCity || "Metro Manila");
    setFormEventName(lead.eventName || "");
    setFormEventDate(dateStr);
    setFormStartTime(lead.startTime || "14:00");
    setFormEndTime(lead.endTime || "17:00");
    setFormTalentId(lead.talentAssignments?.[0]?.talentId || "");
    setFormAgreedTf(
      Number(
        lead.talentAssignments?.[0]?.agreedTalentFee ||
          lead.totalDirectCost ||
          (info.santaTier === "REAL_BEARD" ? 12000 : 7000)
      )
    );
    setFormNotes(lead.specialRequests || "");
    setIsModalOpen(true);
  };

  const handleSaveLeadModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const ledgerMeta = {
        santaTier: modalLivePkg.santaTier,
        santaTierLabel: modalLivePkg.santaTierLabel,
        rateTerritory: modalLivePkg.rateTerritory,
        rateTerritoryLabel: modalLivePkg.rateTerritoryLabel,
        eventActivityTag: modalLivePkg.eventActivityTag,
        eventActivityLabel: modalLivePkg.eventActivityLabel,
        durationHours: modalLivePkg.durationHours,
        extraHours: modalLivePkg.extraHours,
        extraHourCharge: modalLivePkg.extraHourCharge,
        baseRate: modalLivePkg.baseRate,
        tags: modalLivePkg.tags,
        dpStatus: formDepositPaid > 0 ? "Paid" : "Pending",
        collectiblesStatus:
          formQuotedAmount - formDepositPaid <= 0 && formQuotedAmount > 0
            ? "Collected"
            : "Pending",
        contractStatus:
          formStatus === "READY_FOR_DEPLOYMENT" ? "Signed Contract" : "Quotation / Draft",
      };

      const internalNotesEncoded = `CRM Quotation Record ||LEDGER_META:${JSON.stringify(
        ledgerMeta
      )}`;

      if (editingLeadId) {
        const res = await fetch(`/api/bookings/${editingLeadId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-admin-role": "SUPER_ADMIN",
          },
          body: JSON.stringify({
            isCalendarDirectEdit: true,
            status: formStatus,
            companyName: formCompanyName || formVenue,
            primaryContact: formContactPerson || "Authorized Coordinator",
            email: formEmail,
            phone: formPhone,
            mallOrVenue: formVenue,
            city: formCity,
            bookingType: formActivityTag === "PRIVATE_PARTY" ? "PRIVATE" : "CORPORATE",
            eventName:
              formEventName || `${formVenue} — ${modalLivePkg.eventActivityLabel}`,
            eventDate: formEventDate,
            startTime: formStartTime,
            endTime: formEndTime,
            durationHours: formDurationHours,
            isProvincial: formRateTerritory === "OUT_OF_TOWN",
            isHoliday: formRateTerritory === "HOLIDAY",
            talentId: formTalentId,
            agreedTalentFee: formAgreedTf,
            totalContractAmount: formQuotedAmount,
            depositPaid: formDepositPaid,
            balanceDue: Math.max(0, formQuotedAmount - formDepositPaid),
            specialRequests:
              formNotes ||
              `[${modalLivePkg.santaTierLabel} • ${modalLivePkg.eventActivityLabel} • ${modalLivePkg.rateTerritoryLabel} • ${formDurationHours} Hrs]`,
            internalNotes: internalNotesEncoded,
            ledgerMeta,
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || "Failed to update CRM lead");
        showToast("Updated quotation & synced to Dashboard, Calendar & CRM!");
        if (selectedLead?.id === editingLeadId) {
          setSelectedLead(data.booking);
        }
      } else {
        const res = await fetch("/api/public/request-quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientName: formContactPerson || formCompanyName || "Client Contact",
            companyName: formCompanyName || formVenue,
            email: formEmail || "events@client.local",
            phone: formPhone || "0917 000 0000",
            bookingType: formActivityTag === "PRIVATE_PARTY" ? "PRIVATE" : "CORPORATE",
            eventName:
              formEventName || `${formVenue} — ${modalLivePkg.eventActivityLabel}`,
            eventDate: formEventDate,
            startTime: formStartTime,
            endTime: formEndTime,
            durationHours: formDurationHours,
            venueName: formVenue,
            mallOrVenue: formVenue,
            city: formCity,
            isProvincial: formRateTerritory === "OUT_OF_TOWN",
            santaTier: formSantaTier,
            rateTerritory: formRateTerritory,
            eventActivityTag: formActivityTag,
            clientQuotedAmount: formQuotedAmount,
            specialRequests: formNotes,
            talentPreferenceId: formTalentId || undefined,
            consentAgreed: true,
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || "Failed to create quotation");
        showToast(
          `Created Quotation ${data.bookingNumber} — Live on Dashboard, Calendar & CRM!`
        );
      }

      setIsModalOpen(false);
      fetchCrmData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleQuickStatusUpdate = async (
    lead: any,
    newStatus: string,
    e?: React.MouseEvent
  ) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch(`/api/bookings/${lead.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-role": "SUPER_ADMIN",
        },
        body: JSON.stringify({
          isCalendarDirectEdit: true,
          status: newStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Moved ${lead.bookingNumber} → ${newStatus.replace(/_/g, " ")}`);
        if (selectedLead?.id === lead.id) {
          setSelectedLead(data.booking);
        }
        fetchCrmData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLead = async (lead: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm(`Delete quotation / booking ${lead.bookingNumber} (${lead.mallOrVenue})?`))
      return;
    try {
      const res = await fetch(`/api/bookings/${lead.id}`, {
        method: "DELETE",
        headers: { "x-admin-role": "SUPER_ADMIN" },
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Deleted ${lead.bookingNumber}`);
        if (selectedLead?.id === lead.id) setSelectedLead(null);
        setIsModalOpen(false);
        fetchCrmData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const kanbanColumns = [
    {
      id: "INQUIRY_RECEIVED",
      title: "1. Inquiry Received",
      subtitle: "New quotations from funnel",
      items: leads.filter(
        (l) => normalizeToLifecycleState(l.status) === "INQUIRY_RECEIVED"
      ),
    },
    {
      id: "HOLD_24H_ACTIVE",
      title: "2. 24h Calendar Hold",
      subtitle: "Date soft-held on calendar",
      items: leads.filter(
        (l) => normalizeToLifecycleState(l.status) === "HOLD_24H_ACTIVE"
      ),
    },
    {
      id: "QUOTE_ISSUED",
      title: "3. Quote & Contract",
      subtitle: "Official quote / MOA sent",
      items: leads.filter((l) =>
        ["QUOTE_ISSUED", "CONTRACT_SENT", "CONTRACT_SIGNED_PENDING_DEPOSIT"].includes(
          normalizeToLifecycleState(l.status)
        )
      ),
    },
    {
      id: "AWAITING_STAFF_SIGNOFF",
      title: "4. Awaiting Signoff",
      subtitle: "DP check & Dual-Gate review",
      items: leads.filter(
        (l) => normalizeToLifecycleState(l.status) === "AWAITING_STAFF_SIGNOFF"
      ),
    },
    {
      id: "ROSTER_LOCKED_DISPATCHED",
      title: "5. Confirmed & Locked",
      subtitle: "Confirmed on Master Calendar",
      items: leads.filter((l) =>
        ["ROSTER_LOCKED_DISPATCHED", "EVENT_DELIVERED", "FINANCIALLY_SETTLED"].includes(
          normalizeToLifecycleState(l.status)
        )
      ),
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl bg-[#1E1416] text-white border border-[#9B1B30] shadow-xl text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E8DFE0]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="badge-esign px-2.5 py-0.5 rounded text-[10px] font-mono">
              STAGE 1 • COMMERCIAL INTAKE &amp; QUOTATION PIPELINE
            </span>
            <h1 className="page-title text-2xl font-serif tracking-tight">
              Leads &amp; CRM Pipeline
            </h1>
          </div>
          <p className="page-subtitle text-xs mt-1">
            Every Quotation Request automatically updates your Executive Dashboard, Master Calendar, and CRM with live tags and status controls.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* List vs Kanban Toggle */}
          <div className="inline-flex rounded-lg bg-white border border-[#D6C7C9] p-0.5 shadow-sm text-xs">
            <button
              type="button"
              onClick={() => setViewMode("LIST")}
              className={`px-3 py-1.5 rounded-md font-semibold flex items-center space-x-1.5 transition ${
                viewMode === "LIST"
                  ? "bg-[#9B1B30] text-white"
                  : "text-[#4A3A3D] hover:text-[#1E1416]"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("KANBAN")}
              className={`px-3 py-1.5 rounded-md font-semibold flex items-center space-x-1.5 transition ${
                viewMode === "KANBAN"
                  ? "bg-[#9B1B30] text-white"
                  : "text-[#4A3A3D] hover:text-[#1E1416]"
              }`}
            >
              <KanbanSquare className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
          </div>

          <Link
            href="/request-quote"
            className="inline-flex items-center px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-[#D6C7C9] text-[#1E1416] hover:border-[#9B1B30] transition"
          >
            <ExternalLink className="w-3.5 h-3.5 mr-1.5 text-[#9B1B30]" />
            Public Quote Form
          </Link>

          <button
            type="button"
            onClick={openNewInquiryModal}
            className="btn-primary inline-flex items-center px-3.5 py-2 rounded-lg text-xs font-semibold transition"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            + New Quotation / Lead
          </button>
        </div>
      </div>

      {/* Official Rate Card & Sequence Flow Reference Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
        {/* Real Beard Rate Card */}
        <div className="lg:col-span-4 dashboard-card p-4 border-l-4 border-l-[#9B1B30] space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#1E1416] flex items-center space-x-1.5">
              <span>🎅 Real Beard Santa Claus</span>
            </span>
            <span className="badge-esign px-2 py-0.5 rounded text-[10px] font-mono">
              Limited Talents
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
            <div className="p-2 rounded bg-[#FAF7F5] border border-[#E8DFE0]">
              <span className="text-[9px] text-[#756568] uppercase block">Metro Manila</span>
              <strong className="text-[#1E1416]">₱24,000</strong>
            </div>
            <div className="p-2 rounded bg-[#FAF7F5] border border-[#E8DFE0]">
              <span className="text-[9px] text-[#756568] uppercase block">Holiday Rate</span>
              <strong className="text-[#9B1B30]">₱26,000</strong>
            </div>
            <div className="p-2 rounded bg-[#FAF7F5] border border-[#E8DFE0]">
              <span className="text-[9px] text-[#756568] uppercase block">Out of Town</span>
              <strong className="text-[#9B1B30]">₱26,000</strong>
            </div>
          </div>
          <div className="text-[10px] text-[#6E5D5F] flex items-center justify-between pt-1">
            <span>Min 3 HRS • Meet &amp; Greet • Launch • Shoot • Party</span>
            <strong className="text-[#9B1B30] font-mono">+₱3,000 / hr</strong>
          </div>
        </div>

        {/* Fake Beard Rate Card */}
        <div className="lg:col-span-4 dashboard-card p-4 border-l-4 border-l-[#C68A12] space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#1E1416]">🎭 Fake Beard Santa Claus</span>
            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-mono font-semibold">
              Standard Roster
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
            <div className="p-2 rounded bg-[#FAF7F5] border border-[#E8DFE0]">
              <span className="text-[9px] text-[#756568] uppercase block">Metro Manila</span>
              <strong className="text-[#1E1416]">₱15,000</strong>
            </div>
            <div className="p-2 rounded bg-[#FAF7F5] border border-[#E8DFE0]">
              <span className="text-[9px] text-[#756568] uppercase block">Holiday Rate</span>
              <strong className="text-[#C68A12]">₱18,000</strong>
            </div>
            <div className="p-2 rounded bg-[#FAF7F5] border border-[#E8DFE0]">
              <span className="text-[9px] text-[#756568] uppercase block">Out of Town</span>
              <strong className="text-[#C68A12]">₱18,000</strong>
            </div>
          </div>
          <div className="text-[10px] text-[#6E5D5F] flex items-center justify-between pt-1">
            <span>Min 3 HRS • Meet &amp; Greet • Launch • Shoot • Party</span>
            <strong className="text-[#C68A12] font-mono">+₱3,000 / hr</strong>
          </div>
        </div>

        {/* Operational Sequence Guide */}
        <div className="lg:col-span-4 dashboard-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#1E1416]">
              ⚡ Live Sequence &amp; Sync Flow
            </span>
            <span className="text-[10px] font-mono text-emerald-700 font-semibold">
              Auto-Synced
            </span>
          </div>
          <ol className="text-[11px] text-[#4A3A3D] space-y-1 font-medium">
            <li>
              <strong className="text-[#9B1B30]">1. Request Quote:</strong> Auto-computes rate &amp; adds to CRM, Dashboard &amp; Calendar (<code className="text-[10px]">Confirming</code>).
            </li>
            <li>
              <strong className="text-[#C68A12]">2. Hold / Quote / MOA:</strong> Lock 24h calendar hold &amp; issue formal quotation/contract.
            </li>
            <li>
              <strong className="text-emerald-700">3. Confirm &amp; Dispatch:</strong> Verify 50% DP → Switches Calendar row to <code className="text-[10px]">Confirmed</code>!
            </li>
          </ol>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: "ALL", label: "All Deals" },
            { id: "NEW", label: "1. New Inquiries & Holds" },
            { id: "FOLLOW_UP", label: "2. Quoted / Pending DP" },
            { id: "REAL_BEARD", label: "🎅 Real Beard (₱24k–₱26k)" },
            { id: "FAKE_BEARD", label: "🎭 Fake Beard (₱15k–₱18k)" },
            { id: "CORPORATE", label: "Corporate & Malls" },
            { id: "PRIVATE", label: "Private Parties" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeFilter === tab.id
                  ? "bg-[#9B1B30] text-white shadow-sm"
                  : "bg-white border border-[#E8DFE0] text-[#4A3A3D] hover:border-[#9B1B30]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#756568] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search lead, venue, tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#D6C7C9] rounded-lg"
          />
        </div>
      </div>

      {/* VIEW MODE: KANBAN BOARD (5 STAGE COLUMNS) */}
      {viewMode === "KANBAN" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {kanbanColumns.map((col) => (
            <div key={col.id} className="dashboard-card p-3 flex flex-col space-y-3">
              <div className="border-b border-[#E8DFE0] pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1E1416]">{col.title}</span>
                  <span className="badge-esign px-2 py-0.5 rounded-full text-[10px] font-mono">
                    {col.items.length}
                  </span>
                </div>
                <p className="text-[10px] text-[#756568] mt-0.5">{col.subtitle}</p>
              </div>

              <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
                {col.items.length === 0 ? (
                  <div className="p-6 text-center text-[11px] text-[#756568]">
                    No deals in stage
                  </div>
                ) : (
                  col.items.map((lead) => {
                    const info = extractLeadTagsAndMeta(lead);
                    return (
                      <div
                        key={lead.id}
                        onClick={() => setSelectedLead(lead)}
                        className="p-3 rounded-lg bg-[#FCF9F8] border border-[#E8DFE0] hover:border-[#9B1B30] cursor-pointer transition space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between font-mono text-[10px]">
                          <span className="font-bold text-[#9B1B30]">
                            {lead.bookingNumber}
                          </span>
                          <span className="font-bold text-[#1E1416]">
                            ₱{info.quotedAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="font-bold text-[#1E1416] truncate">
                          {lead.mallOrVenue}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold ${
                              info.santaTier === "REAL_BEARD"
                                ? "bg-[#F9EBED] text-[#9B1B30] border border-[#F0D0D5]"
                                : "bg-stone-100 text-stone-700 border border-stone-300"
                            }`}
                          >
                            {info.santaTier === "REAL_BEARD" ? "🎅 Real Beard" : "🎭 Fake Beard"}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[9px] font-mono">
                            {info.eventActivityLabel}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-white border border-[#E8DFE0] text-[#4A3A3D] text-[9px] font-mono">
                            {info.durationHours}h
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-[#E8DFE0]">
                          <div className="text-[10px] text-[#756568] flex items-center space-x-1">
                            <Calendar className="w-3 h-3 text-[#C68A12]" />
                            <span>
                              {new Date(lead.eventDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => openEditLeadModal(lead, e)}
                            className="px-2 py-0.5 rounded bg-white border border-[#D6C7C9] text-[#1E1416] hover:border-[#9B1B30] text-[10px] font-semibold flex items-center space-x-1"
                          >
                            <Pencil className="w-2.5 h-2.5 text-[#9B1B30]" />
                            <span>Edit</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* VIEW MODE: LIST TABLE */
        <div className="dashboard-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FCF9F8] border-b border-[#E8DFE0] text-[10px] font-mono uppercase tracking-wider text-[#756568]">
                  <th className="py-3 px-4 font-semibold">Lead ID &amp; Event</th>
                  <th className="py-3 px-4 font-semibold">Client / Agency</th>
                  <th className="py-3 px-4 font-semibold">Package Tags &amp; Tier</th>
                  <th className="py-3 px-4 font-semibold">Target Date &amp; Hrs</th>
                  <th className="py-3 px-4 font-semibold">Quoted Rate</th>
                  <th className="py-3 px-4 font-semibold">Status &amp; Sequence</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DFE0]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#756568]">
                      Loading CRM leads &amp; quotations...
                    </td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#756568]">
                      No leads found matching current filter.
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => {
                    const st = normalizeToLifecycleState(lead.status);
                    const meta = LIFECYCLE_METADATA[st];
                    const info = extractLeadTagsAndMeta(lead);
                    const assignedSanta = lead.talentAssignments?.[0]?.talent;

                    return (
                      <tr
                        key={lead.id}
                        onClick={() => setSelectedLead(lead)}
                        className="hover:bg-[#F4ECEE]/60 cursor-pointer transition"
                      >
                        <td className="py-3 px-4">
                          <span className="font-mono text-[11px] text-[#9B1B30] font-bold block">
                            {lead.bookingNumber}
                          </span>
                          <span className="font-semibold text-[#1E1416] block mt-0.5">
                            {lead.mallOrVenue}
                          </span>
                          <span className="text-[11px] text-[#756568] block">
                            {lead.eventName}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className="text-[#1E1416] font-semibold block">
                            {lead.client?.companyName ||
                              lead.client?.primaryContact ||
                              "Direct Client"}
                          </span>
                          <span className="text-[11px] text-[#756568] block">
                            {lead.client?.primaryContact || lead.client?.email || ""}
                          </span>
                          {assignedSanta && (
                            <span className="text-[10px] font-mono text-emerald-700 font-semibold block mt-0.5">
                              🎅 Santa {assignedSanta.displayName}
                            </span>
                          )}
                        </td>

                        {/* Package & Beard Tags */}
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1 max-w-[230px]">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                                info.santaTier === "REAL_BEARD"
                                  ? "bg-[#F9EBED] text-[#9B1B30] border-[#F0D0D5]"
                                  : "bg-stone-100 text-stone-700 border-stone-300"
                              }`}
                            >
                              {info.santaTier === "REAL_BEARD"
                                ? "🎅 Real Beard • Limited"
                                : "🎭 Fake Beard"}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-mono font-medium">
                              {info.eventActivityLabel}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-white border border-[#E8DFE0] text-[#4A3A3D] text-[10px] font-mono">
                              {info.rateTerritoryLabel}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono text-[#4A3A3D]">
                          <div className="font-semibold text-[#1E1416]">
                            {new Date(lead.eventDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </div>
                          <div className="text-[10px] text-[#756568]">
                            {lead.startTime || "14:00"}–{lead.endTime || "17:00"} (
                            {info.durationHours} hrs)
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono">
                          <div className="font-bold text-[#9B1B30] text-sm">
                            ₱{info.quotedAmount.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-[#756568]">
                            {info.extraHours > 0
                              ? `Base ₱${info.baseRate.toLocaleString()} + ₱${info.extraHourCharge.toLocaleString()}`
                              : `Min 3 Hrs Base`}
                          </div>
                        </td>

                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                          <div className="space-y-1">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${meta.badgeClass}`}
                            >
                              {meta.label}
                            </span>
                            <select
                              value={lead.status || "INQUIRY_RECEIVED"}
                              onChange={(e) =>
                                handleQuickStatusUpdate(lead, e.target.value)
                              }
                              className="block w-full text-[10px] px-2 py-1 rounded bg-[#FAF7F5] border border-[#D6C7C9] text-[#1E1416] font-medium"
                            >
                              {CRM_STAGE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>

                        <td
                          className="py-3 px-4 text-right whitespace-nowrap space-x-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={(e) => openEditLeadModal(lead, e)}
                            className="inline-flex items-center px-2.5 py-1 text-[11px] font-semibold rounded bg-white text-[#1E1416] border border-[#D6C7C9] hover:border-[#9B1B30] transition"
                          >
                            <Pencil className="w-3 h-3 mr-1 text-[#9B1B30]" />
                            Edit
                          </button>
                          <Link
                            href={`/admin/quotes?bookingId=${lead.id}`}
                            className="inline-flex items-center px-2.5 py-1 text-[11px] font-semibold rounded bg-[#F9EBED] text-[#9B1B30] border border-[#F0D0D5] hover:bg-[#F3DCE0] transition"
                          >
                            Quote →
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slide-over Detail Drawer */}
      {selectedLead && (
        <div className="fixed inset-0 z-40 overflow-hidden bg-black/40 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-lg liquid-glass-modal h-full overflow-y-auto p-6 space-y-5">
            {(() => {
              const info = extractLeadTagsAndMeta(selectedLead);
              const st = normalizeToLifecycleState(selectedLead.status);
              const meta = LIFECYCLE_METADATA[st];
              return (
                <>
                  <div className="flex items-center justify-between pb-4 border-b border-[#E8DFE0]">
                    <div>
                      <span className="font-mono text-xs text-[#9B1B30] font-bold">
                        {selectedLead.bookingNumber}
                      </span>
                      <h2 className="text-xl font-serif font-bold text-[#1E1416]">
                        {selectedLead.mallOrVenue}
                      </h2>
                      <p className="text-xs text-[#756568]">{selectedLead.eventName}</p>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => openEditLeadModal(selectedLead)}
                        className="px-3 py-1.5 rounded-lg bg-[#F9EBED] text-[#9B1B30] border border-[#F0D0D5] text-xs font-semibold flex items-center space-x-1"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit Deal</span>
                      </button>
                      <button
                        onClick={() => setSelectedLead(null)}
                        className="p-1.5 rounded-lg text-[#756568] hover:text-[#1E1416] hover:bg-[#F4ECEE]"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Tags Pill Row */}
                  <div className="flex flex-wrap gap-1.5">
                    {info.tags.map((t: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-full bg-[#F9EBED] text-[#9B1B30] border border-[#F0D0D5] font-mono text-[10px] font-semibold"
                      >
                        {t}
                      </span>
                    ))}
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${meta.badgeClass}`}
                    >
                      {meta.label}
                    </span>
                  </div>

                  {/* Key Deal Metrics */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-[#FCF9F8] border border-[#E8DFE0]">
                      <span className="text-[#756568] block text-[11px]">
                        Client / Organization
                      </span>
                      <strong className="text-[#1E1416] block mt-0.5">
                        {selectedLead.client?.companyName || "Direct Client"}
                      </strong>
                      <span className="text-[11px] text-[#756568]">
                        {selectedLead.client?.primaryContact || ""}{" "}
                        {selectedLead.client?.phone ? `• ${selectedLead.client.phone}` : ""}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-[#FCF9F8] border border-[#E8DFE0]">
                      <span className="text-[#756568] block text-[11px]">
                        Event Date &amp; Duration
                      </span>
                      <strong className="text-[#1E1416] block mt-0.5">
                        {new Date(selectedLead.eventDate).toLocaleDateString()}
                      </strong>
                      <span className="text-[11px] text-[#756568] font-mono">
                        {selectedLead.startTime || "14:00"}–{selectedLead.endTime || "17:00"} (
                        {info.durationHours} hrs)
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-[#FCF9F8] border border-[#E8DFE0]">
                      <span className="text-[#756568] block text-[11px]">
                        Santa Tier &amp; Activity
                      </span>
                      <strong className="text-[#1E1416] block mt-0.5">
                        {info.santaTierLabel}
                      </strong>
                      <span className="text-[11px] text-[#9B1B30] font-semibold">
                        {info.eventActivityLabel} ({info.rateTerritoryLabel})
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-[#FCF9F8] border border-[#E8DFE0]">
                      <span className="text-[#756568] block text-[11px]">
                        Quoted Package Rate
                      </span>
                      <strong className="text-[#9B1B30] block mt-0.5 font-mono text-base">
                        ₱{info.quotedAmount.toLocaleString()}
                      </strong>
                      <span className="text-[10px] text-[#756568] font-mono">
                        Base ₱{info.baseRate.toLocaleString()}{" "}
                        {info.extraHours > 0
                          ? `+ ₱${info.extraHourCharge.toLocaleString()} (${info.extraHours}h extra)`
                          : "(Min 3 Hrs)"}
                      </span>
                    </div>
                  </div>

                  {/* Quick Sequence Stage Progression */}
                  <div className="p-4 rounded-xl bg-[#FCF9F8] border border-[#E8DFE0] space-y-2.5">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#756568] font-bold block">
                      1-Click Status Progression (Updates Calendar &amp; Dashboard)
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {CRM_STAGE_OPTIONS.slice(0, 6).map((opt) => {
                        const isCurrent = selectedLead.status === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleQuickStatusUpdate(selectedLead, opt.value)}
                            className={`p-2 rounded-lg border text-left text-[11px] font-semibold transition ${
                              isCurrent
                                ? "bg-[#9B1B30] text-white border-[#9B1B30]"
                                : "bg-white text-[#1E1416] border-[#D6C7C9] hover:border-[#9B1B30]"
                            }`}
                          >
                            <div>{opt.label}</div>
                            <div
                              className={`text-[9px] font-mono ${
                                isCurrent ? "text-rose-100" : "text-[#756568]"
                              }`}
                            >
                              Calendar: {opt.calendarStatus}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#E8DFE0] space-y-2">
                    <Link
                      href={`/admin/quotes?bookingId=${selectedLead.id}`}
                      className="btn-primary w-full py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center transition"
                    >
                      Step 1: Open in Costing &amp; Quotation Builder{" "}
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Link>
                    <Link
                      href="/admin/calendar"
                      className="w-full py-2.5 px-4 rounded-lg bg-white hover:bg-[#F4ECEE] border border-[#D6C7C9] text-[#1E1416] text-xs font-semibold flex items-center justify-center transition"
                    >
                      Step 2: View on Master Calendar &amp; Excel Sheet
                    </Link>
                    <Link
                      href="/admin/contracts"
                      className="w-full py-2.5 px-4 rounded-lg bg-white hover:bg-[#F4ECEE] border border-[#D6C7C9] text-[#1E1416] text-xs font-semibold flex items-center justify-center transition"
                    >
                      Step 3: Generate Contract &amp; E-Sign
                    </Link>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* CREATE / EDIT QUOTATION & CRM LEAD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="dashboard-card w-full max-w-3xl p-6 space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E8DFE0] pb-3">
              <div>
                <span className="badge-esign px-2 py-0.5 rounded text-[10px] font-mono">
                  {editingLeadId ? "EDIT QUOTATION & CRM LEAD" : "NEW QUOTATION & CRM INQUIRY"}
                </span>
                <h2 className="text-lg font-serif font-bold text-[#1E1416] mt-1">
                  {editingLeadId
                    ? `Edit Quotation & Sync (${formVenue || "Deal"})`
                    : "Create New Santa Quotation (Syncs to Dashboard, Calendar & CRM)"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-[#756568] hover:text-[#1E1416]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLeadModal} className="space-y-4 text-xs">
              {/* 1. Santa Beard Tier & Activity Tag */}
              <div className="p-4 rounded-xl bg-[#FAF7F5] border border-[#E8DFE0] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1E1416]">
                    1. Official Santa Rate Card &amp; Package Tags
                  </span>
                  <span className="font-mono text-[11px] text-[#9B1B30] font-bold">
                    Min 3 HRS • +₱3,000 / extra hour
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setFormSantaTier("REAL_BEARD");
                      setFormAutoCalculatePrice(true);
                      setFormAgreedTf(12000);
                    }}
                    className={`p-3 rounded-xl border text-left transition ${
                      formSantaTier === "REAL_BEARD"
                        ? "bg-[#F9EBED] border-[#9B1B30] text-[#1E1416]"
                        : "bg-white border-[#D6C7C9] text-[#6E5D5F]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-xs text-[#9B1B30]">
                        🎅 Real Beard Santa Claus
                      </strong>
                      <span className="badge-esign px-1.5 py-0.5 rounded text-[9px] font-mono">
                        Limited Talents
                      </span>
                    </div>
                    <div className="font-mono text-[10px] mt-1">
                      MM: ₱24,000 • Holiday: ₱26,000 • Out of Town: ₱26,000
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormSantaTier("FAKE_BEARD");
                      setFormAutoCalculatePrice(true);
                      setFormAgreedTf(7000);
                    }}
                    className={`p-3 rounded-xl border text-left transition ${
                      formSantaTier === "FAKE_BEARD"
                        ? "bg-[#F9EBED] border-[#9B1B30] text-[#1E1416]"
                        : "bg-white border-[#D6C7C9] text-[#6E5D5F]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-xs text-[#1E1416]">
                        🎭 Fake Beard Santa Claus
                      </strong>
                      <span className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 text-[9px] font-mono">
                        Standard
                      </span>
                    </div>
                    <div className="font-mono text-[10px] mt-1">
                      MM: ₱15,000 • Holiday: ₱18,000 • Out of Town: ₱18,000
                    </div>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block mb-1">Rate Territory</label>
                    <select
                      value={formRateTerritory}
                      onChange={(e) => {
                        setFormRateTerritory(e.target.value as SantaRateTerritory);
                        setFormAutoCalculatePrice(true);
                      }}
                      className="w-full px-3 py-2"
                    >
                      <option value="METRO_MANILA">
                        Metro Manila Rate (₱
                        {formSantaTier === "REAL_BEARD" ? "24,000" : "15,000"})
                      </option>
                      <option value="HOLIDAY">
                        Holiday Rate (₱
                        {formSantaTier === "REAL_BEARD" ? "26,000" : "18,000"})
                      </option>
                      <option value="OUT_OF_TOWN">
                        Out of Town Rate (₱
                        {formSantaTier === "REAL_BEARD" ? "26,000" : "18,000"})
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1">Event Activity Tag</label>
                    <select
                      value={formActivityTag}
                      onChange={(e) =>
                        setFormActivityTag(e.target.value as SantaEventActivityTag)
                      }
                      className="w-full px-3 py-2"
                    >
                      {SANTA_EVENT_ACTIVITIES.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1">
                      Duration (Min 3 Hrs + ₱3k/hr)
                    </label>
                    <select
                      value={formDurationHours}
                      onChange={(e) => {
                        setFormDurationHours(Number(e.target.value));
                        setFormAutoCalculatePrice(true);
                      }}
                      className="w-full px-3 py-2 font-mono"
                    >
                      <option value={3}>3 Hours (Minimum Base)</option>
                      <option value={4}>4 Hours (+₱3,000)</option>
                      <option value={5}>5 Hours (+₱6,000)</option>
                      <option value={6}>6 Hours (+₱9,000)</option>
                      <option value={8}>8 Hours (+₱15,000)</option>
                    </select>
                  </div>
                </div>

                {/* Live Rate Computation Bar */}
                <div className="p-3 rounded-lg bg-white border border-[#E8DFE0] flex flex-wrap items-center justify-between gap-2 font-mono">
                  <div className="text-[11px] text-[#4A3A3D]">
                    Base (3h): <strong>₱{modalLivePkg.baseRate.toLocaleString()}</strong>
                    {modalLivePkg.extraHours > 0 && (
                      <span className="text-[#9B1B30] ml-2">
                        + Extra ({modalLivePkg.extraHours}h × ₱3,000):{" "}
                        <strong>+₱{modalLivePkg.extraHourCharge.toLocaleString()}</strong>
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-bold text-[#9B1B30]">
                    Computed Package: ₱{modalLivePkg.totalQuotedRate.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* 2. Client, Venue & Schedule */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block mb-1">Mall / Venue Name *</label>
                  <input
                    type="text"
                    required
                    value={formVenue}
                    onChange={(e) => setFormVenue(e.target.value)}
                    placeholder="e.g. SM Megamall"
                    className="w-full px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block mb-1">Agency / Company *</label>
                  <input
                    type="text"
                    required
                    value={formCompanyName}
                    onChange={(e) => setFormCompanyName(e.target.value)}
                    placeholder="e.g. SM Supermalls / Agency"
                    className="w-full px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block mb-1">Client Contact Person</label>
                  <input
                    type="text"
                    value={formContactPerson}
                    onChange={(e) => setFormContactPerson(e.target.value)}
                    placeholder="e.g. Maria Clara Santos"
                    className="w-full px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block mb-1">Client Email</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="events@company.ph"
                    className="w-full px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block mb-1">Mobile / Hotline</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="0917 123 4567"
                    className="w-full px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block mb-1">City / Location</label>
                  <input
                    type="text"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    placeholder="Metro Manila / Pampanga"
                    className="w-full px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block mb-1">Event Date *</label>
                  <input
                    type="date"
                    required
                    value={formEventDate}
                    onChange={(e) => setFormEventDate(e.target.value)}
                    className="w-full px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block mb-1">Start Time</label>
                  <input
                    type="time"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block mb-1">End Time</label>
                  <input
                    type="time"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full px-3 py-2 font-mono"
                  />
                </div>
              </div>

              {/* 3. Financials, Santa Assignment & Lifecycle Status */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-[#E8DFE0]">
                <div>
                  <label className="block mb-1">Quoted Contract Total (₱)</label>
                  <input
                    type="number"
                    value={formQuotedAmount}
                    onChange={(e) => {
                      setFormAutoCalculatePrice(false);
                      setFormQuotedAmount(Number(e.target.value));
                    }}
                    className="w-full px-3 py-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block mb-1">Downpayment Paid (₱)</label>
                  <input
                    type="number"
                    value={formDepositPaid}
                    onChange={(e) => setFormDepositPaid(Number(e.target.value))}
                    className="w-full px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block mb-1">Assigned Santa</label>
                  <select
                    value={formTalentId}
                    onChange={(e) => setFormTalentId(e.target.value)}
                    className="w-full px-3 py-2"
                  >
                    <option value="">Unassigned / TBD</option>
                    {talents.map((t) => (
                      <option key={t.id} value={t.id}>
                        Santa {t.displayName} ({t.talentType})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Lifecycle Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full px-3 py-2 font-semibold"
                  >
                    {CRM_STAGE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1">
                  Event Details / Quotation Notes (Synced to Calendar Excel Sheet)
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. Meet & Greet 3 hours + photo shoot, holding room required..."
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7F5] border border-[#D6C7C9] text-[#1E1416]"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#E8DFE0]">
                {editingLeadId ? (
                  <button
                    type="button"
                    onClick={() =>
                      handleDeleteLead({
                        id: editingLeadId,
                        bookingNumber: formEventName,
                        mallOrVenue: formVenue,
                      })
                    }
                    className="inline-flex items-center px-3 py-2 rounded-lg text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Delete Record
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-[#D6C7C9] text-xs font-semibold text-[#4A3A3D]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary px-5 py-2 rounded-lg text-xs font-semibold"
                  >
                    {saving
                      ? "Saving..."
                      : editingLeadId
                      ? "Save Changes & Sync All Views"
                      : "Create Quotation & Sync All Views"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
