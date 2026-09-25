import type { Metadata } from "next";
import { CheckoutForm } from "@/components/CheckoutForm";
import { getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Commande" };

export default async function CheckoutPage() {
  const s = await getSettings();
  return (
    <CheckoutForm
      prices={{
        price_small_cents: s.price_small_cents,
        price_large_cents: s.price_large_cents,
        frame_small_cents: s.frame_small_cents,
        frame_large_cents: s.frame_large_cents,
      }}
    />
  );
}
