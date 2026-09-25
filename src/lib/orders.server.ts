import "server-only";
import { db } from "@/lib/supabase/db";
import { ANONYMIZED_FIELDS, retentionCutoff } from "@/lib/orders";

export async function anonymizeOrder(id: string): Promise<void> {
  const { error } = await db()
    .from("orders")
    .update({ ...ANONYMIZED_FIELDS, anonymized_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

/** Anonymise toutes les commandes passées il y a plus d'un an. Renvoie le nombre de commandes traitées. */
export async function anonymizeExpiredOrders(now: Date = new Date()): Promise<number> {
  const { data, error } = await db()
    .from("orders")
    .update({ ...ANONYMIZED_FIELDS, anonymized_at: now.toISOString(), updated_at: now.toISOString() })
    .is("anonymized_at", null)
    .lt("created_at", retentionCutoff(now).toISOString())
    .select("id");
  if (error) throw new Error(error.message);
  return data?.length ?? 0;
}
