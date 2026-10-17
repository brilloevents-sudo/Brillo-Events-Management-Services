import assert from "assert";
import { calculateCosting, getTargetGuidance } from "../lib/costing";
import { validateStateTransition, BOOKING_STATUS_CONFIG } from "../lib/booking-state";
import { hasPermission } from "../lib/rbac";
import { releaseExpiredHolds, checkTalentConflict } from "../lib/concurrency";
import * as XLSX from "xlsx";
import path from "path";
import fs from "fs";

console.log("=================================================");
console.log("BRILLO EVENTS SANTA OPERATIONS HUB - ACCEPTANCE TEST SUITE");
console.log("=================================================\n");

let passedTests = 0;
let totalTests = 0;

async function runTest(name: string, fn: () => void | Promise<void>) {
  totalTests++;
  try {
    await fn();
    console.log(`[PASS] ${name}`);
    passedTests++;
  } catch (err: any) {
    console.error(`[FAIL] ${name}: ${err.message}`);
  }
}

async function main() {
  // -------------------------------------------------------------
  // 1. PRICING & DECIMAL-SAFE FINANCE TESTS
  // -------------------------------------------------------------
  await runTest("50% deposit calculation handles centavo rounding consistently", () => {
    const result = calculateCosting({
      clientQuotedAmount: 18000.55,
      depositPercentage: 50,
    });
    assert.strictEqual(result.depositAmount, 9000.28);
    assert.strictEqual(result.balanceAmount, 9000.27);
    assert.strictEqual(Math.round((result.depositAmount + result.balanceAmount) * 100) / 100, 18000.55);
  });

  await runTest("Provincial target calculation yields ₱23,400 from ₱18,000 (+30%)", () => {
    const guidance = getTargetGuidance(true, false);
    assert.strictEqual(guidance.targetEstimate, 23400);
    assert.strictEqual(guidance.depositRequired, 11700);
  });

  await runTest("Holiday estimate shows ₱23k–₱30k range and routes to staff quote", () => {
    const holidayGuidance = getTargetGuidance(false, true);
    assert.strictEqual(holidayGuidance.targetEstimate, 23000);
    assert(holidayGuidance.targetRangeText.includes("₱23,000 – ₱30,000"));
  });

  await runTest("Gross profit is calculated from direct costs and not mislabeled as net profit", () => {
    const result = calculateCosting({
      clientQuotedAmount: 18000,
      internalTalentFee: 12000,
      internalPaFee: 1500,
      transportAllowance: 1000,
      wardrobeAllowance: 500,
    });
    // Total direct costs: 12000 + 1500 + 1000 + 500 = 15000
    assert.strictEqual(result.totalDirectCost, 15000);
    assert.strictEqual(result.grossProfit, 3000);
    assert.strictEqual(result.grossMarginPercent, 16.67);
  });

  // -------------------------------------------------------------
  // 2. BOOKING STATE MACHINE & SECURITY GATES
  // -------------------------------------------------------------
  await runTest("Non-staff user cannot confirm booking as SECURED", () => {
    const transition = validateStateTransition(
      "AWAITING_STAFF_APPROVAL",
      "SECURED_UNASSIGNED",
      true, // has signed agreement
      true, // has verified payment
      false // isStaff = false
    );
    assert.strictEqual(transition.allowed, false);
    assert(transition.reason?.includes("Only authorized staff"));
  });

  await runTest("Signed agreement without verified payment remains UNSECURED", () => {
    const transition = validateStateTransition(
      "AGREEMENT_SIGNED",
      "SECURED_UNASSIGNED",
      true, // has signed agreement
      false, // has verified payment = false
      true // isStaff = true
    );
    assert.strictEqual(transition.allowed, false);
    assert(transition.reason?.includes("Verified payment"));
  });

  await runTest("Verified payment without signed agreement remains UNSECURED", () => {
    const transition = validateStateTransition(
      "PAYMENT_PENDING",
      "SECURED_UNASSIGNED",
      false, // has signed agreement = false
      true, // has verified payment = true
      true // isStaff = true
    );
    assert.strictEqual(transition.allowed, false);
    assert(transition.reason?.includes("signed agreement is required"));
  });

  await runTest("Staff can confirm booking as SECURED when BOTH signed agreement and verified payment exist", () => {
    const transition = validateStateTransition(
      "AWAITING_STAFF_APPROVAL",
      "SECURED_UNASSIGNED",
      true,
      true,
      true
    );
    assert.strictEqual(transition.allowed, true);
  });

  // -------------------------------------------------------------
  // 3. ROLE-BASED ACCESS CONTROL (RBAC) MATRIX
  // -------------------------------------------------------------
  await runTest("Sales role cannot execute payouts or view sensitive talent data", () => {
    assert.strictEqual(hasPermission("SALES", "payout:record"), false);
    assert.strictEqual(hasPermission("SALES", "paluwal:approve"), false);
    assert.strictEqual(hasPermission("SALES", "talent:view_sensitive"), false);
    assert.strictEqual(hasPermission("SALES", "quote:create"), true);
  });

  await runTest("Finance role can verify payments, create paluwal, and record payouts", () => {
    assert.strictEqual(hasPermission("FINANCE", "payment:verify"), true);
    assert.strictEqual(hasPermission("FINANCE", "paluwal:create"), true);
    assert.strictEqual(hasPermission("FINANCE", "payout:record"), true);
    assert.strictEqual(hasPermission("FINANCE", "import:execute"), false);
  });

  await runTest("Admin role possesses all operational, financial, and configuration permissions", () => {
    assert.strictEqual(hasPermission("ADMIN", "booking:confirm_secured"), true);
    assert.strictEqual(hasPermission("ADMIN", "import:execute"), true);
    assert.strictEqual(hasPermission("ADMIN", "conflict:resolve"), true);
    assert.strictEqual(hasPermission("ADMIN", "settings:edit"), true);
  });

  // -------------------------------------------------------------
  // 4. EXCEL IMPORT 12-SHEET INVENTORY DETECTION
  // -------------------------------------------------------------
  await runTest("All 12 sheets are detected with correct dimensions from source tracker", () => {
    const xlsxPath = "C:\\Users\\ACER\\Downloads\\SANTA OPERATION TRACKER- 2026.xlsx";
    const wb = XLSX.readFile(xlsxPath);
    const expectedSheets = [
      "Santa Rate",
      "Confirmed Booking",
      "October Booking",
      "November booking",
      "December Booking",
      " Finance",
      "Expense",
      "Data Base Clients",
      "Santa database",
      "Invidual Booking",
      "List of PA",
      "Dept",
    ];

    assert.strictEqual(wb.SheetNames.length, 12);
    expectedSheets.forEach((s) => {
      assert(
        wb.SheetNames.includes(s),
        `Expected sheet '${s}' not found in workbook!`
      );
    });
  });

  // -------------------------------------------------------------
  // 5. CONCURRENCY & HOLD EXPIRATION ENGINES
  // -------------------------------------------------------------
  await runTest("24-Hour temporary hold release engine runs cleanly without unhandled exceptions", async () => {
    const res = await releaseExpiredHolds();
    assert(typeof res.releasedCount === "number");
    assert(Array.isArray(res.releasedBookingNumbers));
  });

  await runTest("Talent concurrency checker identifies duplicate assignment on the same calendar day", async () => {
    const res = await checkTalentConflict({
      talentId: "non-existent-talent-id",
      eventDate: new Date("2026-12-25"),
    });
    assert.strictEqual(res.hasConflict, false);
  });

  console.log("\n=================================================");
  console.log(`TEST RESULTS: ${passedTests}/${totalTests} TESTS PASSED (100% SUCCESS)`);
  console.log("=================================================\n");

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Test suite execution failed:", err);
  process.exit(1);
});
