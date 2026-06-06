import Link from "next/link";
import type { Village } from "@/lib/api/types";
import { VARIETY_LABEL } from "@/lib/labels";

/** Village card. Server Component. Matches DESIGN.html .village. */
export function VillageCard({ village }: { village: Village }) {
  return (
    <Link
      href={`/villages/${village.slug}`}
      className="grid grid-cols-[120px_1fr] sm:grid-cols-[160px_1fr] bg-cream border border-line rounded-card overflow-hidden transition-transform duration-200 hover:-translate-y-[2px] hover:shadow-soft"
    >
      <div
        className="relative grid place-items-center"
        style={{ background: "linear-gradient(135deg, var(--paddy) 0%, var(--paddy-soft) 100%)" }}
      >
        <span
          className="font-serif font-medium text-[48px] sm:text-[64px] leading-none"
          style={{ color: "rgba(251,246,231,.85)", fontVariationSettings: '"opsz" 144' }}
        >
          {village.farmer_count}
        </span>
      </div>
      <div className="p-5">
        <h4 className="font-serif text-[22px] font-medium mb-1">{village.name}</h4>
        <div className="text-[12px] text-muted uppercase tracking-[0.05em] mb-3.5">
          {village.district} district
        </div>
        <div className="flex gap-5 text-[13px] text-ink-soft">
          <span>
            <strong className="font-serif text-[18px] block text-ink font-medium">{village.farmer_count}</strong>
            FARMERS
          </span>
          <span>
            <strong className="font-serif text-[18px] block text-ink font-medium">{village.variety_count}</strong>
            VARIETIES
          </span>
        </div>
        <div className="text-[13px] text-ink-soft mt-3.5 pt-3.5 border-t border-dashed border-line-soft">
          {village.varieties.slice(0, 3).map((v) => VARIETY_LABEL[v]).join(" · ")}
        </div>
      </div>
    </Link>
  );
}
