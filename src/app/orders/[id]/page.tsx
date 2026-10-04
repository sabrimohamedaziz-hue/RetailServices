import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { formatMoney } from "@/lib/money";
import { getUserOrder } from "@/lib/services/order.service";

export const metadata: Metadata = {
  title: "Order Details",
  description: "RetailServices order details.",
};

function statusInfo(status: string): { label: string; hint: string } {
  switch (status) {
    case "COMPLETED":
      return { label: "Completed", hint: "Your order has been completed." };
    case "CANCELLED":
      return { label: "Cancelled", hint: "This order was cancelled. Contact support on Discord." };
    case "PENDING":
      return { label: "Pending", hint: "Your order is waiting to be processed." };
    default:
      return { label: "Processing", hint: "Your order is being processed." };
  }
}

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  let order;
  try {
    order = await getUserOrder(user.id, id);
  } catch {
    notFound();
  }
  const info = statusInfo(order.status);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <nav className="mb-8 text-sm text-ink-mute" aria-label="Breadcrumb">
        <Link href="/orders" className="hover:text-ink">Orders</Link>
        <span className="mx-2">/</span>
        <span className="text-ink-dim">{order.orderNumber}</span>
      </nav>

      <div className="card p-6 sm:p-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{order.orderNumber}</h1>
            <p className="mt-1 text-sm text-ink-mute">{order.productNameSnapshot}</p>
          </div>
          <span
            className={
              order.status === "COMPLETED"
                ? "badge-green"
                : order.status === "CANCELLED"
                  ? "badge-red"
                  : "badge-amber"
            }
          >
            {info.label}
          </span>
        </div>

        <p className="mb-6 rounded-lg border border-brand/20 bg-brand/5 px-4 py-3 text-sm text-ink-dim">
          {info.hint}
        </p>

        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-line/70 bg-surface-2 p-4">
            <dt className="text-xs uppercase tracking-wider text-ink-mute">Price paid</dt>
            <dd className="mt-1 text-lg font-semibold text-ink">
              {formatMoney(order.priceSnapshot)}
            </dd>
          </div>
          <div className="rounded-lg border border-line/70 bg-surface-2 p-4">
            <dt className="text-xs uppercase tracking-wider text-ink-mute">Created</dt>
            <dd className="mt-1 text-ink">
              {order.createdAt.toLocaleDateString("en-IE", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </dd>
          </div>
          <div className="rounded-lg border border-line/70 bg-surface-2 p-4">
            <dt className="text-xs uppercase tracking-wider text-ink-mute">Completed</dt>
            <dd className="mt-1 text-ink">
              {order.completedAt
                ? order.completedAt.toLocaleDateString("en-IE", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—"}
            </dd>
          </div>
          <div className="rounded-lg border border-line/70 bg-surface-2 p-4">
            <dt className="text-xs uppercase tracking-wider text-ink-mute">Delivery</dt>
            <dd className="mt-1 text-ink">Manual delivery by our team</dd>
          </div>
        </dl>

        {order.adminNote && (
          <div className="mt-6 rounded-lg border border-brand/30 bg-brand/10 p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-mint">
              Your order details from the team
            </p>
            <p className="whitespace-pre-wrap text-sm text-ink">{order.adminNote}</p>
          </div>
        )}

        {order.status === "PROCESSING" && (
          <p className="mt-6 text-sm text-ink-mute">
            Questions about this order? Open a ticket on our Discord server.
          </p>
        )}
      </div>
    </div>
  );
}
