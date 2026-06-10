import Link from "next/link";
import { useTranslations } from "next-intl";

/**
 * 4-column footer matching DESIGN.html footer.
 */
export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="mt-[60px] border-t border-line py-10 pb-[60px] grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-10">
      <div>
        <h5 className="font-serif font-semibold text-[14px] uppercase tracking-[0.1em] mb-3.5">
          Grainline
        </h5>
        <p className="text-[14px] text-ink-soft leading-[1.6] max-w-[36ch] mt-2">
          {t("tagline")}
        </p>
      </div>
      <FooterCol
        heading={t("buy")}
        links={[
          { label: t("allRice"),      href: "/browse" },
          { label: t("byVillage"),    href: "/villages" },
          { label: t("byVariety"),    href: "/browse" },
        ]}
      />
      <FooterCol
        heading={t("sell")}
        links={[
          { label: t("enrollFarm"),   href: "/sell/enroll" },
          { label: t("farmerDashboard"),   href: "/farmer-app" },
          { label: t("pricing"),            href: "/how-it-works" },
        ]}
      />
      <FooterCol
        heading={t("about")}
        links={[
          { label: t("howItWorks"),  href: "/how-it-works" },
          { label: t("qualityPromise"), href: "/how-it-works" },
          { label: t("contact"),       href: "/how-it-works" },
        ]}
      />
    </footer>
  );
}

function FooterCol({
  heading,
  links,
}: {
  heading: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h5 className="font-serif font-semibold text-[14px] uppercase tracking-[0.1em] mb-3.5">
        {heading}
      </h5>
      {links.map((link) => (
        <Link
          key={link.label}
          href={link.href}
          className="block text-ink-soft no-underline text-[14px] py-1 hover:text-terra transition-colors"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}
