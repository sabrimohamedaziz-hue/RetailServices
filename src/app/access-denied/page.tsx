import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Access Denied",
};

export default function AccessDeniedPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center sm:px-6">
      <div className="card w-full p-10">
        <div
          aria-hidden
          className="mx-auto mb-6 h-12 w-12 rotate-45 rounded-lg border border-danger/30 bg-danger/10"
        />
        <h1 className="text-xl font-semibold tracking-tight">Access denied</h1>
        <p className="mt-2 text-sm text-ink-mute">
          You don't have permission to view this page.
        </p>
        <Link href="/store" className="btn-primary mt-6 w-full">
          Back to Store
        </Link>
      </div>
    </div>
  );
}
