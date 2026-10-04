import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { DepositForm } from "@/components/wallet/deposit-form";

export const metadata: Metadata = {
  title: "Add Balance",
  description: "Top up your RetailServices wallet via Discord.",
};

export default async function DepositPage() {
  await requireUser();
  const discordUrl = process.env.DISCORD_INVITE_URL ?? "";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Add Balance</h1>
        <p className="mt-1 text-sm text-ink-mute">
          Top up your wallet. Payments are handled manually through Discord.
        </p>
      </div>
      <DepositForm discordUrl={discordUrl} />
    </div>
  );
}
