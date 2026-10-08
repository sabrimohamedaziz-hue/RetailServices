"use client";

import { useEffect, useState } from "react";

/**
 * RS emblem — the RetailServices signature.
 * Faithful to the brand mark: silver RS monogram inside a ring with two
 * accent arcs, lit by an emerald glow. Draws itself on mount (hero).
 */
export function RsMark({
  size = 96,
  animate = true,
  className = "",
}: {
  size?: number;
  animate?: boolean;
  className?: string;
}) {
  const [drawn, setDrawn] = useState(!animate);

  useEffect(() => {
    if (!animate) return;
    const t = setTimeout(() => setDrawn(true), 100);
    return () => clearTimeout(t);
  }, [animate]);

  const dash = (len: number) => ({
    strokeDasharray: len,
    strokeDashoffset: drawn ? 0 : len,
    transition: `stroke-dashoffset 1.6s cubic-bezier(.22,1,.36,1) var(--d, 0s)`,
  });

  return (
    <span
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {/* emerald aura */}
      <span
        className="absolute inset-[-22%] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(74,222,128,.34), rgba(34,197,94,.12) 45%, transparent 70%)",
          filter: "blur(18px)",
        }}
      />

      {/* slow rotating prism ring (signature accent) */}
      <span
        className="absolute inset-[-8%] rounded-full opacity-80"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 60%, rgba(167,139,250,.25) 78%, rgba(103,232,249,.6) 90%, rgba(74,222,128,.7) 100%)",
          animation: "spin-slow 7s linear infinite",
          mask: "radial-gradient(circle, transparent 86%, #000 88%)",
          WebkitMask: "radial-gradient(circle, transparent 86%, #000 88%)",
        }}
      />

      <svg viewBox="0 0 200 200" width={size} height={size} fill="none">
        <defs>
          <linearGradient id="rs-silver" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="38%" stopColor="#e8eef0" />
            <stop offset="62%" stopColor="#9fb0ac" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>

          <linearGradient id="rs-green" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#bbf7d0" />
            <stop offset="50%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>

          <filter id="rs-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="rs-soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* main ring with two gaps */}
        <circle
          cx="100"
          cy="100"
          r="86"
          stroke="url(#rs-silver)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="392 149"
          transform="rotate(-58 100 100)"
          style={dash(541)}
        />

        {/* accent arc — top left */}
        <path
          d="M32 58 A86 86 0 0 1 74 20"
          stroke="url(#rs-green)"
          strokeWidth="7"
          strokeLinecap="round"
          filter="url(#rs-soft)"
          style={dash(120)}
        />

        {/* accent arc — bottom right */}
        <path
          d="M168 142 A86 86 0 0 1 126 180"
          stroke="url(#rs-green)"
          strokeWidth="7"
          strokeLinecap="round"
          filter="url(#rs-soft)"
          style={dash(120)}
        />

        {/* RS monogram */}
        <g
          stroke="url(#rs-silver)"
          strokeWidth="13"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#rs-glow)"
        >
          {/* R */}
          <g style={{ ...dash(320), "--d": "0.35s" } as React.CSSProperties}>
            <path d="M58 140 L74 60" />
            <path d="M74 60 L104 60 C122 60 132 68 132 82 C132 96 122 104 104 104 L74 104" />
            <path d="M108 104 L140 140" />
          </g>

          {/* S */}
          <g style={{ ...dash(320), "--d": "0.9s" } as React.CSSProperties}>
            <path d="M176 72 C170 63 161 59 150 59 C131 59 120 70 120 83 C120 96 131 103 146 107 C161 111 170 117 170 128 C170 139 159 145 144 145 C131 145 120 140 113 131" />
          </g>
        </g>

        {/* signature swoosh crossing the monogram */}
        <path
          d="M44 152 C74 166 128 152 166 116"
          stroke="url(#rs-green)"
          strokeWidth="5"
          strokeLinecap="round"
          filter="url(#rs-soft)"
          style={dash(190)}
        />
      </svg>
    </span>
  );
}