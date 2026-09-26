"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useSubmit } from "@/components/admin/useSubmit";
import { signIn } from "@/app/admin/actions";

export function LoginForm({ expiredLink = false }: { expiredLink?: boolean }) {
  const [state, action, pending] = useActionState(signIn, undefined);
  const onSubmit = useSubmit(action);
  return (
    <form onSubmit={onSubmit} className="card stack">
      <p className="logo">
        Ines<span style={{ color: "var(--plum)" }}>.</span> B
      </p>
      <p className="muted">Espace administrateur</p>
      {expiredLink && (
        <p className="alert" role="alert">
          Ce lien a expiré ou a déjà servi. Redemandez un lien depuis « Mot de passe oublié ».
        </p>
      )}
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
      <Link href="/admin/mot-de-passe-oublie" className="muted" style={{ fontSize: 14 }}>
        Mot de passe oublié ?
      </Link>
    </form>
  );
}
