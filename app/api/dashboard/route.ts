import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getEmailProviderStatus } from "@/lib/email-service";
import { computeDynamicReconciliation } from "@/lib/data-reconciliation";

export async function GET() {
  try {
    const [
      totalBookings,
      inquiryBookingsCount,
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
      actionQueueBookings,
    ] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({
        where: {
          status: {
            in: ["INQUIRY_RECEIVED", "NEW_INQUIRY", "QUOTE_ISSUED", "QUOTED"],
          },
        },
      }),
      prisma.booking.count({
        where: {
          status: {
            in: [
              "AWAITING_STAFF_APPROVAL",
              "AWAITING_STAFF_SIGNOFF",
              "CONTRACT_SENT",
              "CONTRACT_SIGNED_PENDING_DEPOSIT",
            ],
          },
        },
      }),
      prisma.booking.count({
        where: {
          status: { in: ["TEMPORARY_HOLD", "HOLD_24H_ACTIVE"] },
          isHoldExpired: false,
        },
      }),
      prisma.booking.count({
        where: {
          status: {
            in: ["SECURED_UNASSIGNED", "READY_FOR_DEPLOYMENT", "ROSTER_LOCKED_DISPATCHED"],
          },
        },
      }),
      prisma.booking.count({
        where: { status: { in: ["EVENT_COMPLETED", "EVENT_DELIVERED", "FINANCIALLY_SETTLED"] } },
      }),
      prisma.talent.count(),
      prisma.talent.count({ where: { approvedForPublicDisplay: false } }),
      prisma.dataConflict.count(),
      prisma.dataConflict.count({ where: { status: "PENDING_REVIEW" } }),
      prisma.payment.findMany({ where: { status: "VERIFIED" } }),
      prisma.booking.findMany({
        select: {
          id: true,
          bookingNumber: true,
          eventDate: true,
          startTime: true,
          endTime: true,
          status: true,
          totalContractAmount: true,
          balanceDue: true,
          talentAssignments: { select: { talentId: true } },
        },
      }),
      prisma.expense.findMany({ select: { amount: true } }),
      prisma.talentLedgerEntry.findMany({ where: { entryType: "ADVANCE" } }),
      prisma.emailThread.count({ where: { isUnread: true } }),
      prisma.booking.findMany({
        take: 12,
        orderBy: [{ pipelineStage: "asc" }, { createdAt: "desc" }],
        include: {
          client: true,
          talentAssignments: { include: { talent: true } },
          contracts: true,
          payments: true,
        },
      }),
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

    const reconciliation = computeDynamicReconciliation({
      bookings: allBookingsFinancials,
      pendingConflictsCount: pendingConflicts,
    });

    const emailStatus = getEmailProviderStatus();

    const queues = {
      pendingStaffApprovalBookings: pendingApprovalBookings,
      activeTemporaryHolds: activeHolds,
      talentsAwaitingPublicApproval: unapprovedTalents,
      unresolvedSourceConflicts: reconciliation.totalActiveConflicts,
      dynamicConflictSubtitle: reconciliation.dynamicSubtitle,
      unreadInboxMessages: Math.max(inquiryBookingsCount, unreadEmailThreads),
      emailConnectionStatus: emailStatus.connected ? "CONNECTED" : "STANDBY_LOCAL_OUTBOX",
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
      reconciliation,
      immediateActionQueue: actionQueueBookings,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
