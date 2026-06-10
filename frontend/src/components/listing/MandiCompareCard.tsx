import { formatRupees } from "@/lib/format";

interface MandiCompareCardProps {
  title?: string;
  retailPaise: number;
  mandiPaise: number;
  ourPaise: number;
  /** Pack size used for the savings headline. Default 10kg. */
  packKg?: number;
  retailLabel?: string;
}

/**
 * "Why direct costs less" card with the 3-color top stripe.
 * Mirrors DESIGN.html .price-card. The mandi-vs-retail comparison the brand
 * shows on every listing.
 */
export function MandiCompareCard({
  title = "Why direct costs less",
  retailPaise,
  mandiPaise,
  ourPaise,
  packKg = 10,
  retailLabel = "Branded retail",
}: MandiCompareCardProps) {
  const savedPerPack = (retailPaise - ourPaise) * packKg;

  return (
    <div className="relative overflow-hidden bg-cream border border-line rounded-card-lg p-6 shadow-soft">
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-1"
        style={{ background: "linear-gradient(90deg, var(--terra) 0 30%, var(--gold) 30% 60%, var(--paddy) 60% 100%)" }}
      />
      <h3 className="font-serif text-[20px] font-medium mb-3.5">{title}</h3>
      <Row label={`${retailLabel} (${packKg}kg)`} value={`${formatRupees(retailPaise)}/kg`} tone="strike" />
      <Row label="Local mandi rate (paddy)" value={`${formatRupees(mandiPaise)}/kg`} />
      <Row label="Grainline farmer price" value={`${formatRupees(ourPaise)}/kg`} tone="hi" />
      <div className="mt-3.5 px-3.5 py-2.5 bg-paddy text-cream rounded-[4px] text-[13px] flex justify-between items-center">
        <span>You save vs. branded retail</span>
        <strong className="font-serif text-[18px] font-semibold">
          {formatRupees(savedPerPack)} / {packKg}kg
        </strong>
      </div>
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "strike" | "hi" }) {
  return (
    <div className="flex justify-between items-baseline py-2.5 border-b border-dashed border-line-soft last:border-b-0">
      <span className="text-[13px] text-ink-soft">{label}</span>
      <span
        className={
          "font-mono text-[14px] font-medium " +
          (tone === "strike" ? "text-muted line-through" : tone === "hi" ? "text-paddy font-semibold" : "")
        }
      >
        {value}
      </span>
    </div>
  );
}
