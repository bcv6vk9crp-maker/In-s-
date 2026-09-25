import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";

export function SiteFooter({ t }: { t: Dictionary }) {
  return (
    <footer className="site-footer">
      <div className="container">
        <span>© {new Date().getFullYear()} Ines. B</span>
        <nav aria-label="Informations légales">
          <Link href="/mentions-legales">{t.footer.legal}</Link>
          <Link href="/conditions-de-vente">{t.footer.terms}</Link>
          <Link href="/confidentialite">{t.footer.privacy}</Link>
        </nav>
      </div>
    </footer>
  );
}
