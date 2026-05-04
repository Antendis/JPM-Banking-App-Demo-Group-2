import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ message: "Unauthorised." }, { status: 401 });

  const { toEmail, amount, reference } = await req.json();

  if (!toEmail || !amount || amount <= 0) {
    return NextResponse.json({ message: "Recipient email and a valid amount are required." }, { status: 400 });
  }
  if (toEmail.toLowerCase() === user.email.toLowerCase()) {
    return NextResponse.json({ message: "You cannot send money to yourself." }, { status: 400 });
  }
  if (amount > user.balance) {
    return NextResponse.json({ message: "Insufficient balance." }, { status: 400 });
  }

  const recipient = await prisma.user.findUnique({ where: { email: toEmail.toLowerCase() } });
  if (!recipient) {
    return NextResponse.json({ message: "No OnePot account found with that email." }, { status: 404 });
  }

  const ref = reference?.trim() || `Transfer to ${recipient.name}`;

  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { balance: { decrement: amount } } }),
    prisma.user.update({ where: { id: recipient.id }, data: { balance: { increment: amount } } }),
    prisma.transaction.create({
      data: {
        amount,
        description: `Sent to ${recipient.name}`,
        category: "TRANSFER",
        counterparty: recipient.name,
        reference: ref,
        type: "DEBIT",
        userId: user.id,
      },
    }),
    prisma.transaction.create({
      data: {
        amount,
        description: `Received from ${user.name}`,
        category: "TRANSFER",
        counterparty: user.name,
        reference: ref,
        type: "CREDIT",
        userId: recipient.id,
      },
    }),
  ]);

  return NextResponse.json({ message: `£${amount.toFixed(2)} sent to ${recipient.name}.` });
}
