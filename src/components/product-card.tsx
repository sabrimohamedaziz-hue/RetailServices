import Image from "next/image";
import Link from "next/link";
import { formatMoneyIn, type CurrencyCode } from "@/lib/currency";
import { AddToCartButton } from "@/components/add-to-cart-button";

export type ProductCardData = {
  slug: string;
  name: string;
  description: string;
  price: { toString(): string } | number | string;
  category: string;
  imageUrl: string | null;
  stock: number;
};

export function ProductCard({ product, currency = "EUR" }: { product: ProductCardData; currency?: CurrencyCode }) {
  const inStock = product.stock > 0;

  return (
    <div className="card card-hover group flex flex-col overflow-hidden">
      <Link href={`/store/${product.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-surface-2">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="h-14 w-14 rotate-45 rounded-lg border border-brand/25 bg-brand/10" aria-hidden />
          </div>
        )}
        <span className="absolute left-3 top-3 badge-brand">{product.category}</span>
        {inStock && (
          <span className="absolute right-3 top-3 badge-green">Instant delivery</span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <Link href={`/store/${product.slug}`}>
          <h3 className="font-medium leading-snug text-ink transition-colors group-hover:text-mint">
            {product.name}
          </h3>
        </Link>
        <p className="line-clamp-2 text-sm text-ink-mute">{product.description}</p>

        <div className="mt-auto flex items-center justify-between pt-3">
          <div>
            <p className="text-lg font-semibold text-ink">{formatMoneyIn(product.price, currency)}</p>
            {inStock ? (
              <p className="text-xs text-success">{product.stock} in stock</p>
            ) : (
              <p className="text-xs text-danger">Out of stock</p>
            )}
          </div>
          {inStock && (
            <Link href={`/store/${product.slug}`} className="btn-primary px-3.5 py-2 text-xs">
              Buy now
            </Link>
          )}
        </div>

        {inStock && (
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
  );
}
