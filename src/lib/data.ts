import "server-only";
import { db, publicImageUrl } from "@/lib/supabase/db";
import type { FormatPrice } from "@/lib/pricing";

export type Settings = {
  notification_email: string | null;
  pickup_location: string;
  contact_email: string | null;
  instagram: string | null;
  about_fr: string;
  about_en: string;
  contact_intro_fr: string;
  contact_intro_en: string;
  legal_name: string;
  legal_status: string;
  siret: string;
  vat_mention: string;
  legal_address: string;
};

export type Format = FormatPrice & {
  position: number;
  active: boolean;
};

export type Collection = {
  id: string;
  slug: string;
  name_fr: string;
  name_en: string;
  note_fr: string;
  note_en: string;
  position: number;
  visible: boolean;
};

export type Photo = {
  id: string;
  slug: string;
  title_fr: string;
  title_en: string;
  description_fr: string;
  description_en: string;
  year: number | null;
  image_path: string;
  width: number;
  height: number;
  position: number;
  visible: boolean;
  created_at: string;
  collection_ids: string[];
  image_url: string;
};

type PhotoRow = Omit<Photo, "collection_ids" | "image_url"> & {
  photo_collections: { collection_id: string }[] | null;
};

const PHOTO_SELECT = "*, photo_collections(collection_id)";

function toPhoto(row: PhotoRow): Photo {
  const { photo_collections, ...rest } = row;
  return {
    ...rest,
    collection_ids: (photo_collections ?? []).map((pc) => pc.collection_id),
    image_url: publicImageUrl(row.image_path),
  };
}

function check<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data as T;
}

export async function getSettings(): Promise<Settings> {
  return check(await db().from("settings").select("*").eq("id", 1).single());
}

export async function getFormats(opts: { onlyActive: boolean }): Promise<Format[]> {
  let q = db().from("formats").select("*").order("position").order("price_cents");
  if (opts.onlyActive) q = q.eq("active", true);
  return check(await q);
}

export async function getCollections(opts: { onlyVisible: boolean }): Promise<Collection[]> {
  let q = db().from("collections").select("*").order("position").order("name_fr");
  if (opts.onlyVisible) q = q.eq("visible", true);
  return check(await q);
}

export async function getPhotos(opts: { onlyVisible: boolean }): Promise<Photo[]> {
  let q = db()
    .from("photos")
    .select(PHOTO_SELECT)
    .order("position")
    .order("created_at", { ascending: false });
  if (opts.onlyVisible) q = q.eq("visible", true);
  return (check(await q) as PhotoRow[]).map(toPhoto);
}

export async function getPhotoBySlug(slug: string): Promise<Photo | null> {
  const row = check(await db().from("photos").select(PHOTO_SELECT).eq("slug", slug).maybeSingle());
  return row ? toPhoto(row as PhotoRow) : null;
}

export async function getPhotoById(id: string): Promise<Photo | null> {
  const row = check(await db().from("photos").select(PHOTO_SELECT).eq("id", id).maybeSingle());
  return row ? toPhoto(row as PhotoRow) : null;
}

export async function getVisiblePhotosByIds(ids: string[]): Promise<Photo[]> {
  if (ids.length === 0) return [];
  const rows = check(
    await db().from("photos").select(PHOTO_SELECT).in("id", ids).eq("visible", true),
  ) as PhotoRow[];
  return rows.map(toPhoto);
}
