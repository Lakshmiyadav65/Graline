import { customerService } from "@/services/customer.service";
import { createClient } from "@/server/supabase/server";
import { PageShell } from "@/components/layout/PageShell";
import { formatRupees } from "@/lib/format";
import { Pill, type PillTone } from "@/components/ui/Pill";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

const STATUS_TONE: Record<string, PillTone> = {
  placed: "pending",
  pending: "pending",
  confirmed: "confirmed",
  milling: "confirmed",
  packed: "ready",
  ready: "ready",
  shipped: "paddy",
  picked_up: "confirmed",
  in_transit: "confirmed",
  out_for_delivery: "paddy",
  "out for delivery": "paddy",
  delivered: "neutral",
  cancelled: "terra",
  disputed: "terra"
};

export default async function CustomerOrdersPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const t = await getTranslations("customerOrders");
  const tLabels = await getTranslations("labels");

  if (!user) {
    return <PageShell><div className="text-muted text-[14px] py-12 text-center">{t("pleaseLogin")}</div></PageShell>;
  }

  const orders = await customerService.getMyOrders(user.id);

  return (
    <PageShell>
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
          <h1 className="font-serif text-[36px] font-normal tracking-[-0.02em]">
            {t("title")}
          </h1>
          <Link href="/account" className="text-[13px] text-ink-soft hover:text-ink">
            {t("backAccount")}
          </Link>
        </div>

        {!orders || orders.length === 0 ? (
          <div className="text-center py-12 bg-cream border border-line rounded-card">
            <h2 className="font-serif text-[24px] mb-2">{t("noOrders")}</h2>
            <p className="text-muted mb-6">{t("noOrdersSub")}</p>
            <Link href="/browse" className="px-5 py-2.5 bg-paddy text-white rounded-full font-medium">{t("browseRiceBtn")}</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o: any) => (
              <div key={o.id} className="border border-line bg-paper rounded-card overflow-hidden">
                <div className="p-4 bg-cream border-b border-line flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <div className="text-[12px] text-muted font-mono mb-1">{new Date(o.created_at).toLocaleDateString()}</div>
                    <div className="font-medium">{t("orderNum", { num: o.order_number })}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-medium mb-1">{formatRupees(o.total_amount * 100)}</div>
                    <Pill tone={STATUS_TONE[o.status] || "neutral"}>{tLabels(`orderStatus.${o.status}`)}</Pill>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {o.order_items?.map((item: any) => {
                    const varietyLabel = item.listings?.rice_variety === "other" && item.listings?.rice_variety_other
                      ? item.listings?.rice_variety_other
                      : tLabels(`variety.${item.listings?.rice_variety}`);
                    return (
                      <div key={item.id} className="flex justify-between text-[14px]">
                        <div>
                          <span className="font-medium">{varietyLabel}</span>
                          <span className="text-muted ml-2">x {item.quantity_kg} kg</span>
                        </div>
                        <div className="font-mono text-muted">{formatRupees(item.price_per_kg * item.quantity_kg * 100)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
