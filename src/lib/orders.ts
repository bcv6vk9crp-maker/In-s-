export const ORDER_STATUSES = ["nouvelle", "contactee", "payee", "livree", "annulee"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  nouvelle: "Nouvelle",
  contactee: "Contactée",
  payee: "Payée",
  livree: "Expédiée / remise",
  annulee: "Annulée",
};

export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === "string" && (ORDER_STATUSES as readonly string[]).includes(value);
}

/** Valeurs qui remplacent les données personnelles lors de l'anonymisation. */
export const ANONYMIZED_FIELDS = {
  first_name: "Anonyme",
  last_name: "",
  email: "anonymise@invalid",
  phone: null,
  address_line: null,
  postal_code: null,
  city: null,
  country: null,
  message: null,
  internal_notes: "",
} as const;

export const RETENTION_DAYS = 365;

export function retentionCutoff(now: Date = new Date()): Date {
  return new Date(now.getTime() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
}

export function slugify(text: string): string {
  return (
    text
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "photo"
  );
}

/** Champ texte de CSV (séparateur « ; ») avec guillemets si nécessaire. */
export function csvCell(value: string | number | null | undefined): string {
  const s = value === null || value === undefined ? "" : String(value);
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
