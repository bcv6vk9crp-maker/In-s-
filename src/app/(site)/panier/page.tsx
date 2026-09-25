import type { Metadata } from "next";
import { CartView } from "@/components/CartView";
import { getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Panier" };

export default async function CartPage() {
  const s = await getSettings();
  return (
    <CartView
      prices={{
        price_small_cents: s.price_small_cents,
        price_large_cents: s.price_large_cents,
        frame_small_cents: s.frame_small_cents,
        frame_large_cents: s.frame_large_cents,
      }}
    />
  );
}
