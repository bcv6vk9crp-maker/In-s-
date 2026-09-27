import { NextResponse, type NextRequest } from "next/server";
import { csvCell, isOrderStatus, STATUS_LABELS, type OrderStatus } from "@/lib/orders";
import { formatOrderNumber } from "@/lib/pricing";
import { currentAdminEmail } from "@/lib/supabase/auth";
import { db } from "@/lib/supabase/db";

type Row = {
  number: number;
  created_at: string;
  status: OrderStatus;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  delivery_method: string;
  address_line: string | null;
  postal_code: string | null;
  city: string | null;
  country: string | null;
  message: string | null;
  internal_notes: string;
  shipping_cents: number;
  total_cents: number;
  order_items: { photo_title: string; format_label: string; framed: boolean; quantity: number }[];
};

const euros = (cents: number) => (cents / 100).toFixed(2).replace(".", ",");

export async function GET(request: NextRequest) {
  if (!(await currentAdminEmail())) return new NextResponse("Non autorisé", { status: 401 });

  const statut = request.nextUrl.searchParams.get("statut");
  let q = db()
    .from("orders")
    .select("*, order_items(photo_title, format_label, framed, quantity)")
    .order("created_at", { ascending: false });
  if (isOrderStatus(statut)) q = q.eq("status", statut);
  const { data, error } = await q;
  if (error) return new NextResponse(error.message, { status: 500 });

  const header = [
    "Numéro", "Date", "Statut", "Prénom", "Nom", "Email", "Téléphone", "Réception",
    "Adresse", "Code postal", "Ville", "Pays", "Tirages", "Frais de port (€)", "Total (€)", "Message", "Notes internes",
  ];
  const lines = (data as Row[]).map((o) =>
    [
      formatOrderNumber(o.number),
      new Date(o.created_at).toLocaleDateString("fr-FR", { timeZone: "Europe/Paris" }),
      STATUS_LABELS[o.status],
      o.first_name,
      o.last_name,
      o.email,
      o.phone,
      o.delivery_method === "livraison" ? "Livraison" : "Retrait",
      o.address_line,
      o.postal_code,
      o.city,
      o.country,
      o.order_items
        .map((i) => `${i.quantity} × ${i.photo_title} (${i.format_label}${i.framed ? ", cadre" : ""})`)
        .join(" | "),
      euros(o.shipping_cents),
      euros(o.total_cents),
      o.message,
      o.internal_notes,
    ]
      .map(csvCell)
      .join(";"),
  );

  // BOM UTF-8 pour qu'Excel affiche correctement les accents.
  const csv = "﻿" + [header.join(";"), ...lines].join("\r\n");
  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="commandes-ines-b-${date}.csv"`,
    },
  });
}
