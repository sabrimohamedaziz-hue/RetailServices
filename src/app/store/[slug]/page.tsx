import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BuyButton } from "@/components/buy-button";
import { getSessionUser } from "@/lib/auth";
import { formatMoney } from "@/lib/money";
import { getProductBySlug } from "@/lib/services/product.service";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      images: product.imageUrl ? [product.imageUrl] : ["/logo.png"],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, user] = await Promise.all([getProductBySlug(slug), getSessionUser()]);
  if (!product) notFound();

  const inStock = product.stock > 0;
  const balance = user ? Number(user.balance) : 0;
  const price = Number(product.price);
  const canAfford = user ? balance >= price : true;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <nav className="mb-8 text-sm text-ink-mute" aria-label="Breadcrumb">
        <Link href="/store" className="hover:text-ink">Store</Link>
        <span className="mx-2">/</span>
        <span className="text-ink-dim">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-line bg-surface-2">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="h-24 w-24 rotate-45 rounded-xl border border-brand/25 bg-brand/10" aria-hidden />
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <span className="badge-brand w-fit">{product.category}</span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">{product.name}</h1>
          <p className="mt-4 leading-relaxed text-ink-dim">{product.description}</p>

          <dl className="mt-8 grid grid-cols-2 gap-4 text-sm">
            <div className="card p-4">
              <dt className="text-ink-mute">Price</dt>
              <dd className="mt-1 text-xl font-semibold text-ink">{formatMoney(product.price)}</dd>
            </div>
            <div className="card p-4">
              <dt className="text-ink-mute">Stock</dt>
              <dd className="mt-1">
                {inStock ? (
                  <span className="badge-green">{product.stock} available</span>
                ) : (
                  <span className="badge-red">Out of stock</span>
                )}
              </dd>
            </div>
            <div className="card p-4">
              <dt className="text-ink-mute">Delivery</dt>
              <dd className="mt-1 text-ink">Manual delivery by our team</dd>
            </div>
            <div className="card p-4">
              <dt className="text-ink-mute">Your Wallet</dt>
              <dd className="mt-1 text-xl font-semibold text-mint">
                {user ? formatMoney(balance) : "—"}
              </dd>
            </div>
          </dl>

          <div className="mt-8">
            {!user && (
              <p className="mb-3 text-sm text-ink-mute">
                <Link href={`/login?next=/store/${product.slug}`} className="text-mint hover:underline">
                  Log in
                </Link>{" "}
                to purchase this product.
              </p>
            )}
            {user && !canAfford && (
              <p className="badge-red mb-3 w-fit">Insufficient balance</p>
            )}
            <BuyButton
              slug={product.slug}
              canAfford={canAfford}
              inStock={inStock}
              loggedIn={Boolean(user)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
