import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { VillageCard } from "@/components/village/VillageCard";
import { api } from "@/lib/api/client";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Villages — Grainline" };

export default async function VillagesPage() {
  const res = await api.villages.list();
  const villages = res.ok ? res.data : [];
  const farmerTotal = villages.reduce((n, v) => n + v.farmer_count, 0);

  const t = await getTranslations("villages");

  return (
    <PageShell>
      <section className="py-12">
        <Eyebrow>{t("eyebrow", { villageCount: villages.length, farmerCount: farmerTotal })}</Eyebrow>
        <h1
          className="font-serif font-normal leading-[1.05] tracking-[-0.02em] mt-3.5 mb-2"
          style={{ fontSize: "clamp(28px, 4vw, 48px)" }}
        >
          {t.rich("title", {
            emVillages: (chunks) => <em className="text-paddy">{chunks}</em>
          })}
        </h1>
        <p className="text-muted text-[15px] max-w-[60ch] mb-9">
          {t("sub")}
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
          {villages.map((v) => (
            <VillageCard key={v.id} village={v} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}
