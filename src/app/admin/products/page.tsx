import type { Metadata } from "next";
import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { listProductsForAdmin } from "@/lib/services/product.service";
import { EmptyState } from "@/components/ui/empty-state";
import { DeleteProductButton } from "@/components/admin/delete-product-button";

export const metadata: Metadata = {
  title: "Products",
};

export default async function AdminProductsPage() {
  const products = await listProductsForAdmin();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Products</h1>
          <p className="mt-1 text-sm text-ink-mute">Manage your store catalog.</p>
        </div>
        <Link href="/admin/products/new" className="btn-primary">Add Product</Link>
      </div>

      {products.length === 0 ? (
        <EmptyState
          title="No products yet."
          hint="Create your first product to start selling."
          actionHref="/admin/products/new"
          actionLabel="Add Product"
        />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="border-b border-line/70">
              <tr>
                <th className="table-head">Product</th>
                <th className="table-head">Category</th>
                <th className="table-head">Price</th>
                <th className="table-head">Stock</th>
                <th className="table-head">Status</th>
                <th className="table-head text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/50">
              {products.map((product) => (
                <tr key={product.id} className="transition-colors hover:bg-surface-2/50">
                  <td className="table-cell">
                    <p className="font-medium text-ink">{product.name}</p>
                    <p className="text-xs text-ink-mute">/{product.slug}</p>
                  </td>
                  <td className="table-cell">{product.category}</td>
                  <td className="table-cell font-semibold text-ink">{formatMoney(product.price)}</td>
                  <td className="table-cell">
                    {product.stock > 0 ? product.stock : <span className="text-danger">0</span>}
                  </td>
                  <td className="table-cell">
                    <div className="flex flex-wrap gap-1.5">
                      {product.active ? (
                        <span className="badge-green">Active</span>
                      ) : (
                        <span className="badge-gray">Inactive</span>
                      )}
                      {product.featured && <span className="badge-brand">Featured</span>}
                    </div>
                  </td>
                  <td className="table-cell text-right">
                    <div className="inline-flex items-center gap-2">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="btn-secondary px-3 py-1.5 text-xs"
                      >
                        Edit
                      </Link>
                      <DeleteProductButton productId={product.id} productName={product.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
