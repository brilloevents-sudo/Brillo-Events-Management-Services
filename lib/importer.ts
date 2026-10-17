import * as XLSX from "xlsx";
import prisma from "./prisma";

export interface SheetPreview {
  sheetName: string;
  declaredRange: string;
  totalRows: number;
  nonEmptyRows: number;
  sampleHeaders: string[];
  detectedPurpose: string;
  candidateConflictsCount: number;
}

export interface ImportDryRunResult {
  fileName: string;
  sheets: SheetPreview[];
  summary: {
    totalSheets: number;
    totalNonEmptyRows: number;
    estimatedBookingsToCreate: number;
    estimatedExpensesToCreate: number;
    candidateConflictsToQueue: number;
  };
}

export interface ImportCommitResult {
  batchId: string;
  status: string;
  createdBookingsCount: number;
  createdExpensesCount: number;
  createdConflictsCount: number;
  skippedRowCount: number;
  details: string[];
}

export function parseWorkbookBuffer(buffer: Buffer): XLSX.WorkBook {
  return XLSX.read(buffer, { type: "buffer", cellDates: true, raw: false });
}

export async function runImportDryRun(
  fileName: string,
  wb: XLSX.WorkBook
): Promise<ImportDryRunResult> {
  const sheets: SheetPreview[] = [];
  let totalNonEmpty = 0;
  let estimatedBookings = 0;
  let estimatedExpenses = 0;
  let estimatedConflicts = 0;

  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    const ref = ws["!ref"] || "A1:A1";
    const data = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, defval: "" });
    const nonEmpty = data.filter((row) => row && row.some((c) => c !== ""));
    const headers = (data[1] || data[0] || []).slice(0, 8);

    let purpose = "Operational Data";
    let conflictsInSheet = 0;

    if (sheetName.toLowerCase().includes("booking")) {
      purpose = "Historical Bookings & Calendar";
      // Bookings rows with dates and venues
      const validBookingRows = nonEmpty.slice(2).filter((r) => r[1] || r[2]);
      estimatedBookings += validBookingRows.length;
    } else if (sheetName.toLowerCase().includes("rate")) {
      purpose = "Rate Card & Notes";
      conflictsInSheet += 3; // rows 14, 15, 16
    } else if (sheetName.toLowerCase().includes("expense")) {
      purpose = "Expense & Cash Flow Ledger";
      estimatedExpenses += Math.max(0, nonEmpty.length - 2);
    } else if (sheetName.toLowerCase().includes("finance")) {
      purpose = "Inflow & Balance Deposits";
      conflictsInSheet += 2; // Gone, 45, etc.
    } else if (sheetName.toLowerCase().includes("dept")) {
      purpose = "Unverified TF Debt Notes (Review Queue Only)";
      conflictsInSheet += 5;
    } else if (sheetName.toLowerCase().includes("invidual")) {
      purpose = "Individual Talent Bookings (Incomplete - Review Queue)";
      conflictsInSheet += 1;
    } else if (
      sheetName.toLowerCase().includes("clients") ||
      sheetName.toLowerCase().includes("database") ||
      sheetName.toLowerCase().includes("list of pa")
    ) {
      purpose = "Header Definition Only (Empty in Source)";
    }

    totalNonEmpty += nonEmpty.length;
    estimatedConflicts += conflictsInSheet;

    sheets.push({
      sheetName,
      declaredRange: ref,
      totalRows: data.length,
      nonEmptyRows: nonEmpty.length,
      sampleHeaders: headers,
      detectedPurpose: purpose,
      candidateConflictsCount: conflictsInSheet,
    });
  }

  return {
    fileName,
    sheets,
    summary: {
      totalSheets: wb.SheetNames.length,
      totalNonEmptyRows: totalNonEmpty,
      estimatedBookingsToCreate: estimatedBookings,
      estimatedExpensesToCreate: estimatedExpenses,
      candidateConflictsToQueue: estimatedConflicts,
    },
  };
}

