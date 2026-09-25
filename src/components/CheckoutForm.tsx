"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { placeOrder } from "@/app/(site)/commande/actions";
import { useCart } from "@/components/CartProvider";
import { useI18n } from "@/components/I18nProvider";
import { pick } from "@/lib/i18n";
import { formatEuros, sizeLabel, unitPriceCents, type Prices } from "@/lib/pricing";

type Delivery = "retrait" | "livraison";

export function CheckoutForm({ prices }: { prices: Prices }) {
  const { locale, t } = useI18n();
  const { lines, ready, clear, removePhotos } = useCart();
  const router = useRouter();
  const [delivery, setDelivery] = useState<Delivery>("retrait");
  const [invalid, setInvalid] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!ready) return null;

  if (lines.length === 0) {
    return (
      <div className="empty">
        {error && (
          <p className="alert" role="alert">
            {error}
          </p>
        )}
        <p className="muted">{t.checkout.emptyCart}</p>
        <Link href="/" className="btn">
          {t.cart.browse}
        </Link>
      </div>
    );
  }

  const total = lines.reduce((sum, l) => sum + unitPriceCents(prices, l.size, l.framed) * l.quantity, 0);
  const bad = (name: string) => (invalid.has(name) ? "true" : undefined);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "");
    setError(null);
    startTransition(async () => {
      const result = await placeOrder({
        firstName: get("firstName"),
        lastName: get("lastName"),
        email: get("email"),
        phone: get("phone"),
        deliveryMethod: delivery,
        addressLine: get("addressLine"),
        postalCode: get("postalCode"),
        city: get("city"),
        country: get("country"),
        message: get("message"),
        consent: f.get("consent") === "on",
        website: get("website"),
        locale,
        items: lines.map(({ photoId, size, framed, quantity }) => ({ photoId, size, framed, quantity })),
      });
      if (result.ok) {
        clear();
        router.push(`/commande/merci?n=${encodeURIComponent(result.number)}`);
        return;
      }
      if (result.reason === "unavailable") {
        removePhotos(result.unavailable);
        setError(t.cart.unavailable);
      } else if (result.reason === "tooMany") {
        setError(t.checkout.tooMany);
      } else if (result.reason === "server") {
        setError(t.checkout.serverError);
      } else {
        setError(t.checkout.error);
      }
      setInvalid(new Set(result.fields));
    });
  }

  return (
    <>
      <div className="page-head">
        <h1>{t.checkout.title}</h1>
        <p className="muted" style={{ maxWidth: "62ch" }}>
          {t.checkout.lead}
        </p>
      </div>
      <div className="two-cols">
        <form className="card stack" onSubmit={onSubmit} noValidate={false}>
          <div className="field-row">
            <label className="field" data-invalid={bad("firstName")}>
              <span>{t.checkout.firstName}</span>
              <input id="firstName" name="firstName" required autoComplete="given-name" maxLength={80} />
            </label>
            <label className="field" data-invalid={bad("lastName")}>
              <span>{t.checkout.lastName}</span>
              <input id="lastName" name="lastName" required autoComplete="family-name" maxLength={80} />
            </label>
          </div>
          <div className="field-row">
            <label className="field" data-invalid={bad("email")}>
              <span>{t.checkout.email}</span>
              <input id="email" name="email" type="email" required autoComplete="email" maxLength={200} />
            </label>
            <label className="field" data-invalid={bad("phone")}>
              <span>{t.checkout.phone}</span>
              <input id="phone" name="phone" type="tel" autoComplete="tel" maxLength={40} />
            </label>
          </div>

          <fieldset className="fieldset">
            <legend>{t.checkout.delivery}</legend>
            <div className="chips">
              {(["retrait", "livraison"] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  className="chip"
                  aria-pressed={delivery === d}
                  onClick={() => setDelivery(d)}
                >
                  {d === "retrait" ? t.checkout.pickup : t.checkout.shipping}
                </button>
              ))}
            </div>
            {delivery === "livraison" && (
              <>
                <p className="muted" style={{ fontSize: 13 }}>
                  {t.checkout.shippingNote}
                </p>
                <label className="field" data-invalid={bad("addressLine")}>
                  <span>{t.checkout.address}</span>
                  <input id="addressLine" name="addressLine" required autoComplete="street-address" maxLength={200} />
                </label>
                <div className="field-row">
                  <label className="field" data-invalid={bad("postalCode")}>
                    <span>{t.checkout.postalCode}</span>
                    <input id="postalCode" name="postalCode" required autoComplete="postal-code" maxLength={20} />
                  </label>
                  <label className="field" data-invalid={bad("city")}>
                    <span>{t.checkout.city}</span>
                    <input id="city" name="city" required autoComplete="address-level2" maxLength={100} />
                  </label>
                  <label className="field" data-invalid={bad("country")}>
                    <span>{t.checkout.country}</span>
                    <input
                      id="country"
                      name="country"
                      required
                      autoComplete="country-name"
                      defaultValue={locale === "fr" ? "France" : ""}
                      maxLength={100}
                    />
                  </label>
                </div>
              </>
            )}
          </fieldset>

          <label className="field">
            <span>{t.checkout.message}</span>
            <textarea id="message" name="message" maxLength={2000} placeholder={t.checkout.messageHint} />
          </label>

          {/* Champ piège anti-spam, invisible pour les humains */}
          <input
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{ position: "absolute", left: "-9999px", width: 1, height: 1 }}
          />

          <label className="check" data-invalid={bad("consent")}>
            <input id="consent" name="consent" type="checkbox" required />
            <span>
              {t.checkout.consent}{" "}
              <Link href="/confidentialite" target="_blank">
                {t.checkout.privacy}
              </Link>
            </span>
          </label>

          {error && (
            <p className="alert" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="btn" disabled={pending}>
            {pending ? t.checkout.sending : t.checkout.submit}
          </button>
        </form>

        <aside className="card summary">
          <h2 style={{ fontSize: 20 }}>{t.checkout.summary}</h2>
          {lines.map((l) => (
            <div key={`${l.photoId}-${l.size}-${l.framed}`} className="summary-line">
              <span>
                {l.quantity} × {pick(locale, l.titleFr, l.titleEn)}, {sizeLabel(l.size)}
                {l.framed ? `, ${t.photo.withFrame.toLowerCase()}` : ""}
              </span>
              <span>{formatEuros(unitPriceCents(prices, l.size, l.framed) * l.quantity, locale)}</span>
            </div>
          ))}
          <div className="total-row">
            <span>{t.cart.total}</span>
            <span>{formatEuros(total, locale)}</span>
          </div>
          <p className="muted" style={{ fontSize: 13 }}>
            {t.cart.shippingNote}
          </p>
        </aside>
      </div>
    </>
  );
}
