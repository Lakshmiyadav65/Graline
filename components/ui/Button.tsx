import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "pill" | "pill-solid" | "pill-terra" | "btn-big-primary" | "btn-big-ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

const variantClass: Record<Variant, string> = {
  // .pill — DESIGN.html line ~64-70
  "pill":
    "inline-flex items-center gap-2 px-[14px] py-2 border border-ink rounded-full " +
    "bg-transparent text-ink text-[13px] font-medium cursor-pointer transition-all " +
    "hover:bg-ink hover:text-paper",
  // .pill.solid
  "pill-solid":
    "inline-flex items-center gap-2 px-[14px] py-2 border border-ink rounded-full " +
    "bg-ink text-paper text-[13px] font-medium cursor-pointer transition-all " +
    "hover:bg-paddy hover:border-paddy",
  // .pill.terra
  "pill-terra":
    "inline-flex items-center gap-2 px-[14px] py-2 border border-terra rounded-full " +
    "bg-terra text-white text-[13px] font-medium cursor-pointer transition-all " +
    "hover:bg-terra-2 hover:border-terra-2",
  // .btn-big.primary
  "btn-big-primary":
    "flex-1 px-5 py-4 rounded-card border border-paddy bg-paddy text-cream " +
    "font-semibold text-[14px] tracking-[0.04em] uppercase cursor-pointer " +
    "transition-all hover:bg-paddy-2 hover:border-paddy-2",
  // .btn-big.ghost
  "btn-big-ghost":
    "flex-1 px-5 py-4 rounded-card border border-ink bg-transparent text-ink " +
    "font-semibold text-[14px] tracking-[0.04em] uppercase cursor-pointer " +
    "transition-all hover:bg-ink hover:text-paper",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ variant = "pill", className, type = "button", ...rest }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(variantClass[variant], className)}
        {...rest}
      />
    );
  }
);
