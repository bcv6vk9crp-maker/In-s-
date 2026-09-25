import { describe, expect, it } from "vitest";
import { mergeCartItems, orderSchema } from "@/lib/order-schema";

const photoId = "3f2b8c1e-5a4d-4c7e-9b1a-2d3e4f5a6b7c";
const base = {
  firstName: "Léa",
  lastName: "Martin",
  email: "lea@example.com",
  phone: "",
  deliveryMethod: "retrait",
  addressLine: "",
  postalCode: "",
  city: "",
  country: "",
  message: "",
  consent: true,
  locale: "fr",
  items: [{ photoId, size: "20x30", framed: false, quantity: 1 }],
};

describe("orderSchema", () => {
  it("accepte un retrait sans adresse", () => {
    const r = orderSchema.safeParse(base);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.phone).toBeNull();
  });

  it("exige l'adresse complète pour une livraison", () => {
    const r = orderSchema.safeParse({ ...base, deliveryMethod: "livraison", addressLine: "1 rue du Port" });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.map((i) => i.path[0]).sort()).toEqual(["city", "country", "postalCode"]);
    }
  });

  it("refuse une commande sans consentement", () => {
    expect(orderSchema.safeParse({ ...base, consent: false }).success).toBe(false);
  });

  it("refuse plus de 10 exemplaires par ligne et un panier vide", () => {
    expect(orderSchema.safeParse({ ...base, items: [{ ...base.items[0], quantity: 11 }] }).success).toBe(false);
    expect(orderSchema.safeParse({ ...base, items: [] }).success).toBe(false);
  });

  it("refuse un format inconnu", () => {
    expect(orderSchema.safeParse({ ...base, items: [{ ...base.items[0], size: "30x40" }] }).success).toBe(false);
  });
});

describe("mergeCartItems", () => {
  it("regroupe les lignes identiques en plafonnant à 10", () => {
    const merged = mergeCartItems([
      { photoId, size: "20x30", framed: false, quantity: 6 },
      { photoId, size: "20x30", framed: false, quantity: 7 },
      { photoId, size: "20x30", framed: true, quantity: 1 },
    ]);
    expect(merged).toEqual([
      { photoId, size: "20x30", framed: false, quantity: 10 },
      { photoId, size: "20x30", framed: true, quantity: 1 },
    ]);
  });
});
