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
    // Au moins 6 chiffres : accepte « 06 12 34 56 78 », « +33 6 12… », « (01) 23-45… ».
    phone: text(40).refine((v) => v.replace(/\D/g, "").length >= 6, "phone"),
    deliveryMethod: z.enum(["retrait", "livraison"]),
    // Adresse obligatoire même en retrait (demande d'Ines, pour pouvoir identifier et recontacter l'acheteur).
    addressLine: text(200).min(1),
    postalCode: text(20).min(1),
    city: text(100).min(1),
    country: text(100).min(1),
    message: optionalText(2000),
    consent: z.literal(true),
    locale: z.enum(["fr", "en"]),
    items: z.array(cartItemSchema).min(1).max(50),
  })
  .superRefine((o, ctx) => {
    // Livraison en France métropolitaine uniquement (Corse comprise, DOM-TOM exclus).
    if (o.deliveryMethod !== "livraison") return;
    if (o.country.trim().toLowerCase() !== "france") ctx.addIssue({ code: "custom", path: ["country"], message: "zone" });
    if (!isMainlandPostalCode(o.postalCode)) ctx.addIssue({ code: "custom", path: ["postalCode"], message: "zone" });
  });

/** Code postal de France métropolitaine : 5 chiffres, hors outre-mer (97, 98). */
export function isMainlandPostalCode(code: string): boolean {
  const c = code.replace(/\s/g, "");
  return /^\d{5}$/.test(c) && !/^9[78]/.test(c);
}
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
