import type { Metadata } from "next";
import { getSettings } from "@/lib/data";
import { orTodo } from "@/lib/legal";
import { formatEuros } from "@/lib/pricing";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Conditions de vente" };

export default async function TermsPage() {
  const s = await getSettings();
  return (
    <div className="prose" style={{ marginTop: 24 }}>
      <h1>Conditions de vente</h1>
      <p className="muted">Modèle à faire relire avant la mise en ligne définitive.</p>
      <h2>1. Vendeuse</h2>
      <p>
        {orTodo(s.legal_name)}, {orTodo(s.legal_status)}, SIRET {orTodo(s.siret)}, {orTodo(s.legal_address)}.
      </p>
      <h2>2. Produits</h2>
      <p>
        Tirages photographiques d&apos;art au format 20 × 30 cm ({formatEuros(s.price_small_cents)}) ou 40 × 60 cm (
        {formatEuros(s.price_large_cents)}), avec en option un cadre ({formatEuros(s.frame_small_cents)} pour le
        20 × 30, {formatEuros(s.frame_large_cents)} pour le 40 × 60). Les couleurs à l&apos;écran peuvent légèrement
        différer du tirage papier.
      </p>
      <h2>3. Prix</h2>
      <p>Les prix sont indiqués en euros. {orTodo(s.vat_mention)}. Les frais de port éventuels sont convenus avec l&apos;acheteur avant toute validation.</p>
      <h2>4. Commande</h2>
      <p>
        La validation du panier sur le site constitue une demande de commande, sans paiement. La vendeuse recontacte
        l&apos;acheteur pour confirmer la disponibilité, le prix total, les modalités de remise ou de livraison et de
        paiement. La vente n&apos;est conclue qu&apos;après cette confirmation et la réception du paiement.
      </p>
      <h2>5. Livraison et retrait</h2>
      <p>Les tirages sont remis en main propre ou expédiés à l&apos;adresse indiquée, selon le choix fait lors de la commande.</p>
      <h2>6. Droit de rétractation</h2>
      <p>
        Conformément au Code de la consommation, l&apos;acheteur dispose d&apos;un délai de 14 jours à compter de la
        réception pour exercer son droit de rétractation, sauf pour les tirages réalisés selon ses spécifications
        ou nettement personnalisés.
      </p>
      <h2>7. Droits d&apos;auteur</h2>
      <p>L&apos;achat d&apos;un tirage ne transfère aucun droit de reproduction sur l&apos;œuvre.</p>
    </div>
  );
}
