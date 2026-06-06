"use client";

import { useState } from "react";
import Link from "next/link";
import { formatRupees } from "@/lib/format";
import { VARIETY_LABEL } from "@/lib/labels";
import type { RiceVariety } from "@/lib/api/types";

export interface HeroVariety {
  variety: RiceVariety;
  ourPaise: number;
  retailPaise: number;
  mandiPaise: number;
  farmerName: string;
  villageName: string;
  packKg: number;
}

/**
 * Interactive version of the "Why direct costs less" card. Picking a variety
 * reveals the real named farmer + village growing it and that variety's live
 * price comparison — dramatizing the hero headline ("a name, a place, a fair
 * price"). Crossfades on change; respects prefers-reduced-motion via globals.
 */
export function HeroPriceExplorer({ items }: { items: HeroVariety[] }) {
  const [idx, setIdx] = useState(0);
  if (items.length === 0) return null;

  const it = items[Math.min(idx, items.length - 1)];
  const savedPerPack = (it.retailPaise - it.ourPaise) * it.packKg;
  const pctLess = Math.max(0, Math.round((1 - it.ourPaise / it.retailPaise) * 100));

  return (
    <div className="relative overflow-hidden bg-cream border border-line rounded-card-lg p-6 shadow-soft">
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-1"
        style={{ background: "linear-gradient(90deg, var(--terra) 0 30%, var(--gold) 30% 60%, var(--paddy) 60% 100%)" }}
      />

      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <h3 className="font-serif text-[20px] font-medium">Why direct costs less</h3>
        <span className="text-[11px] font-mono text-paddy bg-[#e9edda] px-2 py-1 rounded-full">−{pctLess}% vs retail</span>
      </div>

      {/* Variety selector */}
      <div className="flex gap-1.5 flex-wrap mb-4" role="tablist" aria-label="Choose a rice variety">
        {items.map((v, i) => (
          <button
            key={v.variety}
            type="button"
            role="tab"
            aria-selected={i === idx}
            onClick={() => setIdx(i)}
            className={
              "px-3 py-1.5 rounded-full text-[12px] border transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paddy " +
              (i === idx ? "bg-ink text-paper border-ink" : "border-line text-ink-soft hover:border-ink")
            }
          >
            {VARIETY_LABEL[v.variety]}
          </button>
        ))}
      </div>

      {/* Keyed → crossfades when variety changes */}
      <div key={it.variety} className="animate-gl-fade">
        <div className="text-[11px] uppercase tracking-[0.12em] text-muted">Grown by</div>
        <div className="font-serif text-[18px] font-medium mb-3">
          {it.farmerName}
          <span className="text-muted font-sans text-[13px] font-normal"> · {it.villageName}</span>
        </div>

        <Row label={`Branded retail (${it.packKg}kg)`} val={`${formatRupees(it.retailPaise)}/kg`} tone="strike" />
        <Row label="Local mandi rate (paddy)" val={`${formatRupees(it.mandiPaise)}/kg`} />
        <Row label="Grainline farmer price" val={`${formatRupees(it.ourPaise)}/kg`} tone="hi" />

        <div className="mt-3.5 px-3.5 py-2.5 bg-paddy text-cream rounded-[4px] text-[13px] flex justify-between items-center">
          <span>You save vs. branded retail</span>
          <strong className="font-serif text-[18px] font-semibold">{formatRupees(savedPerPack)} / {it.packKg}kg</strong>
        </div>

        <Link
          href={`/browse?variety=${it.variety}`}
          className="inline-flex items-center gap-1 mt-3.5 text-[13px] font-medium text-terra hover:underline"
        >
          See {VARIETY_LABEL[it.variety]} from {it.farmerName.split(/\s+/)[0]} →
        </Link>
      </div>
    </div>
  );
}

function Row({ label, val, tone }: { label: string; val: string; tone?: "strike" | "hi" }) {
  return (
    <div className="flex justify-between items-baseline py-2.5 border-b border-dashed border-line-soft last:border-b-0">
      <span className="text-[13px] text-ink-soft">{label}</span>
      <span
        className={
          "font-mono text-[14px] font-medium " +
          (tone === "strike" ? "text-muted line-through" : tone === "hi" ? "text-paddy font-semibold" : "")
        }
      >
        {val}
      </span>
    </div>
  );
}
