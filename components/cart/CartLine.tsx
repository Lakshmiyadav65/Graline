"use client";

import { useCart, type CartItem } from "@/lib/cart";
import { VARIETY_GRADIENT, VARIETY_LABEL } from "@/lib/labels";
import { formatRupees } from "@/lib/format";
import type { RiceVariety } from "@/lib/api/types";

export function CartLine({ item }: { item: CartItem }) {
  const updateQty = useCart((s) => s.updateQty);
  const removeItem = useCart((s) => s.removeItem);
  const lineTotal = item.pricePerKgPaise * item.packKg * item.qty;
  const label = VARIETY_LABEL[item.variety as RiceVariety] ?? item.variety;

  return (
    <div className="grid grid-cols-[56px_1fr_auto] sm:grid-cols-[64px_1fr_auto] gap-3.5 py-3.5 border-b border-dashed border-line-soft items-center last:border-b-0">
      <div
        className="w-14 h-14 sm:w-16 sm:h-16 rounded-[5px]"
        style={{ background: VARIETY_GRADIENT[item.variety as RiceVariety] ?? "var(--line)" }}
        aria-hidden="true"
      />
      <div className="min-w-0">
        <div className="font-serif text-[16px] sm:text-[17px] font-medium">
          {label} · {item.packKg}kg
        </div>
        <div className="text-[12px] text-muted mt-0.5 truncate">
          {item.farmerName} · {item.villageName}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <div className="inline-flex items-center border border-line rounded-full overflow-hidden">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => updateQty(item.listingId, item.packKg, item.qty - 1)}
              className="w-7 h-7 grid place-items-center text-ink-soft hover:bg-paper-2 transition-colors"
            >
              −
            </button>
            <span className="w-8 text-center font-mono text-[13px]">{item.qty}</span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => updateQty(item.listingId, item.packKg, item.qty + 1)}
              className="w-7 h-7 grid place-items-center text-ink-soft hover:bg-paper-2 transition-colors"
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={() => removeItem(item.listingId, item.packKg)}
            className="text-[12px] text-terra hover:underline"
          >
            Remove
          </button>
        </div>
      </div>
      <div className="font-mono font-semibold text-right self-start pt-1">{formatRupees(lineTotal)}</div>
    </div>
  );
}
