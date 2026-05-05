import { PageShell } from "@/components/layout/PageShell";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

/**
 * M1 stub home page.
 * Verifies fonts (Fraunces hero h1 + Inter body), color tokens (paper bg, terra italic accents,
 * paddy CTAs, gold underline), and the hero-stats + price-card layout.
 *
 * The full home page (with featured listings + villages + how-it-works) ships in M3.
 */
export default function HomePage() {
  return (
    <PageShell>
      <section className="py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.9fr] gap-12 lg:gap-[60px] items-end">
          {/* Left: hero copy */}
          <div>
            <Eyebrow>Direct from 8 villages</Eyebrow>
            <h1
              className="font-serif font-normal mt-4 mb-5 leading-[0.98] tracking-[-0.025em] max-w-[14ch]"
              style={{
                fontSize: "clamp(48px, 7vw, 96px)",
                fontVariationSettings: '"opsz" 144',
              }}
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

            {/* Hero stats — verifies Fraunces large-num + terra italic accent */}
            <div className="mt-12 border-t border-line pt-6 grid grid-cols-3 gap-6">
              <Stat num={<em className="text-terra not-italic">147</em>} label="FARMERS ENROLLED" />
              <Stat num="8" label="VILLAGES IN NETWORK" />
              <Stat num={<><em className="text-terra not-italic">₹18</em>/kg</>} label="AVG. EXTRA TO FARMER" />
            </div>
          </div>

          {/* Right: price-card — verifies cream card + gradient stripe */}
          <Card className="p-6 shadow-soft relative overflow-hidden">
            {/* 3-color top stripe */}
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{
                background:
                  "linear-gradient(90deg, var(--terra) 0 30%, var(--gold) 30% 60%, var(--paddy) 60% 100%)",
              }}
            />
            <h3 className="font-serif text-[20px] font-medium mb-3.5">Why direct costs less</h3>
            <PriceRow label="Branded retail (Sona Masuri 10kg)" val="₹85/kg" tone="strike" />
            <PriceRow label="Local mandi rate (paddy)"           val="₹22/kg" />
            <PriceRow label="Grainline farmer price"             val="₹52/kg" tone="hi" />
            <div className="mt-3.5 px-3.5 py-2.5 bg-paddy text-cream rounded-[4px] text-[13px] flex justify-between items-center">
              <span>You save vs. branded retail</span>
              <strong className="font-serif text-[18px] font-semibold">₹330 / 10kg</strong>
            </div>
          </Card>
        </div>

        {/* M1 verification note */}
        <p className="mt-20 text-[12px] text-muted font-mono">
          M1 stub — verifies tokens, fonts, primitives. Featured listings + villages + how-it-works ship in M3.
        </p>
      </section>
    </PageShell>
  );
}

function Stat({ num, label }: { num: React.ReactNode; label: string }) {
  return (
    <div>
      <div className="font-serif text-[42px] font-medium tracking-[-0.02em] leading-none">{num}</div>
      <div className="text-[12px] text-muted mt-1.5 tracking-[0.05em]">{label}</div>
    </div>
  );
}

function PriceRow({ label, val, tone }: { label: string; val: string; tone?: "strike" | "hi" }) {
  return (
    <div className="flex justify-between items-baseline py-2.5 border-b border-dashed border-line-soft last:border-b-0">
      <span className="text-[13px] text-ink-soft">{label}</span>
      <span
        className={
          "font-mono text-[14px] font-medium " +
          (tone === "strike" ? "text-muted line-through" : "") +
          (tone === "hi" ? "text-paddy font-semibold" : "")
        }
      >
        {val}
      </span>
    </div>
  );
}
