import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { formatMoney } from "@/lib/money";
import { listUserOrders } from "@/lib/services/order.service";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = {
  title: "Orders",
  description: "Your RetailServices order history.",
};

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

export default async function OrdersPage() {
  const user = await requireUser();
  const orders = await listUserOrders(user.id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Orders</h1>
        <p className="mt-1 text-sm text-ink-mute">Your order history.</p>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title="You haven't placed any orders yet."
          actionHref="/store"
          actionLabel="Browse Store"
        />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="border-b border-line/70">
              <tr>
                <th className="table-head">Order</th>
                <th className="table-head">Product</th>
                <th className="table-head">Price</th>
                <th className="table-head">Status</th>
                <th className="table-head">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/50">
              {orders.map((order) => (
                <tr key={order.id} className="transition-colors hover:bg-surface-2/50">
                  <td className="table-cell">
                    <Link
                      href={`/orders/${order.id}`}
                      className="font-medium text-mint hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="table-cell text-ink">{order.productNameSnapshot}</td>
                  <td className="table-cell">{formatMoney(order.priceSnapshot)}</td>
                  <td className="table-cell">{statusBadge(order.status)}</td>
                  <td className="table-cell">
                    {order.createdAt.toLocaleDateString("en-IE", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
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
