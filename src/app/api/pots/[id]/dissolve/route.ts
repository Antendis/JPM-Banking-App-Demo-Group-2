import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ message: "Unauthorised." }, { status: 401 });

  const { id } = await params;
  const potId = parseInt(id, 10);

  const pot = await prisma.pot.findUnique({
    where: { id: potId },
    include: { contributions: true, members: true },
  });

  if (!pot || !pot.isActive) {
    return NextResponse.json({ message: "Pot not found or already dissolved." }, { status: 404 });
  }
  if (pot.creatorId !== user.id) {
    return NextResponse.json({ message: "Only the pot creator can dissolve it." }, { status: 403 });
  }

  // Calculate refund per member
  const refunds = new Map<number, number>();
  for (const c of pot.contributions) {
    refunds.set(c.userId, (refunds.get(c.userId) ?? 0) + c.amount);
  }

  await prisma.$transaction([
    // Mark pot inactive
    prisma.pot.update({ where: { id: potId }, data: { isActive: false } }),
    // Refund each member and create credit transactions
    ...Array.from(refunds.entries()).flatMap(([userId, amount]) => [
      prisma.user.update({ where: { id: userId }, data: { balance: { increment: amount } } }),
      prisma.transaction.create({
        data: {
          amount,
          description: `Pot dissolved: ${pot.title}`,
          category: "POT_DISSOLUTION",
          counterparty: "OnePot",
          reference: `POT-DISSOLVED-${potId}`,
          type: "CREDIT",
          userId,
        },
      }),
    ]),
  ]);

  return NextResponse.json({ message: "Pot dissolved. Funds returned to all members." });
}
