import type { Metadata } from "next";
import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { listOrdersForAdmin } from "@/lib/services/order.service";
import { OrderStatusControl } from "@/components/admin/order-status-control";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = {
  title: "Orders",
};

const STATUSES = ["", "PENDING", "PROCESSING", "COMPLETED", "CANCELLED"];

function statusBadge(status: string) {
  switch (status) {
    case "COMPLETED":
      return <span className="badge-green">Completed</span>;
    case "PROCESSING":
      return <span className="badge-amber">Processing</span>;
    case "CANCELLED":
      return <span className="badge-red">Cancelled</span>;
    default:
      return <span className="badge-gray">Pending</span>;
  }
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;
  const filter = STATUSES.includes(status ?? "") ? (status as never) : undefined;
  const orders = await listOrdersForAdmin(filter, q);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Orders</h1>
        <p className="mt-1 text-sm text-ink-mute">Fulfil orders and track their status.</p>
      </div>

      <form method="GET" action="/admin/orders" className="card mb-6 flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <input type="search" name="q" defaultValue={q} placeholder="Search order, product or email..." className="input flex-1" />
        <select name="status" defaultValue={status ?? ""} className="input sm:w-44" aria-label="Status filter">
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s || "All statuses"}</option>
          ))}
        </select>
        <button type="submit" className="btn-primary sm:w-auto">Apply</button>
      </form>

      {orders.length === 0 ? (
        <EmptyState title="No orders found." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead className="border-b border-line/70">
              <tr>
                <th className="table-head">Order</th>
                <th className="table-head">Customer</th>
                <th className="table-head">Product</th>
                <th className="table-head">Price</th>
                <th className="table-head">Status</th>
                <th className="table-head text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/50">
              {orders.map((order) => (
                <tr key={order.id} className="transition-colors hover:bg-surface-2/50">
                  <td className="table-cell font-medium text-mint">
                    <Link href={`/orders/${order.id}`} className="hover:underline">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="table-cell">
                    <p className="text-ink">{order.user.name}</p>
                    <p className="text-xs text-ink-mute">{order.user.email}</p>
                  </td>
                  <td className="table-cell text-ink">{order.productNameSnapshot}</td>
                  <td className="table-cell font-semibold text-ink">{formatMoney(order.priceSnapshot)}</td>
                  <td className="table-cell">{statusBadge(order.status)}</td>
                  <td className="table-cell text-right">
                    <OrderStatusControl
                      orderId={order.id}
                      status={order.status}
                      note={order.adminNote ?? ""}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
