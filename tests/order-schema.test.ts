import { describe, expect, it } from "vitest";
import { mergeCartItems, orderSchema } from "@/lib/order-schema";

const photoId = "3f2b8c1e-5a4d-4c7e-9b1a-2d3e4f5a6b7c";
const formatId = "9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d";
const otherFormat = "1b2c3d4e-5f6a-4b7c-8d9e-0f1a2b3c4d5e";
const base = {
  firstName: "Léa",
  lastName: "Martin",
  email: "lea@example.com",
  phone: "06 12 34 56 78",
  deliveryMethod: "retrait",
  addressLine: "12 rue du Panier",
  postalCode: "13002",
  city: "Marseille",
  country: "France",
  message: "",
  consent: true,
  locale: "fr",
  items: [{ photoId, formatId, framed: false, quantity: 1 }],
};

describe("orderSchema", () => {
  it("accepte une commande complète", () => {
    expect(orderSchema.safeParse(base).success).toBe(true);
  });

  it("exige le téléphone (au moins 6 chiffres)", () => {
    for (const phone of ["", "   ", "12345", "abcdefgh"]) {
      const r = orderSchema.safeParse({ ...base, phone });
      expect(r.success).toBe(false);
      if (!r.success) expect(r.error.issues.map((i) => i.path[0])).toEqual(["phone"]);
    }
    expect(orderSchema.safeParse({ ...base, phone: "+33 6 12 34 56 78" }).success).toBe(true);
  });

  it("exige l'adresse complète, même en retrait", () => {
    const r = orderSchema.safeParse({ ...base, addressLine: "", postalCode: " ", city: "", country: "" });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.map((i) => i.path[0]).sort()).toEqual(["addressLine", "city", "country", "postalCode"]);
    }
  });

  it("exige prénom, nom et un email valide", () => {
    expect(orderSchema.safeParse({ ...base, firstName: "" }).success).toBe(false);
    expect(orderSchema.safeParse({ ...base, lastName: " " }).success).toBe(false);
    expect(orderSchema.safeParse({ ...base, email: "pas-un-email" }).success).toBe(false);
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
