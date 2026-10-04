import { PrismaClient, Prisma } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in the environment.");
  }
  if (adminPassword.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters.");
  }

  const passwordHash = await hashPassword(adminPassword);

  await prisma.user.upsert({
    where: { email: adminEmail.toLowerCase() },
    update: { role: "ADMIN", passwordHash },
    create: {
      name: "CrystalBoost Admin",
      email: adminEmail.toLowerCase(),
      passwordHash,
      role: "ADMIN",
    },
  });
  console.log(`Admin ready: ${adminEmail}`);

  const products = [
    {
      name: "Netflix Premium - 1 Month",
      slug: "netflix-premium-1-month",
      description:
        "One month of Netflix Premium on a private profile. Delivered manually by our team after your order is confirmed.",
      price: new Prisma.Decimal("15.00"),
      category: "Subscriptions",
      stock: 50,
      featured: true,
    },
    {
      name: "Gaming Boost",
      slug: "gaming-boost",
      description:
        "Professional ranked boost by verified boosters. Fast, safe and fully manual. Contact us on Discord to schedule.",
      price: new Prisma.Decimal("20.00"),
      category: "Boosts",
      stock: 25,
      featured: true,
    },
    {
      name: "Spotify Premium - 1 Month",
      slug: "spotify-premium-1-month",
      description:
        "One month of Spotify Premium on your own account. Activation handled manually by our team within 24 hours.",
      price: new Prisma.Decimal("10.00"),
      category: "Subscriptions",
      stock: 40,
      featured: false,
    },
    {
      name: "Xbox Game Pass Ultimate - 1 Month",
      slug: "xbox-game-pass-ultimate-1-month",
      description:
        "One month of Xbox Game Pass Ultimate. Code delivered manually to your order page after verification.",
      price: new Prisma.Decimal("12.00"),
      category: "Gaming",
      stock: 30,
      featured: false,
    },
    {
      name: "Digital Gift Card €25",
      slug: "digital-gift-card-25",
      description:
        "€25 digital gift card, redeemable on any CrystalBoost product. Delivered manually after order confirmation.",
      price: new Prisma.Decimal("25.00"),
      category: "Digital Products",
      stock: 100,
      featured: false,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        stock: product.stock,
        featured: product.featured,
        active: true,
      },
      create: { ...product, active: true },
    });
  }
  console.log(`${products.length} example products ready.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
