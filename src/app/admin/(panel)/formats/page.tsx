import { deleteFormat } from "@/app/admin/actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { FormatForm } from "@/components/admin/FormatForm";
import { getFormats } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function FormatsPage() {
  const formats = await getFormats({ onlyActive: false });
  const active = formats.filter((f) => f.active).length;

  return (
    <>
      <div className="admin-head">
        <h1>Formats et prix</h1>
      </div>
      <p className="muted" style={{ maxWidth: "72ch" }}>
        Les formats proposés à l&apos;achat sur chaque photo, du classique au grand format (2 à 4 conseillés).
        Pour chacun : le prix du tirage, le supplément si l&apos;acheteur choisit un cadre, et le forfait de port.
        Le port n&apos;est compté qu&apos;une fois par commande, au montant du plus grand format du panier, et il est
        gratuit en retrait. Les commandes déjà reçues gardent leurs prix.
      </p>
      {active === 0 && (
        <p className="alert">Aucun format actif : les photos ne peuvent pas être commandées.</p>
      )}

      {formats.map((f) => (
        <section key={f.id} className="stack">
          <h2 className="section-title">
            {f.label}
            {!f.active && <span className="muted" style={{ fontSize: 14, fontWeight: 400 }}> · désactivé</span>}
          </h2>
          <FormatForm format={f} />
          <div>
            <ConfirmButton
              action={deleteFormat.bind(null, f.id)}
              label="Supprimer ce format"
              confirmLabel="Supprimer définitivement"
            />
          </div>
        </section>
      ))}

      <section className="stack">
        <h2 className="section-title">Ajouter un format</h2>
        <FormatForm format={null} />
      </section>
    </>
  );
}
