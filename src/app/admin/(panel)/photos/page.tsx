import Link from "next/link";
import { getCollections, getPhotos } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function PhotosPage() {
  const [photos, collections] = await Promise.all([
    getPhotos({ onlyVisible: false }),
    getCollections({ onlyVisible: false }),
  ]);
  const names = new Map(collections.map((c) => [c.id, c.name_fr]));

  return (
    <>
      <div className="admin-head">
        <h1>Photos</h1>
        <Link href="/admin/photos/nouvelle" className="btn btn-plum btn-small">
          Ajouter une photo
        </Link>
      </div>
      {photos.length === 0 ? (
        <p className="muted">Aucune photo pour l&apos;instant. Commencez par en ajouter une.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th />
                <th>Titre</th>
                <th>Collections</th>
                <th>Ordre</th>
                <th>Visible</th>
              </tr>
            </thead>
            <tbody>
              {photos.map((p) => (
                <tr key={p.id}>
                  <td>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.thumb_url} alt="" />
                  </td>
                  <td>
                    <Link href={`/admin/photos/${p.id}`}>{p.title_fr}</Link>
                    {p.year && <span className="muted"> · {p.year}</span>}
                  </td>
                  <td className="muted">
                    {p.collection_ids.map((id) => names.get(id)).filter(Boolean).join(", ") || "—"}
                  </td>
                  <td>{p.position}</td>
                  <td>{p.visible ? "Oui" : <span className="muted">Masquée</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
