"use server";

import { getSettings, getVisiblePhotosByIds } from "@/lib/data";
import { sendOrderEmails } from "@/lib/email";
import { mergeCartItems, orderSchema } from "@/lib/order-schema";
import { formatOrderNumber, unitPriceCents } from "@/lib/pricing";
import { db } from "@/lib/supabase/db";

type Result =
  | { ok: true; number: string }
  | { ok: false; fields: string[]; unavailable: string[] };

export async function placeOrder(input: unknown): Promise<Result> {
  // Champ piège rempli : on fait comme si tout allait bien, sans rien enregistrer.
  if (input && typeof input === "object" && "website" in input && (input as { website: unknown }).website) {
    return { ok: true, number: "" };
  }

  const parsed = orderSchema.safeParse(input);
  if (!parsed.success) {
    const fields = [...new Set(parsed.error.issues.map((i) => String(i.path[0])))];
    return { ok: false, fields, unavailable: [] };
  }
  const order = parsed.data;
  const items = mergeCartItems(order.items);

  const ids = [...new Set(items.map((i) => i.photoId))];
  const [photos, settings] = await Promise.all([getVisiblePhotosByIds(ids), getSettings()]);
  const byId = new Map(photos.map((p) => [p.id, p]));
  const unavailable = ids.filter((id) => !byId.has(id));
  if (unavailable.length > 0) return { ok: false, fields: [], unavailable };

  const lines = items.map((item) => {
    const photo = byId.get(item.photoId)!;
    return {
      photo_id: photo.id,
      photo_title: photo.title_fr,
      size: item.size,
      framed: item.framed,
      unit_price_cents: unitPriceCents(settings, item.size, item.framed),
      quantity: item.quantity,
    };
  });
  const total = lines.reduce((sum, l) => sum + l.unit_price_cents * l.quantity, 0);
  const shipping = order.deliveryMethod === "livraison";

  const { data: created, error } = await db()
    .from("orders")
    .insert({
      first_name: order.firstName,
      last_name: order.lastName,
      email: order.email,
      phone: order.phone,
      delivery_method: order.deliveryMethod,
      address_line: shipping ? order.addressLine : null,
      postal_code: shipping ? order.postalCode : null,
      city: shipping ? order.city : null,
      country: shipping ? order.country : null,
      message: order.message,
      locale: order.locale,
      consent_at: new Date().toISOString(),
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
      total,
      settings,
    });
  } catch (e) {
    // La commande est enregistrée : un email raté ne doit pas la faire échouer.
    console.error("Envoi des emails de commande impossible", e);
  }

  return { ok: true, number };
}
