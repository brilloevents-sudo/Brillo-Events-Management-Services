import { executeImportCommit, parseWorkbookBuffer } from "../lib/importer";
import prisma from "../lib/prisma";
import fs from "fs";

async function run() {
  const googleSheetPath =
    "C:\\Users\\ACER\\.gemini\\antigravity\\brain\\0f385fa6-be87-4873-bbf0-dc17e3d4588a\\scratch\\google_sheet_inspect.xlsx";
  const fallbackPath = "C:\\Users\\ACER\\Downloads\\SANTA OPERATION TRACKER- 2026.xlsx";
  const filePath = fs.existsSync(googleSheetPath) ? googleSheetPath : fallbackPath;

  console.log("Cleaning previous historical imports to remove duplicate/misdated rows...");
  await prisma.talentAssignment.deleteMany({
    where: { booking: { isHistoricalImport: true } },
  });
  await prisma.bookingStatusHistory.deleteMany({
    where: { booking: { isHistoricalImport: true } },
  });
  await prisma.booking.deleteMany({
    where: { isHistoricalImport: true },
  });
  await prisma.expense.deleteMany({});
  await prisma.dataConflict.deleteMany({});

  console.log("Reading workbook:", filePath);
  const buffer = fs.readFileSync(filePath);
  const wb = parseWorkbookBuffer(buffer);
  console.log("Parsed workbook sheets:", wb.SheetNames);
  const result = await executeImportCommit("SANTA OPERATION TRACKER- 2026 (Google Sheet Sync).xlsx", wb, "ADMIN");
  console.log("IMPORT COMMIT SUCCESS!");
  console.log(result);
}

run()
  .catch((e) => {
    console.error("Import error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
