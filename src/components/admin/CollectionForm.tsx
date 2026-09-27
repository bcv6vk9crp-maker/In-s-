"use client";

import { useActionState } from "react";
import { useSubmit } from "@/components/admin/useSubmit";
import { saveCollection } from "@/app/admin/actions";
import type { Collection } from "@/lib/data";

export function CollectionForm({ collection }: { collection: Collection | null }) {
  const [state, action, pending] = useActionState(saveCollection.bind(null, collection?.id ?? null), undefined);
  const onSubmit = useSubmit(action);
  const key = collection?.id ?? "new";
  return (
    <form onSubmit={onSubmit} className="card form-grid" key={collection ? key : (state?.at ?? "new")}>
      <div className="field-row">
        <label className="field">
          <span>Nom (français)</span>
          <input id={`name_fr-${key}`} name="name_fr" required maxLength={80} defaultValue={collection?.name_fr} />
        </label>
        <label className="field">
          <span>Nom (anglais)</span>
          <input id={`name_en-${key}`} name="name_en" maxLength={80} defaultValue={collection?.name_en} />
        </label>
      </div>
      <div className="field-row">
        <label className="field">
          <span>Petite phrase sous le titre (français)</span>
          <input
            id={`note_fr-${key}`}
            name="note_fr"
            maxLength={160}
            defaultValue={collection?.note_fr}
            placeholder="des gens croisés entre Marseille et la Corse"
          />
        </label>
        <label className="field">
          <span>Petite phrase sous le titre (anglais)</span>
          <input id={`note_en-${key}`} name="note_en" maxLength={160} defaultValue={collection?.note_en} />
        </label>
      </div>
      <div className="field-row" style={{ alignItems: "end" }}>
        <label className="field">
          <span>Ordre d&apos;affichage</span>
          <input id={`position-${key}`} name="position" inputMode="numeric" defaultValue={collection?.position ?? 0} />
        </label>
        <label className="check">
          <input id={`visible-${key}`} type="checkbox" name="visible" defaultChecked={collection?.visible ?? true} />
          <span>Visible sur le site</span>
        </label>
      </div>
      {state?.error && <p className="alert">{state.error}</p>}
      {state?.ok && <p className="alert alert-ok">{state.ok}</p>}
      <div>
        <button className="btn btn-plum btn-small" disabled={pending}>
          {pending ? "Enregistrement…" : collection ? "Enregistrer" : "Créer la collection"}
        </button>
      </div>
    </form>
  );
}
