import { describe, expect, it } from "vitest";
import { formatEuros, formatOrderNumber, shippingCents, unitPriceCents } from "@/lib/pricing";

// Formats par défaut proposés à Ines (modifiables dans l'admin)
const f20 = { id: "a", label: "20 × 30 cm", price_cents: 3500, frame_cents: 600, shipping_cents: 600 };
const f30 = { id: "b", label: "30 × 45 cm", price_cents: 5000, frame_cents: 800, shipping_cents: 800 };
const f40 = { id: "c", label: "40 × 60 cm", price_cents: 7000, frame_cents: 1000, shipping_cents: 1200 };
const f60 = { id: "d", label: "60 × 90 cm", price_cents: 12000, frame_cents: 1200, shipping_cents: 1800 };

describe("unitPriceCents", () => {
  it("applique le prix du format", () => {
    expect(unitPriceCents(f20, false)).toBe(3500);
    expect(unitPriceCents(f60, false)).toBe(12000);
  });

  it("ajoute le supplément cadre du format (6, 8, 10, 12 €)", () => {
    expect([f20, f30, f40, f60].map((f) => unitPriceCents(f, true))).toEqual([4100, 5800, 8000, 13200]);
  });
});

describe("shippingCents", () => {
  it("est gratuit en retrait", () => {
    expect(shippingCents([f20, f60], "retrait")).toBe(0);
  });

  it("compte une seule fois le forfait du plus grand format", () => {
    expect(shippingCents([f20], "livraison")).toBe(600);
    expect(shippingCents([f20, f20, f40], "livraison")).toBe(1200);
    expect(shippingCents([f60, f30], "livraison")).toBe(1800);
  });

  it("vaut 0 sans article", () => {
    expect(shippingCents([], "livraison")).toBe(0);
  });
});

describe("formatage", () => {
  it("affiche les euros à la française", () => {
    expect(formatEuros(3500).replace(/\s/g, " ")).toBe("35 €");
    expect(formatEuros(3550).replace(/\s/g, " ")).toBe("35,50 €");
  });

  it("numérote les commandes", () => {
    expect(formatOrderNumber(7)).toBe("IB-0007");
    expect(formatOrderNumber(12345)).toBe("IB-12345");
  });
});
