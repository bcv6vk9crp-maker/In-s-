import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PurchaseForm } from "@/components/PurchaseForm";
import { getPhotoBySlug, getSettings } from "@/lib/data";
import { pick } from "@/lib/i18n";
import { getDictionary } from "@/lib/locale";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: PageProps<"/photos/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const photo = await getPhotoBySlug(slug);
  return { title: photo?.visible ? photo.title_fr : undefined };
}

export default async function PhotoPage(props: PageProps<"/photos/[slug]">) {
  const { slug } = await props.params;
  const { locale, t } = await getDictionary();
  const [photo, settings] = await Promise.all([getPhotoBySlug(slug), getSettings()]);
  if (!photo || !photo.visible) notFound();

  const title = pick(locale, photo.title_fr, photo.title_en);
  const description = pick(locale, photo.description_fr, photo.description_en);

  return (
    <>
      <p style={{ marginTop: 8 }}>
        <Link href="/" className="muted">
          ← {t.photo.back}
        </Link>
      </p>
      <div className="photo-page">
        <div className="print-frame">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo.image_url} alt={title} width={photo.width} height={photo.height} />
        </div>
        <div className="purchase card">
          <div className="stack" style={{ gap: 8 }}>
            <h1 style={{ fontSize: 34 }}>{title}</h1>
            {photo.year && <span className="muted">{photo.year}</span>}
            {description && <p className="prose">{description}</p>}
          </div>
          <PurchaseForm
            photo={{
              photoId: photo.id,
              slug: photo.slug,
              titleFr: photo.title_fr,
              titleEn: photo.title_en,
              imageUrl: photo.image_url,
            }}
            prices={{
              price_small_cents: settings.price_small_cents,
              price_large_cents: settings.price_large_cents,
              frame_small_cents: settings.frame_small_cents,
              frame_large_cents: settings.frame_large_cents,
            }}
          />
        </div>
      </div>
    </>
  );
}
