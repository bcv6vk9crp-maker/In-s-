import type { Metadata } from "next";
import { CheckoutForm } from "@/components/CheckoutForm";
import { getFormats, getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Commande" };

export default async function CheckoutPage() {
  const [formats, settings] = await Promise.all([getFormats({ onlyActive: true }), getSettings()]);
  return <CheckoutForm formats={formats} pickupLocation={settings.pickup_location} />;
}
