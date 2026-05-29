"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { VARIETY_LABEL } from "@/lib/labels";
import type { RiceVariety } from "@/lib/api/types";

const VARIETY_CHIPS: (RiceVariety | "all")[] = [
  "all", "sona_masuri", "bpt_5204", "basmati", "jeera_samba", "red_rice", "hand_pounded_sona",
];

const SORTS = [
  { key: "newest", label: "Newest" },
  { key: "price_asc", label: "Price ↑" },
  { key: "price_desc", label: "Price ↓" },
];

function chipClass(active: boolean) {
  return (
    "px-4 py-2 border rounded-full text-[13px] cursor-pointer transition-all focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paddy " +
    (active ? "bg-ink text-paper border-ink" : "border-line text-ink-soft hover:border-ink")
  );
}

export function FilterBar() {
  const router = useRouter();
  const pathname = usePathname() ?? "/browse";
  const params = useSearchParams();

  const activeVariety = params.get("variety") ?? "all";
  const organic = params.get("organic") === "true";
  const sort = params.get("sort") ?? "newest";

  function setParam(key: string, value: string | null) {
    const p = new URLSearchParams(params.toString());
    if (value === null) p.delete(key);
    else p.set(key, value);
    router.push(`${pathname}?${p.toString()}`, { scroll: false });
  }

  return (
    <div className="mb-9 pb-5 border-b border-line-soft">
      <div className="flex gap-2.5 flex-wrap">
        {VARIETY_CHIPS.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setParam("variety", v === "all" ? null : v)}
            className={chipClass(activeVariety === v)}
          >
            {v === "all" ? "All varieties" : VARIETY_LABEL[v]}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setParam("organic", organic ? null : "true")}
          className={chipClass(organic)}
        >
          Organic only
        </button>
      </div>

      <div className="flex gap-2.5 flex-wrap mt-3 items-center">
        <span className="text-[11px] tracking-[0.12em] uppercase text-muted font-semibold mr-1">Sort</span>
        {SORTS.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setParam("sort", s.key === "newest" ? null : s.key)}
            className={chipClass(sort === s.key)}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
