"use client";

import { useActionState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginAction, type ActionResult } from "@/actions/auth.actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { useToast } from "@/components/ui/toaster";

const initial: ActionResult = { ok: false };

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initial);
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  useEffect(() => {
    if (state.ok && state.redirectTo) {
      toast(state.message ?? "Login successful.");
      const next = searchParams.get("next");
      router.push(next && next.startsWith("/") ? next : state.redirectTo);
      router.refresh();
    } else if (state.error) {
      toast(state.error, "error");
    }
  }, [state, router, searchParams, toast]);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="input" placeholder="you@example.com" />
      </div>
      <div>
        <label htmlFor="password" className="label">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="input" placeholder="Your password" />
      </div>
      <SubmitButton pendingLabel="Logging in..." className="w-full">
        Login
      </SubmitButton>
      <p className="text-center text-sm text-ink-mute">
        No account yet?{" "}
        <Link href="/register" className="text-mint hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
