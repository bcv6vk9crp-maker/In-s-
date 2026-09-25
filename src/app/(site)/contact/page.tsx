import type { Metadata } from "next";
import { getSettings } from "@/lib/data";
import { pick } from "@/lib/i18n";
import { getDictionary } from "@/lib/locale";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage() {
  const { locale, t } = await getDictionary();
  const s = await getSettings();
  const instagram = s.instagram?.replace(/^@/, "");
  return (
    <div className="stack" style={{ marginTop: 24 }}>
      <h1>{t.contact.title}</h1>
      <div className="prose">{pick(locale, s.contact_intro_fr, s.contact_intro_en)}</div>
      <div className="card stack" style={{ maxWidth: 480 }}>
        {s.contact_email && (
          <p>
            <span className="muted">{t.contact.email} · </span>
            <a href={`mailto:${s.contact_email}`}>{s.contact_email}</a>
          </p>
        )}
        {instagram && (
          <p>
            <span className="muted">{t.contact.instagram} · </span>
            <a href={`https://www.instagram.com/${instagram}/`} target="_blank" rel="noreferrer">
              @{instagram}
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
