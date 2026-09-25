import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/lib/locale";

export const metadata: Metadata = { title: "Merci" };

export default async function ThanksPage(props: PageProps<"/commande/merci">) {
  const { n } = await props.searchParams;
  const { t } = await getDictionary();
  const number = typeof n === "string" && /^IB-\d+$/.test(n) ? n : "";
  return (
    <div className="empty">
      <span className="hand" style={{ fontSize: 30 }}>
        {t.thanks.title}
      </span>
      <p style={{ maxWidth: "60ch" }}>{t.thanks.body.replace(" {number}", number ? ` ${number}` : "")}</p>
      <Link href="/" className="btn">
        {t.thanks.back}
      </Link>
    </div>
  );
}
