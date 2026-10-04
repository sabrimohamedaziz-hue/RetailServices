import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatMoney } from "@/lib/money";
import { getCustomerDetail } from "@/lib/services/admin.service";
import { formatDepositRef } from "@/lib/services/deposit.service";
import { WalletAdjustmentForm } from "@/components/admin/wallet-adjustment-form";

export const metadata: Metadata = {
  title: "Customer Details",
};

function orderStatusBadge(status: string) {
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

function depositStatusBadge(status: string) {
  switch (status) {
    case "APPROVED":
      return <span className="badge-green">Approved</span>;
    case "REJECTED":
      return <span className="badge-red">Rejected</span>;
    default:
      return <span className="badge-amber">Pending</span>;
  }
}

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getCustomerDetail(id);
  if (!detail) notFound();
  const { customer, orders, deposits, transactions } = detail;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <nav className="mb-8 text-sm text-ink-mute" aria-label="Breadcrumb">
        <Link href="/admin/customers" className="hover:text-ink">Customers</Link>
        <span className="mx-2">/</span>
        <span className="text-ink-dim">{customer.name}</span>
      </nav>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-xs uppercase tracking-wider text-ink-mute">Name</p>
          <p className="mt-1.5 font-medium text-ink">{customer.name}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs uppercase tracking-wider text-ink-mute">Email</p>
          <p className="mt-1.5 font-medium text-ink">{customer.email}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs uppercase tracking-wider text-ink-mute">Wallet Balance</p>
          <p className="mt-1.5 text-xl font-semibold text-mint">
            {formatMoney(customer.balance)}
          </p>
        </div>
      </div>

      <div className="mb-10">
        <WalletAdjustmentForm customerId={customer.id} />
      </div>

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-medium">Order History</h2>
        {orders.length === 0 ? (
          <p className="card px-5 py-6 text-sm text-ink-mute">This customer has no orders.</p>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead className="border-b border-line/70">
                <tr>
                  <th className="table-head">Order</th>
                  <th className="table-head">Product</th>
                  <th className="table-head">Price</th>
                  <th className="table-head">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/50">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="table-cell font-medium text-mint">{order.orderNumber}</td>
                    <td className="table-cell text-ink">{order.productNameSnapshot}</td>
                    <td className="table-cell">{formatMoney(order.priceSnapshot)}</td>
                    <td className="table-cell">{orderStatusBadge(order.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-medium">Deposit History</h2>
        {deposits.length === 0 ? (
          <p className="card px-5 py-6 text-sm text-ink-mute">This customer has no deposit requests.</p>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead className="border-b border-line/70">
                <tr>
                  <th className="table-head">Deposit</th>
                  <th className="table-head">Amount</th>
                  <th className="table-head">Status</th>
                  <th className="table-head">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/50">
                {deposits.map((deposit) => (
                  <tr key={deposit.id}>
                    <td className="table-cell font-medium text-ink">
                      #{formatDepositRef(deposit.createdAt, deposit.id)}
                    </td>
                    <td className="table-cell">{formatMoney(deposit.amount)}</td>
                    <td className="table-cell">{depositStatusBadge(deposit.status)}</td>
                    <td className="table-cell">
                      {deposit.createdAt.toLocaleDateString("en-IE", {
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
      </section>

      <section>
        <h2 className="mb-4 text-lg font-medium">Wallet Transactions</h2>
        {transactions.length === 0 ? (
          <p className="card px-5 py-6 text-sm text-ink-mute">No wallet transactions.</p>
        ) : (
          <div className="card divide-y divide-line/60 overflow-hidden">
            {transactions.map((tx) => {
              const positive = Number(tx.amount) >= 0;
              return (
                <div key={tx.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div>
                    <p className="text-sm font-medium text-ink">{tx.description}</p>
                    <p className="mt-0.5 text-xs text-ink-mute">
                      {tx.type.replace("_", " ")} ·{" "}
                      {tx.createdAt.toLocaleDateString("en-IE", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span className={`text-sm font-semibold ${positive ? "text-success" : "text-danger"}`}>
                    {positive ? "+" : "−"}
                    {formatMoney(Math.abs(Number(tx.amount)))}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
