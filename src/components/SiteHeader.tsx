"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLocale } from "@/app/actions";
import { useCart } from "@/components/CartProvider";
import { useI18n } from "@/components/I18nProvider";
import { LOCALES } from "@/lib/i18n";

export function SiteHeader() {
  const { locale, t } = useI18n();
  const { count, ready } = useCart();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <header className="site-header">
      <div className="container">
        <Link href="/" className="logo">
          Ines<span>.</span> B
        </Link>
        <nav className="site-nav" aria-label="Navigation principale">
          <Link href="/">{t.nav.collections}</Link>
          <Link href="/a-propos">{t.nav.about}</Link>
          <Link href="/contact">{t.nav.contact}</Link>
          <span className="lang-switch">
            {LOCALES.map((l) => (
              <button
                key={l}
                type="button"
                aria-pressed={locale === l}
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await setLocale(l);
                    router.refresh();
                  })
                }
              >
                {l.toUpperCase()}
              </button>
            ))}
          </span>
          <Link href="/panier" className="cart-link">
            {t.nav.cart}
            {ready && count > 0 && <span className="cart-count">{count}</span>}
          </Link>
        </nav>
      </div>
    </header>
  );
}
