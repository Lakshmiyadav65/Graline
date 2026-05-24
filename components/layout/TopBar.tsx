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

  // M3 will replace this with `useCartStore((s) => s.items.length)`.
  // Explicit `number` annotation so TS doesn't narrow to literal `0` and
  // mark the count-dependent branches as dead code.
  const cartCount: number = 0;

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
      <div className="flex items-center justify-between py-[18px] gap-4">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-baseline gap-2.5 no-underline text-inherit rounded-sm shrink-0"
          aria-label="Grainline — home"
        >
          <span
            className="font-serif font-bold text-[30px] tracking-[-0.02em] leading-none"
            style={{ fontVariationSettings: '"opsz" 144' }}
          >
            Grain<em className="text-terra font-medium">line</em>
          </span>
          <span className="hidden md:inline text-[11px] tracking-[0.18em] uppercase text-muted">
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
                  "no-underline text-[14px] py-1.5 border-b-2 border-transparent " +
                  "hover:text-ink transition-colors " +
                  (active
                    ? "text-ink font-semibold border-paddy"
                    : "text-ink-soft font-medium")
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex gap-3 lg:gap-4 items-center shrink-0">
          {/* Sign in — gap-filler until M2 auth. /login currently routes to
              our custom 404 with the milestone status grid. */}
          <Link
            href="/login"
            className="hidden lg:inline-flex text-[13px] font-medium text-ink-soft hover:text-ink transition-colors"
          >
            Sign in
          </Link>

          <Link
            href="/sell"
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 border border-ink rounded-full text-[13px] font-medium text-ink hover:bg-paddy hover:border-paddy hover:text-cream transition-all"
          >
            Sell on Grainline
          </Link>

          {/* Cart — bag icon + label + count badge (hidden when 0).
              Badge wiring lands in M3 when the cart store ships. */}
          <Link
            href="/cart"
            aria-label={
              cartCount > 0
                ? `Cart (${cartCount} item${cartCount === 1 ? "" : "s"})`
                : "Cart"
            }
            className="relative inline-flex items-center gap-2 px-3.5 py-2 border border-ink rounded-full bg-ink text-paper text-[13px] font-medium hover:bg-paddy hover:border-paddy transition-all"
          >
            <BagIcon />
            <span>Cart</span>
            {cartCount > 0 && (
              <span
                aria-hidden="true"
                className="ml-1 bg-terra text-white text-[10px] font-semibold leading-none px-1.5 py-1 rounded-full min-w-[18px] text-center"
              >
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
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

      {/*
       * 3-segment brand stripe replacing the plain border-bottom. Same
       * terra/gold/paddy split used on the price-card top edge — ties the
       * topbar into the rest of the design system instead of a generic rule.
       */}
      <div
        aria-hidden="true"
        className="h-1"
        style={{
          background:
            "linear-gradient(90deg, var(--terra) 0 30%, var(--gold) 30% 60%, var(--paddy) 60% 100%)",
        }}
      />

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
          {/* Secondary actions, surfaced in the mobile panel since they're
              hidden from the desktop topbar at sm/md. */}
          <li className="mt-2 pt-3 border-t border-line-soft">
            <Link
              href="/login"
              className="block py-3 pl-[18px] text-[15px] font-medium text-ink-soft hover:text-ink transition-colors"
            >
              Sign in
            </Link>
          </li>
          <li>
            <Link
              href="/sell"
              className="block py-3 pl-[18px] text-[15px] font-medium text-ink-soft hover:text-ink transition-colors"
            >
              Sell on Grainline
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

function BagIcon() {
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 2 L3 6 v14 a2 2 0 0 0 2 2 h14 a2 2 0 0 0 2 -2 V6 L18 2 z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10 a4 4 0 0 1 -8 0" />
    </svg>
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
