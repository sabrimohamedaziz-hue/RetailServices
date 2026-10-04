import type { Metadata } from "next";
import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { getAdminStats } from "@/lib/services/admin.service";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

const QUICK_ACTIONS = [
  { href: "/admin/products/new", label: "Add Product" },
  { href: "/admin/deposits", label: "Review Deposits" },
  { href: "/admin/orders", label: "Manage Orders" },
  { href: "/admin/customers", label: "Manage Customers" },
];

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  const cards = [
    { label: "Total Customers", value: String(stats.totalCustomers) },
    { label: "Total Orders", value: String(stats.totalOrders) },
    {
      label: "Pending Deposits",
      value: String(stats.pendingDeposits),
      highlight: stats.pendingDeposits > 0,
    },
    { label: "Completed Orders", value: String(stats.completedOrders) },
    {
      label: "Total Revenue",
      value: formatMoney(stats.totalRevenue ?? 0),
    },
    {
      label: "Total Deposits",
      value: formatMoney(stats.totalDeposits ?? 0),
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-ink-mute">RetailServices overview.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="card p-5">
            <p className="text-xs uppercase tracking-wider text-ink-mute">{card.label}</p>
            <p
              className={`mt-2 text-2xl font-semibold tracking-tight ${
                "highlight" in card && card.highlight ? "text-warning" : "text-ink"
              }`}
            >
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <h2 className="mb-4 mt-10 text-lg font-medium">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {QUICK_ACTIONS.map((action) => (
          <Link key={action.href} href={action.href} className="card card-hover p-5 text-sm font-medium text-ink">
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
