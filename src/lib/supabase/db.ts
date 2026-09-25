import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

let client: SupabaseClient | null = null;

/** Client serveur avec la clé secrète : seul point d'accès à la base. */
export function db(): SupabaseClient {
  if (!client) {
    client = createClient(env.supabaseUrl, env.supabaseSecretKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

export const PHOTO_BUCKET = "photos";

export function publicImageUrl(path: string): string {
  return `${env.supabaseUrl}/storage/v1/object/public/${PHOTO_BUCKET}/${path}`;
}
