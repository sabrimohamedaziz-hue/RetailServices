import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Register",
  description: "Create your RetailServices account.",
};

export default function RegisterPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6 sm:py-24">
      <div className="card p-8">
        <h1 className="mb-1 text-xl font-semibold tracking-tight">Create your account</h1>
        <p className="mb-6 text-sm text-ink-mute">Join RetailServices in seconds.</p>
        <RegisterForm />
      </div>
    </div>
  );
}
