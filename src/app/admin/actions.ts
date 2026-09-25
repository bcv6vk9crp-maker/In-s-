"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getPhotoById } from "@/lib/data";
import { env } from "@/lib/env";
import { isOrderStatus, slugify } from "@/lib/orders";
import { anonymizeOrder } from "@/lib/orders.server";
import { authClient, requireAdmin } from "@/lib/supabase/auth";
import { db, PHOTO_BUCKET } from "@/lib/supabase/db";

export type FormState = { error?: string; ok?: string; at?: number } | undefined;

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

function fail(message: string): never {
  throw new Error(message);
}

/* ---------- Connexion ---------- */

export async function signIn(_: FormState, form: FormData): Promise<FormState> {
  const email = str(form, "email").toLowerCase();
  const password = String(form.get("password") ?? "");
  if (email !== env.adminEmail) return { error: "Email ou mot de passe incorrect." };
  const supabase = await authClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Email ou mot de passe incorrect." };
  redirect("/admin");
}

export async function signOut() {
  const supabase = await authClient();
  await supabase.auth.signOut();
  redirect("/admin/connexion");
}

/* ---------- Commandes ---------- */

export async function updateOrder(id: string, _: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const status = form.get("status");
  if (!isOrderStatus(status)) return { error: "Statut inconnu." };
  const { error } = await db()
    .from("orders")
    .update({
      status,
      internal_notes: str(form, "internal_notes").slice(0, 5000),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin", "layout");
  return { ok: "Commande mise à jour." };
}

export async function anonymizeOrderAction(id: string) {
  await requireAdmin();
  await anonymizeOrder(id);
  revalidatePath("/admin", "layout");
}

export async function deleteOrder(id: string) {
  await requireAdmin();
  const { error } = await db().from("orders").delete().eq("id", id);
  if (error) fail(error.message);
  revalidatePath("/admin", "layout");
  redirect("/admin/commandes");
}

/* ---------- Photos ---------- */

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const root = slugify(base);
  const { data } = await db().from("photos").select("id, slug").like("slug", `${root}%`);
  const taken = new Set((data ?? []).filter((r) => r.id !== excludeId).map((r) => r.slug));
  if (!taken.has(root)) return root;
  let i = 2;
  while (taken.has(`${root}-${i}`)) i++;
  return `${root}-${i}`;
}

const photoFields = z.object({
  title_fr: z.string().trim().min(1, "Le titre en français est obligatoire.").max(120),
  title_en: z.string().trim().max(120),
  description_fr: z.string().trim().max(3000),
  description_en: z.string().trim().max(3000),
  year: z
    .string()
    .trim()
    .transform((v) => (v ? Number(v) : null))
    .refine((v) => v === null || (Number.isInteger(v) && v > 1900 && v < 2200), "Année invalide."),
  position: z
    .string()
    .trim()
    .transform((v) => (v ? Number(v) : 0))
    .refine((v) => Number.isInteger(v), "Ordre invalide."),
  visible: z.boolean(),
});

export async function savePhoto(photoId: string | null, _: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = photoFields.safeParse({
    title_fr: str(form, "title_fr"),
    title_en: str(form, "title_en"),
    description_fr: str(form, "description_fr"),
    description_en: str(form, "description_en"),
    year: str(form, "year"),
    position: str(form, "position"),
    visible: form.get("visible") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const fields = parsed.data;
  const collectionIds = form.getAll("collections").map(String);

  const existing = photoId ? await getPhotoById(photoId) : null;
  if (photoId && !existing) return { error: "Photo introuvable." };

  // Image déjà réduite et filigranée dans le navigateur d'Ines.
  const image = form.get("image");
  let imageFields: { image_path: string; width: number; height: number } | null = null;
  if (image instanceof File && image.size > 0) {
    if (image.type !== "image/jpeg") return { error: "Format d'image inattendu." };
    if (image.size > 3.5 * 1024 * 1024) return { error: "Image trop lourde." };
    const width = Number(form.get("width"));
    const height = Number(form.get("height"));
    if (!(width > 0 && height > 0)) return { error: "Dimensions de l'image manquantes." };
    const path = `${randomUUID()}.jpg`;
    const { error } = await db()
      .storage.from(PHOTO_BUCKET)
      .upload(path, image, { contentType: "image/jpeg", cacheControl: "31536000" });
    if (error) return { error: `Envoi de l'image impossible : ${error.message}` };
    imageFields = { image_path: path, width, height };
  } else if (!existing) {
    return { error: "Choisissez une image." };
  }

  let id = photoId;
  if (existing) {
    const { error } = await db()
      .from("photos")
      .update({ ...fields, ...(imageFields ?? {}) })
      .eq("id", existing.id);
    if (error) {
      if (imageFields) await db().storage.from(PHOTO_BUCKET).remove([imageFields.image_path]);
      return { error: error.message };
    }
    if (imageFields) await db().storage.from(PHOTO_BUCKET).remove([existing.image_path]);
  } else {
    const slug = await uniqueSlug(fields.title_fr);
    const { data, error } = await db()
      .from("photos")
      .insert({ ...fields, ...imageFields!, slug })
      .select("id")
      .single();
    if (error || !data) {
      await db().storage.from(PHOTO_BUCKET).remove([imageFields!.image_path]);
      return { error: error?.message ?? "Photo non enregistrée." };
    }
    id = data.id;
  }

  await db().from("photo_collections").delete().eq("photo_id", id!);
  if (collectionIds.length > 0) {
    const { error } = await db()
      .from("photo_collections")
      .insert(collectionIds.map((collection_id) => ({ photo_id: id, collection_id })));
    if (error) return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/admin/photos");
}

export async function deletePhoto(id: string) {
  await requireAdmin();
  const photo = await getPhotoById(id);
  if (!photo) return;
  const { error } = await db().from("photos").delete().eq("id", id);
  if (error) fail(error.message);
  await db().storage.from(PHOTO_BUCKET).remove([photo.image_path]);
  revalidatePath("/", "layout");
  redirect("/admin/photos");
}

/* ---------- Collections ---------- */

export async function saveCollection(collectionId: string | null, _: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const name_fr = str(form, "name_fr");
  if (!name_fr) return { error: "Le nom en français est obligatoire." };
  const position = Number(str(form, "position") || 0);
  if (!Number.isInteger(position)) return { error: "Ordre invalide." };
  const values = {
    name_fr: name_fr.slice(0, 80),
    name_en: str(form, "name_en").slice(0, 80),
    note_fr: str(form, "note_fr").slice(0, 160),
    note_en: str(form, "note_en").slice(0, 160),
    position,
    visible: form.get("visible") === "on",
  };

  if (collectionId) {
    const { error } = await db().from("collections").update(values).eq("id", collectionId);
    if (error) return { error: error.message };
  } else {
    const root = slugify(name_fr);
    const { data } = await db().from("collections").select("slug").like("slug", `${root}%`);
    const taken = new Set((data ?? []).map((r) => r.slug));
    let slug = root;
    for (let i = 2; taken.has(slug); i++) slug = `${root}-${i}`;
    const { error } = await db().from("collections").insert({ ...values, slug });
    if (error) return { error: error.message };
  }
  revalidatePath("/", "layout");
  return { ok: collectionId ? "Collection enregistrée." : "Collection créée.", at: Date.now() };
}

export async function deleteCollection(id: string) {
  await requireAdmin();
  const { error } = await db().from("collections").delete().eq("id", id);
  if (error) fail(error.message);
  revalidatePath("/", "layout");
}

/* ---------- Réglages ---------- */

function euros(value: string): number | null {
  const n = Number(value.replace(",", ".").replace(/\s|€/g, ""));
  return Number.isFinite(n) && n >= 0 && n < 100000 ? Math.round(n * 100) : null;
}

export async function saveSettings(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const prices = {
    price_small_cents: euros(str(form, "price_small")),
    price_large_cents: euros(str(form, "price_large")),
    frame_small_cents: euros(str(form, "frame_small")),
    frame_large_cents: euros(str(form, "frame_large")),
  };
  if (Object.values(prices).some((v) => v === null)) return { error: "Un des prix est invalide." };

  const notification = str(form, "notification_email");
  const contact = str(form, "contact_email");
  const emailCheck = z.union([z.literal(""), z.email()]);
  if (!emailCheck.safeParse(notification).success || !emailCheck.safeParse(contact).success) {
    return { error: "Une des adresses email est invalide." };
  }

  const texts = Object.fromEntries(
    [
      "instagram",
      "about_fr",
      "about_en",
      "contact_intro_fr",
      "contact_intro_en",
      "legal_name",
      "legal_status",
      "siret",
      "vat_mention",
      "legal_address",
    ].map((k) => [k, str(form, k).slice(0, 5000)]),
  );

  const { error } = await db()
    .from("settings")
    .update({
      ...prices,
      ...texts,
      notification_email: notification || null,
      contact_email: contact || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { ok: "Réglages enregistrés." };
}
