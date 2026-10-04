"use client";

import { useActionState, useEffect } from "react";
import { updateProfileAction, type ActionResult } from "@/actions/auth.actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { useToast } from "@/components/ui/toaster";

const initial: ActionResult = { ok: false };

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [state, formAction] = useActionState(updateProfileAction, initial);
  const toast = useToast();

  useEffect(() => {
    if (state.ok && state.message) toast(state.message);
    else if (state.error) toast(state.error, "error");
  }, [state, toast]);

  return (
    <form action={formAction} className="card space-y-4 p-6 sm:p-8">
      <div>
        <label htmlFor="name" className="label">Name</label>
        <input id="name" name="name" type="text" defaultValue={name} required minLength={2} className="input" />
      </div>
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" type="email" value={email} disabled className="input opacity-60" />
        <p className="mt-1.5 text-xs text-ink-mute">Email cannot be changed.</p>
      </div>
      <SubmitButton pendingLabel="Saving...">Save Changes</SubmitButton>
    </form>
  );
}
