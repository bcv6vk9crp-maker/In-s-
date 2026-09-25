"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { useI18n } from "@/components/I18nProvider";
import { QuantityInput } from "@/components/QuantityInput";
import { pick } from "@/lib/i18n";
import { formatEuros, sizeLabel, unitPriceCents, type Prices } from "@/lib/pricing";

export function CartView({ prices }: { prices: Prices }) {
  const { locale, t } = useI18n();
  const { lines, ready, setQuantity, remove } = useCart();

  if (!ready) return null;

  if (lines.length === 0) {
    return (
      <div className="empty">
        <h1>{t.cart.title}</h1>
        <p className="muted">{t.cart.empty}</p>
        <Link href="/" className="btn">
          {t.cart.browse}
        </Link>
      </div>
    );
  }

  const total = lines.reduce((sum, l) => sum + unitPriceCents(prices, l.size, l.framed) * l.quantity, 0);

  return (
    <>
      <div className="page-head">
        <h1>{t.cart.title}</h1>
      </div>
      <div className="two-cols">
        <ul className="cart-lines" style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {lines.map((l, i) => {
            const title = pick(locale, l.titleFr, l.titleEn);
            const unit = unitPriceCents(prices, l.size, l.framed);
            return (
              <li key={`${l.photoId}-${l.size}-${l.framed}`} className="cart-line">
                <Link href={`/photos/${l.slug}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={l.imageUrl} alt={title} />
                </Link>
                <div className="meta">
                  <b>{title}</b>
                  <span>
                    {sizeLabel(l.size)} · {l.framed ? t.photo.withFrame : t.photo.noFrame}
                  </span>
                  <span>{formatEuros(unit, locale)}</span>
                </div>
                <div className="end">
                  <QuantityInput value={l.quantity} label={t.photo.quantity} onChange={(q) => setQuantity(i, q)} />
                  <strong>{formatEuros(unit * l.quantity, locale)}</strong>
                  <button type="button" className="link-button" onClick={() => remove(i)}>
                    {t.cart.remove}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
        <aside className="card summary">
          <div className="total-row" style={{ borderTop: 0, paddingTop: 0 }}>
            <span>{t.cart.total}</span>
            <span>{formatEuros(total, locale)}</span>
          </div>
          <p className="muted" style={{ fontSize: 13 }}>
            {t.cart.shippingNote}
          </p>
          <Link href="/commande" className="btn">
            {t.cart.checkout}
          </Link>
        </aside>
      </div>
    </>
  );
}
