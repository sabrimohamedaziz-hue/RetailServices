"use client";

import Image from "next/image";
import Link from "next/link";

export function Logo({ size = 34 }: { size?: number }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="RetailServices home">
      <Image
        src="/logo.png"
        alt="RetailServices logo"
        width={size}
        height={size}
        priority
        className="rounded-lg ring-1 ring-line"
      />
      <span className="text-base font-semibold tracking-[0.18em] text-ink">
        RETAIL<span className="text-mint">SERVICES</span>
      </span>
    </Link>
  );
}
