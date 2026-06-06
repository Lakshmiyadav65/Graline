"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { useToast } from "@/components/ui/Toast";
import { getMondayOfWeek, formatRupees, formatDate } from "@/lib/format";
import { Pill, type PillTone } from "@/components/ui/Pill";
import type { PayoutBatch, PayoutStatus } from "@/lib/api/types";

const TONE: Record<PayoutStatus, PillTone> = {
  paid: "paddy", pending: "pending", processing: "confirmed", failed: "terra",
};

export default function PayoutsPage() {
  const [batch, setBatch] = useState<PayoutBatch | null>(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const week = getMondayOfWeek().toISOString();

  useEffect(() => {
    api.admin.payoutBatch(week).then((r) => { if (r.ok) setBatch(r.data); });
  }, [week]);

  async function runAll() {
    setBusy(true);
    const r = await api.admin.runPayouts(week);
    setBusy(false);
    if (r.ok) { setBatch(r.data); toast.show("Payouts dispatched via RazorpayX.", "success"); }
    else toast.show(r.error.message, "error");
  }

  if (!batch) return <div className="text-muted text-[14px] py-12">Loading payouts…</div>;

  const anyPending = batch.rows.some((r) => r.status === "pending");

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-7 flex-wrap">
        <div>
          <h1 className="font-serif text-[36px] font-normal tracking-[-0.02em]">Payouts</h1>
          <p className="text-muted text-[14px] mt-1">
            Week of {formatDate(batch.week_of)} · net {formatRupees(batch.total_net)} to {batch.rows.length} farmers
          </p>
        </div>
        {anyPending && (
          <button type="button" onClick={runAll} disabled={busy} className="px-5 py-2.5 bg-paddy text-cream rounded-full text-[13px] font-semibold uppercase tracking-[0.04em] hover:bg-paddy-2 transition-colors disabled:opacity-60">
            {busy ? "Processing…" : "Process all →"}
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        {batch.rows.map((p) => (
          <div key={p.farmer_id} className="grid grid-cols-[1fr_auto] sm:grid-cols-[1.4fr_1fr_1fr_1fr_auto] gap-3 items-center p-4 border border-line bg-cream rounded-card">
            <div>
              <div className="font-serif text-[16px] font-medium">{p.farmer_name}</div>
              <div className="text-[12px] text-muted font-mono">{p.upi_id}</div>
            </div>
            <div className="hidden sm:block text-[13px] text-ink-soft">Gross {formatRupees(p.gross_amount)}</div>
            <div className="hidden sm:block text-[13px] text-muted">− fee {formatRupees(p.commission_deducted)}</div>
            <div className="hidden sm:block font-mono font-semibold">{formatRupees(p.net_amount)}</div>
            <span className="justify-self-end"><Pill tone={TONE[p.status]}>{p.status}</Pill></span>
          </div>
        ))}
      </div>
    </div>
  );
}
