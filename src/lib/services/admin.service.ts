import { prisma } from "@/lib/db";

export async function getAdminStats() {
  const [
    totalCustomers,
    totalOrders,
    pendingDeposits,
    completedOrders,
    revenueAgg,
    depositsAgg,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.order.count(),
    prisma.depositRequest.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "COMPLETED" } }),
    prisma.order.aggregate({
      where: { status: "COMPLETED" },
      _sum: { priceSnapshot: true },
    }),
    prisma.depositRequest.aggregate({
      where: { status: "APPROVED" },
      _sum: { amount: true },
    }),
  ]);

  return {
    totalCustomers,
    totalOrders,
    pendingDeposits,
    completedOrders,
    totalRevenue: revenueAgg._sum.priceSnapshot,
    totalDeposits: depositsAgg._sum.amount,
  };
}

export async function listCustomers() {
  return prisma.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      balance: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
  });
}

export async function getCustomerDetail(customerId: string) {
  const customer = await prisma.user.findFirst({
    where: { id: customerId, role: "CUSTOMER" },
    select: { id: true, name: true, email: true, balance: true, createdAt: true },
  });
  if (!customer) return null;

  const [orders, deposits, transactions] = await Promise.all([
    prisma.order.findMany({
      where: { userId: customerId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.depositRequest.findMany({
      where: { userId: customerId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.walletTransaction.findMany({
      where: { userId: customerId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  return { customer, orders, deposits, transactions };
}
