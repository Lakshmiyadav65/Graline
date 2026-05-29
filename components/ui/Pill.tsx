import type { HTMLAttributes, ReactNode } from "react";

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export type PillTone = "pending" | "confirmed" | "ready" | "neutral" | "terra" | "paddy";

interface PillProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  tone?: PillTone;
}

const toneClass: Record<PillTone, string> = {
  pending:   "bg-[#f5e7c2] text-[#8a6a1a]",
  confirmed: "bg-[#dde6c8] text-[#3d5a1a]",
  ready:     "bg-paddy text-cream",
  neutral:   "bg-paper-2 text-ink-soft",
  terra:     "bg-terra text-white",
  paddy:     "bg-paddy text-cream",
};

/**
 * Status badge — used for order/farmer/village statuses.
 * Mirrors the .st pending / confirmed / ready styling in DESIGN.html ~line 432.
 */
export function Pill({ children, tone = "neutral", className, ...rest }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center px-2.5 py-1.5 rounded-[3px] " +
          "text-[11px] tracking-[0.08em] uppercase font-semibold",
        toneClass[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
