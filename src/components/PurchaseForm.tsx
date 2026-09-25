"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart, type CartLine } from "@/components/CartProvider";
import { useI18n } from "@/components/I18nProvider";
import { QuantityInput } from "@/components/QuantityInput";
import { formatEuros, SIZES, sizeLabel, unitPriceCents, type Prices, type Size } from "@/lib/pricing";

type PhotoInfo = Pick<CartLine, "photoId" | "slug" | "titleFr" | "titleEn" | "imageUrl">;

export function PurchaseForm({ photo, prices }: { photo: PhotoInfo; prices: Prices }) {
  const { locale, t } = useI18n();
  const { add } = useCart();
  const [size, setSize] = useState<Size>("20x30");
  const [framed, setFramed] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const frameCents = size === "20x30" ? prices.frame_small_cents : prices.frame_large_cents;
  const total = unitPriceCents(prices, size, framed) * quantity;
  const reset = () => setAdded(false);

  return (
    <form
      className="purchase"
      onSubmit={(e) => {
        e.preventDefault();
        add({ ...photo, size, framed, quantity });
        setAdded(true);
      }}
    >
      <div className="option-group">
        <span>{t.photo.format}</span>
        <div className="chips">
          {SIZES.map((s) => (
            <button
              key={s}
              type="button"
              className="chip"
              aria-pressed={size === s}
              onClick={() => {
                setSize(s);
                reset();
              }}
            >
              {sizeLabel(s)} · {formatEuros(unitPriceCents(prices, s, false), locale)}
            </button>
          ))}
        </div>
      </div>

      <div className="option-group">
        <span>{t.photo.frame}</span>
        <div className="chips">
          <button
            type="button"
            className="chip"
            aria-pressed={!framed}
            onClick={() => {
              setFramed(false);
              reset();
            }}
          >
            {t.photo.noFrame}
          </button>
          <button
            type="button"
            className="chip"
            aria-pressed={framed}
            onClick={() => {
              setFramed(true);
              reset();
            }}
          >
            {t.photo.withFrame} · +{formatEuros(frameCents, locale)}
          </button>
        </div>
      </div>

      <div className="option-group">
        <span>{t.photo.quantity}</span>
        <QuantityInput
          value={quantity}
          label={t.photo.quantity}
          onChange={(q) => {
            setQuantity(q);
            reset();
          }}
        />
      </div>

      <div className="total-row">
        <span>{t.photo.total}</span>
        <span>{formatEuros(total, locale)}</span>
      </div>

      <button type="submit" className="btn">
        {t.photo.addToCart}
      </button>
      {added && (
        <p className="alert alert-ok" role="status">
          {t.photo.added} · <Link href="/panier">{t.photo.viewCart}</Link>
        </p>
      )}
      <p className="muted" style={{ fontSize: 13 }}>
        {t.photo.noPayment}
      </p>
    </form>
  );
}
