"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { useI18n } from "@/components/I18nProvider";
import { QuantityInput } from "@/components/QuantityInput";
import { useActiveFormats } from "@/components/useActiveFormats";
import { pick } from "@/lib/i18n";
import { formatEuros, shippingCents, unitPriceCents, type FormatPrice } from "@/lib/pricing";

export function CartView({ formats }: { formats: FormatPrice[] }) {
  const { locale, t } = useI18n();
  const { lines, ready, setQuantity, remove } = useCart();
  const { byId, formatRemoved } = useActiveFormats(formats);

  if (!ready) return null;

  const notice = formatRemoved && (
    <p className="alert" role="status">
      {t.cart.formatUnavailable}
    </p>
  );

  const priced = lines.filter((l) => byId.has(l.formatId));
  if (priced.length === 0) {
    return (
      <div className="empty">
        <h1>{t.cart.title}</h1>
        {notice}
        <p className="muted">{t.cart.empty}</p>
        <Link href="/" className="btn">
          {t.cart.browse}
        </Link>
      </div>
    );
  }

  const subtotal = priced.reduce((sum, l) => sum + unitPriceCents(byId.get(l.formatId)!, l.framed) * l.quantity, 0);
  const shipping = shippingCents(priced.map((l) => byId.get(l.formatId)!), "livraison");

  return (
    <>
      <div className="page-head">
        <h1>{t.cart.title}</h1>
      </div>
      {notice}
      <div className="two-cols">
        <ul className="cart-lines" style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {lines.map((l, i) => {
            const format = byId.get(l.formatId);
            if (!format) return null;
            const title = pick(locale, l.titleFr, l.titleEn);
            const unit = unitPriceCents(format, l.framed);
            return (
              <li key={`${l.photoId}-${l.formatId}-${l.framed}`} className="cart-line">
                <Link href={`/photos/${l.slug}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={l.imageUrl} alt={title} />
                </Link>
                <div className="meta">
                  <b>{title}</b>
                  <span>
                    {format.label} · {l.framed ? t.photo.withFrame : t.photo.noFrame}
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
            <span>{t.cart.subtotal}</span>
            <span>{formatEuros(subtotal, locale)}</span>
          </div>
          <p className="muted" style={{ fontSize: 13 }}>
            {t.cart.shippingNote.replace("{amount}", formatEuros(shipping, locale))}
          </p>
          <Link href="/commande" className="btn">
            {t.cart.checkout}
          </Link>
        </aside>
      </div>
    </>
  );
}
