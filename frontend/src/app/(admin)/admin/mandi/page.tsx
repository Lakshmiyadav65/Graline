"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { useToast } from "@/components/ui/Toast";
import { formatRupees, formatDate } from "@/lib/format";
import type { MandiPriceRow } from "@/lib/api/types";

export default function MandiPage() {
  const [rows, setRows] = useState<MandiPriceRow[] | null>(null);
  const [commodity, setCommodity] = useState("");
  const [market, setMarket] = useState("Hyderabad retail (avg)");
  const [state, setState] = useState("");
  const [priceRupees, setPriceRupees] = useState("");
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  useEffect(() => {
    api.admin.mandiPrices().then((r) => setRows(r.ok ? r.data : []));
  }, []);

  async function add() {
    if (!commodity.trim() || !state.trim() || !(Number(priceRupees) > 0)) { toast.show("Enter a commodity, state and price.", "error"); return; }
    setBusy(true);
    const r = await api.admin.addMandiPrice({
      commodity: commodity.trim(),
      market,
      state: state.trim(),
      modal_price: Math.round(Number(priceRupees) * 100),
      date: new Date().toISOString(),
    });
    setBusy(false);
    if (!r.ok) { toast.show(r.error.message, "error"); return; }
    setRows((rs) => [r.data, ...(rs ?? [])]);
    setCommodity(""); setPriceRupees("");
    toast.show("Mandi price added.", "success");
  }

  return (
    <div>
      <h1 className="font-serif text-[36px] font-normal tracking-[-0.02em] mb-2">Mandi prices</h1>
      <p className="text-muted text-[14px] mb-6">
        Reference rates that power the &ldquo;vs retail&rdquo; comparison. Synced daily from Agmarknet
        (cron in BE-M6); add overrides here.
      </p>

      <div className="border border-line bg-cream rounded-card-lg p-4 mb-8 grid grid-cols-1 sm:grid-cols-[1.2fr_1.2fr_1.2fr_1fr_auto] gap-3 items-end">
        <Field label="Commodity"><input value={commodity} onChange={(e) => setCommodity(e.target.value)} placeholder="retail_sona_masuri" className={inputCls} /></Field>
        <Field label="State"><input value={state} onChange={(e) => setState(e.target.value)} placeholder="e.g. Karnataka" className={inputCls} /></Field>
        <Field label="Market"><input value={market} onChange={(e) => setMarket(e.target.value)} className={inputCls} /></Field>
        <Field label="Modal ₹/kg"><input value={priceRupees} onChange={(e) => setPriceRupees(e.target.value.replace(/[^\d.]/g, ""))} inputMode="numeric" placeholder="85" className={inputCls} /></Field>
        <button type="button" onClick={add} disabled={busy} className="px-5 py-3 bg-ink text-paper rounded-full text-[13px] font-medium hover:bg-paddy transition-all disabled:opacity-60 whitespace-nowrap">Add</button>
      </div>

      {rows === null ? (
        <p className="text-muted text-[14px]">Loading…</p>
      ) : (
        <div className="space-y-2.5">
          {rows.map((m) => (
            <div key={m.id} className="grid grid-cols-[1fr_auto] sm:grid-cols-[1.4fr_1.4fr_1fr_auto] gap-3 items-center p-3.5 border border-line bg-cream rounded-card">
              <span className="font-mono text-[13px]">{m.commodity}</span>
              <span className="hidden sm:block text-[13px] text-ink-soft">{m.market}</span>
              <span className="font-mono text-[14px] font-semibold">{formatRupees(m.modal_price)}/kg</span>
              <span className="justify-self-end text-[12px] text-muted">{formatDate(m.date)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const inputCls = "w-full px-3.5 py-2.5 border border-line rounded-[5px] bg-paper text-[14px] focus:outline-none focus:border-ink";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] tracking-[0.12em] uppercase text-muted mb-1.5 font-semibold">{label}</label>
      {children}
    </div>
  );
}
