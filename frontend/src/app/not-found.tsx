import { PageShell } from "@/components/layout/PageShell";
import { Eyebrow } from "@/components/ui/Eyebrow";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Not found — Grainline",
};

/**
 * Custom 404. Most missing routes during M1 are M3-M6 pages not built yet:
 * /browse, /villages, /how-it-works, /cart, /checkout, /orders, /farmer-app, /admin.
 * The list below tells visitors which milestone is responsible — fewer surprises,
 * fewer "is this site broken?" emails.
 */
export default function NotFound() {
  return (
    <PageShell>
      <section className="py-20 max-w-2xl mx-auto px-4 text-center">
        <Eyebrow>404 · Page not found</Eyebrow>
        <h1
          className="font-serif font-normal leading-[1.05] tracking-[-0.02em] mt-4 mb-6"
          style={{
            fontSize: "clamp(40px, 6vw, 64px)",
            fontVariationSettings: '"opsz" 144',
          }}
        >
          We haven&apos;t <em className="text-terra font-medium">milled</em>{" "}
          this page yet.
        </h1>
        <p className="text-[16px] leading-[1.6] text-ink-soft mb-8 max-w-[52ch] mx-auto">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-3 bg-ink text-paper rounded-full text-[13px] font-medium hover:bg-paddy hover:border-paddy transition-all"
          >
            ← Back to home
          </Link>
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 px-5 py-3 border border-ink text-ink rounded-full text-[13px] font-medium hover:bg-ink hover:text-paper transition-all"
          >
            Browse rice
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
