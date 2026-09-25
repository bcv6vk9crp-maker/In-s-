import { deleteCollection } from "@/app/admin/actions";
import { CollectionForm } from "@/components/admin/CollectionForm";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { getCollections, getPhotos } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  const [collections, photos] = await Promise.all([
    getCollections({ onlyVisible: false }),
    getPhotos({ onlyVisible: false }),
  ]);
  const count = (id: string) => photos.filter((p) => p.collection_ids.includes(id)).length;

  return (
    <>
      <div className="admin-head">
        <h1>Collections</h1>
      </div>
      <p className="muted" style={{ maxWidth: "70ch" }}>
        Les collections regroupent vos photos par série ou par thème. Une photo peut appartenir à plusieurs
        collections. La petite note apparaît en écriture manuscrite sous le titre de la collection.
      </p>

      <section className="stack">
        <h2 className="section-title">Nouvelle collection</h2>
        <CollectionForm collection={null} />
      </section>

      {collections.map((c) => (
        <section key={c.id} className="stack">
          <h2 className="section-title">
            {c.name_fr} <span className="muted" style={{ fontSize: 14, fontWeight: 400 }}>· {count(c.id)} photo(s)</span>
          </h2>
          <CollectionForm collection={c} />
          <div>
            <ConfirmButton
              action={deleteCollection.bind(null, c.id)}
              label="Supprimer la collection"
              confirmLabel="Supprimer (les photos restent)"
            />
          </div>
        </section>
      ))}
    </>
  );
}
