import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { FarmerCard } from "@/components/farmer/FarmerCard";
import { PriceBlock } from "@/components/listing/PriceBlock";
import { ListingActions } from "@/components/listing/ListingActions";
import { api } from "@/lib/api/client";
import { VARIETY_GRADIENT } from "@/lib/labels";
import { formatKg, formatDate } from "@/lib/format";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const res = await api.listings.get(params.id);
  if (!res.ok) return { title: "Listing — Grainline" };
  const l = res.data;
  const tLabels = await getTranslations("labels");
  const varietyLabel = l.variety === "other" && l.variety_other
    ? l.variety_other
    : tLabels(`variety.${l.variety}`);
  return { title: `${varietyLabel} · ${l.farmer.name} — Grainline` };
}

export default async function ListingPage({ params }: { params: { id: string } }) {
  const res = await api.listings.get(params.id);
  if (!res.ok || res.data.status !== "active") notFound();
  const l = res.data;

  const t = await getTranslations("listingDetail");
  const tLabels = await getTranslations("labels");
  const tCard = await getTranslations("listingCard");

  const title = l.variety === "other" && l.variety_other
    ? l.variety_other
    : tLabels(`variety.${l.variety}`);
  const words = title.split(" ");
  const head = words.slice(0, -1).join(" ");
  const last = words[words.length - 1];

  const specs: [string, string][] = [
    [t("specVariety"), tLabels(`variety.${l.variety}`)],
    [t("specType"), tLabels(`type.${l.type}`)],
    [t("specHarvest"), l.harvest_year ? `${l.harvest_year}${l.harvest_season ? ` (${tLabels(`season.${l.harvest_season}`)})` : ""}` : "—"],
    [t("specMilled"), l.milled_on ? formatDate(l.milled_on) : t("thisWeek", { defaultValue: "This week" })],
    [t("specAvailable"), t("inStock", { qty: formatKg(l.available_kg) })],
    [t("specCertification"), l.organic_certification ?? t("naturalUncertified")],
  ];

  return (
    <PageShell>
      <section className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-[60px] py-12">
        {/* Left: photo + thumbs */}
        <div>
          <div
            className="aspect-square rounded-card-lg relative overflow-hidden border border-line"
            style={{ background: VARIETY_GRADIENT[l.variety] }}
          >
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{ background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,.45), transparent 60%)" }}
            />
            {(l.is_organic || l.harvest_year) && (
              <span className="absolute top-[18px] left-[18px] bg-paddy text-cream text-[11px] tracking-[0.1em] uppercase px-3 py-1.5 rounded-[3px]">
                {l.is_organic ? tCard("organic") : t("fresh")}
                {l.harvest_year ? ` · ${l.harvest_year} ${t("harvestLabel")}` : ""}
              </span>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2.5 mt-3.5">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                aria-hidden="true"
                className={"aspect-square rounded-[4px] border border-line " + (i === 0 ? "outline outline-2 outline-ink outline-offset-2" : "")}
                style={{ background: VARIETY_GRADIENT[l.variety], opacity: i === 0 ? 1 : 0.7 }}
              />
            ))}
          </div>
        </div>

        {/* Right: details */}
        <div>
          <div className="text-[11px] tracking-[0.18em] uppercase text-paddy font-semibold mb-2.5">
            {tLabels(`variety.${l.variety}`)} · {t("villageLabel", { village: l.farmer.village.name })}
          </div>
          <h1
            className="font-serif font-normal leading-none tracking-[-0.02em] mb-3.5"
            style={{ fontSize: "clamp(40px, 6vw, 54px)" }}
          >
            {head ? <>{head} <em className="text-terra font-medium">{last}</em></> : <em className="text-terra font-medium">{last}</em>}
          </h1>

          <div className="my-5">
            <FarmerCard farmer={l.farmer} />
          </div>

          <PriceBlock pricePaise={l.price_per_kg} retailPaise={l.retail_paise} />

          {l.description && (
            <p className="text-[15px] leading-[1.7] text-ink-soft my-4">{l.description}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 border-t border-line-soft my-5">
            {specs.map(([k, v]) => (
              <div key={k} className="flex justify-between py-3.5 border-b border-line-soft text-[14px]">
                <span className="text-muted">{k}</span>
                <span className="font-medium text-right">{v}</span>
              </div>
            ))}
          </div>

          <ListingActions listing={l} />
        </div>
      </section>
    </PageShell>
  );
}
