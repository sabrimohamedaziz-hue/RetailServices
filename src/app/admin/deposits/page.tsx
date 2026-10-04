import type { Metadata } from "next";
import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { listDepositsForAdmin } from "@/lib/services/deposit.service";
import { DepositActions } from "@/components/admin/deposit-actions";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = {
  title: "Deposit Requests",
};

const FILTERS = [
  { value: "", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

function statusBadge(status: string) {
  switch (status) {
    case "APPROVED":
      return <span className="badge-green">Approved</span>;
    case "REJECTED":
      return <span className="badge-red">Rejected</span>;
    default:
      return <span className="badge-amber">Pending</span>;
  }
}

export default async function AdminDepositsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter = FILTERS.some((f) => f.value === status) ? status : undefined;
  const deposits = await listDepositsForAdmin(
    filter as "PENDING" | "APPROVED" | "REJECTED" | undefined
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Deposit Requests</h1>
        <p className="mt-1 text-sm text-ink-mute">
          Approve only after verifying the payment on Discord.
        </p>
      </div>

      <div className="mb-6 flex gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value ? `/admin/deposits?status=${f.value}` : "/admin/deposits"}
            className={`rounded-lg border px-3.5 py-1.5 text-sm transition-colors ${
              filter === f.value || (!filter && !f.value)
                ? "border-brand bg-brand/15 text-mint"
                : "border-line bg-surface-2 text-ink-dim hover:text-ink"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {deposits.length === 0 ? (
        <EmptyState title="No deposit requests found." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead className="border-b border-line/70">
              <tr>
                <th className="table-head">Customer</th>
                <th className="table-head">Amount</th>
                <th className="table-head">Date</th>
                <th className="table-head">Status</th>
                <th className="table-head text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/50">
              {deposits.map((deposit) => (
                <tr key={deposit.id} className="transition-colors hover:bg-surface-2/50">
                  <td className="table-cell">
                    <p className="font-medium text-ink">{deposit.user.name}</p>
                    <p className="text-xs text-ink-mute">{deposit.user.email}</p>
                  </td>
                  <td className="table-cell font-semibold text-ink">
                    {formatMoney(deposit.amount)}
                  </td>
                  <td className="table-cell">
                    {deposit.createdAt.toLocaleDateString("en-IE", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="table-cell">
                    {statusBadge(deposit.status)}
                    {deposit.adminNote && (
                      <p className="mt-1 max-w-40 truncate text-xs text-ink-mute">
                        {deposit.adminNote}
                      </p>
                    )}
                  </td>
                  <td className="table-cell text-right">
                    <DepositActions depositId={deposit.id} status={deposit.status} />
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
