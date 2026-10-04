import Link from "next/link";

export function EmptyState({
  title,
  hint,
  actionHref,
  actionLabel,
}: {
  title: string;
  hint?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-14 text-center">
      <div
        aria-hidden
        className="mb-1 h-10 w-10 rotate-45 rounded-md border border-brand/30 bg-brand/10"
      />
      <p className="text-base font-medium text-ink">{title}</p>
      {hint ? <p className="max-w-sm text-sm text-ink-mute">{hint}</p> : null}
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="btn-secondary mt-2">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
