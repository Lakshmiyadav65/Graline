"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";
import { useToast } from "@/components/ui/Toast";
import { PackPicker } from "./PackPicker";
import { SampleBanner } from "./SampleBanner";
import type { Listing } from "@/lib/api/types";
import { varietyDisplay } from "@/lib/labels";
import { formatRupees } from "@/lib/format";

/** Interactive island on the listing detail page: pack picker + add-to-cart + sample. */
export function ListingActions({ listing }: { listing: Listing }) {
  const defaultPack = listing.pack_sizes.find((p) => p.kg === 10) ?? listing.pack_sizes[0];
  const [packKg, setPackKg] = useState(defaultPack.kg);
  const pack = listing.pack_sizes.find((p) => p.kg === packKg) ?? listing.pack_sizes[0];
  const lineTotal = pack.price_per_kg_paise * pack.kg;
  const soldOut = listing.available_kg <= 0 || listing.status !== "active";

  const addItem = useCart((s) => s.addItem);
  const toast = useToast();

  function addToCart() {
    addItem({
      listingId: listing.id,
      variety: listing.variety,
      type: listing.type,
      farmerName: listing.farmer.name,
      villageName: listing.farmer.village.name,
      packKg: pack.kg,
      qty: 1,
      pricePerKgPaise: pack.price_per_kg_paise,
      retailPaise: listing.retail_paise,
      photoUrl: listing.photos[0] ?? null,
    });
    toast.show(`Added ${pack.kg}kg ${varietyDisplay(listing)} to cart`, "success");
  }

  return (
    <>
      <PackPicker packs={listing.pack_sizes} selected={packKg} onSelect={setPackKg} />

      <div className="flex gap-3 mt-1.5">
        <button
          type="button"
          onClick={addToCart}
          disabled={soldOut}
          className="flex-1 px-5 py-4 rounded-card border border-paddy bg-paddy text-cream font-semibold text-[14px] tracking-[0.04em] uppercase transition-all hover:bg-paddy-2 hover:border-paddy-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          {soldOut ? "Out of stock" : `Add to cart · ${formatRupees(lineTotal)}`}
        </button>
        <button
          type="button"
          disabled
          title="Subscriptions coming soon"
          className="flex-1 px-5 py-4 rounded-card border border-ink bg-transparent text-ink font-semibold text-[14px] tracking-[0.04em] uppercase opacity-40 cursor-not-allowed"
        >
          Subscribe monthly
        </button>
      </div>

      <SampleBanner listingId={listing.id} />
    </>
  );
}
