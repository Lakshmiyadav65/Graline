import Link from "next/link";
import type { ReactNode } from "react";

interface SectionHeadProps {
  title: ReactNode;
  sub?: string;
  cta?: { label: string; href: string };
}

/** h2 + sub + optional CTA pill. Mirrors DESIGN.html .section-head. */
export function SectionHead({ title, sub, cta }: SectionHeadProps) {
  return (
    <div className="flex justify-between items-end gap-6 flex-wrap mb-9">
      <div>
        <h2
          className="font-serif font-normal leading-[1.05] tracking-[-0.02em] mb-2"
          style={{ fontSize: "clamp(28px, 4vw, 48px)" }}
        >
          {title}
        </h2>
        {sub && <p className="text-muted text-[15px] max-w-[60ch]">{sub}</p>}
      </div>
      {cta && (
        <Link
          href={cta.href}
          className="inline-flex items-center gap-2 px-3.5 py-2 border border-ink rounded-full text-[13px] font-medium text-ink hover:bg-ink hover:text-paper transition-all whitespace-nowrap"
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
}
