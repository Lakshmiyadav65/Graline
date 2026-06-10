import type { HTMLAttributes, ReactNode } from "react";

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Apply the soft hover-lift used on listing/village cards. */
  interactive?: boolean;
}

/**
 * Cream card with line border. Matches DESIGN.html .price-card / .listing / .panel base.
 */
export function Card({ children, interactive, className, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        "bg-cream border border-line rounded-card-lg",
        interactive &&
          "transition-transform duration-200 ease-out hover:-translate-y-[3px] hover:shadow-soft cursor-pointer",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
