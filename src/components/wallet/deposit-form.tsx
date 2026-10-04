"use client";

import { useActionState, useState } from "react";
import { createDepositRequestAction } from "@/actions/shop.actions";
import type { ActionResult } from "@/actions/auth.actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { useToast } from "@/components/ui/toaster";
import { useEffect } from "react";

const initial: ActionResult = { ok: false };

const PRESETS = [5, 10, 20, 50, 100];

const INSTRUCTIONS = [
  "Open the RetailServices Discord server.",
  "Create a payment ticket.",
  "Send the requested amount.",
  "Send your payment proof.",
  "Wait for an administrator to verify the payment.",
  "Your RetailServices wallet will be credited.",
];

export function DepositForm({ discordUrl }: { discordUrl: string }) {
  const [state, formAction] = useActionState(createDepositRequestAction, initial);
  const [amount, setAmount] = useState<string>("20");
  const toast = useToast();

  useEffect(() => {
    if (state.ok && state.message) {
      toast(state.message);
    } else if (state.error) {
      toast(state.error, "error");
    }
  }, [state, toast]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="card p-6 sm:p-8">
        <h2 className="mb-1 text-lg font-medium">Choose amount</h2>
        <p className="mb-6 text-sm text-ink-mute">In euros (EUR).</p>

        <div className="mb-5 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setAmount(String(preset))}
              className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                amount === String(preset)
                  ? "border-brand bg-brand/15 text-mint"
                  : "border-line bg-surface-2 text-ink-dim hover:border-line-strong hover:text-ink"
              }`}
            >
              €{preset}
            </button>
          ))}
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="amount" className="label">Custom amount (EUR)</label>
            <input
              id="amount"
              name="amount"
              type="number"
              min="1"
              max="1000"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input"
              required
            />
          </div>
          <SubmitButton pendingLabel="Submitting..." className="w-full">
            Request Deposit
          </SubmitButton>
        </form>

        {discordUrl ? (
          <a
            href={discordUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary mt-3 w-full"
          >
            Open Discord
          </a>
        ) : null}
      </div>

      <div className="card p-6 sm:p-8">
        <h2 className="mb-1 text-lg font-medium">Pay through Discord</h2>
        <p className="mb-6 text-sm text-ink-mute">
          Deposits are verified manually by our team.
        </p>
        <ol className="space-y-3.5">
          {INSTRUCTIONS.map((step, index) => (
            <li key={step} className="flex gap-3.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/15 text-xs font-semibold text-mint">
                {index + 1}
              </span>
              <span className="text-sm leading-6 text-ink-dim">{step}</span>
            </li>
          ))}
        </ol>
        <p className="mt-6 rounded-lg border border-warning/20 bg-warning/5 px-4 py-3 text-xs leading-relaxed text-ink-mute">
          Submitting a request does not add balance instantly. An administrator must approve
          it after verifying your payment in Discord.
        </p>
      </div>
    </div>
  );
}
