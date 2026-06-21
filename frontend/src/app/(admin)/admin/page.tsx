"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { KPICard } from "@/components/farmer/KPICard";
import { api } from "@/lib/api/client";
import { formatRupees } from "@/lib/format";
import type { AdminKpis } from "@/lib/api/types";

export default function AdminDashboardPage() {
  const [kpis, setKpis] = useState<AdminKpis | null>(null);
  const [pending, setPending] = useState<{ farmers: number; villages: number } | null>(null);

  useEffect(() => {
    api.admin.kpis().then((r) => { if (r.ok) setKpis(r.data); });
    Promise.all([api.admin.pendingFarmers(), api.admin.pendingVillages()]).then(([f, v]) => {
      setPending({ farmers: f.ok ? f.data.length : 0, villages: v.ok ? v.data.length : 0 });
    });
  }, []);

  return (
    <div>
      <h1 className="font-serif text-[36px] font-normal tracking-[-0.02em] mb-1.5">Operations</h1>
      <p className="text-muted text-[14px] mb-7">This week at a glance.</p>

      {!kpis ? (
        <div className="text-muted text-[14px] py-8">Loading metrics…</div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-8">
          <KPICard value={kpis.orders_this_week} label="Orders this week" />
          <KPICard value={formatRupees(kpis.gmv_paise)} label="GMV" />
          <KPICard value={kpis.active_farmers} label="Active farmers" />
          <KPICard value={kpis.active_customers} label="Active customers" />
          <KPICard value={formatRupees(kpis.aov_paise)} label="Avg order value" />
          <KPICard value={`${kpis.repeat_rate_pct}%`} label="Repeat rate" />
          <KPICard value={`${kpis.on_time_pct}%`} label="On-time delivery" />
          <KPICard value={`${kpis.qc_reject_pct}%`} label="QC reject rate" />
        </div>
      )}

      <h2 className="font-serif text-[22px] font-medium mb-4">Pending actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <ActionCard href="/admin/verify" count={pending?.farmers ?? 0} label="Farmers to verify" />
        <ActionCard href="/admin/verify" count={pending?.villages ?? 0} label="Villages to verify" />
        <ActionCard href="/admin/route" count={null} label="Plan this week's route →" />
      </div>
    </div>
  );
}

function ActionCard({ href, count, label }: { href: string; count: number | null; label: string }) {
  return (
    <Link href={href} className="block p-5 border border-line bg-cream rounded-card hover:border-ink transition-colors">
      {count !== null && <div className="font-serif text-[32px] font-semibold leading-none text-terra">{count}</div>}
      <div className={"text-[14px] " + (count !== null ? "text-muted mt-2" : "font-medium text-ink")}>{label}</div>
    </Link>
  );
}
