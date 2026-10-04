import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/errors";

export type TransactionClient = Prisma.TransactionClient;

export async function getWalletData(userId: string) {
  const [user, transactions, deposits] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { id: true, balance: true, name: true, email: true },
    }),
    prisma.walletTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.depositRequest.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);
  return { user, transactions, deposits };
}

export async function adjustWallet(input: {
  adminId: string;
  customerId: string;
  amount: Prisma.Decimal | number;
  direction: "CREDIT" | "DEBIT";
  reason: string;
}) {
  const amount = new Prisma.Decimal(input.amount);

  return prisma.$transaction(async (tx) => {
    const customer = await tx.user.findUnique({ where: { id: input.customerId } });
    if (!customer) throw new AppError("Customer not found.");
    if (customer.role !== "CUSTOMER") throw new AppError("Wallets can only be adjusted for customers.");

    if (input.direction === "DEBIT") {
      // Atomic guard: a debit can never push a balance below zero.
      const result = await tx.user.updateMany({
        where: { id: input.customerId, balance: { gte: amount } },
        data: { balance: { decrement: amount } },
      });
      if (result.count === 0) throw new AppError("Debit rejected: balance would become negative.");
    } else {
      await tx.user.update({
        where: { id: input.customerId },
        data: { balance: { increment: amount } },
      });
    }

    const signed = input.direction === "CREDIT" ? amount : amount.neg();

    await tx.walletTransaction.create({
      data: {
        userId: input.customerId,
        amount: signed,
        type: "ADMIN_ADJUSTMENT",
        description: input.reason,
        adminId: input.adminId,
      },
    });

    return tx.user.findUniqueOrThrow({
      where: { id: input.customerId },
      select: { balance: true },
    });
  });
}
