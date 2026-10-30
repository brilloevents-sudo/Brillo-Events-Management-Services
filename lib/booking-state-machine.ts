/**
 * Deterministic Booking State Machine (v3.0)
 * Enforces chronological gate progression and Dual-Gate Signoff invariants.
 */

export type BookingLifecycleState =
  | "INQUIRY_RECEIVED"
  | "HOLD_24H_ACTIVE"
  | "QUOTE_ISSUED"
  | "CONTRACT_SENT"
  | "CONTRACT_SIGNED_PENDING_DEPOSIT"
  | "AWAITING_STAFF_SIGNOFF"
  | "ROSTER_LOCKED_DISPATCHED"
  | "EVENT_DELIVERED"
  | "FINANCIALLY_SETTLED"
  | "CANCELLED";

export const LIFECYCLE_METADATA: Record<
  BookingLifecycleState,
  {
    step: number;
    label: string;
    badgeClass: string;
    description: string;
  }
> = {
  INQUIRY_RECEIVED: {
    step: 1,
    label: "Inquiry Received",
    badgeClass: "bg-blue-50 text-blue-800 border-blue-200",
    description: "Initial corporate or private event inquiry logged in CRM.",
  },
  HOLD_24H_ACTIVE: {
    step: 2,
    label: "24h Hold Active",
    badgeClass: "badge-gold",
    description: "Calendar date temporarily held for 24 hours pending quote & deposit.",
  },
  QUOTE_ISSUED: {
    step: 3,
    label: "Quote Issued",
    badgeClass: "bg-amber-50 text-amber-900 border-amber-200",
    description: "Direct costing & margin approved; formal quotation sent.",
  },
  CONTRACT_SENT: {
    step: 4,
    label: "Contract Sent",
    badgeClass: "badge-velvet",
    description: "Framework agreement generated and dispatched for signature.",
  },
  CONTRACT_SIGNED_PENDING_DEPOSIT: {
    step: 5,
    label: "Signed • Pending Deposit",
    badgeClass: "badge-gold",
    description: "Signed agreement verified; awaiting 50% reservation deposit.",
  },
  AWAITING_STAFF_SIGNOFF: {
    step: 6,
    label: "Awaiting Staff Signoff",
    badgeClass: "badge-velvet",
    description: "Dual-Gate check required before locking Santa & PA roster.",
  },
  ROSTER_LOCKED_DISPATCHED: {
    step: 7,
    label: "Roster Locked & Dispatched",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
    description: "Commercial & Roster gates passed; Santa performer & PA locked.",
  },
  EVENT_DELIVERED: {
    step: 8,
    label: "Event Delivered",
    badgeClass: "bg-emerald-50 text-emerald-900 border-emerald-300",
    description: "Appearance delivered; awaiting final balance or payout clearance.",
  },
  FINANCIALLY_SETTLED: {
    step: 9,
    label: "Financially Settled",
    badgeClass: "bg-stone-100 text-stone-800 border-stone-300",
    description: "All client receivables, expenses, and Paluwal advances cleared.",
  },
  CANCELLED: {
    step: 0,
    label: "Cancelled / Expired",
    badgeClass: "bg-stone-100 text-stone-500 border-stone-200",
    description: "Hold expired or booking cancelled.",
  },
};

const ALLOWED_TRANSITIONS: Record<BookingLifecycleState, BookingLifecycleState[]> = {
  INQUIRY_RECEIVED: ["HOLD_24H_ACTIVE", "QUOTE_ISSUED", "CANCELLED"],
  HOLD_24H_ACTIVE: ["QUOTE_ISSUED", "CONTRACT_SENT", "CANCELLED"],
  QUOTE_ISSUED: ["CONTRACT_SENT", "CANCELLED"],
  CONTRACT_SENT: ["CONTRACT_SIGNED_PENDING_DEPOSIT", "AWAITING_STAFF_SIGNOFF", "CANCELLED"],
  CONTRACT_SIGNED_PENDING_DEPOSIT: ["AWAITING_STAFF_SIGNOFF", "CANCELLED"],
  AWAITING_STAFF_SIGNOFF: ["ROSTER_LOCKED_DISPATCHED", "CONTRACT_SIGNED_PENDING_DEPOSIT", "CANCELLED"],
  ROSTER_LOCKED_DISPATCHED: ["EVENT_DELIVERED", "CANCELLED"],
  EVENT_DELIVERED: ["FINANCIALLY_SETTLED"],
  FINANCIALLY_SETTLED: [],
  CANCELLED: ["INQUIRY_RECEIVED"],
};

