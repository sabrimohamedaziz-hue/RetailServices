"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { AppError, getErrorMessage } from "@/lib/errors";
import {
  approveDeposit,
  rejectDeposit,
} from "@/lib/services/deposit.service";
import {
  createProduct,
  deleteProduct,
  updateProduct,
} from "@/lib/services/product.service";
import { updateOrderStatus } from "@/lib/services/order.service";
import { adjustWallet } from "@/lib/services/wallet.service";
import {
  adminNoteSchema,
  orderStatusSchema,
  productInputSchema,
  walletAdjustmentSchema,
} from "@/lib/validators";
import type { ActionResult } from "@/actions/auth.actions";

export type { ActionResult };

const GENERIC_ERROR = "Something went wrong. Please try again.";
const ADMIN_ERROR = "Administrator access required.";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

async function saveProductImage(file: File): Promise<string> {
  const ext = ALLOWED_IMAGE_TYPES[file.type];
  if (!ext) throw new Error("Only PNG, JPG, WebP or GIF images are allowed.");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("Image must be smaller than 5 MB.");

  const { randomBytes } = await import("crypto");
  const { mkdir, writeFile } = await import("fs/promises");
  const path = await import("path");

  const filename = `${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
  const dir = path.join(process.cwd(), "uploads", "products");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));
  return `/uploads/products/${filename}`;
}

async function requireAdminId(): Promise<string> {
  const user = await getSessionUser();
  if (!user) throw new AppError("You must be logged in.");
  if (user.role !== "ADMIN") throw new AppError(ADMIN_ERROR);
  return user.id;
}

export async function approveDepositAction(depositId: string): Promise<ActionResult> {
  try {
    const adminId = await requireAdminId();
    await approveDeposit(adminId, depositId);
    revalidatePath("/admin/deposits");
    return { ok: true, message: "Deposit approved. Wallet credited." };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error, GENERIC_ERROR) };
  }
}

export async function rejectDepositAction(depositId: string, note?: string): Promise<ActionResult> {
  try {
    const adminId = await requireAdminId();
    const parsed = adminNoteSchema.safeParse({ note });
    await rejectDeposit(adminId, depositId, parsed.success ? parsed.data.note : undefined);
    revalidatePath("/admin/deposits");
    return { ok: true, message: "Deposit rejected." };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error, GENERIC_ERROR) };
  }
}

export async function saveProductAction(
  productId: string | null,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    await requireAdminId();
  } catch (error) {
    return { ok: false, error: getErrorMessage(error, ADMIN_ERROR) };
  }

  const parsed = productInputSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    price: formData.get("price"),
    category: formData.get("category"),
    imageUrl: formData.get("imageUrl"),
    stock: formData.get("stock"),
    active: formData.get("active") === "on",
    featured: formData.get("featured") === "on",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };
  }

  // Handle image upload (overrides the Image URL field when a file is chosen)
  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    try {
      parsed.data.imageUrl = await saveProductImage(file);
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : "Image upload failed." };
    }
  }

  try {
    if (productId) {
      await updateProduct(productId, parsed.data);
      revalidatePath("/admin/products");
      return { ok: true, message: "Product updated." };
    }
    await createProduct(parsed.data);
    revalidatePath("/admin/products");
    return { ok: true, message: "Product created." };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error, GENERIC_ERROR) };
  }
}

export async function deleteProductAction(productId: string): Promise<ActionResult> {
  try {
    await requireAdminId();
  } catch (error) {
    return { ok: false, error: getErrorMessage(error, ADMIN_ERROR) };
  }

  try {
    const { deactivated } = await deleteProduct(productId);
    revalidatePath("/admin/products");
    revalidatePath("/store");
    revalidatePath("/");
    return {
      ok: true,
      message: deactivated
        ? "Product has orders, so it was deactivated instead of deleted."
        : "Product deleted.",
    };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error, GENERIC_ERROR) };
  }
}

export async function updateOrderStatusAction(
  orderId: string,
  status: string,
  note?: string
): Promise<ActionResult> {
  let adminId: string;
  try {
    adminId = await requireAdminId();
  } catch (error) {
    return { ok: false, error: getErrorMessage(error, ADMIN_ERROR) };
  }

  const parsedStatus = orderStatusSchema.safeParse(status);
  if (!parsedStatus.success) return { ok: false, error: "Invalid order status." };

  const parsedNote = adminNoteSchema.safeParse({ note });
  const cleanNote = parsedNote.success ? parsedNote.data.note : undefined;

  try {
    await updateOrderStatus(adminId, orderId, parsedStatus.data, cleanNote);
    revalidatePath("/admin/orders");
    return { ok: true, message: "Order updated." };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error, GENERIC_ERROR) };
  }
}

export async function adjustWalletAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  let adminId: string;
  try {
    adminId = await requireAdminId();
  } catch (error) {
    return { ok: false, error: getErrorMessage(error, ADMIN_ERROR) };
  }

  const parsed = walletAdjustmentSchema.safeParse({
    userId: formData.get("userId"),
    amount: formData.get("amount"),
    direction: formData.get("direction"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };
  }

  try {
    const { balance } = await adjustWallet({
      adminId,
      customerId: parsed.data.userId,
      amount: parsed.data.amount,
      direction: parsed.data.direction,
      reason: parsed.data.reason,
    });
    revalidatePath("/admin/customers");
    return {
      ok: true,
      message: `Wallet adjusted. New balance: €${Number(balance).toFixed(2)}`,
    };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error, GENERIC_ERROR) };
  }
}
