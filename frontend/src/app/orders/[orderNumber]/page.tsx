"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { Pill } from "@/components/ui/Pill";
import { StatusTimeline } from "@/components/order/StatusTimeline";
import { RequireRole } from "@/components/auth/RequireRole";
import { api } from "@/lib/api/client";
import { formatRupees, formatDate } from "@/lib/format";
import { orderStatusTone } from "@/lib/labels";
import type { Order } from "@/lib/api/types";
import { useTranslations } from "next-intl";

function OrderDetailInner() {
  const params = useParams<{ orderNumber: string }>();
  const orderNumber = params.orderNumber;
  const [order, setOrder] = useState<Order | null | "missing">(null);

  const t = useTranslations("orderDetail");
  const tCheckout = useTranslations("checkout");
  const tLabels = useTranslations("labels");

  useEffect(() => {
    if (!orderNumber) return;
    api.orders.get(orderNumber).then((r) => setOrder(r.ok ? r.data : "missing"));
  }, [orderNumber]);

  if (order === null) {
    return <PageShell><div className="py-24 text-center text-muted text-[14px]">{t("loading")}</div></PageShell>;
  }
  if (order === "missing") {
    return (
      <PageShell>
        <section className="py-20 text-center max-w-md mx-auto">
          <h1 className="font-serif text-[32px] mb-3">{t("notFoundTitle")}</h1>
          <p className="text-muted mb-6">{t("notFoundSub", { num: orderNumber })}</p>
          <Link href="/orders" className="inline-flex px-5 py-3 bg-ink text-paper rounded-full text-[13px] font-medium hover:bg-paddy transition-all">{t("backAll")}</Link>
        </section>
      </PageShell>
    );
  }

  const fulfillmentLabel = order.fulfillment_type === "farm_pickup" 
    ? tCheckout("farmPickup") 
    : order.fulfillment_type === "city_pickup_point" 
    ? tCheckout("cityPickup") 
    : tCheckout("homeDelivery");

  return (
    <PageShell>
      <section className="py-12 max-w-3xl">
        <Link href="/orders" className="text-[13px] text-ink-soft hover:text-ink">{t("backAll")}</Link>
        <div className="flex items-start justify-between gap-4 mt-4 mb-8 flex-wrap">
          <div>
            <div className="font-mono text-[13px] text-muted">{order.order_number}</div>
            <h1 className="font-serif text-[clamp(28px,4vw,40px)] font-normal mt-1">
              {formatRupees(order.total)}
            </h1>
            <div className="text-[13px] text-muted mt-1">
              {t("placedOn", { placed: formatDate(order.placed_at), delivery: formatDate(order.delivery_date) })}
            </div>
          </div>
          <Pill tone={orderStatusTone(order.status)}>{tLabels(`orderStatus.${order.status}`)}</Pill>
        </div>

        <div className="bg-cream border border-line rounded-card-lg p-6 mb-6">
          <StatusTimeline order={order} />
        </div>

        <div className="bg-cream border border-line rounded-card-lg p-6 mb-6">
          <h3 className="font-serif text-[18px] font-medium mb-4">{t("items")}</h3>
          {order.items.map((it, idx) => {
            const varietyLabel = it.variety === "other" && it.varietyName
              ? it.varietyName
              : tLabels(`variety.${it.variety}`);
            return (
              <div key={idx} className="flex justify-between py-2.5 border-b border-dashed border-line-soft last:border-b-0">
                <div>
                  <div className="font-serif text-[16px] font-medium">
                    {varietyLabel} · {it.pack_kg}kg × {it.qty}
                  </div>
                  <div className="text-[12px] text-muted">{it.farmer_name} · {it.village_name}</div>
                </div>
                <span className="font-mono font-semibold">{formatRupees(it.subtotal_paise)}</span>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-cream border border-line rounded-card-lg p-6">
            <h3 className="font-serif text-[18px] font-medium mb-3">{t("delivery")}</h3>
            <p className="text-[14px] text-ink-soft">{fulfillmentLabel}</p>
            {order.delivery_address && (
              <p className="text-[13px] text-muted mt-1">
                {order.delivery_address.line1}
                {order.delivery_address.line2 ? `, ${order.delivery_address.line2}` : ""}, {order.delivery_address.city} {order.delivery_address.pincode}
              </p>
            )}
          </div>
          <div className="bg-cream border border-line rounded-card-lg p-6">
            <h3 className="font-serif text-[18px] font-medium mb-3">{t("payment")}</h3>
            <p className="text-[14px] text-ink-soft">{t(`paymentMethods.${order.payment_method}`)}</p>
            <p className="text-[13px] text-muted mt-1">{t(`paymentStatus.${order.payment_status}`)}</p>
            <div className="mt-3 pt-3 border-t border-line-soft text-[13px] space-y-1">
              <div className="flex justify-between"><span className="text-muted">{t("subtotal")}</span><span className="font-mono">{formatRupees(order.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted">{t("deliveryFee")}</span><span className="font-mono">{order.delivery_fee === 0 ? tCheckout("free") : formatRupees(order.delivery_fee)}</span></div>
              {order.cod_fee > 0 && <div className="flex justify-between"><span className="text-muted">{t("cod")}</span><span className="font-mono">{formatRupees(order.cod_fee)}</span></div>}
              <div className="flex justify-between font-semibold"><span>{t("total")}</span><span className="font-mono">{formatRupees(order.total)}</span></div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

export default function OrderDetailPage() {
  return (
    <RequireRole role="customer">
      <OrderDetailInner />
    </RequireRole>
  );
}
