import { describe, expect, it } from "vitest";
import { formatEuros, formatOrderNumber, unitPriceCents } from "@/lib/pricing";

const prices = {
  price_small_cents: 3500,
  price_large_cents: 7000,
  frame_small_cents: 5000,
  frame_large_cents: 8000,
};

describe("unitPriceCents", () => {
  it("applique le prix de chaque format", () => {
    expect(unitPriceCents(prices, "20x30", false)).toBe(3500);
    expect(unitPriceCents(prices, "40x60", false)).toBe(7000);
  });

  it("ajoute le supplément cadre propre au format", () => {
    expect(unitPriceCents(prices, "20x30", true)).toBe(8500);
    expect(unitPriceCents(prices, "40x60", true)).toBe(15000);
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
