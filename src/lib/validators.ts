import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters.").max(80),
    email: z.string().trim().toLowerCase().email("Enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters.").max(72),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export const depositRequestSchema = z.object({
  amount: z.coerce
    .number({ invalid_type_error: "Enter a valid amount." })
    .positive("Amount must be greater than zero.")
    .min(1, "Minimum deposit is €1.00.")
    .max(1000, "Maximum deposit is €1,000.00.")
    .multipleOf(0.01, "Amount can have at most 2 decimals."),
});

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(80),
});

export const productInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2)
    .max(140)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers and dashes."),
  description: z.string().trim().min(10).max(4000),
  price: z.coerce
    .number({ invalid_type_error: "Enter a valid price." })
    .positive()
    .max(100000)
    .multipleOf(0.01),
  category: z.enum(["Gaming", "Subscriptions", "Digital Products", "Boosts"]),
  group: z.union([z.literal(""), z.string().trim().max(60)]).optional(),
  delivery: z.enum(["INSTANT", "MANUAL"]).default("MANUAL"),
  visibility: z.enum(["BOTH", "GROUP_ONLY", "INDIVIDUAL_ONLY"]).default("BOTH"),
  imageUrl: z
    .union([
      z.literal(""),
      z.string().trim().url(),
      z.string().trim().regex(/^\/uploads\/[\w\-.]+\/[\w\-.]+$/, "Invalid upload path."),
    ])
    .optional(),
  stock: z.coerce.number().int().min(0).max(1000000),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
});

export const orderStatusSchema = z.enum([
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "CANCELLED",
]);

export const adminNoteSchema = z.object({
  note: z.string().trim().max(1000).optional(),
});

export const walletAdjustmentSchema = z.object({
  userId: z.string().min(1),
  amount: z.coerce
    .number({ invalid_type_error: "Enter a valid amount." })
    .positive()
    .max(10000)
    .multipleOf(0.01),
  direction: z.enum(["CREDIT", "DEBIT"]),
  reason: z.string().trim().min(3, "Provide a reason for the adjustment.").max(300),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProductInput = z.infer<typeof productInputSchema>;
