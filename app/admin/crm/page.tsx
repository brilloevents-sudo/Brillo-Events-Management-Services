"use client";

import { useState, useEffect, useMemo } from "react";
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
  ExternalLink,
  Filter,
  Wand2,
  ArrowUpDown,
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

const PRESET_CUSTOM_TAGS = [
  "New Lead",
  "Booked",
  "Priority VIP",
  "Follow-Up Needed",
  "50% DP Paid",
  "Full Payment",
  "Date Confirmed",
  "Peak Holiday",
];

const CRM_STAGE_OPTIONS = [
  {
    value: "INQUIRY_RECEIVED",
    shortBadge: "NEW LEAD",
    pillLabel: "🟢 New Lead",
    step: "Stage 1",
    label: "1. New Lead (Inquiry Received)",
    calendarStatus: "Confirming",
    badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-300",
  },
  {
    value: "HOLD_24H_ACTIVE",
    shortBadge: "24H HOLD",
    pillLabel: "🟡 24h Hold",
    step: "Stage 2",
    label: "2. 24h Calendar Hold Active",
    calendarStatus: "Confirming (24h Hold)",
    badgeColor: "bg-amber-50 text-amber-900 border-amber-300",
  },
  {
    value: "QUOTE_ISSUED",
    shortBadge: "QUOTED",
    pillLabel: "📄 Quoted",
    step: "Stage 3",
    label: "3. Official Quote Issued",
    calendarStatus: "Confirming (Quoted)",
    badgeColor: "bg-blue-50 text-blue-800 border-blue-300",
  },
  {
    value: "CONTRACT_SENT",
    shortBadge: "PENDING DP",
    pillLabel: "✍️ Contract / Pending DP",
    step: "Stage 3B",
    label: "3B. Contract Sent / Pending DP",
    calendarStatus: "Confirming (Contract Sent)",
    badgeColor: "bg-purple-50 text-purple-800 border-purple-300",
  },
  {
    value: "AWAITING_STAFF_SIGNOFF",
    shortBadge: "SIGNOFF",
    pillLabel: "⏳ Awaiting Signoff",
    step: "Stage 4",
    label: "4. Awaiting Dual-Gate Signoff",
    calendarStatus: "Confirming (Signoff)",
    badgeColor: "bg-orange-50 text-orange-900 border-orange-300",
  },
  {
    value: "READY_FOR_DEPLOYMENT",
    shortBadge: "BOOKED",
    pillLabel: "✅ Booked / Confirmed",
    step: "Stage 5",
    label: "5. Booked • Confirmed & Dispatched",
    calendarStatus: "Confirmed",
    badgeColor: "bg-[#E8F5E9] text-[#1B5E20] border-[#A5D6A7]",
  },
  {
    value: "FINANCIALLY_SETTLED",
    shortBadge: "COMPLETED",
    pillLabel: "🏆 Completed & Settled",
    step: "Stage 6",
    label: "6. Completed & Financially Settled",
    calendarStatus: "Confirmed • Settled",
    badgeColor: "bg-teal-50 text-teal-900 border-teal-300",
  },
  {
    value: "CANCELLED",
    shortBadge: "CANCELLED",
    pillLabel: "❌ Cancelled",
    step: "Closed",
    label: "Cancelled / Released",
    calendarStatus: "Cancelled",
    badgeColor: "bg-rose-50 text-rose-800 border-rose-300",
  },
];

function getStageOption(status?: string) {
  const raw = String(status || "INQUIRY_RECEIVED").toUpperCase();
  const direct = CRM_STAGE_OPTIONS.find((o) => o.value === raw);
  if (direct) return direct;
  const normalized = normalizeToLifecycleState(raw);
  if (normalized === "ROSTER_LOCKED_DISPATCHED" || normalized === "EVENT_DELIVERED") {
    return CRM_STAGE_OPTIONS.find((o) => o.value === "READY_FOR_DEPLOYMENT")!;
  }
  return (
    CRM_STAGE_OPTIONS.find((o) => o.value === normalized) || CRM_STAGE_OPTIONS[0]
  );
}

