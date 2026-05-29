"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { useToast } from "@/components/ui/Toast";
import { QCForm } from "@/components/admin/QCForm";
import { Pill } from "@/components/ui/Pill";
import { formatDate } from "@/lib/format";
import type { RoutePlan, VisualQuality } from "@/lib/api/types";

const FULFILLMENT_LABEL: Record<string, string> = {
  farm_pickup: "Farm pickup", city_pickup_point: "City pickup point", home_delivery: "Home delivery",
};

export default function RoutePlanPage() {
  const [plan, setPlan] = useState<RoutePlan | null | "none">(null);
  const [qcOpen, setQcOpen] = useState<string | null>(null);
  const [qcDone, setQcDone] = useState<Record<string, VisualQuality>>({});
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  useEffect(() => {
    api.admin.routePlans().then((r) => setPlan(r.ok && r.data.length ? r.data[0] : "none"));
  }, []);

  async function generate() {
    setBusy(true);
    const r = await api.admin.generateRoutePlan();
    setBusy(false);
    if (r.ok) { setPlan(r.data); toast.show("Draft route generated from confirmed orders.", "success"); }
    else toast.show(r.error.message, "error");
  }

  async function confirm() {
    if (!plan || plan === "none") return;
    setBusy(true);
    const r = await api.admin.confirmRoutePlan(plan.week_of);
    setBusy(false);
    if (r.ok) { setPlan({ ...plan, status: "confirmed" }); toast.show("Route confirmed — pickup reminders + delivery confirmations queued.", "success"); }
    else toast.show(r.error.message, "error");
  }

  if (plan === null) return <div className="text-muted text-[14px] py-12">Loading route…</div>;

  if (plan === "none") {
    return (
      <div>
        <h1 className="font-serif text-[36px] font-normal tracking-[-0.02em] mb-2">Route planner</h1>
        <p className="text-muted text-[14px] mb-6">No plan for this week yet.</p>
        <button type="button" onClick={generate} disabled={busy} className="px-5 py-3 bg-ink text-paper rounded-full text-[13px] font-medium hover:bg-paddy transition-all disabled:opacity-60">
          {busy ? "Generating…" : "Generate this week's route →"}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-7 flex-wrap">
        <div>
          <h1 className="font-serif text-[36px] font-normal tracking-[-0.02em]">Route planner</h1>
          <p className="text-muted text-[14px] mt-1">
            Week of {formatDate(plan.week_of)} · {plan.vehicle ?? "—"} · driver {plan.driver_name ?? "—"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Pill tone={plan.status === "confirmed" ? "paddy" : "pending"}>{plan.status}</Pill>
          {plan.status === "draft" && (
            <button type="button" onClick={confirm} disabled={busy} className="px-5 py-2.5 bg-paddy text-cream rounded-full text-[13px] font-semibold uppercase tracking-[0.04em] hover:bg-paddy-2 transition-colors disabled:opacity-60">
              Confirm &amp; notify
            </button>
          )}
        </div>
      </div>

      {/* Pickups */}
      <h2 className="font-serif text-[22px] font-medium mb-4">Pickups</h2>
      <div className="space-y-4 mb-10">
        {plan.pickups.map((p) => (
          <div key={p.village_id} className="border border-line bg-cream rounded-card-lg p-5">
            <div className="flex justify-between items-start gap-4 flex-wrap">
              <div>
                <div className="font-serif text-[20px] font-medium">{p.village_name}</div>
                <div className="text-[12px] text-muted mt-0.5">{p.hub_address}</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[13px]">{p.arrival_time}</div>
                <div className="text-[12px] text-muted">{p.total_kg} kg total</div>
              </div>
            </div>
            <div className="mt-4 space-y-2.5">
              {p.farmer_orders.map((fo) => {
                const key = `${p.village_id}:${fo.farmer_id}`;
                const logged = qcDone[key];
                return (
                  <div key={fo.farmer_id} className="border-t border-dashed border-line-soft pt-2.5">
                    <div className="flex justify-between items-center gap-3 flex-wrap">
                      <div>
                        <span className="font-medium text-[15px]">{fo.farmer_name}</span>
                        <span className="text-[12px] text-muted ml-2">{fo.order_numbers.join(", ")} · {fo.total_kg}kg</span>
                      </div>
                      {logged ? (
                        <Pill tone={logged === "reject" ? "terra" : "paddy"}>QC: {logged}</Pill>
                      ) : (
                        <button type="button" onClick={() => setQcOpen(qcOpen === key ? null : key)} className="px-3.5 py-1.5 border border-ink rounded-full text-[12px] font-medium hover:bg-ink hover:text-paper transition-all">
                          {qcOpen === key ? "Close" : "Log QC"}
                        </button>
                      )}
                    </div>
                    {qcOpen === key && !logged && (
                      <QCForm
                        routePlanId={plan.id}
                        farmerId={fo.farmer_id}
                        orderNumbers={fo.order_numbers}
                        onLogged={(q) => { setQcDone((d) => ({ ...d, [key]: q })); setQcOpen(null); }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Deliveries */}
      <h2 className="font-serif text-[22px] font-medium mb-4">Deliveries</h2>
      <div className="space-y-2.5">
        {plan.deliveries.map((d, i) => (
          <div key={i} className="flex justify-between items-center p-4 border border-line bg-cream rounded-card">
            <div>
              <div className="font-medium text-[15px]">{d.label}</div>
              <div className="text-[12px] text-muted">{FULFILLMENT_LABEL[d.type]} · {d.order_numbers.join(", ")}</div>
            </div>
            <div className="font-mono text-[13px] text-ink-soft">{d.arrival_window}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
