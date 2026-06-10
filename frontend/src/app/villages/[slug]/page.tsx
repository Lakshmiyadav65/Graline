import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { ListingCard } from "@/components/listing/ListingCard";
import { FarmerCard } from "@/components/farmer/FarmerCard";
import { api } from "@/lib/api/client";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const res = await api.villages.get(params.slug);
  if (!res.ok) return { title: "Village — Grainline" };
  return { title: `${res.data.name} — Grainline`, description: res.data.story ?? undefined };
}

export default async function VillageDetailPage({ params }: { params: { slug: string } }) {
  const res = await api.villages.get(params.slug);
  if (!res.ok) notFound();
  const v = res.data;

  const t = await getTranslations("villages");
  const tEnroll = await getTranslations("enroll");

  return (
    <PageShell>
      {/* Hero */}
      <section className="py-12">
        <div
          className="rounded-card-lg overflow-hidden border border-line mb-8 p-8 md:p-12 text-cream relative"
          style={{ background: "linear-gradient(135deg, var(--paddy) 0%, var(--paddy-soft) 100%)" }}
        >
          <span className="font-mono text-[12px] tracking-[0.15em] uppercase opacity-70">
            {v.district} {tEnroll("district")} · {v.state}
          </span>
          <h1
            className="font-serif font-normal leading-[1.05] tracking-[-0.02em] mt-3 mb-4"
            style={{ fontSize: "clamp(36px, 5vw, 56px)" }}
          >
            {v.name}
          </h1>
          {v.story && <p className="text-[16px] leading-[1.6] opacity-90 max-w-[52ch]">{v.story}</p>}
          <div className="flex gap-8 mt-8">
            <Stat n={v.farmer_count} label={t("farmers").toUpperCase()} />
            <Stat n={v.variety_count} label={t("varieties").toUpperCase()} />
            <Stat n={v.listings.length} label={t("listings").toUpperCase()} />
          </div>
        </div>

        {/* Listings */}
        <h2 className="font-serif text-[28px] font-normal mb-6">
          {t.rich("riceFrom", {
            village: () => <em className="text-paddy">{v.name}</em>
          })}
        </h2>
        {v.listings.length === 0 ? (
          <p className="text-muted text-[14px] mb-12">{t("noListings")}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
            {v.listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}

        {/* Farmers */}
        <h2 className="font-serif text-[28px] font-normal mb-6">{t("meetFarmers")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {v.farmers.map((f) => (
            <FarmerCard key={f.id} farmer={f} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div>
      <div className="font-serif text-[32px] font-medium leading-none">{n}</div>
      <div className="text-[11px] tracking-[0.12em] uppercase opacity-70 mt-1.5">{label}</div>
    </div>
  );
}
