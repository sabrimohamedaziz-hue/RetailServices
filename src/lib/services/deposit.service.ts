import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { DEPOSIT_PREFIX } from "@/lib/constants";

export function formatDepositRef(createdAt: Date, id: string): string {
  const seq = id.slice(-4).toUpperCase();
  return `${DEPOSIT_PREFIX}${seq}`;
}

export async function createDepositRequest(userId: string, amount: number | Prisma.Decimal) {
  const value = new Prisma.Decimal(amount);

  // Creating a request never credits the wallet — an admin must approve it.
  return prisma.depositRequest.create({
    data: { userId, amount: value },
  });
}

export async function approveDeposit(adminId: string, depositId: string) {
  return prisma.$transaction(async (tx) => {
    const deposit = await tx.depositRequest.findUnique({ where: { id: depositId } });
    if (!deposit) throw new AppError("Deposit request not found.");

    // Atomic status flip — a PENDING deposit can only transition once,
    // so the same deposit can never be approved (or rejected) twice.
    const updated = await tx.depositRequest.updateMany({
      where: { id: depositId, status: "PENDING" },
      data: { status: "APPROVED", reviewedBy: adminId, reviewedAt: new Date() },
    });
    if (updated.count === 0) {
      throw new AppError("This deposit has already been reviewed.");
    }

    await tx.user.update({
      where: { id: deposit.userId },
      data: { balance: { increment: deposit.amount } },
    });

    await tx.walletTransaction.create({
      data: {
        userId: deposit.userId,
        amount: deposit.amount,
        type: "DEPOSIT",
        description: "Manual Deposit",
        adminId,
      },
    });

    return { credited: deposit.amount };
  });
}

export async function rejectDeposit(adminId: string, depositId: string, note?: string) {
  return prisma.$transaction(async (tx) => {
    const deposit = await tx.depositRequest.findUnique({ where: { id: depositId } });
    if (!deposit) throw new AppError("Deposit request not found.");

    const updated = await tx.depositRequest.updateMany({
      where: { id: depositId, status: "PENDING" },
      data: {
        status: "REJECTED",
        reviewedBy: adminId,
        reviewedAt: new Date(),
        adminNote: note ?? null,
      },
    });
    if (updated.count === 0) {
      throw new AppError("This deposit has already been reviewed.");
    }

    return { ok: true as const };
  });
}

export async function listDepositsForAdmin(status?: "PENDING" | "APPROVED" | "REJECTED") {
  return prisma.depositRequest.findMany({
    where: status ? { status } : {},
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
}
