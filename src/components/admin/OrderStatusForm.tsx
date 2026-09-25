"use client";

import { useActionState } from "react";
import { useSubmit } from "@/components/admin/useSubmit";
import { updateOrder } from "@/app/admin/actions";
import { ORDER_STATUSES, STATUS_LABELS, type OrderStatus } from "@/lib/orders";

export function OrderStatusForm({ id, status, notes }: { id: string; status: OrderStatus; notes: string }) {
  const [state, action, pending] = useActionState(updateOrder.bind(null, id), undefined);
  const onSubmit = useSubmit(action);
  return (
    <form onSubmit={onSubmit} className="form-grid">
      <label className="field">
        <span>Statut</span>
        <select id="status" name="status" defaultValue={status}>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Notes internes</span>
        <textarea
          id="internal_notes"
          name="internal_notes"
          defaultValue={notes}
          placeholder="Frais de port convenus, mode de paiement, date de remise…"
        />
        <span className="hint">Visibles uniquement par vous.</span>
      </label>
      {state?.error && <p className="alert">{state.error}</p>}
      {state?.ok && <p className="alert alert-ok">{state.ok}</p>}
      <button className="btn btn-plum" disabled={pending}>
        {pending ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}
