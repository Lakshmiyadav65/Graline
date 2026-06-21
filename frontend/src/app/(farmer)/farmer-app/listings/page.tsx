import Link from "next/link";
import { farmerService } from "@/services/farmer.service";
import { createClient } from "@/server/supabase/server";
import { formatRupees, formatKg } from "@/lib/format";
import { Pill, type PillTone } from "@/components/ui/Pill";
import type { ListingStatus, RiceVariety } from "@/lib/api/types";
import { getTranslations } from "next-intl/server";

const STATUS_TONE: Record<ListingStatus, PillTone> = {
  active: "paddy", draft: "neutral", paused: "pending", out_of_stock: "terra", archived: "neutral",
};

export default async function FarmerListingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const t = await getTranslations("farmerListings");
  const tLabels = await getTranslations("labels");
  const tEdit = await getTranslations("editListing");

  if (!user) {
    return <div className="text-muted text-[14px] py-12">{t("pleaseLogin")}</div>;
  }

  const listings = await farmerService.getMyListings(user.id);

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-7 flex-wrap">
        <h1 className="font-serif text-[36px] font-normal tracking-[-0.02em]">{t("title")}</h1>
        <Link
          href="/farmer-app/listings/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-ink text-paper rounded-full text-[13px] font-medium hover:bg-paddy transition-all"
        >
          {t("addListing")}
        </Link>
      </div>

      {!listings || listings.length === 0 ? (
        <p className="text-muted text-[14px]">{t("noListings")}</p>
      ) : (
        <div className="space-y-2.5">
          {listings.map((l: any) => {
            const statusKey = `status${(l.status || "active").split("_").map((p: string) => p[0].toUpperCase() + p.slice(1)).join("")}`;
            const statusLabel = tEdit(statusKey as any);
            const varietyLabel = l.rice_variety === "other" && l.rice_variety_other
              ? l.rice_variety_other
              : tLabels(`variety.${l.rice_variety}`);

            return (
              <div key={l.id} className="grid grid-cols-[1fr_auto] sm:grid-cols-[1.5fr_1fr_1fr_auto_auto] gap-3 items-center p-4 border border-line bg-cream rounded-card">
                <div className="font-serif text-[17px] font-medium">{varietyLabel}</div>
                <div className="hidden sm:block text-[13px] text-ink-soft">{t("inStock", { qty: formatKg(l.stock_kg) })}</div>
                <div className="hidden sm:block font-mono text-[14px]">{formatRupees(l.price_per_kg * 100)}/kg</div>
                <span className="justify-self-end"><Pill tone={STATUS_TONE[(l.status as ListingStatus) || "active"]}>{statusLabel}</Pill></span>
                <Link href={`/farmer-app/listings/edit/${l.id}`} className="text-[13px] text-terra font-semibold hover:underline uppercase tracking-wider ml-2">{t("edit")}</Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
