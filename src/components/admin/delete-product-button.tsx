"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteProductAction } from "@/actions/admin.actions";
import { useToast } from "@/components/ui/toaster";

export function DeleteProductButton({ productId, productName }: { productId: string; productName: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const toast = useToast();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!window.confirm(`Remove "${productName}"? This cannot be undone.`)) return;
        startTransition(async () => {
          const result = await deleteProductAction(productId);
          if (result.ok) {
            toast(result.message ?? "Removed.");
            router.refresh();
          } else {
            toast(result.error ?? "Failed.", "error");
          }
        });
      }}
      className="btn-danger px-3 py-1.5 text-xs"
    >
      {pending ? "Removing..." : "Remove"}
    </button>
  );
}
