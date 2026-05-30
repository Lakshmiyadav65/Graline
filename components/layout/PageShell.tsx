import type { ReactNode } from "react";
import { TopBar } from "./TopBar";
import { Footer } from "./Footer";
import { AnnouncementBar } from "./AnnouncementBar";

interface PageShellProps {
  children: ReactNode;
  /** Hide the footer (useful on dashboards / enroll). */
  noFooter?: boolean;
  /** Hide the topbar + announcement bar (useful on full-bleed enroll-style pages). */
  noTopBar?: boolean;
}

/**
 * App-wide layout shell. The AnnouncementBar is full-bleed; everything below
 * sits inside the max-w-app container that mirrors DESIGN.html .app.
 *
 * <main id="main"> kept as a semantic landmark for screen-reader navigation
 * even though the visible Skip-to-main-content link has been removed.
 */
export function PageShell({ children, noFooter, noTopBar }: PageShellProps) {
  return (
    <>
      {!noTopBar && <AnnouncementBar />}
      <div className="max-w-app mx-auto px-7">
        {!noTopBar && <TopBar />}
        <main id="main" tabIndex={-1} className="focus:outline-none">
          {children}
        </main>
        {!noFooter && <Footer />}
      </div>
    </>
  );
}
