"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { buyProductAction } from "@/actions/shop.actions";
import { useToast } from "@/components/ui/toaster";

export function BuyButton({
  slug,
  canAfford,
  inStock,
  loggedIn,
}: {
  slug: string;
  canAfford: boolean;
  inStock: boolean;
  loggedIn: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [label, setLabel] = useState<string | null>(null);

  function handleBuy() {
    if (!loggedIn) {
      router.push(`/login?next=/store/${slug}`);
      return;
    }
    setLabel("Buying...");
    startTransition(async () => {
      const result = await buyProductAction(slug);
      if (result.ok) {
        toast(result.message ?? "Purchase completed successfully.");
        if (result.redirectTo) router.push(result.redirectTo);
        router.refresh();
      } else {
        toast(result.error ?? "Something went wrong. Please try again.", "error");
        setLabel(null);
        router.refresh();
      }
    });
  }

  if (!inStock) {
    return (
      <button type="button" disabled className="btn-secondary w-full sm:w-auto">
        Out of stock
      </button>
    );
  }

  if (!canAfford) {
    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="button" disabled className="btn-secondary cursor-not-allowed opacity-60">
          Insufficient balance
        </button>
        <button
          type="button"
          onClick={() => router.push("/wallet/deposit")}
          className="btn-primary"
        >
          Add Balance
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleBuy}
      disabled={pending}
      className="btn-primary w-full sm:w-auto sm:min-w-44"
    >
      {pending ? label ?? "Buying..." : "Buy Now"}
    </button>
  );
}
