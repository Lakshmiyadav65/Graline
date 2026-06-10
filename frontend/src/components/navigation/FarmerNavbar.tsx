"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth/session-context";
import { LanguageSelector } from "@/components/layout/LanguageSelector";
import { useTranslations } from "next-intl";

function isActive(pathname: string, href: string) {
  if (href === "/farmer-app") return pathname === "/farmer-app";
  return pathname.startsWith(href);
}

export function FarmerNavbar() {
  const pathname = usePathname() ?? "/farmer-app";
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { user, logout } = useSession();
  const t = useTranslations("navigation");

  const navLinks = [
    { href: "/farmer-app", label: t("dashboard") },
    { href: "/farmer-app/listings", label: t("myListings") },
    { href: "/farmer-app/orders", label: t("orders") },
    { href: "/farmer-app/earnings", label: t("earnings") },
    { href: "/farmer-app/profile", label: t("profile") },
  ];

  async function handleSignOut() {
    await logout();
    router.push("/");
  }

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

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
          href="/farmer-app"
          className="flex items-baseline gap-2.5 no-underline text-inherit rounded-sm shrink-0"
          aria-label="Grainline — farmer app"
        >
          <span
            className="font-serif font-bold text-[30px] tracking-[-0.02em] leading-none"
            style={{ fontVariationSettings: '"opsz" 144' }}
          >
            Grain<em className="text-terra font-medium">line</em>
          </span>
          <span className="text-[11px] tracking-[0.18em] uppercase text-muted font-sans font-semibold">
            {t("farmerPortal")}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav aria-label="Farmer Primary" className="hidden md:flex gap-7 items-center">
          {navLinks.map((link) => {
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
          <LanguageSelector variant="navbar" />

          {/* Account / Sign in */}
          {user ? (
            <AccountControl user={user} handleSignOut={handleSignOut} roleHome={user.role === "farmer" ? "/farmer-app" : "/account"} t={t} />
          ) : (
            <Link
              href="/login"
              className="hidden md:inline-flex text-[13px] font-medium text-ink-soft hover:text-ink transition-colors"
            >
              {t("signIn")}
            </Link>
          )}

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
        aria-label="Mobile farmer primary"
        hidden={!open}
        className="md:hidden border-b border-line bg-paper"
      >
        <ul className="flex flex-col py-3">
          {navLinks.map((link) => {
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
          
          <li className="mt-2 pt-3 border-t border-line-soft">
            {user ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="block w-full text-left py-3 pl-[18px] text-[15px] font-medium text-terra hover:text-terra-2 transition-colors"
              >
                {t("signOut")}
              </button>
            ) : (
              <Link
                href="/login"
                className="block py-3 pl-[18px] text-[15px] font-medium text-ink-soft hover:text-ink transition-colors"
              >
                {t("signIn")}
              </Link>
            )}
          </li>
        </ul>
      </nav>
    </header>
  );
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function AccountControl({ user, handleSignOut, roleHome, t }: { user: any, handleSignOut: () => void, roleHome: string, t: any }) {
  return (
    <details className="relative">
      <summary className="list-none cursor-pointer inline-flex items-center gap-1.5 text-[13px] font-medium text-ink hover:text-paddy transition-colors [&::-webkit-details-marker]:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paddy rounded-full">
        <span className="w-7 h-7 rounded-full bg-paddy text-cream grid place-items-center font-serif text-[12px] leading-none">
          {initials(user.name)}
        </span>
        <span className="hidden sm:inline max-w-[10ch] truncate">{user.name.split(/\s+/)[0]}</span>
        <ChevronDown />
      </summary>
      <div className="absolute right-0 mt-2 w-56 bg-cream border border-line rounded-card-lg shadow-soft py-1 z-50">
        <div className="px-4 py-2.5 border-b border-line-soft">
          <div className="text-[13px] font-medium text-ink truncate">{user.name}</div>
          <div className="text-[11px] text-muted font-mono">{user.phone}</div>
        </div>
        <Link
          href={roleHome}
          className="block px-4 py-2.5 text-[14px] text-ink-soft hover:bg-paper-2 hover:text-ink transition-colors"
        >
          {t("dashboard")}
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          className="block w-full text-left px-4 py-2.5 text-[14px] text-terra hover:bg-paper-2 transition-colors"
        >
          {t("signOut")}
        </button>
      </div>
    </details>
  );
}

function ChevronDown() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
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
