"use client";

import { useActionState, useEffect } from "react";
import { saveProductAction, type ActionResult } from "@/actions/admin.actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { useToast } from "@/components/ui/toaster";
import { useRouter } from "next/navigation";

type ProductFormValues = {
  id: string | null;
  name: string;
  slug: string;
  description: string;
  price: string;
  category: string;
  group: string;
  imageUrl: string;
  stock: number;
  active: boolean;
  featured: boolean;
};

const CATEGORIES = ["Gaming", "Subscriptions", "Digital Products", "Boosts"];

export function ProductForm({ initial }: { initial: ProductFormValues }) {
  const saveAction = saveProductAction.bind(null, initial.id);
  const [state, formAction] = useActionState(saveAction, initialActionResult);
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    if (state.ok && state.message) {
      toast(state.message);
      router.push("/admin/products");
      router.refresh();
    } else if (state.error) {
      toast(state.error, "error");
    }
  }, [state, toast, router]);

  return (
    <form action={formAction} className="card space-y-5 p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="label">Name</label>
          <input id="name" name="name" type="text" defaultValue={initial.name} required className="input" placeholder="Netflix Premium - 1 Month" />
        </div>
        <div>
          <label htmlFor="slug" className="label">Slug</label>
          <input id="slug" name="slug" type="text" defaultValue={initial.slug} required pattern="[a-z0-9\-]+" className="input" placeholder="netflix-premium-1-month" />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="label">Description</label>
        <textarea id="description" name="description" defaultValue={initial.description} required rows={5} className="input" placeholder="What the customer receives..." />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="price" className="label">Price (EUR)</label>
          <input id="price" name="price" type="number" min="0.01" step="0.01" defaultValue={initial.price} required className="input" placeholder="15.00" />
        </div>
        <div>
          <label htmlFor="category" className="label">Category</label>
          <select id="category" name="category" defaultValue={initial.category} required className="input">
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="group" className="label">Group (e.g. Discord Nitro)</label>
          <input id="group" name="group" type="text" defaultValue={initial.group} className="input" placeholder="Optional — groups products together" />
        </div>
        <div>
          <label htmlFor="stock" className="label">Stock</label>
          <input id="stock" name="stock" type="number" min="0" step="1" defaultValue={initial.stock} required className="input" />
        </div>
      </div>

      <div>
        <label htmlFor="image" className="label">Upload image (optional)</label>
        <input
          id="image"
          name="image"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="input file:mr-3 file:rounded-md file:border-0 file:bg-surface-3 file:px-3 file:py-1.5 file:text-sm file:text-ink"
        />
        <p className="mt-1.5 text-xs text-ink-mute">PNG, JPG, WebP or GIF — max 5 MB. Overrides the URL field below.</p>
      </div>

      <div>
        <label htmlFor="imageUrl" className="label">Image URL (optional)</label>
        <input id="imageUrl" name="imageUrl" type="url" defaultValue={initial.imageUrl} className="input" placeholder="https://... or leave empty" />
      </div>

      <div className="flex flex-wrap gap-6 pt-1">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-dim">
          <input type="checkbox" name="active" defaultChecked={initial.active} className="h-4 w-4 accent-[#d3b384]" />
          Active (visible in store)
        </label>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-dim">
          <input type="checkbox" name="featured" defaultChecked={initial.featured} className="h-4 w-4 accent-[#d3b384]" />
          Featured (show on homepage)
        </label>
      </div>

      <SubmitButton pendingLabel="Saving..." className="w-full sm:w-auto">
        {initial.id ? "Save Changes" : "Create Product"}
      </SubmitButton>
    </form>
  );
}

const initialActionResult: ActionResult = { ok: false };
