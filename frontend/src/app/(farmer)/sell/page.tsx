import { PageShell } from "@/components/layout/PageShell";
import { Eyebrow } from "@/components/ui/Eyebrow";
import Link from "next/link";
import { getTranslations } from "@/lib/translations";

export async function generateMetadata() {
  const t = await getTranslations("sell");
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
  };
}

export default async function SellPage() {
  const t = await getTranslations("sell");

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
            {t("roleLabel")}
          </span>
          <h1
            id="sell-hero-title"
            className="font-serif font-normal leading-[1.05] tracking-[-0.02em] mt-5 mb-6"
            style={{
              fontSize: "clamp(40px, 6vw, 64px)",
              fontVariationSettings: '"opsz" 144',
            }}
          >
            {t.rich("heroTitle", {
              emGold: (chunks) => <em className="text-gold font-medium">{chunks}</em>,
              br: () => <br />
            })}
          </h1>
          <p className="text-[17px] md:text-[18px] leading-[1.6] opacity-90 max-w-[44ch] mb-8">
            {t("heroSub")}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/sell/enroll"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-gold text-ink rounded-full text-[13px] font-semibold tracking-[0.04em] uppercase hover:bg-cream transition-all focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
            >
              {t("enrollFarm")}
            </Link>
            <a
              href="https://wa.me/919999999999"
              className="inline-flex items-center gap-2 px-6 py-3.5 border border-cream text-cream rounded-full text-[13px] font-semibold tracking-[0.04em] uppercase hover:bg-cream hover:text-paddy transition-all focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
            >
              {t("waTeam")}
            </a>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12" aria-labelledby="benefits-title">
        <Eyebrow>{t("benefitsEyebrow")}</Eyebrow>
        <h2
          id="benefits-title"
          className="font-serif font-normal leading-[1.05] tracking-[-0.02em] mt-4 mb-10 max-w-[22ch]"
          style={{ fontSize: "clamp(32px, 4vw, 48px)" }}
        >
          {t.rich("benefitsTitle", {
            emPaddy: (chunks) => <em className="text-paddy">{chunks}</em>
          })}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <BenefitCard
            n="01"
            title={t("benefit1Title")}
            body={t("benefit1Body")}
          />
          <BenefitCard
            n="02"
            title={t("benefit2Title")}
            body={t("benefit2Body")}
          />
          <BenefitCard
            n="03"
            title={t("benefit3Title")}
            body={t("benefit3Body")}
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
            {t("testimonialQuote")}
          </blockquote>
          <cite className="block mt-6 text-[14px] text-muted not-italic">
            {t("testimonialAuthor")}
          </cite>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 border-t border-line text-center">
        <h3 className="font-serif text-[28px] md:text-[34px] font-normal mb-2">
          {t("readyTitle")}
        </h3>
        <p className="text-muted text-[15px] mb-8 max-w-[40ch] mx-auto">
          {t("readySub")}
        </p>
        <div className="flex justify-center gap-3 flex-wrap">
          <Link
            href="/sell/enroll"
            className="inline-flex items-center gap-2 px-5 py-3 bg-ink text-paper rounded-full text-[13px] font-medium hover:bg-paddy hover:border-paddy transition-all"
          >
            {t("startEnroll")}
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-3 border border-ink text-ink rounded-full text-[13px] font-medium hover:bg-ink hover:text-paper transition-all"
          >
            {t("backHome")}
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
