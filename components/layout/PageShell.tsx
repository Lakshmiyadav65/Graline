import type { ReactNode } from "react";
import { TopBar } from "./TopBar";
import { Footer } from "./Footer";

interface PageShellProps {
  children: ReactNode;
  /** Hide the footer (useful on dashboards / enroll). */
  noFooter?: boolean;
  /** Hide the topbar (useful on full-bleed enroll-style pages). */
  noTopBar?: boolean;
}

/**
 * App-wide layout shell. max-width 1280, 28px horizontal padding.
 * Mirrors the .app wrapper in DESIGN.html.
 */
export function PageShell({ children, noFooter, noTopBar }: PageShellProps) {
  return (
    <div className="max-w-app mx-auto px-7">
      {!noTopBar && <TopBar />}
      {children}
      {!noFooter && <Footer />}
    </div>
  );
}
