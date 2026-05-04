import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

async function executePending(userId: number) {
  const due = await prisma.scheduledPayment.findMany({
    where: { userId, status: "PENDING", scheduledFor: { lte: new Date() } },
    include: { pot: { include: { contributions: true, expenses: true } } },
  });

  for (const payment of due) {
    try {
      if (payment.sourceType === "ACCOUNT") {
        const sender = await prisma.user.findUnique({ where: { id: userId } });
        if (!sender || sender.balance < payment.amount) {
          await prisma.scheduledPayment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
          continue;
        }
        const recipient = payment.recipientEmail
          ? await prisma.user.findUnique({ where: { email: payment.recipientEmail } })
          : null;

        await prisma.$transaction([
          prisma.scheduledPayment.update({ where: { id: payment.id }, data: { status: "COMPLETED" } }),
          prisma.user.update({ where: { id: userId }, data: { balance: { decrement: payment.amount } } }),
          prisma.transaction.create({
            data: {
              amount: payment.amount,
              description: payment.description,
              category: "TRANSFER",
              counterparty: recipient?.name ?? payment.recipientEmail ?? "External",
              reference: `Scheduled payment`,
              type: "DEBIT",
              userId,
            },
          }),
          ...(recipient
            ? [
                prisma.user.update({ where: { id: recipient.id }, data: { balance: { increment: payment.amount } } }),
                prisma.transaction.create({
                  data: {
                    amount: payment.amount,
                    description: `Scheduled payment from ${sender.name}`,
                    category: "TRANSFER",
                    counterparty: sender.name,
                    reference: payment.description,
                    type: "CREDIT",
                    userId: recipient.id,
                  },
                }),
              ]
            : []),
        ]);
      } else if (payment.sourceType === "POT" && payment.pot) {
        const totalSaved = payment.pot.contributions.reduce((s, c) => s + c.amount, 0);
        const totalSpent = payment.pot.expenses.reduce((s, e) => s + e.amount, 0);
        const available = totalSaved - totalSpent;

        if (available < payment.amount) {
          await prisma.scheduledPayment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
          continue;
        }

        await prisma.$transaction([
          prisma.scheduledPayment.update({ where: { id: payment.id }, data: { status: "COMPLETED" } }),
          prisma.potExpense.create({
            data: {
              amount: payment.amount,
              description: payment.description,
              userId,
              potId: payment.potId!,
            },
          }),
        ]);
      }
    } catch {
      await prisma.scheduledPayment.update({ where: { id: payment.id }, data: { status: "FAILED" } }).catch(() => {});
    }
  }
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ message: "Unauthorised." }, { status: 401 });

  await executePending(user.id);

  const payments = await prisma.scheduledPayment.findMany({
    where: { userId: user.id },
    orderBy: { scheduledFor: "asc" },
    include: { pot: { select: { id: true, title: true } } },
  });

  return NextResponse.json(payments);
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ message: "Unauthorised." }, { status: 401 });

  const { amount, description, recipientEmail, potId, sourceType, scheduledFor } = await req.json();

  if (!amount || amount <= 0) {
    return NextResponse.json({ message: "Amount must be greater than zero." }, { status: 400 });
  }
  if (!description?.trim()) {
    return NextResponse.json({ message: "Description is required." }, { status: 400 });
  }
  if (!scheduledFor) {
    return NextResponse.json({ message: "Scheduled date is required." }, { status: 400 });
  }
  if (sourceType !== "ACCOUNT" && sourceType !== "POT") {
    return NextResponse.json({ message: "Invalid source type." }, { status: 400 });
  }
  if (sourceType === "POT" && !potId) {
    return NextResponse.json({ message: "Pot is required for pot payments." }, { status: 400 });
  }
  if (sourceType === "ACCOUNT" && !recipientEmail) {
    return NextResponse.json({ message: "Recipient email is required for account payments." }, { status: 400 });
  }

  const schedDate = new Date(scheduledFor);
  if (isNaN(schedDate.getTime()) || schedDate <= new Date()) {
    return NextResponse.json({ message: "Scheduled date must be in the future." }, { status: 400 });
  }

  if (sourceType === "POT") {
    const membership = await prisma.potMember.findUnique({
      where: { userId_potId: { userId: user.id, potId: parseInt(potId, 10) } },
    });
    if (!membership) {
      return NextResponse.json({ message: "You are not a member of that pot." }, { status: 403 });
    }
  }

  const payment = await prisma.scheduledPayment.create({
    data: {
      userId: user.id,
      amount,
      description: description.trim(),
      recipientEmail: sourceType === "ACCOUNT" ? recipientEmail : null,
      potId: sourceType === "POT" ? parseInt(potId, 10) : null,
      sourceType,
      scheduledFor: schedDate,
    },
  });

  return NextResponse.json(payment, { status: 201 });
}
