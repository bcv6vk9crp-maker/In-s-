import Link from "next/link";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatEuros, formatOrderNumber } from "@/lib/pricing";
import type { OrderStatus } from "@/lib/orders";
import { db } from "@/lib/supabase/db";

export const dynamic = "force-dynamic";

type OrderRow = {
  id: string;
  number: number;
  status: OrderStatus;
  first_name: string;
  last_name: string;
  total_cents: number;
  created_at: string;
};

export default async function DashboardPage(props: PageProps<"/admin">) {
  const { "mot-de-passe": passwordChanged } = await props.searchParams;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [toProcess, month, items] = await Promise.all([
    db()
      .from("orders")
      .select("id, number, status, first_name, last_name, total_cents, created_at")
      .in("status", ["nouvelle", "contactee"])
      .order("created_at", { ascending: true }),
    db().from("orders").select("status, total_cents").gte("created_at", monthStart),
    db().from("order_items").select("photo_title, quantity, orders!inner(status)").neq("orders.status", "annulee"),
  ]);

  const pending = (toProcess.data ?? []) as OrderRow[];
  const monthOrders = (month.data ?? []) as { status: OrderStatus; total_cents: number }[];
  const monthCount = monthOrders.filter((o) => o.status !== "annulee").length;
  const monthPaid = monthOrders
    .filter((o) => o.status === "payee" || o.status === "livree")
    .reduce((s, o) => s + o.total_cents, 0);

  const counts = new Map<string, number>();
  for (const i of (items.data ?? []) as { photo_title: string; quantity: number }[]) {
    counts.set(i.photo_title, (counts.get(i.photo_title) ?? 0) + i.quantity);
  }
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const monthName = now.toLocaleDateString("fr-FR", { month: "long" });

  return (
    <>
      <div className="admin-head">
        <h1>Bonjour Ines</h1>
        <a href="/admin/export" className="btn btn-ghost btn-small">
          Exporter les commandes (CSV)
        </a>
      </div>

      {passwordChanged === "modifie" && <p className="alert alert-ok">Votre mot de passe a été modifié.</p>}

      <div className="stats">
        <div className="stat">
          <b>{pending.filter((o) => o.status === "nouvelle").length}</b>
          <span>nouvelle(s) commande(s) à traiter</span>
        </div>
        <div className="stat">
          <b>{monthCount}</b>
          <span>commande(s) en {monthName}</span>
        </div>
        <div className="stat">
          <b>{formatEuros(monthPaid)}</b>
          <span>payé sur les commandes de {monthName}</span>
        </div>
      </div>

      <section className="stack">
        <h2 className="section-title">À traiter</h2>
        {pending.length === 0 ? (
          <p className="muted">Aucune commande en attente.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Commande</th>
                  <th>Client</th>
                  <th>Reçue le</th>
                  <th>Statut</th>
                  <th className="num">Total</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <Link href={`/admin/commandes/${o.id}`}>{formatOrderNumber(o.number)}</Link>
                    </td>
                    <td>
                      {o.first_name} {o.last_name}
                    </td>
                    <td>{new Date(o.created_at).toLocaleDateString("fr-FR")}</td>
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
      </section>

      <section className="stack">
        <h2 className="section-title">Photos les plus demandées</h2>
        {top.length === 0 ? (
          <p className="muted">Pas encore de commande.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <tbody>
                {top.map(([title, qty]) => (
                  <tr key={title}>
                    <td>{title}</td>
                    <td className="num">{qty} tirage(s)</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
