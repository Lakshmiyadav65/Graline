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
 *
 * Adds a "Skip to main content" link as the first focusable element so
 * keyboard users can bypass the topbar nav. The link is visually hidden
 * until it receives focus (.skip-link rules live in globals.css).
 */
export function PageShell({ children, noFooter, noTopBar }: PageShellProps) {
  return (
    <div className="max-w-app mx-auto px-7">
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      {!noTopBar && <TopBar />}
      <main id="main" tabIndex={-1} className="focus:outline-none">
        {children}
      </main>
      {!noFooter && <Footer />}
    </div>
  );
}
