import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ message: "Unauthorised." }, { status: 401 });

  const { id } = await params;
  const potId = parseInt(id, 10);
  const { amount, description } = await req.json();

  if (!amount || amount <= 0) {
    return NextResponse.json({ message: "Amount must be greater than zero." }, { status: 400 });
  }
  if (!description?.trim()) {
    return NextResponse.json({ message: "Description is required." }, { status: 400 });
  }

  const membership = await prisma.potMember.findUnique({
    where: { userId_potId: { userId: user.id, potId } },
    include: {
      pot: {
        include: { contributions: true, expenses: true },
      },
    },
  });

  if (!membership || !membership.pot.isActive) {
    return NextResponse.json({ message: "Pot not found or inactive." }, { status: 404 });
  }

  const totalSaved = membership.pot.contributions.reduce((s, c) => s + c.amount, 0);
  const totalSpent = membership.pot.expenses.reduce((s, e) => s + e.amount, 0);
  const available = totalSaved - totalSpent;

  if (amount > available) {
    return NextResponse.json({ message: `Insufficient pot balance. Available: £${available.toFixed(2)}.` }, { status: 400 });
  }

  const expense = await prisma.potExpense.create({
    data: { amount, description: description.trim(), userId: user.id, potId },
  });

  return NextResponse.json(expense, { status: 201 });
}
