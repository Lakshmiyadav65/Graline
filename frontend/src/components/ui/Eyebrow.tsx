import type { ElementType, HTMLAttributes, ReactNode } from "react";

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

interface EyebrowProps extends HTMLAttributes<HTMLElement> {
  /**
   * Tag to render. Default is `<span>` (presentational kicker above an h2).
   * Pass `as="h2"` (etc.) when the eyebrow is acting as the section's heading
   * — e.g. on /browse where the eyebrow is the only labelled identifier
   * before the chip filter row.
   */
  as?: ElementType;
  children: ReactNode;
}

/**
 * Uppercase label with a 24px paddy line on the left.
 * Visual rules live in globals.css (.eyebrow + .eyebrow::before).
 */
export function Eyebrow({ as: Tag = "span", children, className, ...rest }: EyebrowProps) {
  return (
    <Tag className={cn("eyebrow", className)} {...rest}>
      {children}
    </Tag>
  );
}
