import { OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { ORDER_NUMBER_PREFIX } from "@/lib/constants";

async function generateOrderNumber(tx: Prisma.TransactionClient): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const suffix = String(Math.floor(100000 + Math.random() * 900000));
    const orderNumber = `${ORDER_NUMBER_PREFIX}-${suffix}`;
    const existing = await tx.order.findUnique({ where: { orderNumber } });
    if (!existing) return orderNumber;
  }
  throw new AppError("Could not create your order. Please try again.");
}

/**
 * Purchase flow — fully atomic.
 *
 * The product price and the wallet balance are always re-read from the
 * database inside the transaction. Values coming from the client are never
 * trusted: there is no price/balance parameter in this function at all.
 */
export async function purchaseProduct(userId: string, productSlug: string) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { slug: productSlug } });
    if (!product || !product.active) {
      throw new AppError("This product is no longer available.");
    }
    if (product.stock <= 0) {
      throw new AppError("Product is currently out of stock.");
    }

    // Atomic conditional debit — succeeds only if the balance covers the
    // current database price, so a balance can never go negative.
    const debited = await tx.user.updateMany({
      where: { id: userId, balance: { gte: product.price } },
      data: { balance: { decrement: product.price } },
    });
    if (debited.count === 0) {
      throw new AppError("Your balance is insufficient.");
    }

    // Atomic stock decrement — guards against overselling under concurrency.
    const stocked = await tx.product.updateMany({
      where: { id: product.id, stock: { gt: 0 } },
      data: { stock: { decrement: 1 } },
    });
    if (stocked.count === 0) {
      throw new AppError("Product is currently out of stock.");
    }

    const orderNumber = await generateOrderNumber(tx);

    const order = await tx.order.create({
      data: {
        orderNumber,
        userId,
        productId: product.id,
        productNameSnapshot: product.name,
        priceSnapshot: product.price,
        status: "PROCESSING",
      },
    });

    await tx.walletTransaction.create({
      data: {
        userId,
        amount: product.price.neg(),
        type: "PURCHASE",
        description: product.name,
        orderId: order.id,
      },
    });

    return order;
  });
}

export async function listUserOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUserOrder(userId: string, orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
  });
  if (!order) throw new AppError("Order not found.");
  return order;
}

export async function listOrdersForAdmin(status?: OrderStatus, query?: string) {
  return prisma.order.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(query
        ? {
            OR: [
              { orderNumber: { contains: query, mode: "insensitive" } },
              { productNameSnapshot: { contains: query, mode: "insensitive" } },
              { user: { email: { contains: query, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, name: true, email: true } } },
    take: 200,
  });
}

export async function updateOrderStatus(adminId: string, orderId: string, status: OrderStatus, note?: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order) throw new AppError("Order not found.");

    const data: Prisma.OrderUpdateInput = {
      status,
      adminNote: note ?? undefined,
    };
    if (status === "COMPLETED" && order.status !== "COMPLETED") {
      data.completedAt = new Date();
    }
    if (status !== "COMPLETED") {
      data.completedAt = null;
    }

    await tx.order.update({ where: { id: orderId }, data });
    void adminId; // reserved for an audit log in Phase 2
    return tx.order.findUniqueOrThrow({ where: { id: orderId } });
  });
}
