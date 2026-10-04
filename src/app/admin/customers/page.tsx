import type { Metadata } from "next";
import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { listCustomers } from "@/lib/services/admin.service";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = {
  title: "Customers",
};

export default async function AdminCustomersPage() {
  const customers = await listCustomers();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Customers</h1>
        <p className="mt-1 text-sm text-ink-mute">Everyone registered on RetailServices.</p>
      </div>

      {customers.length === 0 ? (
        <EmptyState title="No customers yet." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead className="border-b border-line/70">
              <tr>
                <th className="table-head">Customer</th>
                <th className="table-head">Email</th>
                <th className="table-head">Wallet</th>
                <th className="table-head">Orders</th>
                <th className="table-head">Joined</th>
                <th className="table-head text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/50">
              {customers.map((customer) => (
                <tr key={customer.id} className="transition-colors hover:bg-surface-2/50">
                  <td className="table-cell font-medium text-ink">{customer.name}</td>
                  <td className="table-cell">{customer.email}</td>
                  <td className="table-cell font-semibold text-mint">
                    {formatMoney(customer.balance)}
                  </td>
                  <td className="table-cell">{customer._count.orders}</td>
                  <td className="table-cell">
                    {customer.createdAt.toLocaleDateString("en-IE", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="table-cell text-right">
                    <Link
                      href={`/admin/customers/${customer.id}`}
                      className="btn-secondary px-3 py-1.5 text-xs"
                    >
                      Open
                    </Link>
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
