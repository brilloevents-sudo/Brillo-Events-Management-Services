import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const bookingId = searchParams.get("bookingId");

    const where: any = {};
    if (category) where.category = category;
    if (bookingId) where.bookingId = bookingId;

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        booking: {
          select: { id: true, bookingNumber: true, eventName: true, mallOrVenue: true },
        },
      },
      orderBy: { expenseDate: "desc" },
    });

    const totalAmount = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    return NextResponse.json({ success: true, count: expenses.length, totalAmount, expenses });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      payee,
      amount,
      expenseDate,
      category = "OPERATIONAL",
      notes,
      bookingId,
      actor = "FINANCE_USER",
    } = body;

    if (!payee || !amount) {
      return NextResponse.json(
        { success: false, error: "Payee and amount are required." },
        { status: 400 }
      );
    }

    const expense = await prisma.expense.create({
      data: {
        payee,
        amount: Number(amount),
        expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
        category,
        notes,
        bookingId: bookingId || null,
      },
    });

    await logAudit({
      action: "EXPENSE_CREATE",
      entityType: "Expense",
      entityId: expense.id,
      actorName: actor,
      details: { payee, amount, category },
    });

    return NextResponse.json({ success: true, expense });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
