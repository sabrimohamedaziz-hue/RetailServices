import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = {
  title: "New Product",
};

export default function NewProductPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Add Product</h1>
        <p className="mt-1 text-sm text-ink-mute">Create a new store product.</p>
      </div>
      <ProductForm
        initial={{
          id: null,
          name: "",
          slug: "",
          description: "",
          price: "",
          category: "Gaming",
          imageUrl: "",
          stock: 0,
          active: true,
          featured: false,
        }}
      />
    </div>
  );
}
