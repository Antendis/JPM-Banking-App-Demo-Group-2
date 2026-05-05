import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

function generateCard() {
  const digits = [4, ...Array.from({ length: 15 }, () => Math.floor(Math.random() * 10))];
  const number = digits.join("");
  const now = new Date();
  const expMonth = String(now.getMonth() + 1).padStart(2, "0");
  const expYear = String(now.getFullYear() + 3).slice(-2);
  const cvv = String(Math.floor(Math.random() * 900) + 100);
  return { cardNumber: number, cardExpiry: `${expMonth}/${expYear}`, cardCvv: cvv };
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ message: "Unauthorised." }, { status: 401 });

  const memberships = await prisma.potMember.findMany({
    where: { userId: user.id },
    include: {
      pot: {
        include: {
          members: { include: { user: { select: { id: true, name: true } } } },
          contributions: true,
          expenses: true,
          creator: { select: { id: true, name: true } },
        },
      },
    },
  });

  const pots = memberships
    .map((m) => m.pot)
    .filter((p) => p.isActive)
    .map((pot) => {
      const myContribution = pot.contributions
        .filter((c) => c.userId === user.id)
        .reduce((s, c) => s + c.amount, 0);

      const memberTotals = pot.members.map((m) => ({
        userId: m.user.id,
        name: m.user.name,
        total: pot.contributions
          .filter((c) => c.userId === m.user.id)
          .reduce((s, c) => s + c.amount, 0),
      }));

      const totalSaved = pot.contributions.reduce((s, c) => s + c.amount, 0);
      const totalSpent = pot.expenses.reduce((s, e) => s + e.amount, 0);

      const sparkline = pot.contributions
        .slice()
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .reduce<number[]>((acc, c) => [...acc, (acc[acc.length - 1] ?? 0) + c.amount], [0]);

      return {
        id: pot.id,
        title: pot.title,
        description: pot.description,
        target: pot.target,
        totalSaved,
        totalSpent,
        availableBalance: totalSaved - totalSpent,
        myContribution,
        memberTotals,
        sparkline,
        cardNumber: pot.cardNumber,
        cardExpiry: pot.cardExpiry,
        cardCvv: pot.cardCvv,
        creatorId: pot.creatorId,
        creatorName: pot.creator?.name ?? null,
        isCreator: pot.creatorId === user.id,
        createdAt: pot.createdAt,
      };
    });

  return NextResponse.json(pots);
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ message: "Unauthorised." }, { status: 401 });

  const activeMembershipCount = await prisma.potMember.count({
    where: { userId: user.id, pot: { isActive: true } },
  });
  if (activeMembershipCount >= 5) {
    return NextResponse.json({ message: "You can be a member of at most 5 active pots." }, { status: 400 });
  }

  const { title, description, target, memberIds } = await req.json();

  if (!title || !target || target <= 0) {
    return NextResponse.json({ message: "Title and target amount are required." }, { status: 400 });
  }

  const allMemberIds: number[] = [user.id, ...(memberIds ?? [])].filter(
    (id, idx, arr) => arr.indexOf(id) === idx
  );

  const card = generateCard();

  const pot = await prisma.pot.create({
    data: {
      title,
      description: description ?? null,
      target,
      creatorId: user.id,
      cardNumber: card.cardNumber,
      cardExpiry: card.cardExpiry,
      cardCvv: card.cardCvv,
      members: {
        create: allMemberIds.map((id) => ({ userId: id })),
      },
    },
  });

  return NextResponse.json(pot, { status: 201 });
}
