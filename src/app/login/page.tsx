import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Login",
  description: "Log in to your RetailServices account.",
};

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6 sm:py-24">
      <div className="card p-8">
        <h1 className="mb-1 text-xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mb-6 text-sm text-ink-mute">Log in to continue to RetailServices.</p>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
