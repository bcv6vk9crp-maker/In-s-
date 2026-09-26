import type { Metadata } from "next";
import { CartView } from "@/components/CartView";
import { getFormats } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Panier" };

export default async function CartPage() {
  return <CartView formats={await getFormats({ onlyActive: true })} />;
}
