"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api/client";
import { VARIETY_LABEL } from "@/lib/labels";
import { formatRupees, formatKg } from "@/lib/format";
import { Pill, type PillTone } from "@/components/ui/Pill";
import type { Listing, ListingStatus } from "@/lib/api/types";

const STATUS_TONE: Record<ListingStatus, PillTone> = {
  active: "paddy", draft: "neutral", paused: "pending", out_of_stock: "terra", archived: "neutral",
};

export default function FarmerListingsPage() {
  const [listings, setListings] = useState<Listing[] | null>(null);

  useEffect(() => {
    api.farmer.listings().then((r) => setListings(r.ok ? r.data : []));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-7 flex-wrap">
        <h1 className="font-serif text-[36px] font-normal tracking-[-0.02em]">My listings</h1>
        <Link
          href="/farmer-app/listings/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-ink text-paper rounded-full text-[13px] font-medium hover:bg-paddy transition-all"
        >
          + Add listing
        </Link>
      </div>

      {listings === null ? (
        <div className="text-muted text-[14px] py-12">Loading listings…</div>
      ) : listings.length === 0 ? (
        <p className="text-muted text-[14px]">No listings yet. Add your first one.</p>
      ) : (
        <div className="space-y-2.5">
          {listings.map((l) => (
            <div key={l.id} className="grid grid-cols-[1fr_auto] sm:grid-cols-[1.5fr_1fr_1fr_auto] gap-3 items-center p-4 border border-line bg-cream rounded-card">
              <div className="font-serif text-[17px] font-medium">{VARIETY_LABEL[l.variety]}</div>
              <div className="hidden sm:block text-[13px] text-ink-soft">{formatKg(l.available_kg)} in stock</div>
              <div className="hidden sm:block font-mono text-[14px]">{formatRupees(l.price_per_kg)}/kg</div>
              <span className="justify-self-end"><Pill tone={STATUS_TONE[l.status]}>{l.status.replace("_", " ")}</Pill></span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
