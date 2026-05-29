import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { MandiCompareCard } from "@/components/listing/MandiCompareCard";

export const metadata: Metadata = { title: "How it works — Grainline" };

const STEPS = [
  { n: "01 / MONDAY", h: "You order", p: "Browse rice by variety, village, or farmer. Order any pack from 1kg to 25kg. Cut-off is Tuesday 9pm IST." },
  { n: "02 / WEDNESDAY", h: "Farmer confirms", p: "Your farmer gets a WhatsApp message with the order. They mill the rice fresh that week and prepare your sack." },
  { n: "03 / FRIDAY", h: "We collect", p: "Our team runs a single weekly route through the villages. Each sack is weighed and quality-checked at pickup." },
  { n: "04 / SATURDAY", h: "You receive", p: "Delivery to your door or a city pickup point. The farmer is paid via UPI by Sunday evening — no waiting weeks." },
];

export default function HowItWorksPage() {
  return (
    <PageShell>
      <section className="py-12">
        <Eyebrow>Our model</Eyebrow>
        <h1
          className="font-serif font-normal leading-[1.05] tracking-[-0.02em] mt-3.5 mb-2"
          style={{ fontSize: "clamp(28px, 4vw, 48px)" }}
        >
          A <em className="text-paddy">weekly</em> rhythm.
        </h1>
        <p className="text-muted text-[15px] max-w-[60ch] mb-10">
          We aggregate orders, run a single weekly route through the villages, do quality
          checks at pickup, and pay farmers within 7 days. Simple, predictable, fair.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-line">
          {STEPS.map((s, i) => (
            <div
              key={s.n}
              className={
                "p-7 px-6 border-line " +
                (i < STEPS.length - 1 ? "lg:border-r " : "") +
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
          The <em className="text-paddy">fair-price</em> math.
        </h2>
        <p className="text-muted text-[15px] max-w-[60ch] mb-6">
          We take a 10% commission. Farmers still earn ~2× what mandi pays. You pay 30–40%
          less than branded retail.
        </p>
        <div className="max-w-[560px]">
          <MandiCompareCard
            title="For one kilogram of Sona Masuri"
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
