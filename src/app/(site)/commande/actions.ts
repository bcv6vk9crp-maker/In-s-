"use server";

import { getFormats, getSettings, getVisiblePhotosByIds } from "@/lib/data";
import { sendOrderEmails } from "@/lib/email";
import { mergeCartItems, orderSchema } from "@/lib/order-schema";
import { formatOrderNumber, shippingCents, unitPriceCents } from "@/lib/pricing";
import { db } from "@/lib/supabase/db";

type Result =
  | { ok: true; number: string }
  | {
      ok: false;
      reason: "fields" | "unavailable" | "tooMany" | "server";
      fields: string[];
      unavailable: string[];
      unavailableFormats: string[];
    };

const failure = (reason: "fields" | "unavailable" | "tooMany" | "server", extra: Partial<Result> = {}): Result => ({
  ok: false,
  reason,
  fields: [],
  unavailable: [],
  unavailableFormats: [],
  ...extra,
} as Result);

// Au-delà, on suppose un robot ou une erreur de manipulation (et on évite d'envoyer des emails en masse).
const MAX_ORDERS_PER_EMAIL = 3;
const THROTTLE_MINUTES = 15;

export async function placeOrder(input: unknown): Promise<Result> {
  try {
    return await createOrder(input);
  } catch (e) {
    console.error("Commande impossible", e);
    return failure("server");
  }
}

async function createOrder(input: unknown): Promise<Result> {
  // Champ piège rempli : on fait comme si tout allait bien, sans rien enregistrer.
  if (input && typeof input === "object" && "website" in input && (input as { website: unknown }).website) {
    return { ok: true, number: "" };
  }

  const parsed = orderSchema.safeParse(input);
  if (!parsed.success) {
    const fields = [...new Set(parsed.error.issues.map((i) => String(i.path[0])))];
    return failure("fields", { fields });
  }
  const order = parsed.data;

  const since = new Date(Date.now() - THROTTLE_MINUTES * 60 * 1000).toISOString();
  const { count } = await db()
    .from("orders")
    .select("id", { count: "exact", head: true })
    .ilike("email", order.email.replace(/[\\%_]/g, "\\$&"))
    .gte("created_at", since);
  if ((count ?? 0) >= MAX_ORDERS_PER_EMAIL) {
    return failure("tooMany");
  }
  const items = mergeCartItems(order.items);

  const ids = [...new Set(items.map((i) => i.photoId))];
  const [photos, formats, settings] = await Promise.all([
    getVisiblePhotosByIds(ids),
    getFormats({ onlyActive: true }),
    getSettings(),
  ]);
  const byId = new Map(photos.map((p) => [p.id, p]));
  const formatById = new Map(formats.map((f) => [f.id, f]));
  const unavailable = ids.filter((id) => !byId.has(id));
  const unavailableFormats = [...new Set(items.map((i) => i.formatId))].filter((id) => !formatById.has(id));
  if (unavailable.length > 0 || unavailableFormats.length > 0) {
    return failure("unavailable", { unavailable, unavailableFormats });
  }

  const lines = items.map((item) => {
    const photo = byId.get(item.photoId)!;
    const format = formatById.get(item.formatId)!;
    return {
      photo_id: photo.id,
      photo_title: photo.title_fr,
      format_id: format.id,
      format_label: format.label,
      framed: item.framed,
      unit_price_cents: unitPriceCents(format, item.framed),
      quantity: item.quantity,
    };
  });
  const shippingCost = shippingCents(
    items.map((i) => formatById.get(i.formatId)!),
    order.deliveryMethod,
  );
  const total = lines.reduce((sum, l) => sum + l.unit_price_cents * l.quantity, 0) + shippingCost;

  const { data: created, error } = await db()
    .from("orders")
    .insert({
      first_name: order.firstName,
      last_name: order.lastName,
      email: order.email,
      phone: order.phone,
      delivery_method: order.deliveryMethod,
      address_line: order.addressLine,
      postal_code: order.postalCode,
      city: order.city,
      country: order.country,
      message: order.message,
      locale: order.locale,
      consent_at: new Date().toISOString(),
      shipping_cents: shippingCost,
      total_cents: total,
    })
    .select("id, number, created_at")
    .single();
  if (error || !created) throw new Error(`Commande non enregistrée : ${error?.message}`);

  const { error: itemsError } = await db()
    .from("order_items")
    .insert(lines.map((l) => ({ ...l, order_id: created.id })));
  if (itemsError) {
    await db().from("orders").delete().eq("id", created.id);
    throw new Error(`Lignes de commande non enregistrées : ${itemsError.message}`);
  }

  const number = formatOrderNumber(created.number);
  try {
    await sendOrderEmails({
      id: created.id,
      number,
      order,
      lines,
      shipping: shippingCost,
      total,
      settings,
    });
  } catch (e) {
    // La commande est enregistrée : un email raté ne doit pas la faire échouer.
    console.error("Envoi des emails de commande impossible", e);
  }

  return { ok: true, number };
}
