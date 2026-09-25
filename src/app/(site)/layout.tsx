import { CartProvider } from "@/components/CartProvider";
import { I18nProvider } from "@/components/I18nProvider";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getDictionary } from "@/lib/locale";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { locale, t } = await getDictionary();
  return (
    <I18nProvider locale={locale}>
      <CartProvider>
        <SiteHeader />
        <main className="container">{children}</main>
        <SiteFooter t={t} />
      </CartProvider>
    </I18nProvider>
  );
}
