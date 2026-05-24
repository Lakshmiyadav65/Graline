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
      <section className="py-20 max-w-2xl">
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
        <p className="text-[16px] leading-[1.6] text-ink-soft mb-8 max-w-[52ch]">
          You may have clicked into a section that&apos;s still being built.
          Grainline ships in six milestones — here&apos;s what&apos;s available
          right now and what&apos;s coming.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-10">
          <RouteRow href="/" label="Home" status="live" />
          <RouteRow href="/sell" label="Sell on Grainline" status="live" />
          <RouteRow href="/sell/enroll" label="Farmer enrollment" status="live" />
          <RouteRow href="/browse" label="Browse rice" status="m3" />
          <RouteRow href="/villages" label="Villages" status="m3" />
          <RouteRow href="/how-it-works" label="How it works" status="m3" />
          <RouteRow href="/cart" label="Cart & checkout" status="m4" />
          <RouteRow href="/farmer-app" label="Farmer dashboard" status="m5" />
          <RouteRow href="/admin" label="Admin console" status="m6" />
        </div>

        <div className="flex gap-3 flex-wrap">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-3 bg-ink text-paper rounded-full text-[13px] font-medium hover:bg-paddy hover:border-paddy transition-all"
          >
            ← Back to home
          </Link>
          <Link
            href="/sell"
            className="inline-flex items-center gap-2 px-5 py-3 border border-ink text-ink rounded-full text-[13px] font-medium hover:bg-ink hover:text-paper transition-all"
          >
            Sell on Grainline
          </Link>
        </div>
      </section>
    </PageShell>
  );
}

type RouteStatus = "live" | "m3" | "m4" | "m5" | "m6";

function RouteRow({
  href,
  label,
  status,
}: {
  href: string;
  label: string;
  status: RouteStatus;
}) {
  const live = status === "live";
  const statusLabel =
    status === "live"
      ? "LIVE"
      : status.toUpperCase().replace("M", "MILESTONE ");

  const inner = (
    <span className="flex items-center justify-between gap-4 px-4 py-3 border border-line bg-cream rounded-card hover:border-ink transition-colors">
      <span className="text-[14px] font-medium text-ink">{label}</span>
      <span
        className={
          "text-[10px] tracking-[0.12em] uppercase font-semibold px-2 py-1 rounded-[3px] " +
          (live ? "bg-paddy text-cream" : "bg-paper-2 text-muted")
        }
      >
        {statusLabel}
      </span>
    </span>
  );

  return live ? <Link href={href}>{inner}</Link> : <div>{inner}</div>;
}
