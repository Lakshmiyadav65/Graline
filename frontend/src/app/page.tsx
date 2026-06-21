import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SectionHead } from "@/components/listing/SectionHead";
import { ListingCard } from "@/components/listing/ListingCard";
import { VillageCard } from "@/components/village/VillageCard";
import { HeroPriceExplorer, type HeroVariety } from "@/components/home/HeroPriceExplorer";
import { api } from "@/lib/api/client";
import type { RiceVariety } from "@/lib/api/types";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

const HERO_VARIETIES: RiceVariety[] = ["sona_masuri", "bpt_5204", "basmati", "red_rice"];

export default async function HomePage() {
  const t = await getTranslations("home");

  const [featuredRes, villagesRes, mandiRes, ...heroListingRes] = await Promise.all([
    api.listings.featured(3),
    api.villages.list(),
    api.mandi.compare("sona_masuri"),
    ...HERO_VARIETIES.map((v) => api.listings.list({ variety: v, pageSize: 1 })),
  ]);
  const featured = featuredRes.ok ? featuredRes.data : [];
  const villageTotal = villagesRes.ok ? villagesRes.data.length : 8;
  const villages = villagesRes.ok ? villagesRes.data.slice(0, 4) : [];
  const mandiPaise = mandiRes.ok ? mandiRes.data.mandi_modal_paise : 2200;
  const heroItems: HeroVariety[] = HERO_VARIETIES.map((v, i) => {
    const r = heroListingRes[i];
    const l = r.ok && r.data.listings[0] ? r.data.listings[0] : null;
    return l
      ? {
          variety: v, ourPaise: l.price_per_kg, retailPaise: l.retail_paise, mandiPaise,
          farmerName: l.farmer.name, villageName: l.farmer.village.name, packKg: 10,
        }
      : null;
  }).filter((x): x is HeroVariety => x !== null);

  const stepsKeys = [
    { n: t("step1Num"), h: t("step1Title"), p: t("step1Desc") },
    { n: t("step2Num"), h: t("step2Title"), p: t("step2Desc") },
    { n: t("step3Num"), h: t("step3Title"), p: t("step3Desc") },
    { n: t("step4Num"), h: t("step4Title"), p: t("step4Desc") },
  ];

  return (
    <PageShell>
      {/* Hero */}
      <section className="py-10 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.9fr] gap-12 lg:gap-[60px] items-end">
          <div>
            <Eyebrow>{t("directFrom", { count: villageTotal })}</Eyebrow>
            <h1
              className="font-serif font-normal mt-4 mb-5 leading-[0.98] tracking-[-0.025em] max-w-[14ch]"
              style={{ fontSize: "clamp(40px, 9vw, 96px)", fontVariationSettings: '"opsz" 144' }}
            >
              {t.rich("title", {
                name: (chunks) => <em className="text-terra font-medium">{chunks}</em>,
                place: (chunks) => <span className="gold-underline">{chunks}</span>
              })}
            </h1>
            <p className="text-[18px] leading-[1.55] text-ink-soft max-w-[52ch] mb-8">
              {t("description")}
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link
                href="/browse"
                className="inline-flex items-center gap-2 px-3.5 py-2 border border-ink rounded-full bg-ink text-paper text-[13px] font-medium hover:bg-paddy hover:border-paddy transition-all"
              >
                {t("browseRice")}
              </Link>
              <Link
                href="/sell"
                className="inline-flex items-center gap-2 px-3.5 py-2 border border-ink rounded-full text-[13px] font-medium hover:bg-ink hover:text-paper transition-all"
              >
                {t("imFarmer")}
              </Link>
            </div>

            <div className="mt-12 border-t border-line pt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              <Stat num={<em className="text-terra not-italic">147</em>} label={t("farmersEnrolled")} />
              <Stat num={String(villageTotal)} label={t("villagesNetwork")} />
              <Stat num={<><em className="text-terra not-italic">{t("extraPerKg")}</em></>} label={t("avgExtra")} />
            </div>
          </div>

          <HeroPriceExplorer items={heroItems} />
        </div>
      </section>

      {/* Featured listings */}
      <section className="py-16 border-t border-line">
        <SectionHead
          title={t.rich("seasonHarvest", {
            harvest: (chunks) => <em className="text-paddy">{chunks}</em>
          })}
          sub={t("seasonSub")}
          cta={{ label: t("viewAllRice"), href: "/browse" }}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      </section>

      {/* Villages */}
      <section className="py-16 border-t border-line">
        <SectionHead
          title={t.rich("meetVillages", {
            villages: (chunks) => <em className="text-paddy">{chunks}</em>
          })}
          sub={t("villagesSub")}
          cta={{ label: t("allVillages"), href: "/villages" }}
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
          {villages.map((v) => (
            <VillageCard key={v.id} village={v} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 border-t border-line">
        <h2 className="font-serif text-[clamp(28px,4vw,48px)] font-normal mb-2">
          {t.rich("howWorksTitle", {
            brand: (chunks) => <em className="text-paddy">{chunks}</em>
          })}
        </h2>
        <p className="text-muted text-[15px] mb-9">{t("howWorksSub")}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-line">
          {stepsKeys.map((s, i) => (
            <div
              key={s.n}
              className={"p-7 px-6 border-line border-b lg:border-b-0 " + (i < stepsKeys.length - 1 ? "lg:border-r" : "")}
            >
              <span className="font-serif text-[14px] text-terra font-semibold tracking-[0.05em] block mb-4">{s.n}</span>
              <h4 className="font-serif text-[22px] font-medium mb-2">{s.h}</h4>
              <p className="text-[14px] text-ink-soft leading-[1.55]">{s.p}</p>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

function Stat({ num, label }: { num: React.ReactNode; label: string }) {
  return (
    <div>
      <div className="font-serif text-[36px] sm:text-[42px] font-medium tracking-[-0.02em] leading-none">{num}</div>
      <div className="text-[12px] text-muted mt-1.5 tracking-[0.05em]">{label}</div>
    </div>
  );
}

