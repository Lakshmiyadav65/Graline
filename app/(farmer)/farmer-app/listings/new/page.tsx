"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api/client";
import { useToast } from "@/components/ui/Toast";
import { listingInputSchema } from "@/lib/schemas/listing";
import { VARIETY_LABEL } from "@/lib/labels";
import { formatRupees } from "@/lib/format";
import type { RiceVariety, RiceType, HarvestSeason, PackSize, ListingInputDTO } from "@/lib/api/types";

function packsFrom(base: number): PackSize[] {
  return [
    { kg: 1, price_per_kg_paise: base + 300 },
    { kg: 5, price_per_kg_paise: base + 100 },
    { kg: 10, price_per_kg_paise: base },
    { kg: 25, price_per_kg_paise: Math.max(100, base - 200) },
  ];
}

export default function NewListingPage() {
  const router = useRouter();
  const toast = useToast();
  const [variety, setVariety] = useState<RiceVariety>("sona_masuri");
  const [type, setType] = useState<RiceType>("raw");
  const [organic, setOrganic] = useState(false);
  const [availableKg, setAvailableKg] = useState("");
  const [priceRupees, setPriceRupees] = useState("");
  const [harvestYear, setHarvestYear] = useState("2025");
  const [season, setSeason] = useState<HarvestSeason>("rabi");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    const base = Math.round(Number(priceRupees) * 100);
    const input: ListingInputDTO = {
      variety, type, is_organic: organic,
      available_kg: Number(availableKg), price_per_kg: base, pack_sizes: packsFrom(base),
      harvest_year: Number(harvestYear), harvest_season: season, is_milled: true,
      photos: [], description: description || undefined,
    };
    const parsed = listingInputSchema.safeParse(input);
    if (!parsed.success) { toast.show(parsed.error.issues[0]?.message ?? "Check the listing details.", "error"); return; }
    setBusy(true);
    const res = await api.farmer.createListing(input);
    setBusy(false);
    if (!res.ok) { toast.show(res.error.message, "error"); return; }
    toast.show("Listing created.", "success");
    router.push("/farmer-app/listings");
  }

  return (
    <div className="max-w-lg">
      <Link href="/farmer-app/listings" className="text-[13px] text-ink-soft hover:text-ink">← My listings</Link>
      <h1 className="font-serif text-[32px] font-normal tracking-[-0.02em] mt-3 mb-6">Add a listing</h1>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Variety"><select value={variety} onChange={(e) => setVariety(e.target.value as RiceVariety)} className={selectCls}>{Object.entries(VARIETY_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field>
        <Field label="Type"><select value={type} onChange={(e) => setType(e.target.value as RiceType)} className={selectCls}><option value="raw">Raw</option><option value="boiled">Parboiled</option><option value="brown">Brown</option><option value="hand_pounded">Hand-pounded</option></select></Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Available (kg)"><input value={availableKg} onChange={(e) => setAvailableKg(e.target.value.replace(/[^\d.]/g, ""))} inputMode="numeric" placeholder="320" className={inputCls} /></Field>
        <Field label="Price ₹/kg"><input value={priceRupees} onChange={(e) => setPriceRupees(e.target.value.replace(/[^\d.]/g, ""))} inputMode="numeric" placeholder="52" className={inputCls} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Harvest year"><input value={harvestYear} onChange={(e) => setHarvestYear(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" className={inputCls} /></Field>
        <Field label="Season"><select value={season} onChange={(e) => setSeason(e.target.value as HarvestSeason)} className={selectCls}><option value="rabi">Rabi</option><option value="kharif">Kharif</option></select></Field>
      </div>
      <label className="flex items-center gap-2 my-2 text-[14px]">
        <input type="checkbox" checked={organic} onChange={(e) => setOrganic(e.target.checked)} /> Certified organic
      </label>
      <Field label="Description (optional)"><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputCls + " resize-vertical"} /></Field>

      {Number(priceRupees) > 0 && (
        <p className="text-[12px] text-muted mb-4">Pack pricing auto-set: 1/5/10/25kg around {formatRupees(Number(priceRupees) * 100)}/kg.</p>
      )}

      <button type="button" onClick={submit} disabled={busy} className="w-full py-3.5 bg-paddy text-cream rounded-card font-semibold text-[14px] uppercase tracking-[0.04em] hover:bg-paddy-2 transition-colors disabled:opacity-60">
        {busy ? "Saving…" : "Create listing →"}
      </button>
    </div>
  );
}

const inputCls = "w-full px-3.5 py-3 border border-line rounded-[5px] bg-paper text-[15px] focus:outline-none focus:border-ink";
const selectCls = inputCls;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3.5">
      <label className="block text-[11px] tracking-[0.15em] uppercase text-muted mb-1.5 font-semibold">{label}</label>
      {children}
    </div>
  );
}
