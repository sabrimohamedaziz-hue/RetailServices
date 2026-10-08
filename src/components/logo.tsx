"use client";

import Link from "next/link";
import { RsMark } from "@/components/rs-mark";

export function Logo({ size = 34 }: { size?: number }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label="RetailServices home">
      <span className="transition-transform duration-300 group-hover:scale-105">
        <RsMark size={size} animate={false} />
      </span>
      <span className="font-display text-base font-semibold tracking-[0.18em] text-ink">
        RETAIL<span className="text-mint">SERVICES</span>
      </span>
    </Link>
  );
}