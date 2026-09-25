import type { Metadata } from "next";
import { getSettings } from "@/lib/data";
import { orTodo } from "@/lib/legal";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Confidentialité" };

export default async function PrivacyPage() {
  const s = await getSettings();
  return (
    <div className="prose" style={{ marginTop: 24 }}>
      <h1>Politique de confidentialité</h1>
      <h2>Qui traite vos données ?</h2>
      <p>{orTodo(s.legal_name)}, joignable à l&apos;adresse {orTodo(s.contact_email ?? "")}.</p>
      <h2>Quelles données et pourquoi ?</h2>
      <p>
        Lorsque vous validez votre panier, nous recueillons vos nom, prénom, email, et si vous les donnez votre
        téléphone, votre adresse postale et votre message. Ces données servent uniquement à vous recontacter pour
        finaliser votre commande, organiser le paiement et la remise ou la livraison. La base légale est votre
        consentement, donné en cochant la case prévue, et l&apos;exécution de la commande.
      </p>
      <h2>Combien de temps ?</h2>
      <p>
        Vos coordonnées sont automatiquement effacées un an après votre commande. Seuls le détail et le montant de la
        commande sont conservés, sans lien avec votre identité, pour la comptabilité.
      </p>
      <h2>Qui y a accès ?</h2>
      <p>
        Uniquement Ines. B. Les données sont hébergées par Supabase (Union européenne) et les emails envoyés via
        Resend. Aucune donnée n&apos;est vendue ni utilisée à des fins publicitaires. Le site n&apos;utilise aucun
        cookie de suivi : le panier est conservé dans votre navigateur.
      </p>
      <h2>Vos droits</h2>
      <p>
        Vous pouvez demander à tout moment l&apos;accès, la rectification ou la suppression de vos données en écrivant
        à {orTodo(s.contact_email ?? "")}. Vous pouvez aussi saisir la CNIL (cnil.fr).
      </p>
    </div>
  );
}