/**
 * Normalizes legacy Prisma status codes into the deterministic v3.0 BookingLifecycleState
 */
export function normalizeToLifecycleState(rawStatus?: string | null): BookingLifecycleState {
  switch ((rawStatus || "").toUpperCase()) {
    case "INQUIRY_RECEIVED":
    case "NEW_INQUIRY":
      return "INQUIRY_RECEIVED";
    case "HOLD_24H_ACTIVE":
    case "TEMPORARY_HOLD":
    case "RESERVED_HOLD":
      return "HOLD_24H_ACTIVE";
    case "QUOTE_ISSUED":
    case "QUOTED":
      return "QUOTE_ISSUED";
    case "CONTRACT_SENT":
      return "CONTRACT_SENT";
    case "CONTRACT_SIGNED_PENDING_DEPOSIT":
      return "CONTRACT_SIGNED_PENDING_DEPOSIT";
    case "AWAITING_STAFF_SIGNOFF":
    case "AWAITING_STAFF_APPROVAL":
    case "AWAITING_VERIFICATION":
      return "AWAITING_STAFF_SIGNOFF";
    case "ROSTER_LOCKED_DISPATCHED":
    case "SECURED_UNASSIGNED":
    case "READY_FOR_DEPLOYMENT":
    case "EVENT_IN_PROGRESS":
      return "ROSTER_LOCKED_DISPATCHED";
    case "EVENT_DELIVERED":
    case "EVENT_COMPLETED":
    case "SETTLED_PENDING_TALENT_PAYOUT":
      return "EVENT_DELIVERED";
    case "FINANCIALLY_SETTLED":
    case "CLOSED":
      return "FINANCIALLY_SETTLED";
    case "CANCELLED":
      return "CANCELLED";
    default:
      return "AWAITING_STAFF_SIGNOFF";
  }
}

export function canTransitionLifecycle(
  from: BookingLifecycleState,
  to: BookingLifecycleState
): boolean {
  if (from === to) return true;
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export interface DualGateInput {
  hasSignedContract: boolean;
  hasInstitutionalWaiver: boolean;
  totalContractAmount: number;
  verifiedDepositPaid: number;
  hasAssignedTalent: boolean;
  hasScheduleOverlap: boolean;
}

export interface DualGateResult {
  canLockRoster: boolean;
  commercialGatePassed: boolean;
  rosterGatePassed: boolean;
  blockingReasons: string[];
}

/**
 * Evaluates True Dual-Gate Approval before transitioning AWAITING_STAFF_SIGNOFF -> ROSTER_LOCKED_DISPATCHED
 */
export function evaluateDualGateSignoff(input: DualGateInput): DualGateResult {
  const blockingReasons: string[] = [];

  const requiredDeposit = Math.round(input.totalContractAmount * 0.5);
  const depositSatisfied =
    input.hasInstitutionalWaiver || input.verifiedDepositPaid >= requiredDeposit;

  const commercialGatePassed = input.hasSignedContract && depositSatisfied;
  if (!input.hasSignedContract) {
    blockingReasons.push("Commercial Gate: Signed contract or institutional MOA is missing.");
  }
  if (!depositSatisfied) {
    blockingReasons.push(
      `Commercial Gate: Verified deposit (₱${input.verifiedDepositPaid.toLocaleString()}) is below 50% threshold (₱${requiredDeposit.toLocaleString()}) and no MOA waiver is active.`
    );
  }

  const rosterGatePassed = !input.hasScheduleOverlap;
  if (input.hasScheduleOverlap) {
    blockingReasons.push(
      "Operations Gate: Assigned Santa performer has an overlapping appearance on this date."
    );
  }

  return {
    canLockRoster: commercialGatePassed && rosterGatePassed,
    commercialGatePassed,
    rosterGatePassed,
    blockingReasons,
  };
}
