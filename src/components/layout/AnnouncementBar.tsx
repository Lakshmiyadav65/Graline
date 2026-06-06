import { getNextSaturday } from "@/lib/format";

const istDayMonth = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  weekday: "short",
  day: "numeric",
  month: "short",
});

/**
 * Slim paddy strip above the topbar that surfaces Grainline's defining
 * weekly rhythm — order-by + delivery date computed from the live Tue 21:00
 * IST cutoff. Server-rendered (no client hydration of the date).
 *
 * Full-width bleed: this component owns its own outer band; the max-w-app
 * wrapper is inside so the band stretches to the viewport edge.
 */
export function AnnouncementBar() {
  const sat = getNextSaturday();
  const satLabel = istDayMonth.format(sat); // e.g. "Sat, 16 May"

  return (
    <div className="bg-paddy text-cream">
      <div className="max-w-app mx-auto px-7 py-2 flex items-center justify-between gap-4 text-[11px] sm:text-[12px] font-mono">
        {/* Concise on phones, full from sm up — avoids truncation at 375px */}
        <p className="truncate">
          <span className="sm:hidden">
            By <span className="font-medium text-gold">Tue 9pm</span>
            {" · "}
            <span className="font-medium text-gold">{satLabel}</span>
          </span>
          <span className="hidden sm:inline">
            Order by <span className="font-medium text-gold">Tue 21:00 IST</span>
            {" · "}
            Delivery <span className="font-medium text-gold">{satLabel}</span>
          </span>
        </p>
        <p className="hidden md:block text-cream/70 whitespace-nowrap">
          Free home delivery over ₹2,000
        </p>
      </div>
    </div>
  );
}
