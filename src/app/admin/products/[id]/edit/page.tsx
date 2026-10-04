import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { getProductForAdmin } from "@/lib/services/product.service";

export const metadata: Metadata = {
  title: "Edit Product",
};

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let product;
  try {
    product = await getProductForAdmin(id);
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Edit Product</h1>
        <p className="mt-1 text-sm text-ink-mute">{product.name}</p>
      </div>
      <ProductForm
        initial={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price.toString(),
          category: product.category,
          imageUrl: product.imageUrl ?? "",
          stock: product.stock,
          active: product.active,
          featured: product.featured,
        }}
      />
    </div>
  );
}
