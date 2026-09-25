import Link from "next/link";
import { notFound } from "next/navigation";
import { deletePhoto } from "@/app/admin/actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { PhotoForm } from "@/components/admin/PhotoForm";
import { getCollections, getPhotoById } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function EditPhotoPage(props: PageProps<"/admin/photos/[id]">) {
  const { id } = await props.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [photo, collections] = await Promise.all([getPhotoById(id), getCollections({ onlyVisible: false })]);
  if (!photo) notFound();
  return (
    <>
      <p>
        <Link href="/admin/photos" className="muted">
          ← Photos
        </Link>
      </p>
      <div className="admin-head">
        <h1>{photo.title_fr}</h1>
        {photo.visible && (
          <Link href={`/photos/${photo.slug}`} target="_blank" className="btn btn-ghost btn-small">
            Voir sur le site ↗
          </Link>
        )}
      </div>
      <PhotoForm photo={photo} collections={collections} />
      <section className="danger-zone">
        <p className="muted" style={{ fontSize: 14 }}>
          Supprimer la photo la retire du site. Les commandes passées gardent son titre. Pour la retirer
          temporairement, décochez plutôt « Visible sur le site ».
        </p>
        <ConfirmButton
          action={deletePhoto.bind(null, photo.id)}
          label="Supprimer la photo"
          confirmLabel="Supprimer définitivement"
        />
      </section>
    </>
  );
}
