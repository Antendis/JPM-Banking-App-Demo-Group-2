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
    include: { contributions: { where: { userId: user.id } }, members: true },
  });

  if (!pot || !pot.isActive) {
    return NextResponse.json({ message: "Pot not found or already dissolved." }, { status: 404 });
  }
  if (pot.creatorId === user.id) {
    return NextResponse.json({ message: "You created this pot. Dissolve it instead." }, { status: 403 });
  }

  const membership = pot.members.find((m) => m.userId === user.id);
  if (!membership) {
    return NextResponse.json({ message: "You are not a member of this pot." }, { status: 403 });
  }

  const refund = pot.contributions.reduce((s, c) => s + c.amount, 0);

  await prisma.$transaction([
    prisma.potMember.delete({ where: { userId_potId: { userId: user.id, potId } } }),
    ...(refund > 0
      ? [
          prisma.user.update({ where: { id: user.id }, data: { balance: { increment: refund } } }),
          prisma.transaction.create({
            data: {
              amount: refund,
              description: `Left pot: ${pot.title}`,
              category: "POT_WITHDRAWAL",
              counterparty: "OnePot",
              reference: `POT-LEAVE-${potId}`,
              type: "CREDIT",
              userId: user.id,
            },
          }),
        ]
      : []),
  ]);

  return NextResponse.json({
    message: refund > 0
      ? `You left the pot and £${refund.toFixed(2)} was returned to your balance.`
      : "You left the pot.",
  });
}
