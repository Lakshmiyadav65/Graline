import { getNextSaturday } from "@/lib/format";
import { useTranslations, useLocale } from "next-intl";

/**
 * Slim paddy strip above the topbar that surfaces Grainline's defining
 * weekly rhythm — order-by + delivery date computed from the live Tue 21:00
 * IST cutoff.
 */
export function AnnouncementBar() {
  const t = useTranslations("announcement");
  const locale = useLocale();

  const istDayMonth = new Intl.DateTimeFormat(
    locale === "te" ? "te-IN" : locale === "hi" ? "hi-IN" : locale === "ta" ? "ta-IN" : "en-IN",
    {
      timeZone: "Asia/Kolkata",
      weekday: "short",
      day: "numeric",
      month: "short",
    }
  );

  const sat = getNextSaturday();
  const satLabel = istDayMonth.format(sat); // e.g. "Sat, 16 May"

  return (
    <div className="bg-paddy text-cream">
      <div className="max-w-app mx-auto px-7 py-2 flex items-center justify-between gap-4 text-[11px] sm:text-[12px] font-mono">
        {/* Concise on phones, full from sm up — avoids truncation at 375px */}
        <p className="truncate">
          <span className="sm:hidden">
            {t("by")} <span className="font-medium text-gold">Tue 9pm</span>
            {" · "}
            <span className="font-medium text-gold">{satLabel}</span>
          </span>
          <span className="hidden sm:inline">
            {t("orderBy")} <span className="font-medium text-gold">Tue 21:00 IST</span>
            {" · "}
            {t("delivery")} <span className="font-medium text-gold">{satLabel}</span>
          </span>
        </p>
        <p className="hidden md:block text-cream/70 whitespace-nowrap">
          {t("freeDelivery")}
        </p>
      </div>
    </div>
  );
}

