import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { FilterBar } from "@/components/listing/FilterBar";
import { ListingCard } from "@/components/listing/ListingCard";
import { api } from "@/lib/api/client";
import type { ListingFilters, RiceVariety } from "@/lib/api/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Browse rice — Grainline" };

type SP = Record<string, string | undefined>;

export default async function BrowsePage({ searchParams }: { searchParams: SP }) {
  const filters: ListingFilters = {
    variety: searchParams.variety as RiceVariety | undefined,
    organic: searchParams.organic === "true" ? true : undefined,
    village_id: searchParams.village_id,
    sort: (searchParams.sort as ListingFilters["sort"]) ?? undefined,
  };
  const res = await api.listings.list(filters);
  const listings = res.ok ? res.data.listings : [];
  const total = res.ok ? res.data.total : 0;

  return (
    <PageShell>
      <section className="py-12">
        <Eyebrow>All rice · {total} listing{total === 1 ? "" : "s"}</Eyebrow>
        <h1
          className="font-serif font-normal leading-[1.05] tracking-[-0.02em] mt-3.5 mb-8"
          style={{ fontSize: "clamp(28px, 4vw, 48px)" }}
        >
          Browse <em className="text-paddy">by variety</em>, by village, by price.
        </h1>

        <Suspense fallback={<div className="h-24" />}>
          <FilterBar />
        </Suspense>

        {listings.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-line rounded-card-lg">
            <p className="font-serif text-[24px] mb-2">No rice matches these filters.</p>
            <p className="text-muted text-[14px] mb-6">Try clearing a filter or browsing everything.</p>
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 px-5 py-3 bg-ink text-paper rounded-full text-[13px] font-medium hover:bg-paddy transition-all"
            >
              Clear filters
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
