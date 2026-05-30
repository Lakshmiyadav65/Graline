import { formatRupees } from "@/lib/format";

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

interface PriceTagProps {
  /** Price in paise. */
  paise: number;
  /** Show "/kg" suffix in muted Inter. Default false. */
  perKg?: boolean;
  /** Visual size — matches the listing card / price block / hero stats. */
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClass = {
  sm: "text-[20px]",
  md: "text-[26px]",      // .listing .price
  lg: "text-[32px]",      // .kpi .v
  xl: "text-[48px]",      // .price-block .now
};

const unitSizeClass = {
  sm: "text-[10px]",
  md: "text-[12px]",
  lg: "text-[12px]",
  xl: "text-[14px]",
};

/**
 * Display-face (Bricolage Grotesque) price + optional "/kg" suffix in sans muted.
 * Matches .listing .price / .price-block .now in DESIGN.html.
 */
export function PriceTag({ paise, perKg = false, size = "md", className }: PriceTagProps) {
  return (
    <span
      className={cn(
        "font-serif font-semibold text-ink leading-none tracking-[-0.01em] inline-flex items-baseline",
        sizeClass[size],
        className,
      )}
    >
      {formatRupees(paise)}
      {perKg && (
        <span
          className={cn(
            "font-sans font-normal text-muted ml-0.5",
            unitSizeClass[size],
          )}
        >
          /kg
        </span>
      )}
    </span>
  );
}
