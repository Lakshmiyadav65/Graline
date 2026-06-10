"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { useToast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/format";
import type { PendingFarmer, PendingVillage } from "@/lib/api/types";

export default function VerifyPage() {
  const [farmers, setFarmers] = useState<PendingFarmer[] | null>(null);
  const [villages, setVillages] = useState<PendingVillage[] | null>(null);
  const toast = useToast();

  useEffect(() => {
    api.admin.pendingFarmers().then((r) => setFarmers(r.ok ? r.data : []));
    api.admin.pendingVillages().then((r) => setVillages(r.ok ? r.data : []));
  }, []);

  async function actFarmer(id: string, approve: boolean) {
    const res = await api.admin.verifyFarmer(id, approve);
    if (!res.ok) { toast.show(res.error.message, "error"); return; }
    setFarmers((f) => (f ?? []).filter((x) => x.id !== id));
    toast.show(approve ? "Farmer verified — welcome WhatsApp queued." : "Farmer declined.", approve ? "success" : "info");
  }
  async function actVillage(id: string, approve: boolean) {
    const res = await api.admin.verifyVillage(id, approve);
    if (!res.ok) { toast.show(res.error.message, "error"); return; }
    setVillages((v) => (v ?? []).filter((x) => x.id !== id));
    toast.show(approve ? "Village verified." : "Village declined.", approve ? "success" : "info");
  }

  return (
    <div>
      <h1 className="font-serif text-[36px] font-normal tracking-[-0.02em] mb-7">Verification queue</h1>

      <section className="mb-10">
        <h2 className="font-serif text-[22px] font-medium mb-4">
          Farmers {farmers && <span className="text-muted text-[15px]">· {farmers.length}</span>}
        </h2>
        {farmers === null ? (
          <p className="text-muted text-[14px]">Loading…</p>
        ) : farmers.length === 0 ? (
          <p className="text-muted text-[14px]">No farmers pending. All caught up.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {farmers.map((f) => (
              <div key={f.id} className="p-4 border border-line bg-cream rounded-card">
                <div className="font-serif text-[18px] font-medium">{f.name}</div>
                <div className="text-[13px] text-muted mt-1">
                  {f.village_name} · {f.land_acres ? `${f.land_acres} acres` : "—"} · <span className="font-mono">{f.phone}</span>
                </div>
                <div className="text-[12px] text-muted mt-1">Enrolled {formatDate(f.enrolled_at)}</div>
                <div className="flex gap-2 mt-3">
                  <button type="button" onClick={() => actFarmer(f.id, true)} className="px-4 py-2 bg-paddy text-cream rounded-full text-[12px] font-semibold uppercase tracking-[0.04em] hover:bg-paddy-2 transition-colors">Verify</button>
                  <button type="button" onClick={() => actFarmer(f.id, false)} className="px-4 py-2 border border-line rounded-full text-[12px] font-medium hover:border-terra hover:text-terra transition-colors">Decline</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-serif text-[22px] font-medium mb-4">
          Villages {villages && <span className="text-muted text-[15px]">· {villages.length}</span>}
        </h2>
        {villages === null ? (
          <p className="text-muted text-[14px]">Loading…</p>
        ) : villages.length === 0 ? (
          <p className="text-muted text-[14px]">No villages pending.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {villages.map((v) => (
              <div key={v.id} className="p-4 border border-line bg-cream rounded-card">
                <div className="font-serif text-[18px] font-medium">{v.name}</div>
                <div className="text-[13px] text-muted mt-1">{v.district}, {v.state} · head {v.head_name} <span className="font-mono">{v.head_phone}</span></div>
                <div className="flex gap-2 mt-3">
                  <button type="button" onClick={() => actVillage(v.id, true)} className="px-4 py-2 bg-paddy text-cream rounded-full text-[12px] font-semibold uppercase tracking-[0.04em] hover:bg-paddy-2 transition-colors">Verify</button>
                  <button type="button" onClick={() => actVillage(v.id, false)} className="px-4 py-2 border border-line rounded-full text-[12px] font-medium hover:border-terra hover:text-terra transition-colors">Decline</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
