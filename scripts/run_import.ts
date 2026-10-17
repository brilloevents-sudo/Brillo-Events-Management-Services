import { executeImportCommit, parseWorkbookBuffer } from "../lib/importer";
import fs from "fs";

async function run() {
  const filePath = "C:\\Users\\ACER\\Downloads\\SANTA OPERATION TRACKER- 2026.xlsx";
  console.log("Reading workbook:", filePath);
  const buffer = fs.readFileSync(filePath);
  const wb = parseWorkbookBuffer(buffer);
  console.log("Parsed workbook sheets:", wb.SheetNames);
  const result = await executeImportCommit("SANTA OPERATION TRACKER- 2026.xlsx", wb, "ADMIN");
  console.log("IMPORT COMMIT SUCCESS!");
  console.log(result);
}

run().catch((e) => {
  console.error("Import error:", e);
  process.exit(1);
});
