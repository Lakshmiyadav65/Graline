import Link from "next/link";
import type { Listing } from "@/lib/api/types";
import { VARIETY_GRADIENT } from "@/lib/labels";
import { formatRupees } from "@/lib/format";
import { useTranslations } from "next-intl";

function badgeKeyFor(l: Listing): string | null {
  if (l.is_organic) return "organic";
  if ((l.harvest_year ?? 0) >= 2025) return "newHarvest";
  if ((l.harvest_year ?? 9999) <= 2023) return "aged";
  return null;
}

/** Listing card. Server or Client Component. Matches DESIGN.html .listing. */
export function ListingCard({ listing }: { listing: Listing }) {
  const t = useTranslations("listingCard");
  const tLabels = useTranslations("labels");

  const badgeKey = badgeKeyFor(listing);
  const badgeCls = badgeKey === "organic" ? "bg-paddy" : badgeKey === "newHarvest" ? "bg-terra" : "bg-ink";
  const soldOut = listing.available_kg <= 0 || listing.status === "out_of_stock";

  const varietyLabel = listing.variety === "other" && listing.variety_other
    ? listing.variety_other
    : tLabels(`variety.${listing.variety}`);

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group flex flex-col bg-cream border border-line rounded-card overflow-hidden transition-transform duration-200 hover:-translate-y-[3px] hover:shadow-soft"
    >
      {/* Photo placeholder — per-variety gradient (real photos render in prod) */}
      <div
        className="relative aspect-[4/3] overflow-hidden"
        style={{ background: VARIETY_GRADIENT[listing.variety] }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,.4), transparent 60%)" }}
        />
        {badgeKey && (
          <span className={`absolute top-3 left-3 ${badgeCls} text-paper text-[11px] tracking-[0.08em] uppercase px-2.5 py-1 rounded-[3px] font-medium`}>
            {t(badgeKey)}
          </span>
        )}
        {soldOut && (
          <span className="absolute top-3 right-3 bg-ink/80 text-paper text-[11px] tracking-[0.08em] uppercase px-2.5 py-1 rounded-[3px] font-medium">
            {t("soldOut")}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-[18px] pb-5 flex flex-col flex-1">
        <div className="font-serif text-[22px] font-medium tracking-[-0.01em] leading-[1.1]">
          {varietyLabel}
        </div>
        <div className="text-[13px] text-muted mt-1.5">
          {t("by")} <strong className="text-ink-soft font-medium">{listing.farmer.name}</strong> · {listing.farmer.village.name}
        </div>

        <div className="flex justify-between items-end mt-3.5 pt-3.5 border-t border-dashed border-line-soft">
          <div>
            <div className="font-serif text-[26px] font-semibold text-ink tracking-[-0.01em] leading-none">
              {formatRupees(listing.price_per_kg)}
              <span className="font-sans text-[12px] text-muted font-normal ml-0.5">/kg</span>
            </div>
            <div className="text-[11px] text-terra font-medium mt-1">
              {t("vsRetail", { price: formatRupees(listing.retail_paise) })}
            </div>
          </div>
          <div className="text-[12px] font-medium text-right">
            {soldOut ? (
              <span className="text-muted">{t("outOfStock")}</span>
            ) : (
              <span className="text-paddy">{t("available", { qty: Math.round(listing.available_kg) })}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
