import "server-only";
import { Resend } from "resend";
import type { Settings } from "@/lib/data";
import { env } from "@/lib/env";
import type { OrderInput } from "@/lib/order-schema";
import { formatEuros, sizeLabel, type Size } from "@/lib/pricing";

type Line = {
  photo_title: string;
  size: Size;
  framed: boolean;
  unit_price_cents: number;
  quantity: number;
};

type OrderEmail = {
  id: string;
  number: string;
  order: OrderInput;
  lines: Line[];
  total: number;
  settings: Settings;
};

function esc(value: string | null | undefined): string {
  return (value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function layout(body: string): string {
  return `<!doctype html><html><body style="margin:0;background:#fceee6;font-family:Helvetica,Arial,sans-serif;color:#2e1a26">
<div style="max-width:560px;margin:0 auto;padding:28px 20px">
<p style="font-size:24px;font-weight:700;margin:0 0 20px">Ines<span style="color:#7a2e4e">.</span> B</p>
<div style="background:#ffffff;border-radius:14px;padding:24px;font-size:15px;line-height:1.55">${body}</div>
</div></body></html>`;
}

function linesTable(lines: Line[], total: number, en: boolean): string {
  const rows = lines
    .map(
      (l) => `<tr>
<td style="padding:6px 0">${l.quantity} × ${esc(l.photo_title)}<br><span style="color:#7c5e68;font-size:13px">${sizeLabel(l.size)} · ${l.framed ? (en ? "framed" : "avec cadre") : en ? "no frame" : "sans cadre"}</span></td>
<td style="padding:6px 0;text-align:right;white-space:nowrap">${formatEuros(l.unit_price_cents * l.quantity, en ? "en" : "fr")}</td>
</tr>`,
    )
    .join("");
  return `<table style="width:100%;border-collapse:collapse">${rows}
<tr><td style="padding-top:10px;border-top:1px solid #ebd3c8;font-weight:700">${en ? "Estimated total" : "Total estimé"}</td>
<td style="padding-top:10px;border-top:1px solid #ebd3c8;font-weight:700;text-align:right">${formatEuros(total, en ? "en" : "fr")}</td></tr></table>`;
}

function address(o: OrderInput): string {
  if (o.deliveryMethod === "retrait") return "Retrait en main propre";
  return `Livraison : ${esc(o.addressLine)}, ${esc(o.postalCode)} ${esc(o.city)}, ${esc(o.country)}`;
}

export async function sendOrderEmails(e: OrderEmail): Promise<void> {
  if (!env.resendApiKey) {
    console.warn(`RESEND_API_KEY absente : aucun email envoyé pour la commande ${e.number}.`);
    return;
  }
  const resend = new Resend(env.resendApiKey);
  const inesEmail = e.settings.notification_email || env.adminEmail;
  const o = e.order;
  const en = o.locale === "en";

  const alert = layout(`
<p style="margin:0 0 12px;font-size:18px;font-weight:700">Nouvelle commande ${e.number}</p>
<p style="margin:0 0 16px">${esc(o.firstName)} ${esc(o.lastName)} souhaite commander :</p>
${linesTable(e.lines, e.total, false)}
<p style="margin:18px 0 0"><b>Email :</b> ${esc(o.email)}<br>
<b>Téléphone :</b> ${esc(o.phone) || "non renseigné"}<br>
<b>Réception :</b> ${address(o)}</p>
${o.message ? `<p style="margin:12px 0 0"><b>Message :</b><br>${esc(o.message).replace(/\n/g, "<br>")}</p>` : ""}
<p style="margin:20px 0 0"><a href="${env.siteUrl}/admin/commandes/${e.id}" style="color:#7a2e4e">Ouvrir la commande dans l'espace admin</a></p>
<p style="margin:12px 0 0;color:#7c5e68;font-size:13px">Répondez directement à cet email pour écrire à l'acheteur.</p>`);

  const recap = layout(
    en
      ? `<p style="margin:0 0 12px;font-size:18px;font-weight:700">Thank you, ${esc(o.firstName)}!</p>
<p style="margin:0 0 16px">Your order ${e.number} has been sent to Ines. No payment has been taken: she will contact you shortly to confirm it and arrange payment${o.deliveryMethod === "livraison" ? " and shipping costs" : ""}.</p>
${linesTable(e.lines, e.total, true)}
<p style="margin:18px 0 0;color:#7c5e68;font-size:13px">You can reply to this email to reach Ines.</p>`
      : `<p style="margin:0 0 12px;font-size:18px;font-weight:700">Merci ${esc(o.firstName)} !</p>
<p style="margin:0 0 16px">Votre commande ${e.number} a bien été transmise à Ines. Aucun paiement n'a été effectué : elle vous recontacte très vite pour la confirmer et convenir du paiement${o.deliveryMethod === "livraison" ? " et des frais de port" : ""}.</p>
${linesTable(e.lines, e.total, false)}
<p style="margin:18px 0 0;color:#7c5e68;font-size:13px">Vous pouvez répondre à cet email pour écrire à Ines.</p>`,
  );

  const results = await Promise.allSettled([
    resend.emails.send({
      from: env.emailFrom,
      to: inesEmail,
      replyTo: o.email,
      subject: `Nouvelle commande ${e.number} · ${o.firstName} ${o.lastName}`,
      html: alert,
    }),
    resend.emails.send({
      from: env.emailFrom,
      to: o.email,
      replyTo: inesEmail,
      subject: en ? `Your order ${e.number} · Ines. B` : `Votre commande ${e.number} · Ines. B`,
      html: recap,
    }),
  ]);
  for (const r of results) {
    if (r.status === "rejected") console.error("Email non envoyé", r.reason);
    else if (r.value.error) console.error("Email refusé par Resend", r.value.error);
  }
}
