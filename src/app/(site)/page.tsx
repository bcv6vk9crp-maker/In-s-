import Link from "next/link";
import { getCollections, getFormats, getPhotos } from "@/lib/data";
import { getDictionary } from "@/lib/locale";
import { pick } from "@/lib/i18n";
import { formatEuros } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export default async function HomePage(props: PageProps<"/">) {
  const { collection } = await props.searchParams;
  const { locale, t } = await getDictionary();
  const [collections, photos, formats] = await Promise.all([
    getCollections({ onlyVisible: true }),
    getPhotos({ onlyVisible: true }),
    getFormats({ onlyActive: true }),
  ]);

  const active = collections.find((c) => c.slug === collection) ?? null;
  const shown = active ? photos.filter((p) => p.collection_ids.includes(active.id)) : photos;
  const fromPrice = formats.length > 0 ? formatEuros(Math.min(...formats.map((f) => f.price_cents)), locale) : null;

  return (
    <>
      <div className="page-head">
        <h1>{active ? pick(locale, active.name_fr, active.name_en) : t.home.all}</h1>
        <span className="tagline">
          {active ? pick(locale, active.note_fr, active.note_en) || t.home.intro : t.home.intro}
        </span>
      </div>

      {collections.length > 0 && (
        <nav className="chips" aria-label={t.nav.collections}>
          <Link href="/" className="chip" aria-current={active ? undefined : "page"}>
            {t.home.all}
          </Link>
          {collections.map((c) => (
            <Link
              key={c.id}
              href={`/?collection=${encodeURIComponent(c.slug)}`}
              className="chip"
              aria-current={active?.id === c.id ? "page" : undefined}
            >
              {pick(locale, c.name_fr, c.name_en)}
            </Link>
          ))}
        </nav>
      )}

      {shown.length === 0 ? (
        <p className="empty muted">{t.home.empty}</p>
      ) : (
        <div className="gallery">
          {shown.map((p) => {
            const title = pick(locale, p.title_fr, p.title_en);
            return (
              <Link key={p.id} href={`/photos/${p.slug}`} className="print">
                <div className="print-frame">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image_url} alt={title} width={p.width} height={p.height} loading="lazy" />
                </div>
                <div className="print-caption">
                  <b>{title}</b>
                  {fromPrice && (
                    <span>
                      {t.home.from} {fromPrice}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
