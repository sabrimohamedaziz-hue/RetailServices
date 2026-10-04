"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearCart, getCart, type CartItem } from "@/lib/cart";
import { formatMoney } from "@/lib/money";
import { useToast } from "@/components/ui/toaster";
import { checkoutAction } from "@/actions/shop.actions";

export function CheckoutClient({ balance, discordUrl }: { balance: string; discordUrl: string }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    setItems(getCart());
    setMounted(true);
  }, []);

  const total = items.reduce((sum, i) => sum + Number(i.price), 0);
  const balanceNum = Number(balance);
  const enough = balanceNum >= total;

  if (!mounted) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="mb-8 text-3xl font-semibold tracking-tight">Checkout</h1>

      {items.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-ink-dim">Your cart is empty.</p>
          <Link href="/store" className="btn-primary mt-6 inline-flex">Browse the store</Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="card divide-y divide-line/50 lg:col-span-3">
            {items.map((item) => (
              <div key={item.slug} className="flex items-center justify-between gap-4 p-5">
                <p className="font-medium text-ink">{item.name}</p>
                <span className="font-semibold text-ink">{formatMoney(item.price)}</span>
              </div>
            ))}
          </div>

          <div className="card p-6 lg:col-span-2">
            <p className="text-sm text-ink-mute">Your wallet balance</p>
            <p className="text-xl font-semibold text-ink">{formatMoney(balance)}</p>
            <div className="mt-4 flex justify-between border-t border-line/50 pt-4">
              <span className="text-ink-dim">Total</span>
              <span className="text-xl font-semibold text-ink">{formatMoney(total)}</span>
            </div>

            {enough ? (
              <button
                disabled={pending}
                className="btn-primary mt-6 w-full"
                onClick={() => {
                  startTransition(async () => {
                    const result = await checkoutAction(items.map((i) => i.slug));
                    if (result.ok) {
                      clearCart();
                      toast(result.message ?? "Order placed.");
                      router.push("/orders");
                      router.refresh();
                    } else {
                      toast(result.error ?? "Checkout failed.", "error");
                    }
                  });
                }}
              >
                {pending ? "Processing..." : `Pay ${formatMoney(total)} with wallet`}
              </button>
            ) : (
              <div className="mt-6 space-y-4">
                <div className="rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
                  Your balance is not enough to cover this order. Missing:{" "}
                  <span className="font-semibold">{formatMoney(total - balanceNum)}</span>.
                </div>
                <p className="text-sm leading-relaxed text-ink-dim">
                  To charge your balance, join our Discord server and open a ticket. Our team
                  will help you top up, then you can complete this checkout.
                </p>
                <a
                  href={discordUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full"
                >
                  Open a Discord ticket to charge your balance
                </a>
                <Link href="/wallet" className="btn-secondary w-full">
                  Or request a deposit from your wallet
                </Link>
              </div>
            )}

            <div className="mt-6 border-t border-line/50 pt-4 text-xs text-ink-mute">
              Need help? Join our{" "}
              <a href={discordUrl} target="_blank" rel="noopener noreferrer" className="text-mint hover:underline">
                Discord server
              </a>{" "}
              and open a ticket — after you pay, our team checks your payment and sends your
              order details.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
