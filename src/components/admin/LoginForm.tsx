"use client";

import { useActionState } from "react";
import { useSubmit } from "@/components/admin/useSubmit";
import { signIn } from "@/app/admin/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, undefined);
  const onSubmit = useSubmit(action);
  return (
    <form onSubmit={onSubmit} className="card stack">
      <p className="logo">
        Ines<span style={{ color: "var(--plum)" }}>.</span> B
      </p>
      <p className="muted">Espace administrateur</p>
      <label className="field">
        <span>Email</span>
        <input id="email" name="email" type="email" required autoComplete="username" />
      </label>
      <label className="field">
        <span>Mot de passe</span>
        <input id="password" name="password" type="password" required autoComplete="current-password" />
      </label>
      {state?.error && (
        <p className="alert" role="alert">
          {state.error}
        </p>
      )}
      <button className="btn btn-plum" disabled={pending}>
        {pending ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
