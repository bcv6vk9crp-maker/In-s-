"use client";

import { useActionState } from "react";
import { saveFormat } from "@/app/admin/actions";
import { useSubmit } from "@/components/admin/useSubmit";
import type { Format } from "@/lib/data";

const euros = (cents: number) => (cents / 100).toFixed(2).replace(".", ",").replace(",00", "");

export function FormatForm({ format }: { format: Format | null }) {
  const [state, action, pending] = useActionState(saveFormat.bind(null, format?.id ?? null), undefined);
  const onSubmit = useSubmit(action);
  const k = format?.id ?? "new";
  return (
    <form onSubmit={onSubmit} className="card form-grid" key={format ? k : (state?.at ?? "new")}>
      <div className="field-row">
        <label className="field">
          <span>Nom du format</span>
          <input id={`label-${k}`} name="label" required maxLength={40} defaultValue={format?.label} placeholder="30 × 45 cm" />
        </label>
        <label className="field">
          <span>Prix du tirage (€)</span>
          <input id={`price-${k}`} name="price" inputMode="decimal" required defaultValue={format ? euros(format.price_cents) : ""} />
        </label>
        <label className="field">
          <span>Supplément cadre (€)</span>
          <input id={`frame-${k}`} name="frame" inputMode="decimal" required defaultValue={format ? euros(format.frame_cents) : ""} />
        </label>
        <label className="field">
          <span>Frais de port (€)</span>
          <input id={`shipping-${k}`} name="shipping" inputMode="decimal" required defaultValue={format ? euros(format.shipping_cents) : ""} />
        </label>
      </div>
      <div className="field-row" style={{ alignItems: "end" }}>
        <label className="field">
          <span>Ordre d&apos;affichage</span>
          <input id={`position-${k}`} name="position" inputMode="numeric" defaultValue={format?.position ?? 0} />
        </label>
        <label className="check">
          <input id={`active-${k}`} type="checkbox" name="active" defaultChecked={format?.active ?? true} />
          <span>Proposé à l&apos;achat</span>
        </label>
      </div>
      {state?.error && <p className="alert">{state.error}</p>}
      {state?.ok && <p className="alert alert-ok">{state.ok}</p>}
      <div>
        <button className="btn btn-plum btn-small" disabled={pending}>
          {pending ? "Enregistrement…" : format ? "Enregistrer" : "Ajouter le format"}
        </button>
      </div>
    </form>
  );
}
