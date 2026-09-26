"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset, updatePassword } from "@/app/admin/actions";
import { useSubmit } from "@/components/admin/useSubmit";

function Logo() {
  return (
    <p className="logo">
      Ines<span style={{ color: "var(--plum)" }}>.</span> B
    </p>
  );
}

export function PasswordResetForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, undefined);
  const onSubmit = useSubmit(action);
  return (
    <form onSubmit={onSubmit} className="card stack">
      <Logo />
      <p className="muted">Mot de passe oublié : saisissez l&apos;email du compte admin.</p>
      <label className="field">
        <span>Email</span>
        <input id="email" name="email" type="email" required autoComplete="username" />
      </label>
      {state?.ok && (
        <p className="alert alert-ok" role="status">
          {state.ok}
        </p>
      )}
      <button className="btn btn-plum" disabled={pending}>
        {pending ? "Envoi…" : "Recevoir un lien"}
      </button>
      <Link href="/admin/connexion" className="muted" style={{ fontSize: 14 }}>
        ← Retour à la connexion
      </Link>
    </form>
  );
}

export function NewPasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, undefined);
  const onSubmit = useSubmit(action);
  return (
    <form onSubmit={onSubmit} className="card stack">
      <Logo />
      <p className="muted">Choisissez votre nouveau mot de passe (10 caractères minimum).</p>
      <label className="field">
        <span>Nouveau mot de passe</span>
        <input id="password" name="password" type="password" required minLength={10} autoComplete="new-password" />
      </label>
      <label className="field">
        <span>Confirmez-le</span>
        <input id="confirm" name="confirm" type="password" required minLength={10} autoComplete="new-password" />
      </label>
      {state?.error && (
        <p className="alert" role="alert">
          {state.error}
        </p>
      )}
      <button className="btn btn-plum" disabled={pending}>
        {pending ? "Enregistrement…" : "Enregistrer le mot de passe"}
      </button>
    </form>
  );
}
