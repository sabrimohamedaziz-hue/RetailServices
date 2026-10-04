import type { Metadata } from "next";
import { ProductCard } from "@/components/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import { listProducts, type ProductSort } from "@/lib/services/product.service";
import { CATEGORIES } from "@/lib/constants";

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
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>;
}) {
  const { q, category, sort } = await searchParams;
  const activeSort = (SORTS.some((s) => s.value === sort) ? sort : "featured") as ProductSort;
  const products = await listProducts({ query: q, category, sort: activeSort });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Store</h1>
        <p className="mt-1 text-sm text-ink-mute">
          Premium digital products and gaming services.
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

      {products.length === 0 ? (
        <EmptyState
          title="No products found"
          hint="Try a different search term or category."
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
