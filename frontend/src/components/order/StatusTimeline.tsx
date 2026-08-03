import type { Order, OrderStatus } from "@/lib/api/types";
import { formatDate } from "@/lib/format";
import { useTranslations } from "@/lib/translations";

const STEPS: OrderStatus[] = [
  "placed", "confirmed", "milling", "ready", "picked_up", "in_transit", "delivered",
];

/** Order progress. Horizontal on desktop, vertical on mobile. Matches the
 *  placed→delivered flow; completed=paddy, current=terra, future=muted. */
export function StatusTimeline({ order }: { order: Order }) {
  const tLabels = useTranslations("labels");
  const tTimeline = useTranslations("statusTimeline");

  if (order.status === "cancelled" || order.status === "disputed") {
    return (
      <div className="border border-line rounded-card-lg p-5 bg-cream">
        <span className="inline-flex items-center px-2.5 py-1.5 rounded-[3px] text-[11px] tracking-[0.08em] uppercase font-semibold bg-terra text-white">
          {tLabels(`orderStatus.${order.status}`)}
        </span>
        <p className="text-[13px] text-ink-soft mt-3">
          {order.status === "cancelled" ? tTimeline("cancelledNote") : tTimeline("disputedNote")}
        </p>
      </div>
    );
  }

  const currentIdx = STEPS.indexOf(order.status);
  const atFor = (s: OrderStatus) => order.status_history.find((h) => h.status === s)?.at;

  return (
    <ol className="flex flex-col sm:flex-row sm:items-start gap-0 sm:gap-2">
      {STEPS.map((step, i) => {
        const done = i < currentIdx;
        const current = i === currentIdx;
        const at = atFor(step);
        const dotCls = done
          ? "bg-paddy border-paddy"
          : current
          ? "bg-terra border-terra"
          : "bg-paper border-line";
        const textCls = done ? "text-paddy" : current ? "text-terra font-semibold" : "text-muted";
        return (
          <li key={step} className="flex sm:flex-col sm:flex-1 items-center sm:text-center gap-3 sm:gap-2">
            <div className="flex sm:flex-col items-center sm:w-full">
              <span className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 ${dotCls}`} aria-hidden="true" />
              {i < STEPS.length - 1 && (
                <span
                  className={
                    "hidden sm:block h-[2px] w-full mt-[-9px] " +
                    (i < currentIdx ? "bg-paddy" : "bg-line")
                  }
                  aria-hidden="true"
                />
              )}
            </div>
            <div className="pb-4 sm:pb-0">
              <div className={`text-[12px] ${textCls}`}>{tLabels(`orderStatus.${step}`)}</div>
              {at && <div className="text-[11px] text-muted mt-0.5">{formatDate(at)}</div>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
