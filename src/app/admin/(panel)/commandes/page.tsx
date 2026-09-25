import Link from "next/link";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { isOrderStatus, ORDER_STATUSES, STATUS_LABELS, type OrderStatus } from "@/lib/orders";
import { formatEuros, formatOrderNumber } from "@/lib/pricing";
import { db } from "@/lib/supabase/db";

export const dynamic = "force-dynamic";

export default async function OrdersPage(props: PageProps<"/admin/commandes">) {
  const { statut } = await props.searchParams;
  const filter = isOrderStatus(statut) ? statut : null;

  let q = db()
    .from("orders")
    .select("id, number, status, first_name, last_name, email, delivery_method, total_cents, created_at")
    .order("created_at", { ascending: false })
    .limit(500);
  if (filter) q = q.eq("status", filter);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  const orders = data as {
    id: string;
    number: number;
    status: OrderStatus;
    first_name: string;
    last_name: string;
    email: string;
    delivery_method: string;
    total_cents: number;
    created_at: string;
  }[];

  return (
    <>
      <div className="admin-head">
        <h1>Commandes</h1>
        <a href={`/admin/export${filter ? `?statut=${filter}` : ""}`} className="btn btn-ghost btn-small">
          Exporter (CSV)
        </a>
      </div>
      <nav className="chips" aria-label="Filtrer par statut">
        <Link href="/admin/commandes" className="chip" aria-current={filter ? undefined : "page"}>
          Toutes
        </Link>
        {ORDER_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/commandes?statut=${s}`}
            className="chip"
            aria-current={filter === s ? "page" : undefined}
          >
            {STATUS_LABELS[s]}
          </Link>
        ))}
      </nav>
      {orders.length === 0 ? (
        <p className="muted">Aucune commande.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Commande</th>
                <th>Date</th>
                <th>Client</th>
                <th>Réception</th>
                <th>Statut</th>
                <th className="num">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <Link href={`/admin/commandes/${o.id}`}>{formatOrderNumber(o.number)}</Link>
                  </td>
                  <td>{new Date(o.created_at).toLocaleDateString("fr-FR")}</td>
                  <td>
                    {o.first_name} {o.last_name}
                    <br />
                    <span className="muted">{o.email}</span>
                  </td>
                  <td>{o.delivery_method === "livraison" ? "Livraison" : "Retrait"}</td>
                  <td>
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="num">{formatEuros(o.total_cents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
