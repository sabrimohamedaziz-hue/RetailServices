"use client";

import { addToCart, type CartItem } from "@/lib/cart";
import { useToast } from "@/components/ui/toaster";

export function AddToCartButton({ item, className }: { item: CartItem; className?: string }) {
  const toast = useToast();
  return (
    <button
      type="button"
      className={className ?? "btn-secondary px-3 py-1.5 text-xs"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(item);
        toast(`${item.name} added to cart.`);
      }}
    >
      Add to cart
    </button>
  );
}
