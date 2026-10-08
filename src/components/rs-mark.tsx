"use client";

import { useEffect, useState } from "react";

/**
 * RS monogram — the brand signature.
 * Draws itself on mount, then keeps a slow rotating prism ring behind it.
 */
export function RsMark({ size = 96, animate = true }: { size?: number; animate?: boolean }) {
  const [drawn, setDrawn] = useState(!animate);

  useEffect(() => {
    if (!animate) return;
    const t = setTimeout(() => setDrawn(true), 120);
    return () => clearTimeout(t);
  }, [animate]);

  return (
    <span
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {/* rotating prism ring */}
      <span
        className="absolute inset-0 rounded-full opacity-70"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 62%, rgba(167,139,250,.15) 80%, rgba(103,232,249,.55) 92%, rgba(240,171,252,.75) 100%)",
          animation: "spin-slow 6s linear infinite",
          mask: "radial-gradient(circle, transparent 68%, #000 70%)",
          WebkitMask: "radial-gradient(circle, transparent 68%, #000 70%)",
        }}
      />

      {/* outer ring */}
      <span className="absolute inset-[6%] rounded-full border border-white/15" />

      {/* glow */}
      <span
        className="absolute inset-[14%] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(167,139,250,.28), transparent 70%)", filter: "blur(8px)" }}
      />

      {/* RS monogram */}
      <svg viewBox="0 0 100 100" width={size * 0.56} height={size * 0.56} fill="none">
        <defs>
          <linearGradient id="rs-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#c4b5fd" />
            <stop offset="100%" stopColor="#67e8f9" />
          </linearGradient>
        </defs>

        {/* R */}
        <path
          d="M26 74 L26 26 L44 26 C53 26 58 31 58 38 C58 45 53 50 44 50 L26 50 M44 50 L60 74"
          stroke="url(#rs-grad)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={drawn ? 400 : 400}
          strokeDashoffset={drawn ? 0 : 400}
          style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(.22,1,.36,1) 0.2s" }}
        />

        {/* S */}
        <path
          d="M84 32 C80 27 74 25 68 25 C60 25 55 29 55 35 C55 42 62 44 69 46 C77 48 82 51 82 58 C82 65 76 70 68 70 C60 70 54 67 50 62"
          stroke="url(#rs-grad)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={drawn ? 400 : 400}
          strokeDashoffset={drawn ? 0 : 400}
          style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(.22,1,.36,1) 0.7s" }}
        />
      </svg>
    </span>
  );
}