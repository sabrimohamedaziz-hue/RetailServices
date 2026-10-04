"use server";

import { getSessionUser } from "@/lib/auth";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { getErrorMessage } from "@/lib/errors";
import { createDepositRequest } from "@/lib/services/deposit.service";
import { purchaseProduct } from "@/lib/services/order.service";
import { depositRequestSchema } from "@/lib/validators";
import type { ActionResult } from "@/actions/auth.actions";

const GENERIC_ERROR = "Something went wrong. Please try again.";

export async function createDepositRequestAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "You must be logged in." };

  const parsed = depositRequestSchema.safeParse({ amount: formData.get("amount") });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };
  }

  const rl = rateLimit(clientKey("deposit", user.id), 10, 60_000);
  if (!rl.allowed) {
    return { ok: false, error: "Too many requests. Please wait a minute and try again." };
  }

  try {
    await createDepositRequest(user.id, parsed.data.amount);
    return {
      ok: true,
      message: "Deposit request submitted successfully. It is now waiting for approval.",
    };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error, GENERIC_ERROR) };
  }
}

export async function checkoutAction(slugs: string[]): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "You must be logged in to buy." };
  if (!Array.isArray(slugs) || slugs.length === 0) {
    return { ok: false, error: "Your cart is empty." };
  }
  if (slugs.length > 50) {
    return { ok: false, error: "Too many items." };
  }

  const rl = rateLimit(clientKey("purchase", user.id), 20, 60_000);
  if (!rl.allowed) {
    return { ok: false, error: "Too many requests. Please slow down and try again." };
  }

  try {
    for (const slug of slugs) {
      if (typeof slug !== "string" || !/^[a-z0-9-]+$/.test(slug)) {
        return { ok: false, error: "Invalid cart item." };
      }
      await purchaseProduct(user.id, slug);
    }
    return {
      ok: true,
      message: "Order placed. Our team will check your payment and send the details.",
    };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error, GENERIC_ERROR) };
  }
}

export async function buyProductAction(productSlug: string): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "You must be logged in to buy." };

  const rl = rateLimit(clientKey("purchase", user.id), 20, 60_000);
  if (!rl.allowed) {
    return { ok: false, error: "Too many requests. Please slow down and try again." };
  }

  try {
    const order = await purchaseProduct(user.id, productSlug);
    return {
      ok: true,
      message: "Purchase completed successfully. Your order is being processed.",
      redirectTo: `/orders/${order.id}`,
    };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error, GENERIC_ERROR) };
  }
}
