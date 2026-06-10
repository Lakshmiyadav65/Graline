"use client";

import { useState } from "react";
import { api } from "@/lib/api/client";
import { useToast } from "@/components/ui/Toast";
import type { VisualQuality } from "@/lib/api/types";

const QUALITIES: VisualQuality[] = ["excellent", "good", "acceptable", "reject"];

export function QCForm({
  routePlanId, farmerId, orderNumbers, onLogged,
}: {
  routePlanId: string;
  farmerId: string;
  orderNumbers: string[];
  onLogged: (q: VisualQuality) => void;
}) {
  const toast = useToast();
  const [weight, setWeight] = useState("");
  const [moisture, setMoisture] = useState("");
  const [broken, setBroken] = useState("");
  const [quality, setQuality] = useState<VisualQuality>("good");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!(Number(weight) > 0)) { toast.show("Enter the weighed kg.", "error"); return; }
    setBusy(true);
    const res = await api.admin.logQc({
      route_plan_id: routePlanId,
      farmer_id: farmerId,
      order_numbers: orderNumbers,
      weight_kg: Number(weight),
      moisture_pct: moisture ? Number(moisture) : undefined,
      broken_grain_pct: broken ? Number(broken) : undefined,
      visual_quality: quality,
      photos: [],
      notes: notes || undefined,
    });
    setBusy(false);
    if (!res.ok) { toast.show(res.error.message, "error"); return; }
    if (quality === "reject") toast.show("Marked reject — order cancelled + refund queued.", "info");
    else toast.show("QC logged — order marked picked up.", "success");
    onLogged(quality);
  }

  return (
    <div className="mt-3 p-3.5 border border-dashed border-line rounded-card bg-paper space-y-2.5">
      <div className="grid grid-cols-3 gap-2">
        <Num label="Weight kg" value={weight} onChange={setWeight} />
        <Num label="Moisture %" value={moisture} onChange={setMoisture} />
        <Num label="Broken %" value={broken} onChange={setBroken} />
      </div>
      <div>
        <div className="text-[11px] tracking-[0.12em] uppercase text-muted font-semibold mb-1.5">Visual quality</div>
        <div className="flex gap-1.5 flex-wrap">
          {QUALITIES.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setQuality(q)}
              className={
                "px-3 py-1.5 rounded-full text-[12px] border transition-colors " +
                (quality === q
                  ? q === "reject" ? "bg-terra text-white border-terra" : "bg-paddy text-cream border-paddy"
                  : "border-line text-ink-soft hover:border-ink")
              }
            >
              {q}
            </button>
          ))}
        </div>
      </div>
      <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)" className="w-full px-3 py-2 border border-line rounded-[5px] bg-paper text-[14px] focus:outline-none focus:border-ink" />
      <button type="button" onClick={submit} disabled={busy} className="px-4 py-2 bg-ink text-paper rounded-full text-[12px] font-semibold uppercase tracking-[0.04em] hover:bg-paddy transition-colors disabled:opacity-60">
        {busy ? "Saving…" : "Save QC"}
      </button>
    </div>
  );
}

function Num({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[11px] tracking-[0.12em] uppercase text-muted mb-1 font-semibold">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value.replace(/[^\d.]/g, ""))} inputMode="numeric" className="w-full px-2.5 py-2 border border-line rounded-[5px] bg-paper text-[14px] focus:outline-none focus:border-ink" />
    </div>
  );
}
