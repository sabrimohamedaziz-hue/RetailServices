"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  approveDepositAction,
  rejectDepositAction,
} from "@/actions/admin.actions";
import { useToast } from "@/components/ui/toaster";

export function DepositActions({ depositId, status }: { depositId: string; status: string }) {
  const [pending, startTransition] = useTransition();
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");
  const router = useRouter();
  const toast = useToast();

  if (status !== "PENDING") {
    return <span className="text-xs text-ink-mute">Reviewed</span>;
  }

  function run(action: () => Promise<{ ok: boolean; message?: string; error?: string }>) {
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        toast(result.message ?? "Done.");
      } else {
        toast(result.error ?? "Something went wrong.", "error");
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => approveDepositAction(depositId))}
          className="btn-primary px-3 py-1.5 text-xs"
        >
          Approve
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => setRejecting((v) => !v)}
          className="btn-danger px-3 py-1.5 text-xs"
        >
          Reject
        </button>
      </div>
      {rejecting && (
        <div className="flex w-56 flex-col gap-2">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Reason (optional)"
            className="input px-2.5 py-1.5 text-xs"
          />
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => rejectDepositAction(depositId, note))}
            className="btn-danger px-3 py-1.5 text-xs"
          >
            Confirm Rejection
          </button>
        </div>
      )}
    </div>
  );
}
