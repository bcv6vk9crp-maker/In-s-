"use client";

import { MAX_QUANTITY } from "@/lib/pricing";

export function QuantityInput({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (value: number) => void;
  label: string;
}) {
  return (
    <div className="qty" role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="−1">
        −
      </button>
      <output aria-live="polite">{value}</output>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= MAX_QUANTITY}
        aria-label="+1"
      >
        +
      </button>
    </div>
  );
}
