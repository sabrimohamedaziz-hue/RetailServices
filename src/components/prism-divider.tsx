/**
 * PrismDivider — a thin spectrum line that separates sections.
 * The signature detail of RetailServices.
 */
export function PrismDivider() {
  return (
    <div className="flex items-center justify-center gap-3 py-2" aria-hidden>
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-brand/50 sm:w-28" />
      <span className="relative flex h-1.5 w-1.5 rotate-45">
        <span
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg,#c4b5fd,#67e8f9,#f0abfc)",
            animation: "prism-spin 6s linear infinite",
          }}
        />
      </span>
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-lime/50 sm:w-28" />
    </div>
  );
}