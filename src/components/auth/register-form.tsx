"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type ActionResult } from "@/actions/auth.actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { useToast } from "@/components/ui/toaster";
import { useEffect } from "react";

const initial: ActionResult = { ok: false };

export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, initial);
  const toast = useToast();

  useEffect(() => {
    if (state.error) toast(state.error, "error");
  }, [state, toast]);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="name" className="label">Name</label>
        <input id="name" name="name" type="text" autoComplete="name" required minLength={2} className="input" placeholder="Your name" />
      </div>
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="input" placeholder="you@example.com" />
      </div>
      <div>
        <label htmlFor="password" className="label">Password</label>
        <input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} className="input" placeholder="At least 8 characters" />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="label">Confirm password</label>
        <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required minLength={8} className="input" placeholder="Repeat your password" />
      </div>
      <SubmitButton pendingLabel="Creating account..." className="w-full">
        Create Account
      </SubmitButton>
      <p className="text-center text-sm text-ink-mute">
        Already have an account?{" "}
        <Link href="/login" className="text-mint hover:underline">
          Login
        </Link>
      </p>
    </form>
  );
}
