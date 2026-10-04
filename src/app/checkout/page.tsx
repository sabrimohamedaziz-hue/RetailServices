import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { CheckoutClient } from "@/components/checkout-client";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/checkout");

  return (
    <CheckoutClient
      balance={user.balance.toString()}
      discordUrl={process.env.DISCORD_INVITE_URL ?? "#"}
    />
  );
}
