import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { MandiCompareCard } from "@/components/listing/MandiCompareCard";

export const metadata: Metadata = { title: "How it works — Grainline" };

export default async function HowItWorksPage() {
  const steps = [
    { n: "01", h: "Farmer lists", p: "A verified farmer near you lists their freshly milled rice with a fair price and mill date." },
    { n: "02", h: "You order", p: "Browse by variety, village, or farmer name. Order by Tuesday 9pm IST." },
    { n: "03", h: "We mill & pack", p: "Rice is milled to order on Wednesday and packed fresh for your delivery." },
    { n: "04", h: "Delivered Saturday", p: "Hand-packed and delivered to your door every Saturday — no exceptions." },
  ];

  return (
    <PageShell>
      <section className="py-12">
        <Eyebrow>The Grainline model</Eyebrow>
        <h1
          className="font-serif font-normal leading-[1.05] tracking-[-0.02em] mt-3.5 mb-2"
          style={{ fontSize: "clamp(28px, 4vw, 48px)" }}
        >
          A <em className="text-paddy">weekly</em> supply chain, end to end
        </h1>
        <p className="text-muted text-[15px] max-w-[60ch] mb-10">
          We connect farmers directly with households — no middlemen, no warehousing, no guessing on freshness.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-line">
          {steps.map((s, i) => (
            <div
              key={s.n}
              className={
                "p-7 px-6 border-line " +
                (i < steps.length - 1 ? "lg:border-r " : "") +
                "border-b lg:border-b-0"
              }
            >
              <span className="font-serif text-[14px] text-terra font-semibold tracking-[0.05em] block mb-4">
                {s.n}
              </span>
              <h4 className="font-serif text-[22px] font-medium mb-2">{s.h}</h4>
              <p className="text-[14px] text-ink-soft leading-[1.55]">{s.p}</p>
            </div>
          ))}
        </div>

        <h2 className="font-serif text-[clamp(28px,4vw,40px)] font-normal mt-20 mb-2">
          The <em className="text-paddy">math</em> — why you pay less
        </h2>
        <p className="text-muted text-[15px] max-w-[60ch] mb-6">
          Cutting out the distributor, retailer, and brand margin means more money to the farmer and less from your pocket.
        </p>
        <div className="max-w-[560px]">
          <MandiCompareCard
            title="Price comparison — Sona Masuri, 1kg"
            retailPaise={8500}
            mandiPaise={2200}
            ourPaise={5200}
            packKg={1}
          />
        </div>
      </section>
    </PageShell>
  );
}