function formatShortDateLabel(dateInput?: string | Date | null): string {
  if (!dateInput) return "TBD Date";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function toDateInputKey(dateInput?: string | Date | null): string {
  if (!dateInput) return "";
  if (typeof dateInput === "string" && /^\d{4}-\d{2}-\d{2}/.test(dateInput.trim())) {
    return dateInput.trim().slice(0, 10);
  }
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(
    d.getUTCDate()
  ).padStart(2, "0")}`;
}

function buildAutoOrganizedDealName(params: {
  eventDate?: string | Date | null;
  status?: string;
  venue?: string;
  companyName?: string;
  santaName?: string;
  activityLabel?: string;
}) {
  const datePart = formatShortDateLabel(params.eventDate);
  const stageOpt = getStageOption(params.status);
  const venueOrClient =
    (params.venue || "").trim() ||
    (params.companyName || "").trim() ||
    "Holiday Event";
  const santaPart = params.santaName
    ? `Santa ${params.santaName.replace(/^Santa\s+/i, "")}`
    : params.activityLabel || "Santa Appearance";

  return `[${datePart}] • [${stageOpt.shortBadge}] • ${venueOrClient} • ${santaPart}`;
}

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
    meta.santaTier === "SANTA_AND_ELVES" ||
    (lead.specialRequests || "").toLowerCase().includes("elves")
      ? "SANTA_AND_ELVES"
      : meta.santaTier === "FAKE_BEARD" ||
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

  const assignedSantaName =
    lead.talentAssignments?.[0]?.talent?.displayName || "";
  const customTags: string[] = Array.isArray(meta.customTags)
    ? meta.customTags
    : [];

  const autoOrganizedTitle = buildAutoOrganizedDealName({
    eventDate: lead.eventDate,
    status: lead.status,
    venue: lead.mallOrVenue,
    companyName: lead.client?.companyName,
    santaName: assignedSantaName,
    activityLabel: pkg.eventActivityLabel,
  });

  const organizedDealName =
    meta.organizedDealName ||
    (lead.eventName && lead.eventName.startsWith("[")
      ? lead.eventName
      : autoOrganizedTitle);

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
    tags: Array.from(new Set([...(meta.tags || pkg.tags || []), ...customTags])),
    customTags,
    organizedDealName,
    autoOrganizedTitle,
  };
}

function matchesStatusTab(lead: any, statusTab: string): boolean {
  if (statusTab === "ALL") return true;
  const raw = String(lead.status || "INQUIRY_RECEIVED").toUpperCase();
  const norm = normalizeToLifecycleState(raw);

  if (statusTab === "NEW_LEAD") {
    return (
      raw === "INQUIRY_RECEIVED" ||
      raw === "NEW_INQUIRY" ||
      norm === "INQUIRY_RECEIVED"
    );
  }
  if (statusTab === "QUOTED_HOLD") {
    return (
      raw === "HOLD_24H_ACTIVE" ||
      raw === "TEMPORARY_HOLD" ||
      raw === "QUOTE_ISSUED" ||
      raw === "QUOTED" ||
      norm === "HOLD_24H_ACTIVE" ||
      norm === "QUOTE_ISSUED"
    );
  }
  if (statusTab === "PENDING_DP") {
    return (
      raw === "CONTRACT_SENT" ||
      raw === "CONTRACT_SIGNED_PENDING_DEPOSIT" ||
      raw === "AWAITING_STAFF_SIGNOFF" ||
      raw === "AWAITING_STAFF_APPROVAL" ||
      norm === "CONTRACT_SENT" ||
      norm === "AWAITING_STAFF_SIGNOFF"
    );
  }
  if (statusTab === "BOOKED") {
    return (
      raw === "READY_FOR_DEPLOYMENT" ||
      raw === "CONFIRMED" ||
      raw === "ROSTER_LOCKED_DISPATCHED" ||
      raw === "DEPLOYED" ||
      norm === "ROSTER_LOCKED_DISPATCHED"
    );
  }
  if (statusTab === "COMPLETED") {
    return (
      raw === "FINANCIALLY_SETTLED" ||
      raw === "COMPLETED" ||
      raw === "EVENT_DELIVERED" ||
      norm === "FINANCIALLY_SETTLED" ||
      norm === "EVENT_DELIVERED"
    );
  }
  if (statusTab === "CANCELLED") {
    return (
      raw === "CANCELLED" ||
      raw === "DECLINED" ||
      raw === "EXPIRED" ||
      norm === "CANCELLED"
    );
  }
  return true;
}

export default function UnifiedCrmPipelinePage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [talents, setTalents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"LIST" | "KANBAN">("LIST");

  // Organized Filter States
  const [statusTab, setStatusTab] = useState<string>("ALL");
  const [monthFilter, setMonthFilter] = useState<string>("ALL_DATES");
  const [specificDateFilter, setSpecificDateFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL_CATEGORIES");
  const [sortBy, setSortBy] = useState<
    "NEWEST_LEAD" | "DATE_ASC" | "DATE_DESC" | "RATE_DESC"
  >("NEWEST_LEAD");
  const [search, setSearch] = useState("");

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
  const [formAutoNameEnabled, setFormAutoNameEnabled] = useState<boolean>(true);
  const [formCustomTags, setFormCustomTags] = useState<string[]>(["New Lead"]);
  const [formCustomTagInput, setFormCustomTagInput] = useState<string>("");
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
      fetch(`/api/leads?filter=ALL`).then((res) => res.json()),
      fetch("/api/talents")
        .then((res) => res.json())
        .catch(() => ({ talents: [] })),
    ])
      .then(([d, tData]) => {
        if (d.success && Array.isArray(d.leads)) setLeads(d.leads);
        if (tData?.talents) setTalents(tData.talents);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCrmData();
  }, []);

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

  // Auto-update Organized Deal Name when formAutoNameEnabled is true
  useEffect(() => {
    if (!formAutoNameEnabled) return;
    const selectedTalentObj = talents.find((t) => t.id === formTalentId);
    const generated = buildAutoOrganizedDealName({
      eventDate: formEventDate,
      status: formStatus,
      venue: formVenue,
      companyName: formCompanyName,
      santaName: selectedTalentObj?.displayName,
      activityLabel: modalLivePkg.eventActivityLabel,
    });
    setFormEventName(generated);
  }, [
    formAutoNameEnabled,
    formEventDate,
    formStatus,
    formVenue,
    formCompanyName,
    formTalentId,
    modalLivePkg.eventActivityLabel,
    talents,
  ]);

  const handleToggleCustomTag = (tag: string) => {
    setFormCustomTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddCustomTagInput = () => {
    const clean = formCustomTagInput.trim();
    if (!clean) return;
    if (!formCustomTags.includes(clean)) {
      setFormCustomTags((prev) => [...prev, clean]);
    }
    setFormCustomTagInput("");
  };

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
    setFormAutoNameEnabled(true);
    setFormCustomTags(["New Lead"]);
    setFormCustomTagInput("");
    setFormEventDate(specificDateFilter || "2026-11-15");
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
    const dateStr = toDateInputKey(lead.eventDate) || "2026-11-15";

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
    setFormAutoNameEnabled(false);
    setFormEventName(info.organizedDealName || lead.eventName || "");
    setFormCustomTags(
      info.customTags.length > 0
        ? info.customTags
        : [getStageOption(lead.status).shortBadge === "BOOKED" ? "Booked" : "New Lead"]
    );
    setFormCustomTagInput("");
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
      const selectedTalentObj = talents.find((t) => t.id === formTalentId);
      const effectiveDealName =
        formEventName.trim() ||
        buildAutoOrganizedDealName({
          eventDate: formEventDate,
          status: formStatus,
          venue: formVenue,
          companyName: formCompanyName,
          santaName: selectedTalentObj?.displayName,
          activityLabel: modalLivePkg.eventActivityLabel,
        });

      const mergedTags = Array.from(
        new Set([...(modalLivePkg.tags || []), ...formCustomTags])
      );

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
        tags: mergedTags,
        customTags: formCustomTags,
        organizedDealName: effectiveDealName,
        dpStatus: formDepositPaid > 0 ? "Paid" : "Pending",
        collectiblesStatus:
          formQuotedAmount - formDepositPaid <= 0 && formQuotedAmount > 0
            ? "Collected"
            : "Pending",
        contractStatus:
          formStatus === "READY_FOR_DEPLOYMENT"
            ? "Signed Contract"
            : "Quotation / Draft",
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
            bookingType:
              formActivityTag === "PRIVATE_PARTY" ? "PRIVATE" : "CORPORATE",
            eventName: effectiveDealName,
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
        if (!data.success)
          throw new Error(data.error || "Failed to update CRM deal");
        showToast("Updated CRM deal & synced to Dashboard and Master Calendar!");
        if (selectedLead?.id === editingLeadId) {
          setSelectedLead(data.booking);
        }
      } else {
        const res = await fetch("/api/public/request-quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientName:
              formContactPerson || formCompanyName || "Client Contact",
            companyName: formCompanyName || formVenue,
            email: formEmail || "events@client.local",
            phone: formPhone || "0917 000 0000",
            bookingType:
              formActivityTag === "PRIVATE_PARTY" ? "PRIVATE" : "CORPORATE",
            eventName: effectiveDealName,
            organizedDealName: effectiveDealName,
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
            depositPaid: formDepositPaid,
            agreedTalentFee: formAgreedTf,
            status: formStatus,
            customTags: formCustomTags,
            ledgerMeta,
            specialRequests: formNotes,
            talentPreferenceId: formTalentId || undefined,
            consentAgreed: true,
          }),
        });
        const data = await res.json();
        if (!data.success)
          throw new Error(data.error || "Failed to create CRM deal");
        showToast(
          `Created CRM Deal ${data.bookingNumber} (${getStageOption(formStatus).shortBadge})!`
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
      const info = extractLeadTagsAndMeta(lead);
      const assignedSantaName =
        lead.talentAssignments?.[0]?.talent?.displayName || "";
      const updatedOrganizedName = buildAutoOrganizedDealName({
        eventDate: lead.eventDate,
        status: newStatus,
        venue: lead.mallOrVenue,
        companyName: lead.client?.companyName,
        santaName: assignedSantaName,
        activityLabel: info.eventActivityLabel,
      });

      const updatedLedgerMeta = {
        ...info.meta,
        organizedDealName: updatedOrganizedName,
      };

      const res = await fetch(`/api/bookings/${lead.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-role": "SUPER_ADMIN",
        },
        body: JSON.stringify({
          isCalendarDirectEdit: true,
          status: newStatus,
          eventName: updatedOrganizedName,
          ledgerMeta: updatedLedgerMeta,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const opt = getStageOption(newStatus);
        showToast(`Updated ${lead.bookingNumber} → ${opt.shortBadge}`);
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
    if (
      !confirm(
        `Delete CRM deal ${lead.bookingNumber || ""} (${
          lead.mallOrVenue || lead.eventName || "Deal"
        })?`
      )
    )
      return;
    try {
      const res = await fetch(`/api/bookings/${lead.id}`, {
        method: "DELETE",
        headers: { "x-admin-role": "SUPER_ADMIN" },
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Deleted ${lead.bookingNumber || "CRM Deal"}`);
        if (selectedLead?.id === lead.id) setSelectedLead(null);
        setIsModalOpen(false);
        fetchCrmData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Compute live counts for each Status Tab
  const statusCounts = useMemo(() => {
    return {
      ALL: leads.length,
      NEW_LEAD: leads.filter((l) => matchesStatusTab(l, "NEW_LEAD")).length,
      QUOTED_HOLD: leads.filter((l) => matchesStatusTab(l, "QUOTED_HOLD")).length,
      PENDING_DP: leads.filter((l) => matchesStatusTab(l, "PENDING_DP")).length,
      BOOKED: leads.filter((l) => matchesStatusTab(l, "BOOKED")).length,
      COMPLETED: leads.filter((l) => matchesStatusTab(l, "COMPLETED")).length,
      CANCELLED: leads.filter((l) => matchesStatusTab(l, "CANCELLED")).length,
    };
  }, [leads]);

  // Apply Status Tab + Month/Date Filter + Category Filter + Search + Sort
  const filteredLeads = useMemo(() => {
    const q = search.trim().toLowerCase();

    const list = leads.filter((lead) => {
      // 1. Status Tab
      if (!matchesStatusTab(lead, statusTab)) return false;

      // 2. Specific Date Filter
      const dateKey = toDateInputKey(lead.eventDate);
      if (specificDateFilter && dateKey !== specificDateFilter) {
        return false;
      }

      // 3. Month / Season Filter
      if (monthFilter !== "ALL_DATES") {
        if (monthFilter === "OCT" && !dateKey.includes("-10-")) return false;
        if (monthFilter === "NOV" && !dateKey.includes("-11-")) return false;
        if (monthFilter === "DEC" && !dateKey.includes("-12-")) return false;
        if (
          monthFilter === "PEAK_DEC" &&
          !["-12-24", "-12-25", "-12-30", "-12-31"].some((s) =>
            dateKey.includes(s)
          )
        ) {
          return false;
        }
        if (monthFilter === "UPCOMING") {
          const todayKey = new Date().toISOString().slice(0, 10);
          if (dateKey < todayKey) return false;
        }
      }

      // 4. Category / Tier Filter
      const info = extractLeadTagsAndMeta(lead);
      if (categoryFilter === "REAL_BEARD" && info.santaTier !== "REAL_BEARD") {
        return false;
      }
      if (categoryFilter === "FAKE_BEARD" && info.santaTier !== "FAKE_BEARD") {
        return false;
      }
      if (
        categoryFilter === "SANTA_AND_ELVES" &&
        info.santaTier !== "SANTA_AND_ELVES"
      ) {
        return false;
      }
      if (
        categoryFilter === "CORPORATE" &&
        String(lead.bookingType || "CORPORATE").toUpperCase().includes("PRIVATE")
      ) {
        return false;
      }
      if (
        categoryFilter === "PRIVATE" &&
        !String(lead.bookingType || "").toUpperCase().includes("PRIVATE")
      ) {
        return false;
      }

      // 5. Search Query
      if (q) {
        const assignedSanta =
          lead.talentAssignments?.[0]?.talent?.displayName || "";
        const hay = [
          lead.bookingNumber,
          lead.mallOrVenue,
          lead.eventName,
          info.organizedDealName,
          lead.city,
          lead.client?.companyName,
          lead.client?.primaryContact,
          assignedSanta,
          dateKey,
          formatShortDateLabel(lead.eventDate),
          getStageOption(lead.status).shortBadge,
          ...(info.tags || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!hay.includes(q)) return false;
      }

      return true;
    });

    // 6. Sort Order
    list.sort((a, b) => {
      if (sortBy === "DATE_ASC") {
        return toDateInputKey(a.eventDate).localeCompare(
          toDateInputKey(b.eventDate)
        );
      }
      if (sortBy === "DATE_DESC") {
        return toDateInputKey(b.eventDate).localeCompare(
          toDateInputKey(a.eventDate)
        );
      }
      if (sortBy === "RATE_DESC") {
        const rateA = extractLeadTagsAndMeta(a).quotedAmount;
        const rateB = extractLeadTagsAndMeta(b).quotedAmount;
        return rateB - rateA;
      }
      // Default: NEWEST_LEAD (New Leads & newly created bookings at the top, then by date)
      const isNewA =
        String(a.id).startsWith("bk_") ||
        matchesStatusTab(a, "NEW_LEAD") ||
        matchesStatusTab(a, "QUOTED_HOLD");
      const isNewB =
        String(b.id).startsWith("bk_") ||
        matchesStatusTab(b, "NEW_LEAD") ||
        matchesStatusTab(b, "QUOTED_HOLD");
      if (isNewA !== isNewB) return isNewA ? -1 : 1;
      return toDateInputKey(a.eventDate).localeCompare(
        toDateInputKey(b.eventDate)
      );
    });

    return list;
  }, [
    leads,
    statusTab,
    monthFilter,
    specificDateFilter,
    categoryFilter,
    search,
    sortBy,
  ]);

  const kanbanColumns = [
    {
      id: "NEW_LEAD",
      title: "1. 🟢 New Leads",
      subtitle: "Fresh inquiries & date checks",
      items: filteredLeads.filter((l) => matchesStatusTab(l, "NEW_LEAD")),
    },
    {
      id: "QUOTED_HOLD",
      title: "2. 🟡 Quoted & 24h Hold",
      subtitle: "Date soft-held / quote sent",
      items: filteredLeads.filter((l) => matchesStatusTab(l, "QUOTED_HOLD")),
    },
    {
      id: "PENDING_DP",
      title: "3. 📜 Contract / Pending DP",
      subtitle: "Awaiting 50% DP & signoff",
      items: filteredLeads.filter((l) => matchesStatusTab(l, "PENDING_DP")),
    },
    {
      id: "BOOKED",
      title: "4. ✅ Booked & Confirmed",
      subtitle: "Locked on Master Calendar",
      items: filteredLeads.filter((l) => matchesStatusTab(l, "BOOKED")),
    },
    {
      id: "COMPLETED",
      title: "5. 🏆 Completed & Settled",
      subtitle: "Delivered & fully collected",
      items: filteredLeads.filter((l) => matchesStatusTab(l, "COMPLETED")),
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
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <span className="badge-esign px-2.5 py-0.5 rounded text-[10px] font-mono">
              ORGANIZED DEAL BOARD • DATES • NEW LEADS • BOOKED
            </span>
            <h1 className="page-title text-2xl font-serif tracking-tight">
              CRM Deals, Dates &amp; Booking Pipeline
            </h1>
          </div>
          <p className="page-subtitle text-xs mt-1">
            Organized by Event Date, Deal Status (New Lead, Quoted/Hold, Pending DP, Booked, Completed), Venue, and Assigned Santa.
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
            + New CRM Deal / Lead
          </button>
        </div>
      </div>

      {/* =====================================================================
          ROW 1: CLEAN STATUS PIPELINE TABS WITH LIVE COUNTS
         ===================================================================== */}
      <div className="dashboard-card p-4 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "ALL", label: "All CRM Deals", count: statusCounts.ALL },
            {
              id: "NEW_LEAD",
              label: "🟢 New Lead",
              count: statusCounts.NEW_LEAD,
            },
            {
              id: "QUOTED_HOLD",
              label: "🟡 Quoted / 24h Hold",
              count: statusCounts.QUOTED_HOLD,
            },
            {
              id: "PENDING_DP",
              label: "📜 Contract / Pending DP",
              count: statusCounts.PENDING_DP,
            },
            {
              id: "BOOKED",
              label: "✅ Booked / Confirmed",
              count: statusCounts.BOOKED,
            },
            {
              id: "COMPLETED",
              label: "🏆 Completed / Settled",
              count: statusCounts.COMPLETED,
            },
            {
              id: "CANCELLED",
              label: "❌ Cancelled",
              count: statusCounts.CANCELLED,
            },
          ].map((tab) => {
            const active = statusTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
                  active
                    ? "bg-[#9B1B30] text-white border-[#9B1B30] shadow-sm"
                    : "bg-[#FAF7F5] border-[#E8DFE0] text-[#4A3A3D] hover:border-[#9B1B30] hover:text-[#1E1416]"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                    active
                      ? "bg-white/20 text-white"
                      : "bg-white border border-[#E8DFE0] text-[#9B1B30]"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ===================================================================
            ROW 2: DATE / MONTH FILTER + SPECIFIC DATE PICKER + CATEGORY + SORT
           =================================================================== */}
        <div className="pt-3 border-t border-[#E8DFE0] flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
          {/* Month & Holiday Date Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-[#756568] mr-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#9B1B30]" />
              <span>Dates:</span>
            </span>
            {[
              { id: "ALL_DATES", label: "All Dates" },
              { id: "UPCOMING", label: "📅 Upcoming" },
              { id: "OCT", label: "October" },
              { id: "NOV", label: "November" },
              { id: "DEC", label: "December" },
              { id: "PEAK_DEC", label: "🎄 Peak Dec 24–25" },
            ].map((m) => {
              const active = monthFilter === m.id && !specificDateFilter;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setMonthFilter(m.id);
                    setSpecificDateFilter("");
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition border ${
                    active
                      ? "bg-[#1E1416] text-[#F3D899] border-[#1E1416]"
                      : "bg-white border-[#D6C7C9] text-[#4A3A3D] hover:border-[#9B1B30]"
                  }`}
                >
                  {m.label}
                </button>
              );
            })}

            {/* Exact Event Date Picker */}
            <div className="inline-flex items-center gap-1 bg-white border border-[#D6C7C9] rounded-lg px-2 py-1">
              <span className="text-[10px] font-mono text-[#756568]">
                Pick Date:
              </span>
              <input
                type="date"
                value={specificDateFilter}
                onChange={(e) => {
                  setSpecificDateFilter(e.target.value);
                  if (e.target.value) setMonthFilter("ALL_DATES");
                }}
                className="text-[11px] font-mono text-[#1E1416] bg-transparent focus:outline-none"
              />
              {specificDateFilter && (
                <button
                  type="button"
                  onClick={() => setSpecificDateFilter("")}
                  className="text-[#9B1B30] hover:underline text-[10px] font-bold ml-1"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Right Controls: Category Filter + Sort + Search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1 bg-white border border-[#D6C7C9] rounded-lg px-2.5 py-1.5">
              <Filter className="w-3 h-3 text-[#9B1B30]" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs bg-transparent text-[#1E1416] font-semibold focus:outline-none"
              >
                <option value="ALL_CATEGORIES">All Santa Tiers &amp; Events</option>
                <option value="REAL_BEARD">🎅 Real Beard (₱24k–₱26k)</option>
                <option value="FAKE_BEARD">🎭 Fake Beard (₱15k–₱18k)</option>
                <option value="SANTA_AND_ELVES">🎅🧝 Santa + 2 Elves (₱32k)</option>
                <option value="CORPORATE">🏢 Corporate &amp; Shopping Malls</option>
                <option value="PRIVATE">🏠 Private &amp; Family Parties</option>
              </select>
            </div>

            <div className="inline-flex items-center gap-1 bg-white border border-[#D6C7C9] rounded-lg px-2.5 py-1.5">
              <ArrowUpDown className="w-3 h-3 text-[#9B1B30]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs bg-transparent text-[#1E1416] font-semibold focus:outline-none"
              >
                <option value="NEWEST_LEAD">Sort: New Leads First</option>
                <option value="DATE_ASC">Sort: Event Date (Earliest)</option>
                <option value="DATE_DESC">Sort: Event Date (Latest)</option>
                <option value="RATE_DESC">Sort: Highest Package Rate</option>
              </select>
            </div>

            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-[#756568] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search deal, date, Santa, venue..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-[#D6C7C9] rounded-lg"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#756568] hover:text-[#1E1416]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* VIEW MODE: KANBAN BOARD (5 STAGE COLUMNS) */}
      {viewMode === "KANBAN" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {kanbanColumns.map((col) => (
            <div
              key={col.id}
              className="dashboard-card p-3 flex flex-col space-y-3"
            >
              <div className="border-b border-[#E8DFE0] pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1E1416]">
                    {col.title}
                  </span>
                  <span className="badge-esign px-2 py-0.5 rounded-full text-[10px] font-mono">
                    {col.items.length}
                  </span>
                </div>
                <p className="text-[10px] text-[#756568] mt-0.5">
                  {col.subtitle}
                </p>
              </div>

              <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
                {col.items.length === 0 ? (
                  <div className="p-6 text-center text-[11px] text-[#756568]">
                    No deals in stage
                  </div>
                ) : (
                  col.items.map((lead) => {
                    const info = extractLeadTagsAndMeta(lead);
                    const stageOpt = getStageOption(lead.status);
                    const assignedSanta = lead.talentAssignments?.[0]?.talent;
                    return (
                      <div
                        key={lead.id}
                        onClick={() => setSelectedLead(lead)}
                        className="p-3 rounded-xl bg-[#FCF9F8] border border-[#E8DFE0] hover:border-[#9B1B30] cursor-pointer transition space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between font-mono text-[10px]">
                          <span
                            className={`px-1.5 py-0.5 rounded font-bold border ${stageOpt.badgeColor}`}
                          >
                            {stageOpt.shortBadge}
                          </span>
                          <span className="font-bold text-[#9B1B30]">
                            ₱{info.quotedAmount.toLocaleString()}
                          </span>
                        </div>

                        <div className="font-bold text-[#1E1416] text-xs leading-snug">
                          {info.organizedDealName}
                        </div>

                        <div className="text-[11px] text-[#4A3A3D] flex items-center justify-between">
                          <span className="truncate">{lead.mallOrVenue}</span>
                          {assignedSanta && (
                            <span className="text-[10px] font-mono text-emerald-700 font-bold shrink-0">
                              🎅 {assignedSanta.displayName}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {info.customTags.map((ct: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded bg-[#1E1416] text-[#F3D899] text-[9px] font-mono font-semibold"
                            >
                              {ct}
                            </span>
                          ))}
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold ${
                              info.santaTier === "REAL_BEARD"
                                ? "bg-[#F9EBED] text-[#9B1B30] border border-[#F0D0D5]"
                                : "bg-stone-100 text-stone-700 border border-stone-300"
                            }`}
                          >
                            {info.santaTier === "REAL_BEARD"
                              ? "🎅 Real Beard"
                              : info.santaTier === "SANTA_AND_ELVES"
                              ? "🎅🧝 Santa + Elves"
                              : "🎭 Fake Beard"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1.5 border-t border-[#E8DFE0]">
                          <div className="text-[10px] font-mono text-[#1E1416] font-semibold flex items-center space-x-1">
                            <Calendar className="w-3 h-3 text-[#9B1B30]" />
                            <span>{formatShortDateLabel(lead.eventDate)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => openEditLeadModal(lead, e)}
                              className="px-2 py-0.5 rounded bg-white border border-[#D6C7C9] text-[#1E1416] hover:border-[#9B1B30] text-[10px] font-semibold flex items-center space-x-1"
                            >
                              <Pencil className="w-2.5 h-2.5 text-[#9B1B30]" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteLead(lead, e)}
                              className="p-1 rounded bg-white border border-[#D6C7C9] text-rose-700 hover:bg-rose-50"
                              title="Delete deal"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          </div>
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
        /* VIEW MODE: ORGANIZED LIST TABLE */
        <div className="dashboard-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FCF9F8] border-b border-[#E8DFE0] text-[10px] font-mono uppercase tracking-wider text-[#756568]">
                  <th className="py-3 px-4 font-semibold">
                    Organized Deal Name (Date • Status • Venue • Santa)
                  </th>
                  <th className="py-3 px-4 font-semibold">
                    Event Date &amp; Time
                  </th>
                  <th className="py-3 px-4 font-semibold">
                    Client &amp; Assigned Santa
                  </th>
                  <th className="py-3 px-4 font-semibold">
                    Package &amp; Custom Tags
                  </th>
                  <th className="py-3 px-4 font-semibold">Quoted Rate</th>
                  <th className="py-3 px-4 font-semibold">
                    Pipeline Status (New Lead / Booked)
                  </th>
                  <th className="py-3 px-4 font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DFE0]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#756568]">
                      Loading organized CRM deals &amp; schedule...
                    </td>
                  </tr>
                ) : filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#756568]">
                      No CRM deals match the selected status or date filter.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => {
                    const info = extractLeadTagsAndMeta(lead);
                    const stageOpt = getStageOption(lead.status);
                    const assignedSanta = lead.talentAssignments?.[0]?.talent;

                    return (
                      <tr
                        key={lead.id}
                        onClick={() => setSelectedLead(lead)}
                        className="hover:bg-[#F4ECEE]/60 cursor-pointer transition"
                      >
                        {/* Column 1: Organized Deal Name */}
                        <td className="py-3.5 px-4 max-w-[320px]">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-[10px] text-[#9B1B30] font-bold">
                              {lead.bookingNumber}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border ${stageOpt.badgeColor}`}
                            >
                              {stageOpt.shortBadge}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-[#FAF7F5] border border-[#D6C7C9] text-[#1E1416] text-[9px] font-mono font-semibold">
                              📅 {formatShortDateLabel(lead.eventDate)}
                            </span>
                          </div>

                          <div className="font-bold text-[#1E1416] text-xs mt-1 leading-snug">
                            {info.organizedDealName}
                          </div>

                          <div className="text-[11px] text-[#756568] mt-0.5 truncate">
                            📍 Venue: <strong className="text-[#4A3A3D]">{lead.mallOrVenue}</strong>
                            {lead.city ? ` (${lead.city})` : ""}
                          </div>
                        </td>

                        {/* Column 2: Event Date & Time */}
                        <td className="py-3.5 px-4 font-mono text-[#4A3A3D] whitespace-nowrap">
                          <div className="font-bold text-[#1E1416] flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-[#9B1B30]" />
                            <span>{formatShortDateLabel(lead.eventDate)}</span>
                          </div>
                          <div className="text-[10px] text-[#756568] mt-0.5">
                            {lead.startTime || "14:00"}–{lead.endTime || "17:00"} (
                            {info.durationHours} hrs)
                          </div>
                        </td>

                        {/* Column 3: Client & Assigned Santa */}
                        <td className="py-3.5 px-4">
                          <span className="text-[#1E1416] font-semibold block">
                            {lead.client?.companyName ||
                              lead.client?.primaryContact ||
                              "Direct Client"}
                          </span>
                          <span className="text-[11px] text-[#756568] block">
                            {lead.client?.primaryContact ||
                              lead.client?.email ||
                              ""}
                          </span>
                          {assignedSanta ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold mt-1">
                              🎅 Santa {assignedSanta.displayName}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-semibold mt-1">
                              🎅 Unassigned / TBD
                            </span>
                          )}
                        </td>

                        {/* Column 4: Package & Custom Tags */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1 max-w-[230px]">
                            {info.customTags.map((ct: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded bg-[#1E1416] text-[#F3D899] text-[10px] font-mono font-semibold"
                              >
                                ★ {ct}
                              </span>
                            ))}
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                                info.santaTier === "REAL_BEARD"
                                  ? "bg-[#F9EBED] text-[#9B1B30] border-[#F0D0D5]"
                                  : "bg-stone-100 text-stone-700 border-stone-300"
                              }`}
                            >
                              {info.santaTier === "REAL_BEARD"
                                ? "🎅 Real Beard"
                                : info.santaTier === "SANTA_AND_ELVES"
                                ? "🎅🧝 Santa + 2 Elves"
                                : "🎭 Fake Beard"}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-mono font-medium">
                              {info.eventActivityLabel}
                            </span>
                          </div>
                        </td>

                        {/* Column 5: Quoted Rate */}
                        <td className="py-3.5 px-4 font-mono whitespace-nowrap">
                          <div className="font-bold text-[#9B1B30] text-sm">
                            ₱{info.quotedAmount.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-[#756568]">
                            {Number(lead.depositPaid || 0) > 0
                              ? `DP Paid: ₱${Number(lead.depositPaid).toLocaleString()}`
                              : info.extraHours > 0
                              ? `Base ₱${info.baseRate.toLocaleString()} + ₱${info.extraHourCharge.toLocaleString()}`
                              : `Min 3 Hrs Base`}
                          </div>
                        </td>

                        {/* Column 6: Quick Status Switcher (New Lead / Quoted / Booked) */}
                        <td
                          className="py-3.5 px-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="space-y-1.5 min-w-[175px]">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  handleQuickStatusUpdate(
                                    lead,
                                    "INQUIRY_RECEIVED"
                                  )
                                }
                                className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border transition ${
                                  stageOpt.value === "INQUIRY_RECEIVED"
                                    ? "bg-emerald-600 text-white border-emerald-700"
                                    : "bg-white text-[#4A3A3D] border-[#D6C7C9] hover:border-emerald-600"
                                }`}
                              >
                                New Lead
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleQuickStatusUpdate(lead, "QUOTE_ISSUED")
                                }
                                className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border transition ${
                                  stageOpt.value === "QUOTE_ISSUED" ||
                                  stageOpt.value === "HOLD_24H_ACTIVE"
                                    ? "bg-amber-500 text-white border-amber-600"
                                    : "bg-white text-[#4A3A3D] border-[#D6C7C9] hover:border-amber-500"
                                }`}
                              >
                                Quoted
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleQuickStatusUpdate(
                                    lead,
                                    "READY_FOR_DEPLOYMENT"
                                  )
                                }
                                className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border transition ${
                                  stageOpt.value === "READY_FOR_DEPLOYMENT"
                                    ? "bg-[#1B5E20] text-white border-[#1B5E20]"
                                    : "bg-white text-[#4A3A3D] border-[#D6C7C9] hover:border-[#1B5E20]"
                                }`}
                              >
                                Booked ✓
                              </button>
                            </div>

                            <select
                              value={stageOpt.value}
                              onChange={(e) =>
                                handleQuickStatusUpdate(lead, e.target.value)
                              }
                              className="block w-full text-[10px] px-2 py-1 rounded bg-[#FAF7F5] border border-[#D6C7C9] text-[#1E1416] font-semibold"
                            >
                              {CRM_STAGE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>

                        {/* Column 7: Actions */}
                        <td
                          className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={(e) => openEditLeadModal(lead, e)}
                            className="inline-flex items-center px-2.5 py-1 text-[11px] font-semibold rounded bg-white text-[#1E1416] border border-[#D6C7C9] hover:border-[#9B1B30] transition"
                          >
                            <Pencil className="w-3 h-3 mr-1 text-[#9B1B30]" />
                            Edit / Rename
                          </button>
                          <Link
                            href={`/admin/quotes?bookingId=${lead.id}`}
                            className="inline-flex items-center px-2.5 py-1 text-[11px] font-semibold rounded bg-[#F9EBED] text-[#9B1B30] border border-[#F0D0D5] hover:bg-[#F3DCE0] transition"
                          >
                            Quote →
                          </Link>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteLead(lead, e)}
                            className="inline-flex items-center p-1.5 text-[11px] font-semibold rounded bg-white text-rose-700 border border-[#D6C7C9] hover:bg-rose-50 hover:border-rose-300 transition"
                            title="Delete Deal"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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
                      <h2 className="text-lg font-serif font-bold text-[#1E1416] mt-0.5">
                        {info.organizedDealName}
                      </h2>
                      <p className="text-xs text-[#756568] mt-0.5">
                        📍 Venue: {selectedLead.mallOrVenue}
                      </p>
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
                        {selectedLead.client?.phone
                          ? `• ${selectedLead.client.phone}`
                          : ""}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-[#FCF9F8] border border-[#E8DFE0]">
                      <span className="text-[#756568] block text-[11px]">
                        Event Date &amp; Duration
                      </span>
                      <strong className="text-[#1E1416] block mt-0.5">
                        {formatShortDateLabel(selectedLead.eventDate)}
                      </strong>
                      <span className="text-[11px] text-[#756568] font-mono">
                        {selectedLead.startTime || "14:00"}–
                        {selectedLead.endTime || "17:00"} ({info.durationHours}{" "}
                        hrs)
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
                      {CRM_STAGE_OPTIONS.map((opt) => {
                        const isCurrent =
                          getStageOption(selectedLead.status).value ===
                          opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() =>
                              handleQuickStatusUpdate(selectedLead, opt.value)
                            }
                            className={`p-2 rounded-lg border text-left text-[11px] font-semibold transition ${
                              isCurrent
                                ? "bg-[#9B1B30] text-white border-[#9B1B30]"
                                : "bg-white text-[#1E1416] border-[#D6C7C9] hover:border-[#9B1B30]"
                            }`}
                          >
                            <div>{opt.pillLabel}</div>
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

      {/* =====================================================================
          CREATE / EDIT ORGANIZED CRM DEAL & QUOTATION MODAL
         ===================================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="dashboard-card w-full max-w-3xl p-6 space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E8DFE0] pb-3">
              <div>
                <span className="badge-esign px-2 py-0.5 rounded text-[10px] font-mono">
                  {editingLeadId
                    ? "EDIT & ORGANIZE CRM DEAL"
                    : "CREATE ORGANIZED CRM DEAL / LEAD"}
                </span>
                <h2 className="text-lg font-serif font-bold text-[#1E1416] mt-1">
                  {editingLeadId
                    ? `Organize Deal Name, Dates & Status (${
                        formVenue || "Deal"
                      })`
                    : "Create Organized CRM Deal (New Lead / Quoted / Booked)"}
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
              {/* SECTION A: ORGANIZED CRM DEAL NAME, STATUS & CUSTOM TAGS */}
              <div className="p-4 rounded-xl bg-[#FCF9F8] border-2 border-[#9B1B30]/30 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="font-bold text-[#1E1416] text-xs flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#9B1B30]" />
                    <span>
                      Organized CRM Deal Name (Date • Status • Venue • Santa)
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const selectedTalentObj = talents.find(
                        (t) => t.id === formTalentId
                      );
                      const generated = buildAutoOrganizedDealName({
                        eventDate: formEventDate,
                        status: formStatus,
                        venue: formVenue,
                        companyName: formCompanyName,
                        santaName: selectedTalentObj?.displayName,
                        activityLabel: modalLivePkg.eventActivityLabel,
                      });
                      setFormEventName(generated);
                      setFormAutoNameEnabled(true);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#9B1B30] text-white text-[11px] font-semibold hover:bg-[#7A1526] transition"
                  >
                    <Wand2 className="w-3 h-3" />
                    <span>Auto-Format Deal Name</span>
                  </button>
                </div>

                <input
                  type="text"
                  value={formEventName}
                  onChange={(e) => {
                    setFormAutoNameEnabled(false);
                    setFormEventName(e.target.value);
                  }}
                  placeholder="[Nov 16, 2026] • [NEW LEAD] • SM Megamall • Santa Edwin"
                  className="w-full px-3.5 py-2.5 font-semibold text-xs bg-white border border-[#D6C7C9] rounded-lg text-[#1E1416]"
                />

                {/* Quick Pipeline Status Pills (New Lead / Quoted / Booked / etc.) */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-[#4A3A3D] block">
                    Select Deal Stage (New Lead, 24h Hold, Quoted, Booked, etc.):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {CRM_STAGE_OPTIONS.map((opt) => {
                      const active = formStatus === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setFormStatus(opt.value);
                            if (opt.value === "READY_FOR_DEPLOYMENT") {
                              setFormCustomTags((prev) =>
                                Array.from(
                                  new Set([
                                    ...prev.filter((t) => t !== "New Lead"),
                                    "Booked",
                                  ])
                                )
                              );
                            } else if (opt.value === "INQUIRY_RECEIVED") {
                              setFormCustomTags((prev) =>
                                Array.from(
                                  new Set([
                                    ...prev.filter((t) => t !== "Booked"),
                                    "New Lead",
                                  ])
                                )
                              );
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition ${
                            active
                              ? "bg-[#9B1B30] text-white border-[#9B1B30] shadow-xs"
                              : "bg-white text-[#1E1416] border-[#D6C7C9] hover:border-[#9B1B30]"
                          }`}
                        >
                          {opt.pillLabel}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom CRM Tags & Labels */}
                <div className="space-y-1.5 pt-2 border-t border-[#E8DFE0]">
                  <span className="text-[11px] font-bold text-[#4A3A3D] flex items-center gap-1">
                    <Tag className="w-3 h-3 text-[#9B1B30]" />
                    <span>
                      Custom CRM Labels &amp; Status Tags (Click to Toggle or Add Your Own):
                    </span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_CUSTOM_TAGS.map((tag) => {
                      const active = formCustomTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleToggleCustomTag(tag)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border transition ${
                            active
                              ? "bg-[#1E1416] text-[#F3D899] border-[#1E1416]"
                              : "bg-white text-[#6E5D5F] border-[#D6C7C9] hover:border-[#1E1416]"
                          }`}
                        >
                          {active ? `✓ ${tag}` : `+ ${tag}`}
                        </button>
                      );
                    })}
                    {formCustomTags
                      .filter((t) => !PRESET_CUSTOM_TAGS.includes(t))
                      .map((custom) => (
                        <span
                          key={custom}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#9B1B30] text-white text-[10px] font-mono font-bold"
                        >
                          <span>{custom}</span>
                          <button
                            type="button"
                            onClick={() => handleToggleCustomTag(custom)}
                            className="hover:opacity-75"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={formCustomTagInput}
                      onChange={(e) => setFormCustomTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCustomTagInput();
                        }
                      }}
                      placeholder="Add custom label (e.g. Call Back Nov 18, VIP Mall, Confirmed DP)..."
                      className="flex-1 px-3 py-1.5 text-[11px] bg-white border border-[#D6C7C9] rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomTagInput}
                      className="px-3 py-1.5 rounded-lg bg-[#1E1416] text-[#F3D899] text-[11px] font-semibold"
                    >
                      + Add Tag
                    </button>
                  </div>
                </div>
              </div>

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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
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
                        🎅 Real-Beard Santa
                      </strong>
                      <span className="badge-esign px-1.5 py-0.5 rounded text-[9px] font-mono">
                        Limited
                      </span>
                    </div>
                    <div className="font-mono text-[10px] mt-1">
                      MM: ₱24k • Hol/OOT: ₱26k
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
                        🎭 Classic (Fake Beard)
                      </strong>
                      <span className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 text-[9px] font-mono">
                        Standard
                      </span>
                    </div>
                    <div className="font-mono text-[10px] mt-1">
                      MM: ₱15k • Hol/OOT: ₱18k
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormSantaTier("SANTA_AND_ELVES");
                      setFormAutoCalculatePrice(true);
                      setFormAgreedTf(16000);
                    }}
                    className={`p-3 rounded-xl border text-left transition ${
                      formSantaTier === "SANTA_AND_ELVES"
                        ? "bg-[#F9EBED] border-[#9B1B30] text-[#1E1416]"
                        : "bg-white border-[#D6C7C9] text-[#6E5D5F]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-xs text-[#9B1B30]">
                        🎅🧝 Santa + 2 Elves
                      </strong>
                      <span className="badge-esign px-1.5 py-0.5 rounded text-[9px] font-mono">
                        Full Cast
                      </span>
                    </div>
                    <div className="font-mono text-[10px] mt-1">
                      Package Rate: ₱32,000
                    </div>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block mb-1">Rate Territory</label>
                    <select
                      value={formRateTerritory}
                      onChange={(e) => {
                        setFormRateTerritory(
                          e.target.value as SantaRateTerritory
                        );
                        setFormAutoCalculatePrice(true);
                      }}
                      className="w-full px-3 py-2"
                    >
                      <option value="METRO_MANILA">
                        Metro Manila Rate (₱
                        {formSantaTier === "SANTA_AND_ELVES"
                          ? "32,000"
                          : formSantaTier === "REAL_BEARD"
                          ? "24,000"
                          : "15,000"}
                        )
                      </option>
                      <option value="HOLIDAY">
                        Holiday Rate (₱
                        {formSantaTier === "SANTA_AND_ELVES"
                          ? "32,000"
                          : formSantaTier === "REAL_BEARD"
                          ? "26,000"
                          : "18,000"}
                        )
                      </option>
                      <option value="OUT_OF_TOWN">
                        Out of Town Rate (₱
                        {formSantaTier === "SANTA_AND_ELVES"
                          ? "32,000"
                          : formSantaTier === "REAL_BEARD"
                          ? "26,000"
                          : "18,000"}
                        )
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1">Event Activity Tag</label>
                    <select
                      value={formActivityTag}
                      onChange={(e) =>
                        setFormActivityTag(
                          e.target.value as SantaEventActivityTag
                        )
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
                    Base (3h):{" "}
                    <strong>₱{modalLivePkg.baseRate.toLocaleString()}</strong>
                    {modalLivePkg.extraHours > 0 && (
                      <span className="text-[#9B1B30] ml-2">
                        + Extra ({modalLivePkg.extraHours}h × ₱3,000):{" "}
                        <strong>
                          +₱{modalLivePkg.extraHourCharge.toLocaleString()}
                        </strong>
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-bold text-[#9B1B30]">
                    Computed Package: ₱
                    {modalLivePkg.totalQuotedRate.toLocaleString()}
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
                      ? "Save Organized Deal & Sync All Views"
                      : "Create Organized Deal & Sync All Views"}
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
