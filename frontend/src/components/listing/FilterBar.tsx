"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { RiceVariety, Village } from "@/lib/api/types";
import { api } from "@/lib/api/client";
import { VARIETY_LABEL } from "@/lib/labels";

const VARIETY_CHIPS: (RiceVariety | "all")[] = [
  "all", "sona_masuri", "bpt_5204", "basmati", "jeera_samba", "red_rice", "hand_pounded_sona",
];

function chipClass(active: boolean) {
  return (
    "px-4 py-2 border rounded-full text-[13px] cursor-pointer transition-all focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paddy " +
    (active ? "bg-ink text-paper border-ink" : "border-line text-ink-soft hover:border-ink")
  );
}

export function FilterBar() {
  const SORTS = [
    { key: "newest", label: "Newest" },
    { key: "price_asc", label: "Price: Low → High" },
    { key: "price_desc", label: "Price: High → Low" },
  ];

  const router = useRouter();
  const pathname = usePathname() ?? "/browse";
  const params = useSearchParams();

  const activeVariety = params.get("variety") ?? "all";
  const organic = params.get("organic") === "true";
  const sort = params.get("sort") ?? "newest";
  const activeVillage = params.get("village_id") ?? "all";
  
  const [searchVal, setSearchVal] = useState(params.get("search") ?? "");
  const [villages, setVillages] = useState<Village[]>([]);

  useEffect(() => {
    api.villages.list().then((res) => {
      if (res.ok) {
        setVillages(res.data);
      }
    });
  }, []);

  function setParam(key: string, value: string | null) {
    const p = new URLSearchParams(params.toString());
    if (value === null) p.delete(key);
    else p.set(key, value);
    router.push(`${pathname}?${p.toString()}`, { scroll: false });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setParam("search", searchVal.trim() || null);
  }

  return (
    <div className="mb-9 pb-5 border-b border-line-soft space-y-4">
      {/* Search & Village row */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex flex-1 gap-2 max-w-lg">
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search rice, farmer, or village…"
            className="flex-1 px-4 py-2 border border-line rounded-full bg-paper text-[14px] focus:outline-none focus:border-ink"
          />
          <button
            type="submit"
            className="px-5 py-2 bg-ink text-paper rounded-full text-[13px] font-medium hover:bg-paddy transition-colors"
          >
            Search
          </button>
          {params.get("search") && (
            <button
              type="button"
              onClick={() => {
                setSearchVal("");
                setParam("search", null);
              }}
              className="px-4 py-2 border border-line text-muted rounded-full text-[13px] hover:border-ink hover:text-ink transition-colors"
            >
              Clear
            </button>
          )}
        </form>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-[11px] tracking-[0.12em] uppercase text-muted font-semibold">Village</span>
          <select
            value={activeVillage}
            onChange={(e) => setParam("village_id", e.target.value === "all" ? null : e.target.value)}
            className="px-4 py-2 border border-line rounded-full bg-paper text-[13px] text-ink-soft focus:outline-none focus:border-ink"
          >
            <option value="all">All villages</option>
            {villages.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.district})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-2.5 flex-wrap">
        {VARIETY_CHIPS.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setParam("variety", v === "all" ? null : v)}
            className={chipClass(activeVariety === v)}
          >
            {v === "all" ? "All varieties" : VARIETY_LABEL[v as RiceVariety]}
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
