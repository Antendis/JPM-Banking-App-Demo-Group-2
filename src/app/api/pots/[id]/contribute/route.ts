import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ message: "Unauthorised." }, { status: 401 });

  const { id } = await params;
  const potId = parseInt(id, 10);
  const { amount, note } = await req.json();

  if (!amount || amount <= 0) {
    return NextResponse.json({ message: "Amount must be greater than zero." }, { status: 400 });
  }
  if (amount > user.balance) {
    return NextResponse.json({ message: "Insufficient balance." }, { status: 400 });
  }

  const membership = await prisma.potMember.findUnique({
    where: { userId_potId: { userId: user.id, potId } },
    include: { pot: true },
  });

  if (!membership || !membership.pot.isActive) {
    return NextResponse.json({ message: "Pot not found or inactive." }, { status: 404 });
  }

  const [contribution] = await prisma.$transaction([
    prisma.potContribution.create({
      data: { amount, note: note ?? null, userId: user.id, potId },
    }),
    prisma.transaction.create({
      data: {
        amount,
        description: `Pot: ${membership.pot.title}`,
        category: "POT_CONTRIBUTION",
        counterparty: "OnePot Shared Pot",
        reference: `POT-${potId}`,
        type: "DEBIT",
        userId: user.id,
      },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { balance: { decrement: amount } },
    }),
  ]);

  return NextResponse.json(contribution, { status: 201 });
}
