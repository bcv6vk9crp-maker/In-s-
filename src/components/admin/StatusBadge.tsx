import { STATUS_LABELS, type OrderStatus } from "@/lib/orders";

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`status status-${status}`}>{STATUS_LABELS[status]}</span>;
}
