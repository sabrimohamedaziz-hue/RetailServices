"use client";

import { useActionState, useEffect } from "react";
import { adjustWalletAction } from "@/actions/admin.actions";
import type { ActionResult } from "@/actions/auth.actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { useToast } from "@/components/ui/toaster";
import { useRouter } from "next/navigation";

const initial: ActionResult = { ok: false };

export function WalletAdjustmentForm({ customerId }: { customerId: string }) {
  const [state, formAction] = useActionState(adjustWalletAction, initial);
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    if (state.ok && state.message) {
      toast(state.message);
      router.refresh();
    } else if (state.error) {
      toast(state.error, "error");
    }
  }, [state, toast, router]);

  return (
    <form action={formAction} className="card space-y-4 p-6">
      <h2 className="text-base font-medium">Adjust Wallet</h2>
      <input type="hidden" name="userId" value={customerId} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="direction" className="label">Direction</label>
          <select id="direction" name="direction" className="input" defaultValue="CREDIT">
            <option value="CREDIT">Credit (+)</option>
            <option value="DEBIT">Debit (−)</option>
          </select>
        </div>
        <div>
          <label htmlFor="amount" className="label">Amount (EUR)</label>
          <input id="amount" name="amount" type="number" min="0.01" step="0.01" required className="input" placeholder="10.00" />
        </div>
      </div>
      <div>
        <label htmlFor="reason" className="label">Reason</label>
        <input id="reason" name="reason" type="text" required minLength={3} className="input" placeholder="Payment verified manually" />
      </div>
      <SubmitButton pendingLabel="Adjusting..." className="w-full sm:w-auto">
        Apply Adjustment
      </SubmitButton>
      <p className="text-xs text-ink-mute">
        Every adjustment is recorded as an ADMIN_ADJUSTMENT transaction.
      </p>
    </form>
  );
}
