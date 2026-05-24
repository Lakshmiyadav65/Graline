"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { href: "/",             label: "Home" },
  { href: "/browse",       label: "Browse Rice" },
  { href: "/villages",     label: "Villages" },
  { href: "/how-it-works", label: "How it works" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function TopBar() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);

  // Close menu when route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-[2px] bg-gradient-to-b from-paper from-[80%] to-transparent">
      <div className="flex items-center justify-between py-[22px] border-b border-line">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-baseline gap-2.5 no-underline text-inherit rounded-sm"
          aria-label="Grainline — home"
        >
          <span
            className="font-serif font-bold text-[30px] tracking-[-0.02em] leading-none"
            style={{ fontVariationSettings: '"opsz" 144' }}
          >
            Grain<em className="text-terra font-medium">line</em>
          </span>
          <span className="hidden sm:inline text-[11px] tracking-[0.18em] uppercase text-muted">
            Field to Kitchen
          </span>
        </Link>

        {/* Desktop primary nav */}
        <nav aria-label="Primary" className="hidden md:flex gap-7 items-center">
          {NAV_LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={
                  "text-ink-soft no-underline text-[14px] font-medium py-1.5 " +
                  "border-b border-transparent hover:text-ink transition-colors " +
                  (active ? "border-paddy" : "")
                }
              >
                {link.label}
              </Link>
            );
          })}
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

          {/* Mobile menu toggle */}
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full border border-ink bg-transparent text-ink hover:bg-ink hover:text-paper transition-all focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paddy"
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile nav panel */}
      <nav
        id="mobile-nav"
        aria-label="Mobile primary"
        hidden={!open}
        className="md:hidden border-b border-line bg-paper"
      >
        <ul className="flex flex-col py-3">
          {NAV_LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={
                    "block py-3 text-[15px] font-medium transition-colors " +
                    (active
                      ? "text-ink border-l-2 border-paddy pl-4"
                      : "text-ink-soft pl-[18px] hover:text-ink")
                  }
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}

function MenuIcon() {
  return (
    <svg
      width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="3" y1="6"  x2="21" y2="6"  />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="6"  y1="6"  x2="18" y2="18" />
      <line x1="18" y1="6"  x2="6"  y2="18" />
    </svg>
  );
}
