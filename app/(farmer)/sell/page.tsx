import { PageShell } from "@/components/layout/PageShell";
import { Eyebrow } from "@/components/ui/Eyebrow";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sell on Grainline — Earn 2× more, paid in 7 days",
  description:
    "Sell your rice direct to home kitchens. You set the price, we handle logistics, payment via UPI within 7 days of pickup.",
};

export default function SellPage() {
  return (
    <PageShell>
      {/* Hero — paddy panel, modelled on DESIGN.html .enroll-side aesthetic */}
      <section
        className="relative overflow-hidden rounded-card-lg bg-paddy text-cream mt-10 mb-16 px-7 py-14 md:px-14 md:py-20"
        aria-labelledby="sell-hero-title"
      >
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            backgroundImage:
              "radial-gradient(circle at 100% 0%, rgba(199,156,58,.18), transparent 50%), radial-gradient(circle at 0% 100%, rgba(184,85,45,.15), transparent 50%)",
          }}
        />
        <div className="relative max-w-2xl">
          <span className="font-mono text-[12px] tracking-[0.15em] uppercase opacity-70">
            For Farmers
          </span>
          <h1
            id="sell-hero-title"
            className="font-serif font-normal leading-[1.05] tracking-[-0.02em] mt-5 mb-6"
            style={{
              fontSize: "clamp(40px, 6vw, 64px)",
              fontVariationSettings: '"opsz" 144',
            }}
          >
            Sell your rice <em className="text-gold font-medium">directly</em>.
            <br />
            Earn <em className="text-gold font-medium">2× more</em>.
          </h1>
          <p className="text-[17px] md:text-[18px] leading-[1.6] opacity-90 max-w-[44ch] mb-8">
            Join 147 farmers across 8 villages. We handle listings, orders,
            logistics, and payments — you focus on growing.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/sell/enroll"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-gold text-ink rounded-full text-[13px] font-semibold tracking-[0.04em] uppercase hover:bg-cream transition-all focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
            >
              Enroll your farm →
            </Link>
            <a
              href="https://wa.me/919999999999"
              className="inline-flex items-center gap-2 px-6 py-3.5 border border-cream text-cream rounded-full text-[13px] font-semibold tracking-[0.04em] uppercase hover:bg-cream hover:text-paddy transition-all focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
            >
              WhatsApp our team
            </a>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12" aria-labelledby="benefits-title">
        <Eyebrow>Why farmers join</Eyebrow>
        <h2
          id="benefits-title"
          className="font-serif font-normal leading-[1.05] tracking-[-0.02em] mt-4 mb-10 max-w-[22ch]"
          style={{ fontSize: "clamp(32px, 4vw, 48px)" }}
        >
          Simple, fair, <em className="text-paddy">predictable</em>.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <BenefitCard
            n="01"
            title="Your price, full stop"
            body="Set your own price per kilo. We never negotiate it down. Customers see your name, your village, your land."
          />
          <BenefitCard
            n="02"
            title="Paid in 7 days via UPI"
            body="Pickup Friday. Delivery Saturday. Money in your UPI account by Sunday evening. Every week, every order."
          />
          <BenefitCard
            n="03"
            title="WhatsApp, not an app"
            body="Confirm orders, update stock, check earnings — all over WhatsApp text. Nothing to install."
          />
        </div>
      </section>

      {/* Testimonial — real Ramesh Varma quote per DESIGN.html .enroll-side .quote */}
      <section className="py-16 border-t border-line" aria-label="Farmer testimonial">
        <div className="max-w-3xl mx-auto text-center">
          <blockquote
            className="font-serif italic font-normal leading-[1.3] text-ink"
            style={{ fontSize: "clamp(24px, 3.5vw, 36px)" }}
          >
            “Mandi gave me ₹22 a kilo. Last month I sold at ₹50. My daughter is
            back in school.”
          </blockquote>
          <cite className="block mt-6 text-[14px] text-muted not-italic">
            — Ramesh Varma, Konaipalli village
          </cite>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 border-t border-line text-center">
        <h3 className="font-serif text-[28px] md:text-[34px] font-normal mb-2">
          Ready to enroll your farm?
        </h3>
        <p className="text-muted text-[15px] mb-8 max-w-[40ch] mx-auto">
          Five short steps. Takes about 6 minutes. You can stop and resume any
          time.
        </p>
        <div className="flex justify-center gap-3 flex-wrap">
          <Link
            href="/sell/enroll"
            className="inline-flex items-center gap-2 px-5 py-3 bg-ink text-paper rounded-full text-[13px] font-medium hover:bg-paddy hover:border-paddy transition-all"
          >
            Start enrollment
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-3 border border-ink text-ink rounded-full text-[13px] font-medium hover:bg-ink hover:text-paper transition-all"
          >
            ← Back to home
          </Link>
        </div>
      </section>
    </PageShell>
  );
}

function BenefitCard({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <article className="bg-cream border border-line rounded-card-lg p-6 transition-transform duration-200 hover:-translate-y-[2px] hover:shadow-soft">
      <span className="font-serif text-[14px] text-terra font-semibold tracking-[0.05em] block mb-4">
        {n}
      </span>
      <h3 className="font-serif text-[22px] font-medium tracking-[-0.01em] mb-2">
        {title}
      </h3>
      <p className="text-[14px] leading-[1.6] text-ink-soft">{body}</p>
    </article>
  );
}
