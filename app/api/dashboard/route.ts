import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getEmailProviderStatus } from "@/lib/email-service";

export async function GET() {
  try {
    const [
      totalBookings,
      pendingApprovalBookings,
      activeHolds,
      securedBookings,
      completedBookings,
      totalTalents,
      unapprovedTalents,
      totalConflicts,
      pendingConflicts,
      allVerifiedPayments,
      allBookingsFinancials,
      allExpenses,
      ledgerAdvances,
      unreadEmailThreads,
    ] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { status: "AWAITING_STAFF_APPROVAL" } }),
      prisma.booking.count({ where: { status: "TEMPORARY_HOLD", isHoldExpired: false } }),
      prisma.booking.count({ where: { status: "SECURED_UNASSIGNED" } }),
      prisma.booking.count({ where: { status: "EVENT_COMPLETED" } }),
      prisma.talent.count(),
      prisma.talent.count({ where: { approvedForPublicDisplay: false } }),
      prisma.dataConflict.count(),
      prisma.dataConflict.count({ where: { status: "PENDING_REVIEW" } }),
      prisma.payment.findMany({ where: { status: "VERIFIED" } }),
      prisma.booking.findMany({ select: { totalContractAmount: true, balanceDue: true } }),
      prisma.expense.findMany({ select: { amount: true } }),
      prisma.talentLedgerEntry.findMany({ where: { entryType: "ADVANCE" } }),
      prisma.emailThread.count({ where: { isUnread: true } }),
    ]);

    const totalVerifiedRevenue = allVerifiedPayments.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );
    const totalContractValue = allBookingsFinancials.reduce(
      (sum, b) => sum + Number(b.totalContractAmount),
      0
    );
    const totalOutstandingReceivables = allBookingsFinancials.reduce(
      (sum, b) => sum + Number(b.balanceDue),
      0
    );
    const totalExpensesRecorded = allExpenses.reduce(
      (sum, e) => sum + Number(e.amount),
      0
    );
    const totalPaluwalAdvances = ledgerAdvances.reduce(
      (sum, l) => sum + Number(l.amount),
      0
    );

    const emailStatus = getEmailProviderStatus();

    // Critical Task Queues
    const queues = {
      pendingStaffApprovalBookings: pendingApprovalBookings,
      activeTemporaryHolds: activeHolds,
      talentsAwaitingPublicApproval: unapprovedTalents,
      unresolvedSourceConflicts: pendingConflicts,
      unreadInboxMessages: unreadEmailThreads,
      emailConnectionStatus: emailStatus.connected ? "CONNECTED" : "CONFIGURATION_REQUIRED",
    };

    return NextResponse.json({
      success: true,
      metrics: {
        totalBookings,
        securedBookings,
        completedBookings,
        totalTalents,
        totalContractValue,
        totalVerifiedRevenue,
        totalOutstandingReceivables,
        totalExpensesRecorded,
        totalPaluwalAdvances,
      },
      queues,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
