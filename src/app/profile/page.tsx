import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { ProfileForm } from "@/components/profile/profile-form";

export const metadata: Metadata = {
  title: "Profile",
  description: "Your RetailServices profile.",
};

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Profile</h1>
        <p className="mt-1 text-sm text-ink-mute">Your account details.</p>
      </div>
      <ProfileForm name={user.name} email={user.email} />
    </div>
  );
}
