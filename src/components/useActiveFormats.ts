"use client";

import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/components/CartProvider";
import type { FormatPrice } from "@/lib/pricing";

/**
 * Relie les lignes du panier aux formats proposés aujourd'hui et retire celles
 * dont le format a été supprimé ou désactivé par Ines depuis l'ajout.
 */
export function useActiveFormats(formats: FormatPrice[]) {
  const { lines, ready, removeFormats } = useCart();
  const byId = useMemo(() => new Map(formats.map((f) => [f.id, f])), [formats]);
  const [formatRemoved, setFormatRemoved] = useState(false);

  useEffect(() => {
    if (!ready) return;
    const stale = [...new Set(lines.filter((l) => !byId.has(l.formatId)).map((l) => l.formatId))];
    if (stale.length > 0) {
      removeFormats(stale);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormatRemoved(true);
    }
  }, [ready, lines, byId, removeFormats]);

  return { byId, formatRemoved };
}
