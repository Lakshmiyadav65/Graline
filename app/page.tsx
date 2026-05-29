import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SectionHead } from "@/components/listing/SectionHead";
import { ListingCard } from "@/components/listing/ListingCard";
import { VillageCard } from "@/components/village/VillageCard";
import { MandiCompareCard } from "@/components/listing/MandiCompareCard";
import { api } from "@/lib/api/client";

export const dynamic = "force-dynamic";

const STEPS = [
  { n: "01 / MON", h: "You order", p: "Browse rice by variety, village, or farmer. Cut-off is Tuesday 9pm IST." },
  { n: "02 / WED", h: "Farmer confirms", p: "Your farmer gets a WhatsApp confirmation and mills the rice fresh that week." },
  { n: "03 / FRI", h: "We collect", p: "One weekly route through the villages. Quality checked at pickup." },
  { n: "04 / SAT", h: "You receive", p: "Delivery to your door or a city pickup point. Farmer paid by Sunday." },
];

export default async function HomePage() {
  const [featuredRes, villagesRes, compareRes] = await Promise.all([
    api.listings.featured(3),
    api.villages.list(),
    api.mandi.compare("sona_masuri"),
  ]);
  const featured = featuredRes.ok ? featuredRes.data : [];
  const villages = villagesRes.ok ? villagesRes.data.slice(0, 4) : [];
  const compare = compareRes.ok ? compareRes.data : { mandi_modal_paise: 2200, retail_modal_paise: 8500 };

  return (
    <PageShell>
      {/* Hero */}
      <section className="py-10 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.9fr] gap-12 lg:gap-[60px] items-end">
          <div>
            <Eyebrow>Direct from {villages.length || 8} villages</Eyebrow>
            <h1
              className="font-serif font-normal mt-4 mb-5 leading-[0.98] tracking-[-0.025em] max-w-[14ch]"
              style={{ fontSize: "clamp(40px, 9vw, 96px)", fontVariationSettings: '"opsz" 144' }}
            >
              Rice with a <em className="text-terra font-medium">name</em>, a{" "}
              <span className="gold-underline">place</span>, and a fair price.
            </h1>
            <p className="text-[18px] leading-[1.55] text-ink-soft max-w-[52ch] mb-8">
              No middlemen. No mystery brand. Just paddy grown by farmers you can call by name,
              milled this season, delivered to your door.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link
                href="/browse"
                className="inline-flex items-center gap-2 px-3.5 py-2 border border-ink rounded-full bg-ink text-paper text-[13px] font-medium hover:bg-paddy hover:border-paddy transition-all"
              >
                Browse rice →
              </Link>
              <Link
                href="/sell"
                className="inline-flex items-center gap-2 px-3.5 py-2 border border-ink rounded-full text-[13px] font-medium hover:bg-ink hover:text-paper transition-all"
              >
                I&apos;m a farmer
              </Link>
            </div>

            <div className="mt-12 border-t border-line pt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              <Stat num={<em className="text-terra not-italic">147</em>} label="FARMERS ENROLLED" />
              <Stat num="8" label="VILLAGES IN NETWORK" />
              <Stat num={<><em className="text-terra not-italic">₹18</em>/kg</>} label="AVG. EXTRA TO FARMER" />
            </div>
          </div>

          <MandiCompareCard
            retailPaise={compare.retail_modal_paise}
            mandiPaise={compare.mandi_modal_paise}
            ourPaise={5200}
          />
        </div>
      </section>

      {/* Featured listings */}
      <section className="py-16 border-t border-line">
        <SectionHead
          title={<>This season&apos;s <em className="text-paddy">harvest</em></>}
          sub="Fresh from the latest season. Limited stock from each farmer."
          cta={{ label: "View all rice →", href: "/browse" }}
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
          title={<>Meet the <em className="text-paddy">villages</em></>}
          sub="Each village has its soil, its water, its varieties. Eight villages, one network."
          cta={{ label: "All villages →", href: "/villages" }}
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
          How <em className="text-paddy">Grainline</em> works
        </h2>
        <p className="text-muted text-[15px] mb-9">A weekly rhythm that respects both the field and the kitchen.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-line">
          {STEPS.map((s, i) => (
            <div
              key={s.n}
              className={"p-7 px-6 border-line border-b lg:border-b-0 " + (i < STEPS.length - 1 ? "lg:border-r" : "")}
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
