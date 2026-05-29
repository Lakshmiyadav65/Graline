"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { RequireRole } from "@/components/auth/RequireRole";
import { useSession } from "@/lib/auth/session-context";

const NAV = [
  { href: "/farmer-app", label: "Dashboard", exact: true },
  { href: "/farmer-app/listings", label: "My listings" },
  { href: "/farmer-app/earnings", label: "Earnings & payouts" },
];

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");
}

export default function FarmerAppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/farmer-app";
  const { user } = useSession();

  return (
    <RequireRole role="farmer">
      <PageShell noFooter>
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-0 min-h-[60vh]">
          <aside className="lg:border-r border-line lg:pr-6 py-8">
            <div className="flex items-center gap-3 pb-6 mb-6 border-b border-line-soft">
              <span className="w-10 h-10 rounded-full bg-paddy text-cream grid place-items-center font-serif text-[15px]">
                {user ? initials(user.name) : "—"}
              </span>
              <div>
                <div className="font-serif text-[18px] font-medium leading-tight">{user?.name ?? "Farmer"}</div>
                <div className="text-[12px] text-muted">Farmer</div>
              </div>
            </div>
            <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible -mx-1 px-1">
              {NAV.map((n) => {
                const active = n.exact ? pathname === n.href : pathname.startsWith(n.href);
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    aria-current={active ? "page" : undefined}
                    className={
                      "whitespace-nowrap px-3.5 py-2.5 rounded-[5px] text-[14px] transition-colors " +
                      (active ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper-2")
                    }
                  >
                    {n.label}
                  </Link>
                );
              })}
              <a
                href="https://wa.me/919999999999"
                className="whitespace-nowrap px-3.5 py-2.5 rounded-[5px] text-[14px] text-ink-soft hover:bg-paper-2 transition-colors"
              >
                Help &amp; WhatsApp
              </a>
            </nav>
          </aside>
          <main className="lg:pl-9 py-8">{children}</main>
        </div>
      </PageShell>
    </RequireRole>
  );
}
