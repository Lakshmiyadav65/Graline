"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth/session-context";
import type { Role } from "@/lib/api/types";

/**
 * Client-side route guard. Redirects unauthenticated users to
 * /login?next=<path>, and wrong-role users to home. Used by protected
 * segments (/orders, /farmer-app, /admin).
 *
 * On the mock adapter this is the only guard (no cookie). The real backend
 * (BE-M2) adds server-side middleware on top using the iron-session cookie.
 */
export function RequireRole({
  role,
  children,
}: {
  role: Role | Role[];
  children: ReactNode;
}) {
  const { user, loading } = useSession();
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const roles = Array.isArray(role) ? role : [role];
  const allowed = !!user && roles.includes(user.role);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    } else if (!roles.includes(user.role)) {
      router.replace("/");
    }
    // roles is derived from a prop each render; intentionally not in deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading, pathname, router]);

  if (loading || !allowed) {
    return (
      <div className="max-w-app mx-auto px-7 py-24 text-center text-muted text-[14px]">
        Checking your access…
      </div>
    );
  }
  return <>{children}</>;
}
