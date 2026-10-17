import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";
import prisma from "@/lib/prisma";
import { runImportDryRun, executeImportCommit, parseWorkbookBuffer } from "@/lib/importer";
import { logAudit } from "@/lib/audit";

export async function GET() {
  try {
    const batches = await prisma.importBatch.findMany({
      include: {
        _count: { select: { rows: true, conflicts: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, count: batches.length, batches });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const action = (formData.get("action") as string) || "dry_run"; // 'dry_run' | 'commit'
    const useDefaultFile = formData.get("useDefaultFile") === "true";
    const file = formData.get("file") as File | null;

    let wb: XLSX.WorkBook;
    let fileName = "SANTA OPERATION TRACKER- 2026.xlsx";

    if (file) {
      fileName = file.name;
      const bytes = await file.arrayBuffer();
      wb = parseWorkbookBuffer(Buffer.from(bytes));
    } else if (useDefaultFile || !file) {
      const defaultPath = "C:\\Users\\ACER\\Downloads\\SANTA OPERATION TRACKER- 2026.xlsx";
      if (!fs.existsSync(defaultPath)) {
        return NextResponse.json(
          { success: false, error: `Default Excel tracker not found at ${defaultPath}` },
          { status: 404 }
        );
      }
      const buffer = fs.readFileSync(defaultPath);
      wb = parseWorkbookBuffer(buffer);
    } else {
      return NextResponse.json({ success: false, error: "No Excel file provided." }, { status: 400 });
    }

    if (action === "dry_run") {
      const dryRun = await runImportDryRun(fileName, wb);
      return NextResponse.json({ success: true, mode: "dry_run", result: dryRun });
    }

    if (action === "commit") {
      const commitResult = await executeImportCommit(fileName, wb, "ADMIN");

      await logAudit({
        action: "EXCEL_IMPORT_COMMIT",
        entityType: "ImportBatch",
        entityId: commitResult.batchId,
        details: {
          createdBookings: commitResult.createdBookingsCount,
          createdExpenses: commitResult.createdExpensesCount,
          createdConflicts: commitResult.createdConflictsCount,
        },
      });

      return NextResponse.json({ success: true, mode: "commit", result: commitResult });
    }

    return NextResponse.json({ success: false, error: `Unknown action '${action}'` }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
