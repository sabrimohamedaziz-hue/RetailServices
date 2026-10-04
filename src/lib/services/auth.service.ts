import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { AppError } from "@/lib/errors";
import type { LoginInput, RegisterInput } from "@/lib/validators";

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new AppError("An account with this email already exists.");

  const passwordHash = await hashPassword(input.password);

  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: "CUSTOMER",
    },
  });
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw new AppError("Invalid email or password.");

  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) throw new AppError("Invalid email or password.");

  return user;
}

export async function updateProfile(userId: string, name: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { name },
    select: { id: true, name: true, email: true },
  });
}
