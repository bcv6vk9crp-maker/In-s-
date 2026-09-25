import type { Metadata } from "next";
import { getSettings } from "@/lib/data";
import { orTodo } from "@/lib/legal";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Mentions légales" };

export default async function LegalPage() {
  const s = await getSettings();
  return (
    <div className="prose" style={{ marginTop: 24 }}>
      <h1>Mentions légales</h1>
      <h2>Éditrice du site</h2>
      <p>
        {orTodo(s.legal_name)}
        {"\n"}Statut : {orTodo(s.legal_status)}
        {"\n"}SIRET : {orTodo(s.siret)}
        {"\n"}Adresse : {orTodo(s.legal_address)}
        {"\n"}Contact : {orTodo(s.contact_email ?? "")}
      </p>
      <h2>Hébergement</h2>
      <p>
        Site hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.
        {"\n"}Données stockées par Supabase Inc., serveurs situés dans l&apos;Union européenne.
      </p>
      <h2>Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble des photographies présentées sur ce site sont des œuvres originales protégées par le droit
        d&apos;auteur. Toute reproduction, même partielle, est interdite sans l&apos;autorisation écrite de leur autrice.
      </p>
    </div>
  );
}
