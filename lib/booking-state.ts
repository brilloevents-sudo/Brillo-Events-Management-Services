export type BookingStatus =
  | "INQUIRY_RECEIVED"
  | "AVAILABILITY_CHECK_PENDING"
  | "AVAILABILITY_CHECKED"
  | "TEMPORARY_HOLD"
  | "QUOTE_DRAFT"
  | "QUOTE_SENT"
  | "AGREEMENT_PENDING"
  | "AGREEMENT_SENT"
  | "AGREEMENT_SIGNED"
  | "PAYMENT_PENDING"
  | "AWAITING_STAFF_APPROVAL"
  | "SECURED_UNASSIGNED"
  | "TALENT_PA_ASSIGNMENT_PENDING"
  | "READY_FOR_DEPLOYMENT"
  | "EVENT_IN_PROGRESS"
  | "EVENT_COMPLETED"
  | "BALANCE_OPEN"
  | "SETTLED_PENDING_TALENT_PAYOUT"
  | "CLOSED"
  | "CANCELLED"
  | "EXPIRED"
  | "ON_HOLD_REVIEW";

export interface StateConfig {
  label: string;
  pipelineStage: number; // 1 to 5
  color: string;
  description: string;
}

export const BOOKING_STATUS_CONFIG: Record<BookingStatus, StateConfig> = {
  INQUIRY_RECEIVED: {
    label: "Inquiry Received",
    pipelineStage: 1,
    color: "bg-blue-900/40 text-blue-300 border-blue-700",
    description: "New client request submitted via public funnel or manual lead entry.",
  },
  AVAILABILITY_CHECK_PENDING: {
    label: "Checking Availability",
    pipelineStage: 1,
    color: "bg-amber-900/40 text-amber-300 border-amber-700",
    description: "Operations reviewing talent schedules and logistics.",
  },
  AVAILABILITY_CHECKED: {
    label: "Availability Checked",
    pipelineStage: 1,
    color: "bg-cyan-900/40 text-cyan-300 border-cyan-700",
    description: "Talent available; ready for quotation or temporary hold.",
  },
  TEMPORARY_HOLD: {
    label: "Temporary Soft Hold (24h)",
    pipelineStage: 1,
    color: "bg-yellow-900/40 text-yellow-300 border-yellow-700",
    description: "24-hour temporary hold active. Not a secured booking.",
  },
  QUOTE_DRAFT: {
    label: "Quote Draft",
    pipelineStage: 1,
    color: "bg-slate-800 text-slate-300 border-slate-600",
    description: "Internal cost estimate and client quote being drafted.",
  },
  QUOTE_SENT: {
    label: "Quote Issued",
    pipelineStage: 1,
    color: "bg-indigo-900/40 text-indigo-300 border-indigo-700",
    description: "Quote sent to client with inclusions and validity period.",
  },
  AGREEMENT_PENDING: {
    label: "Agreement Pending",
    pipelineStage: 1,
    color: "bg-purple-900/40 text-purple-300 border-purple-700",
    description: "Booking agreement framework prepared with specific terms.",
  },
  AGREEMENT_SENT: {
    label: "Agreement Out for Signature",
    pipelineStage: 1,
    color: "bg-purple-900/40 text-purple-200 border-purple-600",
    description: "Contract sent via e-sign or PDF out for signing.",
  },
  AGREEMENT_SIGNED: {
    label: "Agreement Signed",
    pipelineStage: 1,
    color: "bg-teal-900/40 text-teal-300 border-teal-700",
    description: "Contract signed by client. Awaiting verified payment.",
  },
  PAYMENT_PENDING: {
    label: "Payment Pending",
    pipelineStage: 1,
    color: "bg-orange-900/40 text-orange-300 border-orange-700",
    description: "Deposit or full payment awaiting client transfer.",
  },
  AWAITING_STAFF_APPROVAL: {
    label: "Awaiting Staff Confirmation",
    pipelineStage: 1,
    color: "bg-gold-900/40 text-gold-300 border-gold-600",
    description: "Signed contract and verified payment ready for staff authorization.",
  },
  SECURED_UNASSIGNED: {
    label: "Secured (Unassigned)",
    pipelineStage: 2,
    color: "bg-emerald-900/40 text-emerald-300 border-emerald-700",
    description: "Officially secured booking. Talent/PA assignment pending.",
  },
  TALENT_PA_ASSIGNMENT_PENDING: {
    label: "Assignment In Progress",
    pipelineStage: 2,
    color: "bg-emerald-900/40 text-emerald-300 border-emerald-700",
    description: "Talent and PA deployment being scheduled.",
  },
  READY_FOR_DEPLOYMENT: {
    label: "Ready for Deployment",
    pipelineStage: 3,
    color: "bg-emerald-800/60 text-emerald-200 border-emerald-500",
    description: "All assignments and event-day operational checklist items verified.",
  },
  EVENT_IN_PROGRESS: {
    label: "Event In Progress",
    pipelineStage: 3,
    color: "bg-green-700/60 text-white border-green-400",
    description: "Santa and crew currently on-ground at venue.",
  },
  EVENT_COMPLETED: {
    label: "Event Delivered",
    pipelineStage: 4,
    color: "bg-slate-700 text-slate-200 border-slate-500",
    description: "Appearance successfully executed. Ready for balance collection.",
  },
  BALANCE_OPEN: {
    label: "Balance Collectible",
    pipelineStage: 4,
    color: "bg-rose-900/40 text-rose-300 border-rose-700",
    description: "Post-event balance outstanding from client.",
  },
  SETTLED_PENDING_TALENT_PAYOUT: {
    label: "Settled / Payout Pending",
    pipelineStage: 5,
    color: "bg-blue-900/40 text-blue-200 border-blue-600",
    description: "Client fully settled. Net talent fee and advances ready for payout.",
  },
  CLOSED: {
    label: "Closed & Archived",
    pipelineStage: 5,
    color: "bg-neutral-800 text-neutral-400 border-neutral-700",
    description: "All client collections, talent payouts, and expense settlements closed.",
  },
  CANCELLED: {
    label: "Cancelled",
    pipelineStage: 1,
    color: "bg-red-950 text-red-400 border-red-800",
    description: "Booking cancelled with recorded actor and reason.",
  },
  EXPIRED: {
    label: "Hold Expired",
    pipelineStage: 1,
    color: "bg-zinc-800 text-zinc-400 border-zinc-700",
    description: "Temporary hold expired without securing. Slot released.",
  },
  ON_HOLD_REVIEW: {
    label: "On Hold Review",
    pipelineStage: 1,
    color: "bg-amber-950 text-amber-400 border-amber-800",
    description: "Administrative hold due to data discrepancy or client request.",
  },
};

