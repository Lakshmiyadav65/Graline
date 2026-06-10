"use client";

import type { PackSize } from "@/lib/api/types";
import { formatRupees } from "@/lib/format";
import { useTranslations } from "next-intl";

interface PackPickerProps {
  packs: PackSize[];
  selected: number;
  onSelect: (kg: number) => void;
}

/** 4-up pack-size grid. Selected = ink fill. Matches DESIGN.html .packs/.pack. */
export function PackPicker({ packs, selected, onSelect }: PackPickerProps) {
  const t = useTranslations("packPicker");

  return (
    <div className="mt-2">
      <label className="text-[11px] tracking-[0.15em] uppercase text-muted font-semibold">
        {t("label")}
      </label>
      <div className="grid grid-cols-4 gap-2.5 mt-2.5 mb-[22px]">
        {packs.map((p) => {
          const active = p.kg === selected;
          return (
            <button
              key={p.kg}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(p.kg)}
              className={
                "rounded-card border p-3 px-2.5 text-center transition-all focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paddy " +
                (active ? "border-ink bg-ink text-paper" : "border-line bg-transparent text-ink hover:border-ink")
              }
            >
              <div className="font-serif text-[20px] font-medium">{p.kg} kg</div>
              <div className="text-[11px] mt-0.5 opacity-75">{formatRupees(p.price_per_kg_paise)}/kg</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
