import Image from "next/image";

/**
 * Brand emblem — the original RS logo file, wrapped in the brand's emerald aura.
 */
export function BrandLogo({
  size = 96,
  className = "",
  ring = false,
}: {
  size?: number;
  className?: string;
  ring?: boolean;
}) {
  return (
    <span
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* emerald aura */}
      <span
        className="absolute inset-[-18%] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(74,222,128,.30), rgba(34,197,94,.10) 48%, transparent 72%)",
          filter: "blur(16px)",
        }}
      />

      {/* rotating prism ring */}
      {ring && (
        <span
          className="absolute inset-[-10%] rounded-full opacity-70"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 62%, rgba(148,163,184,.18) 78%, rgba(74,222,128,.55) 92%, rgba(203,213,225,.5) 100%)",
            animation: "spin-slow 7s linear infinite",
            mask: "radial-gradient(circle, transparent 87%, #000 89%)",
            WebkitMask: "radial-gradient(circle, transparent 87%, #000 89%)",
          }}
        />
      )}

      <span
        className="relative block overflow-hidden"
        style={{ width: size, height: size, borderRadius: size * 0.22 }}
      >
        <Image
          src="/logo.png"
          alt="RetailServices"
          width={size}
          height={size}
          priority
          unoptimized
          className="h-full w-full object-cover"
        />
      </span>
    </span>
  );
}