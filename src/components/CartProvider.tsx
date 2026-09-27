"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { MAX_QUANTITY } from "@/lib/pricing";

export type CartLine = {
  photoId: string;
  formatId: string;
  formatLabel: string;
  framed: boolean;
  quantity: number;
  // Copie pour l'affichage ; le serveur recalcule tout à la validation.
  slug: string;
  titleFr: string;
  titleEn: string;
  imageUrl: string;
};

type CartContextValue = {
  lines: CartLine[];
  ready: boolean;
  count: number;
  add: (line: CartLine) => void;
  setQuantity: (index: number, quantity: number) => void;
  remove: (index: number) => void;
  removePhotos: (photoIds: string[]) => void;
  removeFormats: (formatIds: string[]) => void;
  removeLines: (lines: { photoId: string; formatId: string }[]) => void;
  clear: () => void;
};

const STORAGE_KEY = "inesb-cart-v2";
const CartContext = createContext<CartContextValue | null>(null);

function isCartLine(v: unknown): v is CartLine {
  if (!v || typeof v !== "object") return false;
  const l = v as Record<string, unknown>;
  return (
    typeof l.photoId === "string" &&
    typeof l.formatId === "string" &&
    typeof l.formatLabel === "string" &&
    typeof l.framed === "boolean" &&
    Number.isInteger(l.quantity) &&
    (l.quantity as number) >= 1 &&
    (l.quantity as number) <= MAX_QUANTITY &&
    typeof l.slug === "string" &&
    typeof l.titleFr === "string" &&
    typeof l.imageUrl === "string"
  );
}

function readStorage(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(isCartLine) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Le panier vit dans le navigateur : on le charge après le premier rendu.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLines(readStorage());
    setReady(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setLines(readStorage());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const update = useCallback((next: (prev: CartLine[]) => CartLine[]) => {
    setLines((prev) => {
      const value = next(prev);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      } catch {
        // Stockage indisponible (navigation privée) : le panier reste en mémoire.
      }
      return value;
    });
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      ready,
      count: lines.reduce((n, l) => n + l.quantity, 0),
      add: (line) =>
        update((prev) => {
          const i = prev.findIndex(
            (l) => l.photoId === line.photoId && l.formatId === line.formatId && l.framed === line.framed,
          );
          if (i === -1) return [...prev, line];
          return prev.map((l, j) =>
            j === i ? { ...l, quantity: Math.min(MAX_QUANTITY, l.quantity + line.quantity) } : l,
          );
        }),
      setQuantity: (index, quantity) =>
        update((prev) =>
          prev.map((l, i) =>
            i === index ? { ...l, quantity: Math.max(1, Math.min(MAX_QUANTITY, quantity)) } : l,
          ),
        ),
      remove: (index) => update((prev) => prev.filter((_, i) => i !== index)),
      removePhotos: (ids) => update((prev) => prev.filter((l) => !ids.includes(l.photoId))),
      removeFormats: (ids) => update((prev) => prev.filter((l) => !ids.includes(l.formatId))),
      removeLines: (gone) =>
        update((prev) => prev.filter((l) => !gone.some((g) => g.photoId === l.photoId && g.formatId === l.formatId))),
      clear: () => update(() => []),
    }),
    [lines, ready, update],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart doit être utilisé dans CartProvider");
  return ctx;
}
