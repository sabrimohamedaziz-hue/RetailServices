import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/errors";
import type { ProductInput } from "@/lib/validators";

export type ProductSort = "featured" | "price-asc" | "price-desc" | "name";

export async function listProducts(options: {
  query?: string;
  category?: string;
  sort?: ProductSort;
  onlyActive?: boolean;
}) {
  const { query, category, sort = "featured", onlyActive = true } = options;

  const where: Prisma.ProductWhereInput = {
    ...(onlyActive ? { active: true } : {}),
    ...(category ? { category } : {}),
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput[] =
    sort === "price-asc"
      ? [{ price: "asc" }]
      : sort === "price-desc"
        ? [{ price: "desc" }]
        : sort === "name"
          ? [{ name: "asc" }]
          : [{ featured: "desc" }, { createdAt: "desc" }];

  return prisma.product.findMany({ where, orderBy });
}

export async function getFeaturedProducts(limit = 4) {
  return prisma.product.findMany({
    where: { active: true, featured: true, stock: { gt: 0 } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product || !product.active) return null;
  return product;
}

export async function listProductsForAdmin() {
  return prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });
}

export async function getProductForAdmin(id: string) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new AppError("Product not found.");
  return product;
}

export async function deleteProduct(id: string): Promise<{ deactivated: boolean }> {
  const existing = await prisma.product.findUnique({
    where: { id },
    include: { _count: { select: { orders: true } } },
  });
  if (!existing) throw new AppError("Product not found.");

  // Products with orders must stay for order history — deactivate instead
  if (existing._count.orders > 0) {
    await prisma.product.update({
      where: { id },
      data: { active: false, featured: false },
    });
    return { deactivated: true };
  }

  await prisma.product.delete({ where: { id } });
  return { deactivated: false };
}

export async function createProduct(input: ProductInput) {
  const existing = await prisma.product.findUnique({ where: { slug: input.slug } });
  if (existing) throw new AppError("A product with this slug already exists.");

  return prisma.product.create({
    data: {
      name: input.name,
      slug: input.slug,
      description: input.description,
      price: new Prisma.Decimal(input.price),
      category: input.category,
      imageUrl: input.imageUrl || null,
      stock: input.stock,
      active: input.active,
      featured: input.featured,
    },
  });
}

export async function updateProduct(id: string, input: ProductInput) {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw new AppError("Product not found.");

  const slugTaken = await prisma.product.findFirst({
    where: { slug: input.slug, id: { not: id } },
  });
  if (slugTaken) throw new AppError("A product with this slug already exists.");

  return prisma.product.update({
    where: { id },
    data: {
      name: input.name,
      slug: input.slug,
      description: input.description,
      price: new Prisma.Decimal(input.price),
      category: input.category,
      imageUrl: input.imageUrl || null,
      stock: input.stock,
      active: input.active,
      featured: input.featured,
    },
  });
}
