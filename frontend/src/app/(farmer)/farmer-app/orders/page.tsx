"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api/client";
import { useToast } from "@/components/ui/Toast";
import { Pill } from "@/components/ui/Pill";
import { formatRupees, formatDate } from "@/lib/format";
import { orderStatusTone } from "@/lib/labels";
import type { FarmerOrderRow, OrderStatus } from "@/lib/api/types";
import { useTranslations } from "@/lib/translations";

export default function FarmerOrdersPage() {
  const toast = useToast();
  const t = useTranslations("farmerOrders");
  const tLabels = useTranslations("labels");

  const [orders, setOrders] = useState<FarmerOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    const res = await api.farmer.me();
    setLoading(false);
    if (res.ok) {
      setOrders(res.data.incoming_orders || []);
    } else {
      toast.show(res.error.message, "error");
    }
  }, [toast]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  async function handleStatusChange(orderNumber: string, action: string) {
    setUpdatingId(orderNumber);
    const res = await api.farmer.orderAction(orderNumber, action as any);
    setUpdatingId(null);

    if (res.ok) {
      toast.show(t("updatedSuccess"), "success");
      // Update local state
      setOrders((prev) =>
        prev.map((o) => (o.order_number === orderNumber ? { ...o, status: res.data.status } : o))
      );
    } else {
      toast.show(res.error.message, "error");
    }
  }

  if (loading) {
    return <div className="py-24 text-center text-muted">{t("loading")}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 mb-7 flex-wrap">
        <h1 className="font-serif text-[36px] font-normal tracking-[-0.02em]">{t("title")}</h1>
      </div>

      {orders.length === 0 ? (
        <div className="p-12 bg-cream border border-line rounded-card text-center text-muted">
          <p className="font-serif text-[20px] mb-2">{t("noOrders")}</p>
          <p className="text-[14px]">{t("noOrdersSub")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div
              key={o.order_number}
              className="p-5 border border-line bg-cream rounded-card grid grid-cols-1 md:grid-cols-[100px_1.5fr_1.2fr_1.2fr_auto] gap-4 items-center"
            >
              {/* Order number */}
              <div className="font-mono text-[13px] text-ink font-semibold">#{o.order_number}</div>

              {/* Rice variety & Quantity */}
              <div>
                <h3 className="font-serif text-[18px] font-medium text-ink">
                  {tLabels(`variety.${o.variety}`)} · {o.pack_kg}kg
                </h3>
                <div className="text-[13px] text-muted">{t("qty", { qty: o.qty })}</div>
              </div>

              {/* Customer */}
              <div>
                <span className="text-[11px] tracking-[0.1em] uppercase text-muted font-bold block mb-0.5">
                  {t("customer")}
                </span>
                <span className="text-[14px] text-ink font-medium">{o.customer_label}</span>
              </div>

              {/* Date & Earnings */}
              <div>
                <span className="text-[11px] tracking-[0.1em] uppercase text-muted font-bold block mb-0.5">
                  {t("earnings")}
                </span>
                <span className="text-[14px] text-ink font-mono font-medium block">
                  {formatRupees(o.earnings_paise)}
                </span>
                <span className="text-[12px] text-muted">
                  {t("pickup", { date: formatDate(o.pickup_date) })}
                </span>
              </div>

              {/* Actions & Status */}
              <div className="flex items-center gap-3 justify-end md:justify-self-end w-full md:w-auto">
                <Pill tone={orderStatusTone(o.status)} className="mr-2">
                  {tLabels(`orderStatus.${o.status}`)}
                </Pill>

                <select
                  value={o.status === "cancelled" ? "cancel" : o.status === "confirmed" ? "confirm" : o.status}
                  disabled={updatingId === o.order_number}
                  onChange={(e) => handleStatusChange(o.order_number, e.target.value)}
                  className="px-3 py-2 border border-line rounded-[5px] bg-paper text-[13px] focus:outline-none focus:border-ink"
                >
                  <option value="pending">{t("statusPending")}</option>
                  <option value="confirm">{t("statusConfirm")}</option>
                  <option value="packed">{t("statusPacked")}</option>
                  <option value="out_for_delivery">{t("statusOutForDelivery")}</option>
                  <option value="delivered">{t("statusDelivered")}</option>
                  <option value="cancel">{t("statusCancel")}</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
