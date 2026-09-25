import type { Metadata } from "next";
import { getSettings } from "@/lib/data";
import { pick } from "@/lib/i18n";
import { getDictionary } from "@/lib/locale";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "À propos" };

export default async function AboutPage() {
  const { locale, t } = await getDictionary();
  const s = await getSettings();
  return (
    <div className="stack" style={{ marginTop: 24 }}>
      <h1>{t.about.title}</h1>
      <div className="prose">{pick(locale, s.about_fr, s.about_en)}</div>
    </div>
  );
}
