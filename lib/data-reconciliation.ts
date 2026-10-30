/**
 * Dynamic Anomaly & Conflict Reconciliation Engine (v3.0)
 * Architectural Reference: tools/rederive & tools/ponytail + tools/openviking context memory.
 * Dynamically inspects booking dates, schedule overlaps, and historical import flags
 * without any hardcoded placeholder error strings.
 */

export interface ReconciliationSummary {
  totalActiveConflicts: number;
  scheduleOverlaps: number;
  dateAnomalies: number;
  pendingSourceConflicts: number;
  dynamicSubtitle: string;
}

export function computeDynamicReconciliation(params: {
  bookings: Array<{
    id: string;
    bookingNumber: string;
    eventDate: Date | string;
    startTime?: string | null;
    endTime?: string | null;
    status: string;
    talentAssignments?: Array<{ talentId: string }>;
  }>;
  pendingConflictsCount: number;
}): ReconciliationSummary {
  let dateAnomalies = 0;
  let scheduleOverlaps = 0;

  // Group active talent assignments by YYYY-MM-DD + talentId
  const talentDateMap = new Map<string, number>();

  for (const b of params.bookings) {
    const d = new Date(b.eventDate);
    const yr = d.getFullYear();
    if (Number.isNaN(yr) || yr < 2023 || yr > 2030) {
      dateAnomalies += 1;
    }

    if (b.status !== "CANCELLED" && b.talentAssignments && b.talentAssignments.length > 0) {
      const dateKey = Number.isNaN(yr) ? "invalid" : d.toISOString().slice(0, 10);
      for (const ta of b.talentAssignments) {
        const key = `${ta.talentId}::${dateKey}`;
        const prev = talentDateMap.get(key) || 0;
        if (prev >= 1) {
          scheduleOverlaps += 1;
        }
        talentDateMap.set(key, prev + 1);
      }
    }
  }

  const totalActiveConflicts =
    params.pendingConflictsCount + scheduleOverlaps + dateAnomalies;

  const parts: string[] = [];
  if (params.pendingConflictsCount > 0) {
    parts.push(`${params.pendingConflictsCount} source audit flags`);
  }
  if (scheduleOverlaps > 0) {
    parts.push(`${scheduleOverlaps} roster overlaps`);
  }
  if (dateAnomalies > 0) {
    parts.push(`${dateAnomalies} date anomalies`);
  }

  const dynamicSubtitle =
    parts.length > 0
      ? parts.join(" • ")
      : "Zero unresolved schedule or import anomalies";

  return {
    totalActiveConflicts,
    scheduleOverlaps,
    dateAnomalies,
    pendingSourceConflicts: params.pendingConflictsCount,
    dynamicSubtitle,
  };
}