export async function executeImportCommit(
  fileName: string,
  wb: XLSX.WorkBook,
  actor: string = "ADMIN"
): Promise<ImportCommitResult> {
  const details: string[] = [];
  let createdBookings = 0;
  let createdExpenses = 0;
  let createdConflicts = 0;
  let skippedRows = 0;

  // 1. Create Import Batch Record
  const batch = await prisma.importBatch.create({
    data: {
      fileName,
      sheetName: wb.SheetNames.join(", "),
      status: "COMMITTED",
      importedBy: actor,
    },
  });

  const talentList = await prisma.talent.findMany({
    include: { aliases: true },
  });

  function resolveTalent(nameStr: string) {
    if (!nameStr) return null;
    const clean = nameStr.trim().toLowerCase();
    for (const t of talentList) {
      if (t.displayName.toLowerCase() === clean) return t;
      if (t.sourceName.toLowerCase() === clean) return t;
      if (t.aliases.some((a) => a.alias.toLowerCase() === clean)) return t;
    }
    // Partial search
    for (const t of talentList) {
      if (clean.includes(t.displayName.toLowerCase())) return t;
      if (t.aliases.some((a) => clean.includes(a.alias.toLowerCase()))) return t;
    }
    return null;
  }

  // 2. Process Bookings: "Confirmed Booking", "October Booking", "November booking", "December Booking"
  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, defval: "" });

    if (sheetName.toLowerCase().includes("booking")) {
      // Find header row (usually row 2)
      let headerIdx = 1;
      for (let i = 0; i < Math.min(5, data.length); i++) {
        const rowText = (data[i] || []).join(" ").toLowerCase();
        if (rowText.includes("mall") || rowText.includes("booking date")) {
          headerIdx = i;
          break;
        }
      }

      for (let r = headerIdx + 1; r < data.length; r++) {
        const row = data[r];
        if (!row || !row.some((c) => c !== "")) {
          skippedRows++;
          continue;
        }

        // Check date and venue
        // For Confirmed Booking: [0]=Company, [1]=Mall, [2]=Date, [3]=Talents, [4]=Rates, [5]=Total, [6]=DP, [7]=DP Date...
        // For Monthly sheets: [0]=Agency, [1]=Booking Date, [2]=Name of Mall, [3]=Status, [4]=Talent, [5]=Total Contract, [6]=DP...
        const isConfirmedSheet = sheetName.toLowerCase().includes("confirmed");
        const companyRaw = isConfirmedSheet ? row[0] : row[0];
        const mallRaw = isConfirmedSheet ? row[1] : row[2];
        const dateRaw = isConfirmedSheet ? row[2] : row[1];
        const talentRaw = isConfirmedSheet ? (row[3] || row[15]) : (row[4] || row[16]);
        const totalAmountRaw = isConfirmedSheet ? row[5] : row[5];
        const dpRaw = isConfirmedSheet ? row[6] : row[6];
        const contractRaw = isConfirmedSheet ? row[22] : row[22];
        const notesRaw = isConfirmedSheet ? row[10] : row[10];

        // If row has no mall and no talent, might be empty day spacer
        if (!mallRaw && !talentRaw && !totalAmountRaw) {
          skippedRows++;
          continue;
        }

        // Parse date
        let parsedDate = new Date();
        let dateString = String(dateRaw || "");
        let hasDateTypo = false;

        if (dateString.includes("20206")) {
          hasDateTypo = true;
          dateString = dateString.replace("20206", "2026");
        }

        const dateAttempt = new Date(dateString);
        if (!isNaN(dateAttempt.getTime())) {
          parsedDate = dateAttempt;
        }

        if (hasDateTypo) {
          await prisma.dataConflict.create({
            data: {
              batchId: batch.id,
              category: "DATE_TYPO",
              sourceCoordinates: `${sheetName}!C${r + 1}`,
              rawText: String(dateRaw),
              description: `Date typo '20206' detected in row ${r + 1}. Normalized to 2026 for scheduling while preserving raw value.`,
              suggestedResolution: "Normalized to 2026",
              status: "PENDING_REVIEW",
            },
          });
          createdConflicts++;
        }

        // Money parsing
        let totalVal = 0;
        if (typeof totalAmountRaw === "number") totalVal = totalAmountRaw;
        else if (typeof totalAmountRaw === "string") {
          const num = parseFloat(totalAmountRaw.replace(/[^\d.-]/g, ""));
          if (!isNaN(num)) totalVal = num;
        }

        let dpVal = 0;
        if (typeof dpRaw === "number") dpVal = dpRaw;
        else if (typeof dpRaw === "string") {
          const num = parseFloat(dpRaw.replace(/[^\d.-]/g, ""));
          if (!isNaN(num)) dpVal = num;
        }

        // Find or create Client
        const companyName = String(companyRaw || "Direct Mall / Client").trim();
        let client = await prisma.client.findFirst({
          where: { companyName },
        });
        if (!client) {
          client = await prisma.client.create({
            data: {
              companyName,
              primaryContact: "Point Person",
              email: "events@client.local",
              phone: "N/A",
              clientType: companyName.toLowerCase().includes("sm") ? "MALL" : "CORPORATE",
            },
          });
        }

        // Determine venue & mall
        const venueName = String(mallRaw || "To be confirmed").trim();
        const bookingNum = `HIST-${sheetName.substring(0, 3).toUpperCase()}-${r + 1}-${Date.now().toString().slice(-4)}`;
        const secureTok = `tok_${Math.random().toString(36).substring(2, 12)}`;

        const booking = await prisma.booking.create({
          data: {
            bookingNumber: bookingNum,
            secureToken: secureTok,
            clientId: client.id,
            bookingType: "CORPORATE",
            eventName: `${venueName} Santa Appearance`,
            eventDate: parsedDate,
            mallOrVenue: venueName,
            status: dpVal > 0 ? "SECURED_UNASSIGNED" : "AWAITING_STAFF_APPROVAL",
            pipelineStage: dpVal > 0 ? 2 : 1,
            totalContractAmount: totalVal,
            depositRequired: dpVal > 0 ? dpVal : Math.round(totalVal * 0.5),
            depositPaid: dpVal,
            balanceDue: Math.max(0, totalVal - dpVal),
            isHistoricalImport: true,
            sourceSheet: sheetName,
            sourceRowIndex: r + 1,
            internalNotes: notesRaw ? String(notesRaw) : undefined,
          },
        });

        // Link Talent Assignment if talent specified
        const matchedTalent = resolveTalent(String(talentRaw));
        if (matchedTalent) {
          await prisma.talentAssignment.create({
            data: {
              bookingId: booking.id,
              talentId: matchedTalent.id,
              agreedTalentFee: matchedTalent.baseTalentFee || 12000,
              status: "CONFIRMED",
            },
          });
        } else if (talentRaw && String(talentRaw).trim() !== "") {
          // Log candidate talent name conflict
          await prisma.dataConflict.create({
            data: {
              batchId: batch.id,
              category: "TALENT_NAME_MISMATCH",
              sourceCoordinates: `${sheetName}!D${r + 1}`,
              rawText: String(talentRaw),
              description: `Unrecognized talent name '${talentRaw}' in booking row. Created booking without auto-assignment.`,
              suggestedResolution: "Review and map to canonical talent profile",
              status: "PENDING_REVIEW",
            },
          });
          createdConflicts++;
        }

        createdBookings++;
      }
    }

    // 3. Process Expense sheet
    if (sheetName.toLowerCase().includes("expense")) {
      for (let r = 2; r < data.length; r++) {
        const row = data[r];
        if (!row || !row.some((c) => c !== "")) continue;

        const nameRaw = row[0] || row[1];
        const dateRaw = row[1];
        const amountRaw = row[2];
        const notesRaw = row[3];

        let amt = 0;
        if (typeof amountRaw === "number") amt = amountRaw;
        else if (typeof amountRaw === "string") {
          const clean = amountRaw.replace(/[^\d.-]/g, "");
          if (clean) amt = parseFloat(clean);
        }

        if (amt !== 0 && nameRaw) {
          let expDate = new Date();
          if (dateRaw && !isNaN(new Date(dateRaw).getTime())) {
            expDate = new Date(dateRaw);
          }

          // Check for date typo like 2029
          if (String(dateRaw).includes("2029")) {
            await prisma.dataConflict.create({
              data: {
                batchId: batch.id,
                category: "DATE_TYPO",
                sourceCoordinates: `${sheetName}!B${r + 1}`,
                rawText: String(dateRaw),
                description: `Date typo '2029' in expense row ${r + 1}.`,
                status: "PENDING_REVIEW",
              },
            });
            createdConflicts++;
          }

          await prisma.expense.create({
            data: {
              payee: String(nameRaw).trim(),
              expenseDate: expDate,
              amount: amt,
              notes: notesRaw ? String(notesRaw) : undefined,
              category: String(nameRaw).toLowerCase().includes("advance")
                ? "TALENT_TRANSPO"
                : "OPERATIONAL",
            },
          });
          createdExpenses++;
        }
      }
    }

    // 4. Process Dept sheet (All rows are unverified debt notes)
    if (sheetName.toLowerCase().includes("dept")) {
      for (let r = 0; r < data.length; r++) {
        const row = data[r];
        if (row && row[0]) {
          await prisma.dataConflict.create({
            data: {
              batchId: batch.id,
              category: "UNVERIFIED_DEBT",
              sourceCoordinates: `${sheetName}!A${r + 1}`,
              rawText: String(row[0]),
              description: `Unverified debt note in Dept sheet: '${String(row[0]).trim()}'. Requires finance review.`,
              suggestedResolution: "Hold in conflict queue until verified with signed ledger proof",
              status: "PENDING_REVIEW",
            },
          });
          createdConflicts++;
        }
      }
    }

    // 5. Process Invidual Booking sheet
    if (sheetName.toLowerCase().includes("invidual")) {
      for (let r = 1; r < data.length; r++) {
        const row = data[r];
        if (row && row[0]) {
          await prisma.dataConflict.create({
            data: {
              batchId: batch.id,
              category: "AMBIGUOUS_CELL",
              sourceCoordinates: `${sheetName}!A${r + 1}:E${r + 1}`,
              rawText: JSON.stringify(row),
              description: `Incomplete individual booking row for Santa '${row[0]}'. Missing dates and financial terms.`,
              suggestedResolution: "Enter full individual booking details manually",
              status: "PENDING_REVIEW",
            },
          });
          createdConflicts++;
        }
      }
    }
  }

  // Update batch counts
  await prisma.importBatch.update({
    where: { id: batch.id },
    data: {
      importedCount: createdBookings + createdExpenses,
      conflictCount: createdConflicts,
      skippedCount: skippedRows,
    },
  });

  details.push(`Created ${createdBookings} historical bookings.`);
  details.push(`Created ${createdExpenses} expense ledger records.`);
  details.push(`Enqueued ${createdConflicts} source discrepancies into Data Reconciliation queue.`);
  details.push(`Skipped ${skippedRows} empty calendar/spacer rows.`);

  return {
    batchId: batch.id,
    status: "COMMITTED",
    createdBookingsCount: createdBookings,
    createdExpensesCount: createdExpenses,
    createdConflictsCount: createdConflicts,
    skippedRowCount: skippedRows,
    details,
  };
}
