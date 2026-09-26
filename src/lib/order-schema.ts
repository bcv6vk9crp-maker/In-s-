import { z } from "zod";
import { MAX_QUANTITY } from "@/lib/pricing";

export const cartItemSchema = z.object({
  photoId: z.uuid(),
  formatId: z.uuid(),
  framed: z.boolean(),
  quantity: z.number().int().min(1).max(MAX_QUANTITY),
});
export type CartItem = z.infer<typeof cartItemSchema>;

const text = (max: number) => z.string().trim().max(max);
const optionalText = (max: number) =>
  text(max)
    .optional()
    .transform((v) => (v ? v : null));

export const orderSchema = z
  .object({
    firstName: text(80).min(1),
    lastName: text(80).min(1),
    email: z.email().max(200),
    phone: optionalText(40),
    deliveryMethod: z.enum(["retrait", "livraison"]),
    addressLine: optionalText(200),
    postalCode: optionalText(20),
    city: optionalText(100),
    country: optionalText(100),
    message: optionalText(2000),
    consent: z.literal(true),
    locale: z.enum(["fr", "en"]),
    items: z.array(cartItemSchema).min(1).max(50),
  })
  .superRefine((o, ctx) => {
    if (o.deliveryMethod !== "livraison") return;
    for (const field of ["addressLine", "postalCode", "city", "country"] as const) {
      if (!o[field]) ctx.addIssue({ code: "custom", path: [field], message: "required" });
    }
  });
export type OrderInput = z.infer<typeof orderSchema>;

/** Regroupe les lignes identiques (même photo, format et cadre), en plafonnant la quantité. */
export function mergeCartItems(items: CartItem[]): CartItem[] {
  const merged = new Map<string, CartItem>();
  for (const item of items) {
    const key = `${item.photoId}|${item.formatId}|${item.framed}`;
    const existing = merged.get(key);
    if (existing) {
      existing.quantity = Math.min(MAX_QUANTITY, existing.quantity + item.quantity);
    } else {
      merged.set(key, { ...item });
    }
  }
  return [...merged.values()];
}
