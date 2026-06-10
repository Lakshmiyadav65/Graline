import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { MandiCompareCard } from "@/components/listing/MandiCompareCard";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = { title: "How it works — Grainline" };

export default async function HowItWorksPage() {
  const t = await getTranslations("howItWorks");
  const tHome = await getTranslations("home");

  const steps = [
    { n: tHome("step1Num"), h: tHome("step1Title"), p: tHome("step1Desc") },
    { n: tHome("step2Num"), h: tHome("step2Title"), p: tHome("step2Desc") },
    { n: tHome("step3Num"), h: tHome("step3Title"), p: tHome("step3Desc") },
    { n: tHome("step4Num"), h: tHome("step4Title"), p: tHome("step4Desc") },
  ];

  return (
    <PageShell>
      <section className="py-12">
        <Eyebrow>{t("eyebrow")}</Eyebrow>
        <h1
          className="font-serif font-normal leading-[1.05] tracking-[-0.02em] mt-3.5 mb-2"
          style={{ fontSize: "clamp(28px, 4vw, 48px)" }}
        >
          {t.rich("title", {
            emWeekly: (chunks) => <em className="text-paddy">{chunks}</em>
          })}
        </h1>
        <p className="text-muted text-[15px] max-w-[60ch] mb-10">
          {t("sub")}
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
          {t.rich("mathTitle", {
            emMath: (chunks) => <em className="text-paddy">{chunks}</em>
          })}
        </h2>
        <p className="text-muted text-[15px] max-w-[60ch] mb-6">
          {t("mathSub")}
        </p>
        <div className="max-w-[560px]">
          <MandiCompareCard
            title={t("compareTitle")}
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
