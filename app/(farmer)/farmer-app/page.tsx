"use client";

import { useEffect, useState } from "react";
import { KPICard } from "@/components/farmer/KPICard";
import { OrderRow } from "@/components/farmer/OrderRow";
import { api } from "@/lib/api/client";
import { formatRupees } from "@/lib/format";
import type { FarmerDashboard } from "@/lib/api/types";

export default function FarmerDashboardPage() {
  const [data, setData] = useState<FarmerDashboard | null>(null);

  useEffect(() => {
    api.farmer.me().then((r) => { if (r.ok) setData(r.data); });
  }, []);

  if (!data) return <div className="text-muted text-[14px] py-12">Loading dashboard…</div>;

  const { profile, stats, incoming_orders } = data;
  const firstName = profile.name.split(/\s+/)[0];

  return (
    <div>
      <h1 className="font-serif text-[36px] font-normal tracking-[-0.02em] mb-1.5">
        Good morning, <em className="text-terra not-italic italic">{firstName}</em>.
      </h1>
      <p className="text-muted text-[14px] mb-7">
        {incoming_orders.length} active order{incoming_orders.length === 1 ? "" : "s"} this week · pickup scheduled Friday morning
      </p>

      {profile.status === "pending" && (
        <div className="mb-7 px-4 py-3 bg-[#f5e7c2] text-[#8a6a1a] rounded-card text-[13px] font-medium">
          Your enrollment is pending verification. We&apos;ll review within a day — your listing goes live once approved.
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-8">
        <KPICard value={<>₹<em className="text-terra not-italic">{(stats.earned_this_week / 100).toLocaleString("en-IN")}</em></>} label="Earned this week" delta={`+ ${formatRupees(stats.delta_vs_last_week)} vs last week`} />
        <KPICard value={<>{stats.kg_sold_this_week}<span className="text-[14px] text-muted font-sans"> kg</span></>} label="Sold this week" delta={`${stats.active_orders} active orders`} />
        <KPICard value={<>₹<em className="text-terra not-italic">{stats.avg_price_per_kg / 100}</em></>} label="Your avg price/kg" delta={`vs ${formatRupees(stats.mandi_rate)} mandi rate`} />
        <KPICard value={<>{Math.round(stats.stock_remaining_kg)}<span className="text-[14px] text-muted font-sans"> kg</span></>} label="Stock remaining" />
      </div>

      <h2 className="font-serif text-[24px] font-medium mb-4">Incoming orders</h2>
      <div className="space-y-2.5">
        {incoming_orders.map((o) => <OrderRow key={o.order_number} order={o} />)}
      </div>

      <div className="mt-8 p-[18px] bg-cream border border-dashed border-terra rounded-card flex gap-3.5 items-center">
        <div className="font-serif text-[32px] text-terra leading-none">⌖</div>
        <div className="flex-1">
          <div className="font-serif text-[18px] font-medium">Pickup reminder</div>
          <div className="text-[13px] text-ink-soft mt-0.5">
            Our tempo arrives Friday between 7–9am. Have your sacks ready, weighed and labelled.
          </div>
        </div>
      </div>
    </div>
  );
}
