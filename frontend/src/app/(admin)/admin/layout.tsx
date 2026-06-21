"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { RequireRole } from "@/components/auth/RequireRole";
import { useSession } from "@/lib/auth/session-context";

const NAV = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/verify", label: "Verify" },
  { href: "/admin/route", label: "Route planner" },
  { href: "/admin/payouts", label: "Payouts" },
  { href: "/admin/mandi", label: "Mandi prices" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/admin";
  const { user } = useSession();

  return (
    <RequireRole role="admin">
      <PageShell noFooter>
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-0 min-h-[60vh]">
          <aside className="lg:border-r border-line lg:pr-6 py-8">
            <div className="pb-6 mb-6 border-b border-line-soft">
              <div className="text-[11px] tracking-[0.12em] uppercase text-terra font-semibold">Admin</div>
              <div className="font-serif text-[18px] font-medium mt-1">{user?.name ?? "Ops"}</div>
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
            </nav>
          </aside>
          <main className="lg:pl-9 py-8">{children}</main>
        </div>
      </PageShell>
    </RequireRole>
  );
}
