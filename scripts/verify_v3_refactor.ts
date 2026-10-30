import {
  normalizeToLifecycleState,
  canTransitionLifecycle,
  evaluateDualGateSignoff,
} from "../lib/booking-state-machine";
import { validateContractPayload, computeSha256Hex } from "../lib/security";
import { computeDynamicReconciliation } from "../lib/data-reconciliation";

async function runVerification() {
  console.log("=== BRILLO EVENTS SANTA HUB v3.0 AUTOMATED VERIFICATION ===");

  // 1. Security Audit: Reject raw local path traversal on /api/contracts
  const traversalCheck = validateContractPayload({
    bookingId: "booking_001",
    templateType: "WITH_DP",
    signedFileUrl: "/proofs/signed-sm-pasig-contract.pdf",
  });
  if (traversalCheck.valid) {
    throw new Error("SECURITY FAILURE: Raw local path /proofs/... should have been rejected!");
  }
  console.log("[PASS] Path traversal & raw local path rejection:", traversalCheck.error);

  // 2. Security Audit: Accept valid HTTPS storage URL and compute SHA-256
  const httpsCheck = validateContractPayload({
    bookingId: "booking_001",
    templateType: "SM_CUSTOM",
    signerName: "Maria Santos",
    signedFileUrl: "https://storage.brilloevent.com/contracts/sm-moa-2026.pdf",
  });
  if (!httpsCheck.valid || !httpsCheck.data?.documentSha256) {
    throw new Error("SECURITY FAILURE: Valid HTTPS contract URL should pass with SHA-256 digest!");
  }
  console.log(
    "[PASS] Cryptographic SHA-256 Contract Verification:",
    httpsCheck.data.documentSha256.slice(0, 24) + "..."
  );

  // 3. Deterministic State Machine & Dual-Gate Signoff Verification
  const blockedGate = evaluateDualGateSignoff({
    hasSignedContract: false,
    hasInstitutionalWaiver: false,
    totalContractAmount: 18000,
    verifiedDepositPaid: 0,
    hasAssignedTalent: true,
    hasScheduleOverlap: false,
  });
  if (blockedGate.canLockRoster) {
    throw new Error("STATE MACHINE FAILURE: Dual-Gate Signoff must block unsigned/unpaid booking!");
  }
  console.log("[PASS] Dual-Gate Signoff blocks unsigned/unpaid booking:", blockedGate.blockingReasons[0]);

  const passedGate = evaluateDualGateSignoff({
    hasSignedContract: true,
    hasInstitutionalWaiver: false,
    totalContractAmount: 18000,
    verifiedDepositPaid: 9000,
    hasAssignedTalent: true,
    hasScheduleOverlap: false,
  });
  if (!passedGate.canLockRoster) {
    throw new Error("STATE MACHINE FAILURE: Dual-Gate Signoff should pass when 50% DP + MOA + zero overlap!");
  }
  console.log("[PASS] Dual-Gate Signoff passes with signed MOA + 50% verified deposit + zero overlap.");

  // 4. Dynamic Anomaly & Reconciliation Engine (No hardcoded '20206')
  const recon = computeDynamicReconciliation({
    bookings: [
      {
        id: "1",
        bookingNumber: "B2026-001",
        eventDate: "2026-12-15",
        status: "SECURED_UNASSIGNED",
        talentAssignments: [{ talentId: "santa_bob" }],
      },
      {
        id: "2",
        bookingNumber: "B2026-002",
        eventDate: "2026-12-15",
        status: "AWAITING_STAFF_APPROVAL",
        talentAssignments: [{ talentId: "santa_bob" }],
      },
    ],
    pendingConflictsCount: 13,
  });
  if (recon.dynamicSubtitle.includes("20206") || recon.scheduleOverlaps !== 1) {
    throw new Error("RECONCILIATION FAILURE: Expected 1 dynamic schedule overlap and zero hardcoded strings!");
  }
  console.log("[PASS] Dynamic Reconciliation Summary:", recon.dynamicSubtitle);

  console.log("=== ALL v3.0 ARCHITECTURAL, SECURITY & STATE INVARIANTS VERIFIED ===");
}

runVerification().catch((err) => {
  console.error(err);
  process.exit(1);
});
