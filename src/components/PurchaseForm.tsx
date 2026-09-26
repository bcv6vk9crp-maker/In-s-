"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart, type CartLine } from "@/components/CartProvider";
import { useI18n } from "@/components/I18nProvider";
import { QuantityInput } from "@/components/QuantityInput";
import { formatEuros, unitPriceCents, type FormatPrice } from "@/lib/pricing";

type PhotoInfo = Pick<CartLine, "photoId" | "slug" | "titleFr" | "titleEn" | "imageUrl">;

export function PurchaseForm({ photo, formats }: { photo: PhotoInfo; formats: FormatPrice[] }) {
  const { locale, t } = useI18n();
  const { add } = useCart();
  const [formatId, setFormatId] = useState(formats[0]?.id);
  const [framed, setFramed] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const format = formats.find((f) => f.id === formatId) ?? formats[0];
  if (!format) return <p className="muted">{t.photo.noFormat}</p>;

  const total = unitPriceCents(format, framed) * quantity;
  const reset = () => setAdded(false);

  return (
    <form
      className="purchase"
      onSubmit={(e) => {
        e.preventDefault();
        add({ ...photo, formatId: format.id, formatLabel: format.label, framed, quantity });
        setAdded(true);
      }}
    >
      <div className="option-group">
        <span>{t.photo.format}</span>
        <div className="chips">
          {formats.map((f) => (
            <button
              key={f.id}
              type="button"
              className="chip"
              aria-pressed={format.id === f.id}
              onClick={() => {
                setFormatId(f.id);
                reset();
              }}
            >
              {f.label} · {formatEuros(f.price_cents, locale)}
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
            {t.photo.withFrame} · +{formatEuros(format.frame_cents, locale)}
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
