import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ message: "Unauthorised." }, { status: 401 });

  const { id } = await params;
  const paymentId = parseInt(id, 10);

  const payment = await prisma.scheduledPayment.findUnique({ where: { id: paymentId } });

  if (!payment || payment.userId !== user.id) {
    return NextResponse.json({ message: "Payment not found." }, { status: 404 });
  }
  if (payment.status !== "PENDING") {
    return NextResponse.json({ message: "Only pending payments can be cancelled." }, { status: 400 });
  }

  await prisma.scheduledPayment.update({ where: { id: paymentId }, data: { status: "CANCELLED" } });

  return NextResponse.json({ message: "Payment cancelled." });
}
