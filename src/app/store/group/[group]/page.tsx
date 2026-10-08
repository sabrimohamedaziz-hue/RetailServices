import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductGroupName, listProductsByGroup } from "@/lib/services/product.service";
import { getCurrency, formatMoneyIn } from "@/lib/currency.server";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { Reveal } from "@/components/reveal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ group: string }>;
}): Promise<Metadata> {
  const { group } = await params;
  const name = await getProductGroupName(group);
  if (!name) return { title: "Group not found" };
  return { title: name, description: `${name} — products` };
}

export default async function GroupPage({
  params,
}: {
  params: Promise<{ group: string }>;
}) {
  const { group } = await params;
  const [name, products, currency] = await Promise.all([
    getProductGroupName(group),
    listProductsByGroup(group),
    getCurrency(),
  ]);

  if (!name || products.length === 0) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <nav className="mb-6 text-sm text-ink-mute" aria-label="Breadcrumb">
        <Link href="/store" className="hover:text-ink">Store</Link>
        <span className="mx-2">/</span>
        <span className="text-ink-dim">{name}</span>
      </nav>

      <div className="mb-8 flex items-center gap-5">
        {products[0].imageUrl && (
          <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-line">
            <Image src={products[0].imageUrl} alt={name} fill unoptimized className="object-cover" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{name}</h1>
          <p className="mt-1 text-sm text-ink-mute">{products.length} products · instant delivery</p>
        </div>
      </div>

      <Reveal>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <div key={product.id} className="card card-hover group flex flex-col overflow-hidden">
              <Link href={`/store/${product.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-surface-2">
                {product.imageUrl ? (
                  <Image src={product.imageUrl} alt={product.name} fill unoptimized className="object-cover" sizes="(max-width: 768px) 100vw, 300px" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <div className="h-14 w-14 rotate-45 rounded-lg border border-brand/25 bg-brand/10" aria-hidden />
                  </div>
                )}
                {product.stock > 0 && (
                    <span
                      className={
                        product.delivery === "INSTANT"
                          ? "absolute right-3 top-3 badge-green"
                          : "absolute right-3 top-3 badge-gray"
                      }
                    >
                      {product.delivery === "INSTANT" ? "Instant delivery" : "Manual delivery"}
                    </span>
                  )}
              </Link>
              <div className="flex flex-1 flex-col gap-2 p-5">
                <Link href={`/store/${product.slug}`}>
                  <h3 className="font-medium leading-snug text-ink transition-colors group-hover:text-mint">{product.name}</h3>
                </Link>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div>
                    <p className="text-lg font-semibold text-ink">{formatMoneyIn(product.price, currency)}</p>
                    {product.stock > 0 ? (
                      <p className="text-xs text-success">{product.stock} in stock</p>
                    ) : (
                      <p className="text-xs text-danger">Out of stock</p>
                    )}
                  </div>
                  {product.stock > 0 && (
                    <Link href={`/store/${product.slug}`} className="btn-primary px-3.5 py-2 text-xs">Buy now</Link>
                  )}
                </div>
                {product.stock > 0 && (
                  <AddToCartButton
                    className="btn-secondary mt-2 w-full text-xs"
                    item={{
                      slug: product.slug,
                      name: product.name,
                      price: String(product.price),
                      category: product.category,
                      imageUrl: product.imageUrl,
                    }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
