"use server";

import { redirect } from "next/navigation";
import { createSession, destroySession, getSessionUser } from "@/lib/auth";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { AppError, getErrorMessage } from "@/lib/errors";
import { loginUser, registerUser, updateProfile } from "@/lib/services/auth.service";
import { loginSchema, profileUpdateSchema, registerSchema } from "@/lib/validators";

export type ActionResult = {
  ok: boolean;
  error?: string;
  message?: string;
  redirectTo?: string;
};

const GENERIC_ERROR = "Something went wrong. Please try again.";

export async function registerAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };
  }

  const rl = rateLimit(clientKey("register", parsed.data.email), 5, 60_000);
  if (!rl.allowed) {
    return { ok: false, error: "Too many attempts. Please wait a minute and try again." };
  }

  try {
    const user = await registerUser(parsed.data);
    await createSession(user.id);
  } catch (error) {
    return { ok: false, error: getErrorMessage(error, GENERIC_ERROR) };
  }

  redirect("/store");
}

export async function loginAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };
  }

  const rl = rateLimit(clientKey("login", parsed.data.email), 5, 60_000);
  if (!rl.allowed) {
    return { ok: false, error: "Too many attempts. Please wait a minute and try again." };
  }

  try {
    const user = await loginUser(parsed.data);
    await createSession(user.id);
    return {
      ok: true,
      message: "Login successful.",
      redirectTo: user.role === "ADMIN" ? "/admin" : "/store",
    };
  } catch (error) {
    if (error instanceof AppError) return { ok: false, error: error.message };
    return { ok: false, error: GENERIC_ERROR };
  }
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}

export async function updateProfileAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "You must be logged in." };

  const parsed = profileUpdateSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };
  }

  try {
    await updateProfile(user.id, parsed.data.name);
    return { ok: true, message: "Profile updated." };
  } catch {
    return { ok: false, error: GENERIC_ERROR };
  }
}
