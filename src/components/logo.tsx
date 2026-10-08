"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export function Logo({ size = 34 }: { size?: number }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label="RetailServices home">
      <span className="transition-transform duration-300 group-hover:scale-105">
        <BrandLogo size={size} />
      </span>
      <span className="font-display text-base font-semibold tracking-[0.18em] text-ink">
        RETAIL<span className="text-ink-dim transition-colors group-hover:text-ink">SERVICES</span>
      </span>
    </Link>
  );
}