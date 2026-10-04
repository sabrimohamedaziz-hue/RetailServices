import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { formatMoney } from "@/lib/money";
import { formatDepositRef } from "@/lib/services/deposit.service";
import { getWalletData } from "@/lib/services/wallet.service";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = {
  title: "Wallet",
  description: "Your RetailServices wallet.",
};

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

export default async function WalletPage() {
  const sessionUser = await requireUser();
  const { user, transactions, deposits } = await getWalletData(sessionUser.id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Retail Wallet</h1>
          <p className="mt-1 text-sm text-ink-mute">Your balance and transaction history.</p>
        </div>
        <Link href="/wallet/deposit" className="btn-primary">Add Balance</Link>
      </div>

      <div className="card relative mb-8 overflow-hidden p-6 sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand/15 blur-3xl"
        />
        <p className="text-xs font-semibold tracking-[0.25em] text-ink-mute">BALANCE</p>
        <p className="mt-2 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          {formatMoney(user.balance)}
        </p>
      </div>

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-medium">Transaction History</h2>
        {transactions.length === 0 ? (
          <EmptyState title="No wallet activity yet." />
        ) : (
          <div className="card divide-y divide-line/60 overflow-hidden">
            {transactions.map((tx) => {
              const positive = ["DEPOSIT", "REFUND", "ADMIN_ADJUSTMENT"].includes(tx.type)
                ? Number(tx.amount) >= 0
                : false;
              return (
                <div key={tx.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div>
                    <p className="text-sm font-medium text-ink">{tx.description}</p>
                    <p className="mt-0.5 text-xs text-ink-mute">
                      {tx.type.replace("_", " ")} · {tx.createdAt.toLocaleDateString("en-IE", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
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

      <section>
        <h2 className="mb-4 text-lg font-medium">Deposit Requests</h2>
        {deposits.length === 0 ? (
          <EmptyState
            title="No deposit requests yet."
            actionHref="/wallet/deposit"
            actionLabel="Add Balance"
          />
        ) : (
          <div className="card divide-y divide-line/60 overflow-hidden">
            {deposits.map((deposit) => (
              <div key={deposit.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-ink">
                    Deposit #{formatDepositRef(deposit.createdAt, deposit.id)}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-mute">
                    {deposit.createdAt.toLocaleDateString("en-IE", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                    {deposit.status === "REJECTED" && deposit.adminNote
                      ? ` · Note: ${deposit.adminNote}`
                      : ""}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-ink">{formatMoney(deposit.amount)}</span>
                  {statusBadge(deposit.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
