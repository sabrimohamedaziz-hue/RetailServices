import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ProductCard } from "@/components/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import { listProducts, listProductGroups, type ProductSort } from "@/lib/services/product.service";
import { getCurrency, formatMoneyIn } from "@/lib/currency.server";
import { CATEGORIES } from "@/lib/constants";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Store",
  description: "Browse premium digital products and gaming services.",
};

const SORTS: { value: ProductSort; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name A-Z" },
];

export default async function StorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; group?: string; sort?: string }>;
}) {
  const { q, category, group, sort } = await searchParams;
  const activeSort = (SORTS.some((s) => s.value === sort) ? sort : "featured") as ProductSort;
  const [products, groups, currency] = await Promise.all([
    listProducts({ query: q, category, sort: activeSort, group }),
    listProductGroups(),
    getCurrency(),
  ]);

  const showGroups = !q && !category && !group;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Products</h1>
        <p className="mt-1 text-sm text-ink-mute">
          Keys, licenses and accounts — delivered the moment payment clears.
        </p>
      </div>

      <form method="GET" action="/store" className="card mb-8 flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search products..."
          className="input flex-1"
          aria-label="Search products"
        />
        <select name="category" defaultValue={category ?? ""} className="input sm:w-48" aria-label="Category">
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select name="sort" defaultValue={activeSort} className="input sm:w-48" aria-label="Sort">
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <button type="submit" className="btn-primary sm:w-auto">Apply</button>
      </form>

      {/* Product groups */}
      {showGroups && groups.length > 0 && (
        <Reveal className="mb-12">
          <h2 className="mb-5 text-xl font-semibold tracking-tight">Browse by group</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {groups.map((g) => (
              <Link
                key={g.name}
                href={`/store/group/${encodeURIComponent(g.name)}`}
                className="card card-hover group flex flex-col overflow-hidden"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-surface-2">
                  {g.image ? (
                    <Image src={g.image} alt={g.name} fill unoptimized className="object-cover transition-transform duration-300 group-hover:scale-[1.04]" sizes="(max-width: 768px) 100vw, 300px" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <div className="h-14 w-14 rotate-45 rounded-lg border border-brand/25 bg-brand/10" aria-hidden />
                    </div>
                  )}
                  <span className="absolute right-3 top-3 badge-green">Instant delivery</span>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <h3 className="font-medium text-ink group-hover:text-mint">{g.name}</h3>
                  <p className="text-sm text-ink-mute">
                    Starting at <span className="font-semibold text-ink">{formatMoneyIn(g.lowest, currency)}</span>
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <span className="text-xs text-ink-mute">{g.count} products</span>
                    <span className="btn-secondary px-3 py-1.5 text-xs">View group</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Reveal>
      )}

      {/* Products */}
      {products.length === 0 ? (
        <EmptyState
          title="No products found"
          hint="Try a different search term or category."
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} currency={currency} />
          ))}
        </div>
      )}
    </div>
  );
}
