"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Pill } from "@/components/ui/Pill";
import { RequireRole } from "@/components/auth/RequireRole";
import { api } from "@/lib/api/client";
import { formatRupees } from "@/lib/format";
import { orderStatusTone } from "@/lib/labels";
import type { Order } from "@/lib/api/types";
import { useTranslations } from "next-intl";

function itemSummary(order: Order, tLabels: any, t: any): string {
  const first = order.items[0];
  const varietyLabel = first 
    ? (first.variety === "other" && first.varietyName
        ? first.varietyName
        : tLabels(`variety.${first.variety}`))
    : "";
  const label = first ? `${varietyLabel} ${first.pack_kg}kg` : "";
  const extra = order.items.length - 1;
  return extra > 0 ? `${label} ${t("more", { count: extra })}` : label;
}

function OrdersInner() {
  const [orders, setOrders] = useState<Order[] | null>(null);

  const t = useTranslations("customerOrders");
  const tNav = useTranslations("navigation");
  const tLabels = useTranslations("labels");
  const tOrderDetail = useTranslations("orderDetail");

  useEffect(() => {
    api.orders.list().then((r) => setOrders(r.ok ? r.data : []));
  }, []);

  return (
    <PageShell>
      <section className="py-12">
        <Eyebrow>{tNav("myOrders")}</Eyebrow>
        <h1 className="font-serif text-[clamp(32px,5vw,48px)] font-normal mt-3.5 mb-8">
          {t.rich("history", {
            emHistory: (chunks) => <em className="text-terra font-medium">{chunks}</em>
          })}
        </h1>

        {orders === null ? (
          <div className="text-muted text-[14px] py-12">{tOrderDetail("loading")}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-line rounded-card-lg">
            <p className="font-serif text-[22px] mb-2">{t("noOrders")}</p>
            <Link href="/browse" className="inline-flex mt-3 px-5 py-3 bg-ink text-paper rounded-full text-[13px] font-medium hover:bg-paddy transition-all">{t("browseRiceBtn")} →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <Link
                key={o.id}
                href={`/orders/${o.order_number}`}
                className="grid grid-cols-[1fr_auto] sm:grid-cols-[100px_1fr_auto_110px] gap-3 sm:gap-4 items-center p-4 border border-line bg-cream rounded-card hover:border-ink transition-colors"
              >
                <span className="font-mono text-[12px] text-muted">{o.order_number}</span>
                <span className="font-serif text-[16px] font-medium order-3 sm:order-none col-span-2 sm:col-span-1">
                  {itemSummary(o, tLabels, t)}
                </span>
                <span className="hidden sm:block text-[13px] text-ink-soft font-mono">{formatRupees(o.total)}</span>
                <span className="justify-self-end">
                  <Pill tone={orderStatusTone(o.status)}>{tLabels(`orderStatus.${o.status}`)}</Pill>
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}

export default function OrdersPage() {
  return (
    <RequireRole role="customer">
      <OrdersInner />
    </RequireRole>
  );
}
