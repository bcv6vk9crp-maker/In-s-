"use client";

import { useState, useTransition } from "react";

/** Bouton en deux temps : un premier clic demande confirmation, le second exécute l'action. */
export function ConfirmButton({
  action,
  label,
  confirmLabel,
  className = "btn btn-danger btn-small",
}: {
  action: () => Promise<void>;
  label: string;
  confirmLabel: string;
  className?: string;
}) {
  const [asking, setAsking] = useState(false);
  const [pending, startTransition] = useTransition();
  if (!asking) {
    return (
      <button type="button" className={className} onClick={() => setAsking(true)}>
        {label}
      </button>
    );
  }
  return (
    <span className="chips" style={{ alignItems: "center" }}>
      <button
        type="button"
        className={className}
        disabled={pending}
        onClick={() => startTransition(() => action())}
      >
        {pending ? "…" : confirmLabel}
      </button>
      <button type="button" className="link-button" onClick={() => setAsking(false)}>
        Annuler
      </button>
    </span>
  );
}
