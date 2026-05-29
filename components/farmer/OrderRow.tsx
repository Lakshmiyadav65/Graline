import { Pill } from "@/components/ui/Pill";
import { ORDER_STATUS_LABEL, orderStatusTone, VARIETY_LABEL } from "@/lib/labels";
import { formatRupees, formatDate } from "@/lib/format";
import type { FarmerOrderRow } from "@/lib/api/types";

export function OrderRow({ order }: { order: FarmerOrderRow }) {
  return (
    <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[90px_1.4fr_1fr_1fr_110px] gap-3 sm:gap-3.5 items-center p-4 border border-line bg-cream rounded-card">
      <div className="font-mono text-[12px] text-muted">#{order.order_number}</div>
      <div className="col-span-2 sm:col-span-1 order-3 sm:order-none">
        <div className="font-serif text-[17px] font-medium">
          {VARIETY_LABEL[order.variety]} · {order.pack_kg}kg
        </div>
        <div className="text-[13px] text-ink-soft">{order.customer_label}</div>
      </div>
      <div className="hidden sm:block text-[13px] text-ink-soft">
        Pickup <em className="text-terra not-italic font-semibold">{formatDate(order.pickup_date)}</em>
      </div>
      <div className="hidden sm:block text-[13px] text-ink-soft">
        Earnings <strong>{formatRupees(order.earnings_paise)}</strong>
      </div>
      <span className="justify-self-end">
        <Pill tone={orderStatusTone(order.status)}>{ORDER_STATUS_LABEL[order.status]}</Pill>
      </span>
    </div>
  );
}
