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
  return XLSX.read(buffer, { type: "buffer", cellDates: false, raw: false });
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

  // 2. Process Bookings: "October Booking", "November booking", "December Booking", then "Confirmed Booking"
  const bookingSheetsOrder = [
    ...wb.SheetNames.filter(
      (s) =>
        s.toLowerCase().includes("booking") &&
        !s.toLowerCase().includes("confirmed") &&
        !s.toLowerCase().includes("invidual")
    ),
    ...wb.SheetNames.filter((s) => s.toLowerCase().includes("confirmed")),
  ];

  function parseFlexibleExcelDate(raw: any, fallbackDate: Date | null): { date: Date | null; hasTypo: boolean } {
    if (raw === undefined || raw === null || String(raw).trim() === "") {
      return { date: fallbackDate, hasTypo: false };
    }
    if (raw instanceof Date && !isNaN(raw.getTime())) {
      return { date: raw, hasTypo: false };
    }
    let str = String(raw).trim();
    let hasTypo = false;
    if (str.includes("20206")) {
      hasTypo = true;
      str = str.replace("20206", "2026");
    }
    // Remove day-of-week in parens e.g. "(Sunday)" or "(Saturday) |"
    str = str.replace(/\([^)]*\)/g, "").replace(/\|/g, "").trim();
    // If string has month + day but no 4-digit year (e.g. "December 5," or "October 21")
    if (!/\b20\d{2}\b/.test(str) && /[A-Za-z]+\s+\d{1,2}/.test(str)) {
      str = `${str.replace(/,\s*$/, "")}, 2026`;
    }
    // Check Excel serial number e.g. 46311
    if (/^\d{5}$/.test(str)) {
      const serial = parseInt(str, 10);
      const utcDays = serial - 25569;
      const d = new Date(utcDays * 86400 * 1000);
      if (!isNaN(d.getTime())) return { date: d, hasTypo };
    }
    const attempt = new Date(str);
    if (!isNaN(attempt.getTime())) {
      // Normalize to Noon UTC so every timezone (UTC and Asia/Manila UTC+8) resolves to the exact calendar day
      const normalized = new Date(Date.UTC(attempt.getFullYear(), attempt.getMonth(), attempt.getDate(), 12, 0, 0));
      return { date: normalized, hasTypo };
    }
    return { date: fallbackDate, hasTypo };
  }

  for (const sheetName of bookingSheetsOrder) {
    const ws = wb.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, defval: "", raw: false });

    // Find header row (usually row 2)
    let headerIdx = 1;
    for (let i = 0; i < Math.min(5, data.length); i++) {
      const rowText = (data[i] || []).join(" ").toLowerCase();
      if (rowText.includes("mall") || rowText.includes("booking date")) {
        headerIdx = i;
        break;
      }
    }

    const isConfirmedSheet = sheetName.toLowerCase().includes("confirmed");
    let lastValidDate: Date | null = null;
    let lastCompany = "";
    let lastMall = "";
    let lastTalent = "";
    let lastPackageDesc = "";

    for (let r = headerIdx + 1; r < data.length; r++) {
      const row = data[r];
      if (!row || !row.some((c) => c !== "")) {
        skippedRows++;
        continue;
      }

      const rawCell0 = String(row[0] || "").trim();
      const rawCell1 = String(row[1] || "").trim();
      const rawCell2 = String(row[2] || "").trim();

      if (isConfirmedSheet) {
        if (rawCell0) lastCompany = rawCell0;
        if (rawCell1) {
          lastMall = rawCell1;
          lastTalent = String(row[3] || row[15] || "").trim();
          lastPackageDesc = String(row[5] || "").trim();
        }
      }

      const companyRaw = isConfirmedSheet ? (rawCell0 || lastCompany) : rawCell0;
      const mallRaw = isConfirmedSheet ? (rawCell1 || lastMall) : rawCell2;
      const dateRaw = isConfirmedSheet ? row[2] : row[1];
      const statusColRaw = isConfirmedSheet ? String(row[8] || "Confirmed") : String(row[3] || "Confirmed");
      const talentRaw = isConfirmedSheet
        ? String(row[3] || row[15] || lastTalent || "").trim()
        : String(row[4] || row[16] || "").trim();
      const totalAmountRaw = row[5];
      const dpRaw = row[6];
      const dpDateRaw = row[7];
      const dpStatusRaw = row[8];
      const clientNotesRaw = row[10];
      const collectiblesRaw = row[11];
      const dateSettledRaw = row[12];
      const collectibleStatusRaw = row[13];
      const tfRaw = isConfirmedSheet ? (row[16] || row[4]) : (row[17] || row[16]);
      const tfNotesRaw = isConfirmedSheet ? row[21] : row[18];
      const profitRaw = isConfirmedSheet ? row[20] : row[22];
      const contractRaw = isConfirmedSheet ? row[22] : row[23];

      // Update lastValidDate whenever a date cell is present
      const { date: parsedCandidate, hasTypo: hasDateTypo } = parseFlexibleExcelDate(dateRaw, lastValidDate);
      if (parsedCandidate) {
        lastValidDate = parsedCandidate;
      }

      // Skip empty day-spacer rows or summary rows that have no Mall/Venue
      if (!mallRaw || mallRaw.toLowerCase() === "none") {
        skippedRows++;
        continue;
      }

      if (!lastValidDate) {
        skippedRows++;
        continue;
      }

      const parsedDate = lastValidDate;

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
      const parseMoney = (val: any): number => {
        if (typeof val === "number") return val;
        if (typeof val === "string") {
          const clean = val.replace(/[^\d.-]/g, "");
          const n = parseFloat(clean);
          return isNaN(n) ? 0 : n;
        }
        return 0;
      };

      let totalVal = parseMoney(totalAmountRaw);
      let dpVal = parseMoney(dpRaw);
      let collectiblesVal = parseMoney(collectiblesRaw);
      let tfVal = parseMoney(tfRaw);
      let profitVal = parseMoney(profitRaw);

      if (totalVal === 0 && collectiblesVal > 0) {
        totalVal = collectiblesVal + dpVal;
      }
      if (totalVal === 0) {
        totalVal = 18000;
      }
      if (String(dpRaw).toLowerCase().includes("full") || String(dpStatusRaw).toLowerCase() === "paid") {
        if (dpVal === 0 && collectiblesVal === 0) dpVal = totalVal;
      }

      // Find or create Client
      const companyName = String(companyRaw || "SM Supermalls / Direct").trim();
      let client = await prisma.client.findFirst({
        where: { companyName },
      });
      if (!client) {
        client = await prisma.client.create({
          data: {
            companyName,
            primaryContact: "Authorized Event Coordinator",
            email: "events@client.local",
            phone: "N/A",
            clientType: companyName.toLowerCase().includes("sm") ? "MALL" : "CORPORATE",
          },
        });
      }

      const venueName = String(mallRaw).trim();

      // Build structured description & operational notes
      const noteParts: string[] = [];
      if (isConfirmedSheet && lastPackageDesc) noteParts.push(`Package: ${lastPackageDesc}`);
      if (clientNotesRaw) noteParts.push(`Client Note: ${String(clientNotesRaw).trim()}`);
      if (tfNotesRaw) noteParts.push(`TF/Allowance: ${String(tfNotesRaw).trim()}`);
      if (collectibleStatusRaw) noteParts.push(`Collectibles Status: ${String(collectibleStatusRaw).trim()}`);
      if (dpDateRaw) noteParts.push(`DP Note: ${String(dpDateRaw).trim()}`);
      if (profitVal !== 0) noteParts.push(`Net Profit: ₱${profitVal.toLocaleString()}`);
      if (contractRaw) noteParts.push(`Contract Ref: ${String(contractRaw).trim()}`);
      const combinedNotes = noteParts.join(" • ") || `Confirmed deployment at ${venueName}`;

      // If Confirmed Booking sheet, check if this exact Date + Venue already exists from the Monthly sheet to avoid duplicates
      if (isConfirmedSheet) {
        const startOfDay = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate(), 0, 0, 0);
        const endOfDay = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate(), 23, 59, 59);
        const existingSameDay = await prisma.booking.findMany({
          where: {
            eventDate: { gte: startOfDay, lte: endOfDay },
          },
        });
        const normVenue = venueName.toLowerCase().replace(/[^a-z0-9]/g, "");
        const duplicate = existingSameDay.find((b) => {
          const bNorm = b.mallOrVenue.toLowerCase().replace(/[^a-z0-9]/g, "");
          return bNorm.includes(normVenue) || normVenue.includes(bNorm);
        });
        if (duplicate) {
          // Enrich the existing monthly booking with package/financial details if needed
          await prisma.booking.update({
            where: { id: duplicate.id },
            data: {
              totalContractAmount: totalVal > 18000 ? totalVal : duplicate.totalContractAmount,
              depositPaid: dpVal > 0 ? dpVal : duplicate.depositPaid,
              internalNotes: duplicate.internalNotes
                ? `${duplicate.internalNotes} | ${combinedNotes}`
                : combinedNotes,
            },
          });
          continue;
        }
      }

      const bookingNum = `BR-2026-${sheetName.substring(0, 3).toUpperCase()}-${String(r + 1).padStart(2, "0")}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
      const secureTok = `tok_${Math.random().toString(36).substring(2, 12)}`;
      const matchedTalent = resolveTalent(String(talentRaw));
      const effectiveTf = tfVal > 0 ? tfVal : Number(matchedTalent?.baseTalentFee || 12000);
      const effectiveProfit = profitVal !== 0 ? profitVal : Math.max(0, totalVal - effectiveTf);

      const bookingStatus =
        matchedTalent
          ? "READY_FOR_DEPLOYMENT"
          : dpVal > 0 || statusColRaw.toLowerCase().includes("confirm")
          ? "SECURED_UNASSIGNED"
          : "AWAITING_STAFF_APPROVAL";

      const booking = await prisma.booking.create({
        data: {
          bookingNumber: bookingNum,
          secureToken: secureTok,
          clientId: client.id,
          bookingType: isConfirmedSheet ? "PACKAGE" : "CORPORATE",
          eventName: `${venueName} — Santa Appearance`,
          eventDate: parsedDate,
          startTime: "14:00",
          endTime: "18:00",
          callTime: "13:00",
          mallOrVenue: venueName,
          status: bookingStatus,
          pipelineStage: matchedTalent ? 3 : 2,
          totalContractAmount: totalVal,
          depositRequired: dpVal > 0 ? dpVal : Math.round(totalVal * 0.5),
          depositPaid: dpVal,
          balanceDue: collectiblesVal > 0 ? collectiblesVal : Math.max(0, totalVal - dpVal),
          totalDirectCost: effectiveTf,
          projectedGrossProfit: effectiveProfit,
          isHistoricalImport: true,
          sourceSheet: sheetName,
          sourceRowIndex: r + 1,
          internalNotes: combinedNotes,
          specialRequests: clientNotesRaw ? String(clientNotesRaw).trim() : undefined,
          venueNotes: tfNotesRaw ? String(tfNotesRaw).trim() : undefined,
        },
      });

      // Link Talent Assignment if talent specified
      if (matchedTalent) {
        await prisma.talentAssignment.create({
          data: {
            bookingId: booking.id,
            talentId: matchedTalent.id,
            agreedTalentFee: tfVal > 0 ? tfVal : matchedTalent.baseTalentFee || 12000,
            callTime: "13:00",
            status: "CONFIRMED",
          },
        });
      } else if (talentRaw && String(talentRaw).trim() !== "" && !String(talentRaw).toLowerCase().includes("real beard")) {
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

  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, defval: "" });

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
