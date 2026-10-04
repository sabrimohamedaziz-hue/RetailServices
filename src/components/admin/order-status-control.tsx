"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatusAction } from "@/actions/admin.actions";
import { useToast } from "@/components/ui/toaster";

const STATUSES = ["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"] as const;

export function OrderStatusControl({
  orderId,
  status,
  note,
}: {
  orderId: string;
  status: string;
  note: string;
}) {
  const [pending, startTransition] = useTransition();
  const [value, setValue] = useState(status);
  const [noteValue, setNoteValue] = useState(note);
  const router = useRouter();
  const toast = useToast();

  function save() {
    startTransition(async () => {
      const result = await updateOrderStatusAction(orderId, value, noteValue);
      if (result.ok) {
        toast(result.message ?? "Order updated.");
        router.refresh();
      } else {
        toast(result.error ?? "Something went wrong.", "error");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-2">
        <select
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="input w-36 px-2.5 py-1.5 text-xs"
          aria-label="Order status"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={save}
          disabled={pending || value === status}
          className="btn-primary px-3 py-1.5 text-xs"
        >
          Save
        </button>
      </div>
      <input
        value={noteValue}
        onChange={(e) => setNoteValue(e.target.value)}
        placeholder="Details to send the customer (login, code…)"
        className="input w-56 px-2.5 py-1.5 text-xs"
      />
    </div>
  );
}
