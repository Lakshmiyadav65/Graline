"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/",           label: "Home" },
  { href: "/browse",     label: "Browse Rice" },
  { href: "/villages",   label: "Villages" },
  { href: "/how-it-works", label: "How it works" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function TopBar() {
  const pathname = usePathname() ?? "/";

  return (
    <header className="sticky top-0 z-50 backdrop-blur-[2px] bg-gradient-to-b from-paper from-[80%] to-transparent">
      <div className="flex items-center justify-between py-[22px] border-b border-line">
        {/* Brand */}
        <Link href="/" className="flex items-baseline gap-2.5 no-underline text-inherit">
          <span
            className="font-serif font-bold text-[30px] tracking-[-0.02em] leading-none"
            style={{ fontVariationSettings: '"opsz" 144' }}
          >
            Grain
            <em className="text-terra not-italic font-medium italic">line</em>
          </span>
          <span className="text-[11px] tracking-[0.18em] uppercase text-muted">
            Field to Kitchen
          </span>
        </Link>

        {/* Primary nav */}
        <nav className="hidden md:flex gap-7 items-center">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                "text-ink-soft no-underline text-[14px] font-medium py-1.5 " +
                "border-b border-transparent hover:text-ink transition-colors " +
                (isActive(pathname, link.href) ? " border-paddy" : "")
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex gap-3.5 items-center">
          <Link
            href="/sell"
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 border border-ink rounded-full text-[13px] font-medium text-ink hover:bg-ink hover:text-paper transition-all"
          >
            Sell on Grainline
          </Link>
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 px-3.5 py-2 border border-ink rounded-full bg-ink text-paper text-[13px] font-medium hover:bg-paddy hover:border-paddy transition-all"
          >
            Cart
          </Link>
        </div>
      </div>
    </header>
  );
}
