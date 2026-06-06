"use client";

import { useEffect, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { api } from "@/lib/api/client";
import { formatRupees } from "@/lib/format";
import { Pill, type PillTone } from "@/components/ui/Pill";
import type { FarmerDashboard, PayoutStatus } from "@/lib/api/types";

const PAYOUT_TONE: Record<PayoutStatus, PillTone> = {
  paid: "paddy", pending: "pending", processing: "confirmed", failed: "terra",
};

export default function EarningsPage() {
  const [data, setData] = useState<FarmerDashboard | null>(null);

  useEffect(() => {
    api.farmer.me().then((r) => { if (r.ok) setData(r.data); });
  }, []);

  if (!data) return <div className="text-muted text-[14px] py-12">Loading earnings…</div>;

  const chartData = data.weekly_earnings.map((w) => ({ week: w.week, rupees: Math.round(w.paise / 100) }));

  return (
    <div>
      <h1 className="font-serif text-[36px] font-normal tracking-[-0.02em] mb-1.5">
        Earnings &amp; <em className="text-terra not-italic italic">payouts</em>.
      </h1>
      <p className="text-muted text-[14px] mb-7">
        All-time {formatRupees(data.profile.total_earned)} across {data.profile.total_orders} orders ·
        {" "}{Math.round(data.profile.total_kg_sold)}kg sold.
      </p>

      <div className="border border-line bg-cream rounded-card-lg p-5 mb-8">
        <h2 className="font-serif text-[18px] font-medium mb-4">Weekly earnings</h2>
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ddd2b4" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 12, fill: "#6b6354" }} axisLine={{ stroke: "#cdc1a4" }} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#6b6354" }} axisLine={false} tickLine={false} width={48} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                cursor={{ fill: "rgba(45,74,43,0.06)" }}
                contentStyle={{ background: "#fbf6e7", border: "1px solid #cdc1a4", borderRadius: 6, fontSize: 13 }}
                formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Earned"]}
              />
              <Bar dataKey="rupees" fill="#2d4a2b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <h2 className="font-serif text-[24px] font-medium mb-4">Recent payouts</h2>
      <div className="space-y-2.5">
        {data.recent_payouts.map((p) => (
          <div key={p.week} className="flex items-center justify-between p-4 border border-line bg-cream rounded-card">
            <div>
              <div className="font-serif text-[16px] font-medium">{p.week}</div>
              <div className="text-[12px] text-muted">UPI · {data.profile.upi_id}</div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-mono font-semibold">{formatRupees(p.net_amount)}</span>
              <Pill tone={PAYOUT_TONE[p.status]}>{p.status}</Pill>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