export const PIPELINE_STAGE_LABELS: Record<number, string> = {
  1: "1. Lead Captured & Pending DP",
  2: "2. Secured & To Be Assigned",
  3: "3. Ready for Deployment",
  4: "4. Awaiting Balance (Post-Event)",
  5: "5. Settled & Talent Payout",
};

export function validateStateTransition(
  currentStatus: BookingStatus,
  targetStatus: BookingStatus,
  hasSignedAgreement: boolean,
  hasVerifiedPayment: boolean,
  isStaff: boolean
): { allowed: boolean; reason?: string } {
  if (currentStatus === targetStatus) return { allowed: true };

  // Rule: Only staff can confirm a booking as SECURED
  if (
    targetStatus === "SECURED_UNASSIGNED" ||
    targetStatus === "TALENT_PA_ASSIGNMENT_PENDING"
  ) {
    if (!isStaff) {
      return {
        allowed: false,
        reason: "Only authorized staff can confirm a booking as secured.",
      };
    }
    // Agreement and payment check
    if (!hasSignedAgreement) {
      return {
        allowed: false,
        reason: "A signed agreement is required before confirming a booking as secured.",
      };
    }
    if (!hasVerifiedPayment) {
      return {
        allowed: false,
        reason: "Verified payment/downpayment is required under standard terms.",
      };
    }
  }

  // Rule: Deployment requires assignments
  if (targetStatus === "READY_FOR_DEPLOYMENT" && !isStaff) {
    return {
      allowed: false,
      reason: "Operations authorization required to mark ready for deployment.",
    };
  }

  return { allowed: true };
}
