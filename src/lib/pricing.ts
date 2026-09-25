export const SIZES = ["20x30", "40x60"] as const;
export type Size = (typeof SIZES)[number];

export const MAX_QUANTITY = 10;

export type Prices = {
  price_small_cents: number;
  price_large_cents: number;
  frame_small_cents: number;
  frame_large_cents: number;
};

export function unitPriceCents(prices: Prices, size: Size, framed: boolean): number {
  const base = size === "20x30" ? prices.price_small_cents : prices.price_large_cents;
  const frame = size === "20x30" ? prices.frame_small_cents : prices.frame_large_cents;
  return base + (framed ? frame : 0);
}

export function sizeLabel(size: Size): string {
  return size === "20x30" ? "20 × 30 cm" : "40 × 60 cm";
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
