import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

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

      return {
        id: pot.id,
        title: pot.title,
        description: pot.description,
        target: pot.target,
        totalSaved,
        myContribution,
        memberTotals,
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

  const { title, description, target, memberIds } = await req.json();

  if (!title || !target || target <= 0) {
    return NextResponse.json({ message: "Title and target amount are required." }, { status: 400 });
  }

  const allMemberIds: number[] = [user.id, ...(memberIds ?? [])].filter(
    (id, idx, arr) => arr.indexOf(id) === idx
  );

  const pot = await prisma.pot.create({
    data: {
      title,
      description: description ?? null,
      target,
      creatorId: user.id,
      members: {
        create: allMemberIds.map((id) => ({ userId: id })),
      },
    },
  });

  return NextResponse.json(pot, { status: 201 });
}
