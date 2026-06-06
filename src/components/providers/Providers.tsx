"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "@/lib/auth/session-context";
import { ToastProvider } from "@/components/ui/Toast";

/**
 * Client-side context wrapper mounted once in the root layout.
 * Session (auth state) + Toast (global notifications) are available everywhere.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>{children}</ToastProvider>
    </SessionProvider>
  );
}
