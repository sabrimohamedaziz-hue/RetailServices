import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/errors";
import type { ProductInput } from "@/lib/validators";

export type ProductSort = "featured" | "price-asc" | "price-desc" | "name";

export async function listProducts(options: {
  query?: string;
  category?: string;
  group?: string;
  delivery?: "INSTANT" | "MANUAL";
  sort?: ProductSort;
  onlyActive?: boolean;
}) {
  const { query, category, group, delivery, sort = "featured", onlyActive = true } = options;

  const where: Prisma.ProductWhereInput = {
    ...(onlyActive ? { active: true } : {}),
    ...(category ? { category } : {}),
    ...(group ? { group } : {}),
    ...(delivery ? { delivery } : {}),
    // GROUP_ONLY products live only inside their group page
    ...(!group ? { visibility: { not: "GROUP_ONLY" } } : {}),
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
    where: { active: true, featured: true, stock: { gt: 0 }, visibility: { not: "GROUP_ONLY" } },
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

/** Product groups ("Discord Nitro", "Netflix"…) with count and lowest price. */
export async function listProductGroups() {
  const products = await prisma.product.findMany({
    where: { active: true, group: { not: null } },
    orderBy: { createdAt: "desc" },
  });

  const groups = new Map<string, { name: string; count: number; lowest: number; image: string | null }>();
  for (const product of products) {
    const name = product.group as string;
    const entry = groups.get(name) ?? { name, count: 0, lowest: Number.MAX_SAFE_INTEGER, image: null };
    entry.count += 1;
    entry.lowest = Math.min(entry.lowest, Number(product.price));
    entry.image = entry.image ?? product.imageUrl;
    groups.set(name, entry);
  }

  return [...groups.values()]
    .map((g) => ({ ...g, lowest: g.lowest === Number.MAX_SAFE_INTEGER ? 0 : g.lowest }))
    .sort((a, b) => b.count - a.count);
}

export async function listProductsByGroup(group: string) {
  return prisma.product.findMany({
    where: { active: true, group, visibility: { not: "INDIVIDUAL_ONLY" } },
    orderBy: { price: "asc" },
  });
}

export async function getProductGroupName(group: string) {
  const product = await prisma.product.findFirst({ where: { group } });
  return product?.group ?? group;
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
      group: input.group || null,
      delivery: input.delivery,
      visibility: input.visibility,
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
      group: input.group || null,
      delivery: input.delivery,
      visibility: input.visibility,
      imageUrl: input.imageUrl || null,
      stock: input.stock,
      active: input.active,
      featured: input.featured,
    },
  });
}
