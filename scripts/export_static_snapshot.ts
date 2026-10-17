import prisma from "../lib/prisma";
import fs from "fs";
import path from "path";

async function exportSnapshot() {
  const [
    bookings,
    talents,
    clients,
    quotes,
    contracts,
    payments,
    ledgerEntries,
    expenses,
    conflicts,
    threads,
    importBatches,
    auditLogs,
  ] = await Promise.all([
    prisma.booking.findMany({
      include: {
        client: true,
        talentAssignments: {
          include: {
            talent: { include: { images: true } },
          },
        },
        quotes: true,
        contracts: true,
        payments: true,
      },
      orderBy: { eventDate: "asc" },
    }),
    prisma.talent.findMany({
      include: {
        images: true,
        assignments: { include: { booking: { include: { client: true } } } },
        ledgerEntries: true,
      },
      orderBy: { displayName: "asc" },
    }),
    prisma.client.findMany({
      include: { bookings: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.quote.findMany({
      include: { booking: { include: { client: true } }, client: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.contract.findMany({
      include: { booking: { include: { client: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.payment.findMany({
      include: { booking: { include: { client: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.talentLedgerEntry.findMany({
      include: { talent: true, booking: true },
      orderBy: { entryDate: "desc" },
    }),
    prisma.expense.findMany({
      include: { booking: true },
      orderBy: { expenseDate: "desc" },
    }),
    prisma.dataConflict.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.emailThread.findMany({
      include: { messages: true, booking: true },
      orderBy: { lastActivityAt: "desc" },
    }),
    prisma.importBatch.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const securedBookings = bookings.filter((b) =>
    ["SECURED_UNASSIGNED", "TALENT_ASSIGNED", "READY_FOR_DEPLOYMENT", "TALENT_CONFIRMED"].includes(b.status)
  ).length;
  const completedBookings = bookings.filter((b) =>
    ["EVENT_COMPLETED", "CLOSED"].includes(b.status)
  ).length;
  const verifiedPayments = payments.filter((p) => p.status === "VERIFIED");
  const totalVerifiedRevenue = verifiedPayments.reduce((s, p) => s + Number(p.amount || 0), 0);
  const totalOutstandingReceivables = bookings.reduce((s, b: any) => s + Number(b.balanceAmount || b.balanceDueAmount || 0), 0);
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const totalPaluwalAdvances = ledgerEntries
    .filter((l) => l.entryType === "ADVANCE")
    .reduce((s, l) => s + Number(l.amount || 0), 0);

  const dashboard = {
    success: true,
    metrics: {
      totalBookings: bookings.length,
      securedBookings,
      completedBookings,
      totalVerifiedRevenue,
      totalOutstandingReceivables,
      totalExpenses,
      totalPaluwalAdvances,
    },
    queues: {
      pendingStaffApprovalBookings: bookings.filter((b) => b.status === "AWAITING_STAFF_APPROVAL").length,
      activeTemporaryHolds: bookings.filter((b) => b.status === "TEMPORARY_HOLD").length,
      unresolvedSourceConflicts: conflicts.filter((c) => c.status === "OPEN").length,
      unreadInboxMessages: threads.filter((t) => t.isUnread).length,
      emailConnectionStatus: "MOCK_LOCAL_OUTBOX",
    },
    recentAuditLogs: auditLogs,
  };

  const individualAssignments = bookings
    .filter((b) => b.talentAssignments && b.talentAssignments.length > 0)
    .flatMap((b) =>
      b.talentAssignments.map((a) => ({
        id: a.id,
        agreedTalentFee: a.agreedTalentFee,
        payoutStatus: a.payoutStatus,
        roleType: a.roleType,
        talent: a.talent,
        booking: b,
      }))
    );

  const snapshot = {
    dashboard,
    bookings: { success: true, bookings },
    leads: { success: true, leads: bookings },
    talents: { success: true, talents },
    clients: { success: true, clients },
    quotes: { success: true, quotes },
    contracts: { success: true, contracts },
    payments: { success: true, payments },
    paluwal: { success: true, entries: ledgerEntries, talents },
    expenses: { success: true, expenses },
    conflicts: { success: true, conflicts },
    inbox: { success: true, threads, providerStatus: "MOCK_LOCAL_OUTBOX" },
    importBatches: { success: true, batches: importBatches },
    individualBookings: {
      success: true,
      assignments: individualAssignments,
      talents,
      summary: {
        totalAssignments: individualAssignments.length,
        totalContractedTalentFees: individualAssignments.reduce(
          (s, a) => s + Number(a.agreedTalentFee || 0),
          0
        ),
      },
    },
  };

  const outPath = path.join(process.cwd(), "public", "static-db-snapshot.json");
  fs.writeFileSync(outPath, JSON.stringify(snapshot));
  console.log("Wrote static snapshot to", outPath, "Size:", fs.statSync(outPath).size);
}

exportSnapshot()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
