import { PageShell } from "@/components/layout/PageShell";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function SupportPage() {
  const phone = process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+919999999999";
  const email = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@grainline.in";
  
  // Format for WhatsApp: digits only (e.g. 919999999999)
  const waDigits = phone.replace(/\D/g, "");
  const waUrl = `https://wa.me/${waDigits}`;

  const t = await getTranslations("support");

  return (
    <PageShell>
      <section className="py-16 max-w-4xl mx-auto px-4">
        <Eyebrow>{t("eyebrow")}</Eyebrow>
        <h1 className="font-serif text-[clamp(32px,5vw,48px)] font-normal mt-3.5 mb-2 leading-none">
          {t.rich("title", {
            emSupport: (chunks) => <em className="text-terra font-medium">{chunks}</em>
          })}
        </h1>
        <p className="text-muted text-[16px] max-w-[50ch] mb-12">
          {t("sub")}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* WhatsApp Redirect */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-8 border border-line bg-cream hover:bg-paper-2 rounded-card transition-all text-center group"
          >
            <div className="w-12 h-12 rounded-full bg-[#dde6c8] text-paddy font-serif text-[24px] grid place-items-center mx-auto mb-4 group-hover:scale-115 transition-transform">
              💬
            </div>
            <h3 className="font-serif text-[20px] font-medium mb-2 text-ink">{t("whatsappTitle")}</h3>
            <p className="text-muted text-[13px] mb-4">{t("whatsappDesc")}</p>
            <span className="text-[13px] font-bold text-terra uppercase tracking-wider group-hover:underline">
              {t("whatsappBtn")}
            </span>
          </a>

          {/* Call Support */}
          <a
            href={`tel:${phone}`}
            className="block p-8 border border-line bg-cream hover:bg-paper-2 rounded-card transition-all text-center group"
          >
            <div className="w-12 h-12 rounded-full bg-[#f5e7c2] text-[#8a6a1a] font-serif text-[24px] grid place-items-center mx-auto mb-4 group-hover:scale-115 transition-transform">
              📞
            </div>
            <h3 className="font-serif text-[20px] font-medium mb-2 text-ink">{t("callTitle")}</h3>
            <p className="text-muted text-[13px] mb-4">{t("callDesc")}</p>
            <span className="text-[13px] font-bold text-terra uppercase tracking-wider group-hover:underline">
              {phone}
            </span>
          </a>

          {/* Email Support */}
          <a
            href={`mailto:${email}`}
            className="block p-8 border border-line bg-cream hover:bg-paper-2 rounded-card transition-all text-center group"
          >
            <div className="w-12 h-12 rounded-full bg-paper-2 text-ink-soft font-serif text-[24px] grid place-items-center mx-auto mb-4 group-hover:scale-115 transition-transform">
              ✉️
            </div>
            <h3 className="font-serif text-[20px] font-medium mb-2 text-ink font-serif">{t("emailTitle")}</h3>
            <p className="text-muted text-[13px] mb-4">{t("emailDesc")}</p>
            <span className="text-[13px] font-bold text-terra uppercase tracking-wider group-hover:underline">
              {email}
            </span>
          </a>
        </div>
      </section>
    </PageShell>
  );
}
