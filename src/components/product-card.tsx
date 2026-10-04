import Image from "next/image";
import Link from "next/link";
import { formatMoney } from "@/lib/money";
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

export function ProductCard({ product }: { product: ProductCardData }) {
  const inStock = product.stock > 0;

  return (
    <Link
      href={`/store/${product.slug}`}
      className="card card-hover group flex flex-col overflow-hidden"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-2">
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
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-medium text-ink">{product.name}</h3>
        <p className="line-clamp-2 text-sm text-ink-mute">{product.description}</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-semibold text-ink">{formatMoney(product.price)}</span>
          {inStock ? (
            <span className="badge-green">In stock</span>
          ) : (
            <span className="badge-red">Out of stock</span>
          )}
        </div>
        {inStock && (
          <AddToCartButton
            className="btn-secondary mt-3 w-full text-xs"
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
    </Link>
  );
}
