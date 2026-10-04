"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clearCart, getCart, removeFromCart, type CartItem } from "@/lib/cart";
import { formatMoney } from "@/lib/money";

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const update = () => setItems(getCart());
    update();
    setMounted(true);
    window.addEventListener("cart-updated", update);
    return () => window.removeEventListener("cart-updated", update);
  }, []);

  const total = items.reduce((sum, i) => sum + Number(i.price), 0);

  if (!mounted) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="mb-8 text-3xl font-semibold tracking-tight">Your Cart</h1>

      {items.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-ink-dim">Your cart is empty.</p>
          <Link href="/store" className="btn-primary mt-6 inline-flex">Browse the store</Link>
        </div>
      ) : (
        <>
          <div className="card divide-y divide-line/50">
            {items.map((item) => (
              <div key={item.slug} className="flex items-center justify-between gap-4 p-5">
                <div>
                  <p className="font-medium text-ink">{item.name}</p>
                  <p className="text-xs text-ink-mute">{item.category}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-ink">{formatMoney(item.price)}</span>
                  <button
                    onClick={() => removeFromCart(item.slug)}
                    className="text-sm text-danger hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button onClick={() => clearCart()} className="text-sm text-ink-mute hover:text-ink">
              Clear cart
            </button>
            <div className="flex items-center gap-6">
              <p className="text-lg font-semibold text-ink">Total: {formatMoney(total)}</p>
              <Link href="/checkout" className="btn-primary">Checkout</Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
