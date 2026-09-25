"use client";

import { useActionState } from "react";
import { useSubmit } from "@/components/admin/useSubmit";
import { saveSettings } from "@/app/admin/actions";
import type { Settings } from "@/lib/data";

const euros = (cents: number) => (cents / 100).toFixed(2).replace(".", ",").replace(",00", "");

function Text({
  name,
  label,
  value,
  hint,
  area,
  type,
}: {
  name: string;
  label: string;
  value: string | null;
  hint?: string;
  area?: boolean;
  type?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {area ? (
        <textarea id={name} name={name} defaultValue={value ?? ""} rows={6} />
      ) : (
        <input id={name} name={name} type={type} defaultValue={value ?? ""} />
      )}
      {hint && <span className="hint">{hint}</span>}
    </label>
  );
}

export function SettingsForm({ settings: s, adminEmail }: { settings: Settings; adminEmail: string }) {
  const [state, action, pending] = useActionState(saveSettings, undefined);
  const onSubmit = useSubmit(action);
  return (
    <form onSubmit={onSubmit} className="form-grid">
      <section className="card form-grid">
        <h2 className="section-title" style={{ marginTop: 0 }}>
          Prix (en euros)
        </h2>
        <div className="field-row">
          <Text name="price_small" label="Tirage 20 × 30" value={euros(s.price_small_cents)} />
          <Text name="price_large" label="Tirage 40 × 60" value={euros(s.price_large_cents)} />
        </div>
        <div className="field-row">
          <Text name="frame_small" label="Supplément cadre 20 × 30" value={euros(s.frame_small_cents)} />
          <Text name="frame_large" label="Supplément cadre 40 × 60" value={euros(s.frame_large_cents)} />
        </div>
        <p className="hint muted" style={{ fontSize: 13 }}>
          Les nouveaux prix s&apos;appliquent aux prochaines commandes. Les commandes déjà reçues gardent leur prix.
        </p>
      </section>

      <section className="card form-grid">
        <h2 className="section-title" style={{ marginTop: 0 }}>
          Emails et contact
        </h2>
        <Text
          name="notification_email"
          type="email"
          label="Email qui reçoit les alertes de commande"
          value={s.notification_email}
          hint={`Si vide, les alertes partent vers ${adminEmail}.`}
        />
        <div className="field-row">
          <Text name="contact_email" type="email" label="Email affiché sur la page Contact" value={s.contact_email} />
          <Text name="instagram" label="Compte Instagram" value={s.instagram} hint="Par exemple @ines.b.photo" />
        </div>
      </section>

      <section className="card form-grid">
        <h2 className="section-title" style={{ marginTop: 0 }}>
          Textes du site
        </h2>
        <div className="field-row">
          <Text name="about_fr" label="À propos (français)" value={s.about_fr} area />
          <Text name="about_en" label="À propos (anglais)" value={s.about_en} area />
        </div>
        <div className="field-row">
          <Text name="contact_intro_fr" label="Introduction Contact (français)" value={s.contact_intro_fr} area />
          <Text name="contact_intro_en" label="Introduction Contact (anglais)" value={s.contact_intro_en} area />
        </div>
      </section>

      <section className="card form-grid">
        <h2 className="section-title" style={{ marginTop: 0 }}>
          Informations légales
        </h2>
        <p className="muted" style={{ fontSize: 14 }}>
          Utilisées dans les mentions légales, les conditions de vente et la politique de confidentialité. Tant
          qu&apos;un champ est vide, le site affiche « [à compléter] ».
        </p>
        <div className="field-row">
          <Text name="legal_name" label="Nom ou raison sociale" value={s.legal_name} />
          <Text
            name="legal_status"
            label="Statut"
            value={s.legal_status}
            hint="Par exemple : micro-entrepreneuse, artiste-auteure"
          />
        </div>
        <div className="field-row">
          <Text name="siret" label="SIRET" value={s.siret} />
          <Text
            name="vat_mention"
            label="Mention TVA"
            value={s.vat_mention}
            hint="Par exemple : TVA non applicable, art. 293 B du CGI"
          />
        </div>
        <Text name="legal_address" label="Adresse" value={s.legal_address} />
      </section>

      {state?.error && <p className="alert">{state.error}</p>}
      {state?.ok && <p className="alert alert-ok">{state.ok}</p>}
      <div>
        <button className="btn btn-plum" disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer les réglages"}
        </button>
      </div>
    </form>
  );
}
