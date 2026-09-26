import { describe, expect, it } from "vitest";
import { mergeCartItems, orderSchema } from "@/lib/order-schema";

const photoId = "3f2b8c1e-5a4d-4c7e-9b1a-2d3e4f5a6b7c";
const formatId = "9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d";
const otherFormat = "1b2c3d4e-5f6a-4b7c-8d9e-0f1a2b3c4d5e";
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
  items: [{ photoId, formatId, framed: false, quantity: 1 }],
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

  it("refuse un identifiant de format invalide", () => {
    expect(orderSchema.safeParse({ ...base, items: [{ ...base.items[0], formatId: "30x40" }] }).success).toBe(false);
  });
});

describe("mergeCartItems", () => {
  it("regroupe les lignes identiques en plafonnant à 10", () => {
    const merged = mergeCartItems([
      { photoId, formatId, framed: false, quantity: 6 },
      { photoId, formatId, framed: false, quantity: 7 },
      { photoId, formatId, framed: true, quantity: 1 },
      { photoId, formatId: otherFormat, framed: false, quantity: 2 },
    ]);
    expect(merged).toEqual([
      { photoId, formatId, framed: false, quantity: 10 },
      { photoId, formatId, framed: true, quantity: 1 },
      { photoId, formatId: otherFormat, framed: false, quantity: 2 },
    ]);
  });
});
