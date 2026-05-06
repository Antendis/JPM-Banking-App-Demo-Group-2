import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ message: "Unauthorised." }, { status: 401 });

  const { id } = await params;
  const potId = parseInt(id, 10);
  const { title, description } = await req.json();

  if (!title?.trim()) {
    return NextResponse.json({ message: "Pot name is required." }, { status: 400 });
  }

  const membership = await prisma.potMember.findUnique({
    where: { userId_potId: { userId: user.id, potId } },
    include: { pot: true },
  });

  if (!membership || !membership.pot.isActive) {
    return NextResponse.json({ message: "Pot not found or inactive." }, { status: 404 });
  }

  const updated = await prisma.pot.update({
    where: { id: potId },
    data: { title: title.trim(), description: description?.trim() ?? null },
  });

  return NextResponse.json(updated);
}
