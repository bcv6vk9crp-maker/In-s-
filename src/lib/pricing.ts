export const MAX_QUANTITY = 10;

/** Ce dont le calcul des prix a besoin d'un format. */
export type FormatPrice = {
  id: string;
  label: string;
  price_cents: number;
  frame_cents: number;
  shipping_cents: number;
};

/** Formats proposés pour une photo : ceux qu'Ines a cochés (tous si aucun choix). */
export function formatsForPhoto<F extends { id: string }>(formats: F[], allowed: string[] | null): F[] {
  return allowed ? formats.filter((f) => allowed.includes(f.id)) : formats;
}

export type DeliveryMethod = "retrait" | "livraison";

export function unitPriceCents(format: FormatPrice, framed: boolean): number {
  return format.price_cents + (framed ? format.frame_cents : 0);
}

/**
 * Forfait de port : compté une seule fois par commande, au montant du plus grand
 * forfait parmi les formats du panier. Gratuit en retrait.
 */
export function shippingCents(formats: FormatPrice[], method: DeliveryMethod): number {
  if (method === "retrait" || formats.length === 0) return 0;
  return Math.max(...formats.map((f) => f.shipping_cents));
}

export function formatEuros(cents: number, locale: string = "fr"): string {
  return new Intl.NumberFormat(locale === "en" ? "en-GB" : "fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export function formatOrderNumber(n: number): string {
  return `IB-${String(n).padStart(4, "0")}`;
}
