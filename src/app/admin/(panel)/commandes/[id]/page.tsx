import Link from "next/link";
import { notFound } from "next/navigation";
import { anonymizeOrderAction, deleteOrder } from "@/app/admin/actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { OrderStatusForm } from "@/components/admin/OrderStatusForm";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { OrderStatus } from "@/lib/orders";
import { formatEuros, formatOrderNumber } from "@/lib/pricing";
import { db } from "@/lib/supabase/db";

export const dynamic = "force-dynamic";

type Order = {
  id: string;
  number: number;
  status: OrderStatus;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  delivery_method: "retrait" | "livraison";
  address_line: string | null;
  postal_code: string | null;
  city: string | null;
  country: string | null;
  message: string | null;
  locale: string;
  consent_at: string;
  shipping_cents: number;
  total_cents: number;
  internal_notes: string;
  anonymized_at: string | null;
  created_at: string;
  order_items: {
    id: string;
    photo_title: string;
    format_label: string;
    framed: boolean;
    unit_price_cents: number;
    quantity: number;
    photos: { slug: string } | null;
  }[];
};

const dateTime = (iso: string) =>
  new Date(iso).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Paris" });

export default async function OrderPage(props: PageProps<"/admin/commandes/[id]">) {
  const { id } = await props.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { data } = await db()
    .from("orders")
    .select("*, order_items(id, photo_title, format_label, framed, unit_price_cents, quantity, photos(slug))")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  const o = data as Order;
  const number = formatOrderNumber(o.number);

  return (
    <>
      <p>
        <Link href="/admin/commandes" className="muted">
          ← Toutes les commandes
        </Link>
      </p>
      <div className="admin-head">
        <h1>
          Commande {number} <StatusBadge status={o.status} />
        </h1>
        <span className="muted">Reçue le {dateTime(o.created_at)}</span>
      </div>

      <div className="detail-grid">
        <div className="stack">
          <section className="card stack">
            <h2 className="section-title" style={{ marginTop: 0 }}>
              Tirages demandés
            </h2>
            <div className="table-wrap" style={{ borderRadius: 0 }}>
              <table className="table">
                <tbody>
                  {o.order_items.map((i) => (
                    <tr key={i.id}>
                      <td>
                        {i.photos ? (
                          <Link href={`/photos/${i.photos.slug}`} target="_blank">
                            {i.photo_title}
                          </Link>
                        ) : (
                          i.photo_title
                        )}
                        <br />
                        <span className="muted">
                          {i.format_label} · {i.framed ? "avec cadre" : "sans cadre"}
                        </span>
                      </td>
                      <td className="num">
                        {i.quantity} × {formatEuros(i.unit_price_cents)}
                      </td>
                      <td className="num">{formatEuros(i.quantity * i.unit_price_cents)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={2}>
                      Frais de port ({o.delivery_method === "livraison" ? "livraison" : "retrait"})
                    </td>
                    <td className="num">{o.shipping_cents === 0 ? "Gratuit" : formatEuros(o.shipping_cents)}</td>
                  </tr>
                  <tr>
                    <td colSpan={2}>
                      <b>Total</b>
                    </td>
                    <td className="num">
                      <b>{formatEuros(o.total_cents)}</b>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="card stack">
            <h2 className="section-title" style={{ marginTop: 0 }}>
              Acheteur
            </h2>
            {o.anonymized_at ? (
              <p className="muted">Coordonnées anonymisées le {dateTime(o.anonymized_at)}.</p>
            ) : (
              <dl className="kv">
                <dt>Nom</dt>
                <dd>
                  {o.first_name} {o.last_name}
                </dd>
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${o.email}?subject=${encodeURIComponent(`Votre commande ${number}`)}`}>{o.email}</a>
                </dd>
                <dt>Téléphone</dt>
                <dd>{o.phone ? <a href={`tel:${o.phone}`}>{o.phone}</a> : "—"}</dd>
                <dt>Réception</dt>
                <dd>
                  {o.delivery_method === "retrait" ? "Retrait en main propre" : "Livraison"}
                </dd>
                <dt>Adresse</dt>
                <dd>
                  {o.address_line ? `${o.address_line}\n${o.postal_code} ${o.city}\n${o.country}` : "—"}
                </dd>
                <dt>Langue</dt>
                <dd>{o.locale === "en" ? "Anglais" : "Français"}</dd>
                <dt>Message</dt>
                <dd>{o.message || "—"}</dd>
                <dt>Consentement</dt>
                <dd>Donné le {dateTime(o.consent_at)}</dd>
              </dl>
            )}
          </section>
        </div>

        <div className="stack">
          <section className="card">
            <OrderStatusForm id={o.id} status={o.status} notes={o.internal_notes} />
          </section>
          <section className="danger-zone">
            <p className="muted" style={{ fontSize: 14 }}>
              L&apos;anonymisation efface les coordonnées de l&apos;acheteur mais garde les tirages et le montant
              pour la comptabilité. Elle se fait automatiquement un an après la commande.
            </p>
            {!o.anonymized_at && (
              <ConfirmButton
                action={anonymizeOrderAction.bind(null, o.id)}
                label="Anonymiser maintenant"
                confirmLabel="Confirmer l'anonymisation"
              />
            )}
            <ConfirmButton
              action={deleteOrder.bind(null, o.id)}
              label="Supprimer la commande"
              confirmLabel="Supprimer définitivement"
            />
          </section>
        </div>
      </div>
    </>
  );
}
