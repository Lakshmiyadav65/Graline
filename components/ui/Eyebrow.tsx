import type { HTMLAttributes, ReactNode } from "react";

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

interface EyebrowProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
}

/**
 * Uppercase label with a 24px paddy line on the left.
 * Matches DESIGN.html .eyebrow (the global ::before is set up in globals.css).
 */
export function Eyebrow({ children, className, ...rest }: EyebrowProps) {
  return (
    <span className={cn("eyebrow", className)} {...rest}>
      {children}
    </span>
  );
}
