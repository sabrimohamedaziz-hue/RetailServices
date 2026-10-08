"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { CURRENCIES, CURRENCY_COOKIE, type CurrencyCode } from "@/lib/currency";

export function CurrencySelector({ active }: { active: CurrencyCode }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={active}
      disabled={pending}
      aria-label="Currency"
      onChange={(e) => {
        const code = e.target.value as CurrencyCode;
        document.cookie = `${CURRENCY_COOKIE}=${code}; path=/; max-age=31536000; SameSite=Lax`;
        startTransition(() => router.refresh());
      }}
      className="rounded-lg border border-line bg-surface-2 px-2 py-1.5 text-sm text-ink-dim outline-none hover:text-ink"
    >
      {Object.entries(CURRENCIES).map(([code, c]) => (
        <option key={code} value={code}>{c.label}</option>
      ))}
    </select>
  );
}
